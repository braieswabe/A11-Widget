import { neon } from '@neondatabase/serverless';
import { comparePassword, generateToken, hashToken, getClientIp, getUserAgent, isValidEmail } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);

    const result = await sql`
      SELECT id, email, password_hash, role, is_active
      FROM users
      WHERE email = ${email.toLowerCase()} AND is_active = true
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result[0];

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'admin'
    };

    const token = generateToken(tokenPayload);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store token hash in database (using clients table structure for consistency)
    // Note: For admin tokens, we could use a separate table, but for simplicity using same structure
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // Update last login
    await sql`
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ${user.id}
    `;

    return res.status(200).json({
      success: true,
      token,
      expiresIn: 3600,
      admin: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
