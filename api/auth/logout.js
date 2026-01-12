import { extractToken, hashToken } from '../utils/auth.js';
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req);
  
  if (!token) {
    return res.status(200).json({ success: true, message: 'Already logged out' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(200).json({ success: true });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const tokenHash = hashToken(token);

    // Delete token from database
    await sql`
      DELETE FROM auth_tokens
      WHERE token_hash = ${tokenHash}
    `;

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still return success even if deletion fails
    return res.status(200).json({ success: true });
  }
}
