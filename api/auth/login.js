import { neon } from '@neondatabase/serverless';
import { comparePassword, generateToken, hashToken, getClientIp, getUserAgent, isValidEmail } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, apiKey, siteId } = req.body;

  // Validate input
  if (!apiKey && (!email || !password)) {
    return res.status(400).json({ error: 'Either email/password or apiKey is required' });
  }

  if (apiKey && (email || password)) {
    return res.status(400).json({ error: 'Cannot use both email/password and apiKey' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    let client;

    if (apiKey) {
      // API key authentication
      const result = await sql`
        SELECT id, email, password_hash, company_name, site_ids, is_active, api_key
        FROM clients
        WHERE api_key = ${apiKey} AND is_active = true
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      client = result[0];
    } else {
      // Email/password authentication
      const result = await sql`
        SELECT id, email, password_hash, company_name, site_ids, is_active, api_key
        FROM clients
        WHERE email = ${email.toLowerCase()} AND is_active = true
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      client = result[0];

      // Verify password
      const passwordMatch = await comparePassword(password, client.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Check site access if siteId is provided
    if (siteId) {
      const hasAccess = !client.site_ids || client.site_ids.length === 0 || 
                       client.site_ids.includes(siteId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied for this site' });
      }
    }

    // Generate token
    const tokenPayload = {
      clientId: client.id,
      email: client.email,
      type: 'client'
    };

    const token = generateToken(tokenPayload);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store token hash in database
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    await sql`
      INSERT INTO auth_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES (${client.id}, ${tokenHash}, ${expiresAt.toISOString()}, ${userAgent}, ${ipAddress})
    `;

    // Update last login
    await sql`
      UPDATE clients
      SET last_login_at = NOW()
      WHERE id = ${client.id}
    `;

    return res.status(200).json({
      success: true,
      token,
      expiresIn: 3600,
      client: {
        id: client.id,
        email: client.email,
        companyName: client.company_name,
        siteIds: client.site_ids || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
