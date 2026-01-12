import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { extractToken, generateToken, hashToken, getClientIp, getUserAgent } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const oldToken = extractToken(req);
  
  if (!oldToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // Verify old token (allow expired tokens for refresh)
    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET || 'change-this-secret-key-in-production-min-32-chars', {
        ignoreExpiration: true // Allow expired tokens for refresh
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!decoded || !decoded.clientId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Check if client exists and is active
    const clientResult = await sql`
      SELECT id, email, company_name, site_ids, is_active
      FROM clients
      WHERE id = ${decoded.clientId} AND is_active = true
    `;

    if (clientResult.length === 0) {
      return res.status(401).json({ error: 'Client not found or inactive' });
    }

    const client = clientResult[0];

    // Delete old token
    const oldTokenHash = hashToken(oldToken);
    await sql`
      DELETE FROM auth_tokens
      WHERE token_hash = ${oldTokenHash}
    `;

    // Generate new token
    const tokenPayload = {
      clientId: client.id,
      email: client.email,
      type: 'client'
    };

    const newToken = generateToken(tokenPayload);
    const newTokenHash = hashToken(newToken);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store new token
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    await sql`
      INSERT INTO auth_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES (${client.id}, ${newTokenHash}, ${expiresAt.toISOString()}, ${userAgent}, ${ipAddress})
    `;

    return res.status(200).json({
      success: true,
      token: newToken,
      expiresIn: 3600,
      client: {
        id: client.id,
        email: client.email,
        companyName: client.company_name,
        siteIds: client.site_ids || []
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
