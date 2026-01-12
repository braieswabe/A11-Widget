import { extractToken, verifyToken } from './auth.js';
import { neon } from '@neondatabase/serverless';

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

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const result = await sql`
      SELECT id, email, company_name, site_ids, is_active
      FROM clients
      WHERE id = ${decoded.clientId} AND is_active = true
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'Client not found or inactive' });
    }

    req.client = result[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
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

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const result = await sql`
      SELECT id, email, role, is_active
      FROM users
      WHERE id = ${decoded.userId} AND is_active = true
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'Admin user not found or inactive' });
    }

    req.admin = result[0];
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      if (decoded.clientId) {
        try {
          const sql = neon(process.env.NEON_DATABASE_URL);
          const result = await sql`
            SELECT id, email, company_name, site_ids, is_active
            FROM clients
            WHERE id = ${decoded.clientId} AND is_active = true
          `;
          if (result.length > 0) {
            req.client = result[0];
          }
        } catch (error) {
          // Silently fail for optional auth
        }
      }
    }
  }
  
  next();
}
