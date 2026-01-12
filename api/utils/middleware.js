import { extractToken, verifyToken } from './auth.js';
import { getDb } from './db.js';
import { get, set } from './cache.js';

// Middleware to authenticate widget users (clients)
export async function authenticateClient(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.clientId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const cacheKey = `client:${decoded.clientId}`;
  
  // Try to get from cache first (allow stale cache)
  let client = get(cacheKey, true);
  
  if (!client) {
    // Cache miss, fetch from database
    try {
      const sql = getDb();
      const result = await sql`
        SELECT id, email, company_name, site_ids, is_active
        FROM clients
        WHERE id = ${decoded.clientId} AND is_active = true
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: 'Client not found or inactive' });
      }

      client = result[0];
      
      // Cache the result for 5 minutes
      set(cacheKey, client);
    } catch (dbError) {
      console.error('Database error fetching client:', dbError);
      
      // Try to use stale cache if available
      client = get(cacheKey, true);
      
      if (!client) {
        // No cache available, return error
        console.error('Authentication error: Database unavailable and no cache available');
        return res.status(500).json({ error: 'Authentication failed - database unavailable' });
      }
      
      console.log('Using stale cache for client authentication');
    }
  }

  req.client = client;
  next();
}

// Middleware to authenticate admin users
export async function authenticateAdmin(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin' && decoded.role !== 'super_admin') {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }

  const cacheKey = `admin:${decoded.userId}`;
  
  // Try to get from cache first (allow stale cache)
  let admin = get(cacheKey, true);
  
  if (!admin) {
    // Cache miss, fetch from database
    try {
      const sql = getDb();
      const result = await sql`
        SELECT id, email, role, is_active
        FROM users
        WHERE id = ${decoded.userId} AND is_active = true
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: 'Admin user not found or inactive' });
      }

      admin = result[0];
      
      // Cache the result for 5 minutes
      set(cacheKey, admin);
    } catch (dbError) {
      console.error('Database error fetching admin:', dbError);
      
      // Try to use stale cache if available
      admin = get(cacheKey, true);
      
      if (!admin) {
        // No cache available, return error
        console.error('Admin authentication error: Database unavailable and no cache available');
        return res.status(500).json({ error: 'Authentication failed - database unavailable' });
      }
      
      console.log('Using stale cache for admin authentication');
    }
  }

  req.admin = admin;
  next();
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      if (decoded.clientId) {
        const cacheKey = `client:${decoded.clientId}`;
        
        // Try cache first
        let client = get(cacheKey, true);
        
        if (!client) {
          try {
            const sql = getDb();
            const result = await sql`
              SELECT id, email, company_name, site_ids, is_active
              FROM clients
              WHERE id = ${decoded.clientId} AND is_active = true
            `;
            if (result.length > 0) {
              client = result[0];
              set(cacheKey, client);
              req.client = client;
            }
          } catch (error) {
            // Try stale cache
            client = get(cacheKey, true);
            if (client) {
              req.client = client;
            }
            // Silently fail for optional auth
          }
        } else {
          req.client = client;
        }
      }
    }
  }
  
  next();
}
