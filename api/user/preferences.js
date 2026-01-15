import { getDb } from '../utils/db.js';
import { extractToken, verifyToken } from '../utils/auth.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'client') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = decoded.clientId;
  const { siteId, preferences } = req.body;

  if (!siteId) {
    return res.status(400).json({ error: 'siteId is required' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const sql = getDb();

    if (req.method === 'GET') {
      // Get user preferences
      const result = await sql`
        SELECT preferences, updated_at
        FROM user_preferences
        WHERE user_id = ${userId} AND site_id = ${siteId}
      `;

      if (result.length === 0) {
        return res.status(200).json({ preferences: null });
      }

      return res.status(200).json({
        preferences: result[0].preferences,
        updatedAt: result[0].updated_at
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Save/update user preferences
      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ error: 'preferences object is required' });
      }

      await sql`
        INSERT INTO user_preferences (user_id, site_id, preferences)
        VALUES (${userId}, ${siteId}, ${JSON.stringify(preferences)})
        ON CONFLICT (user_id, site_id)
        DO UPDATE SET
          preferences = ${JSON.stringify(preferences)},
          updated_at = NOW()
      `;

      return res.status(200).json({
        success: true,
        message: 'Preferences saved successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete user preferences (reset to defaults)
      await sql`
        DELETE FROM user_preferences
        WHERE user_id = ${userId} AND site_id = ${siteId}
      `;

      return res.status(200).json({
        success: true,
        message: 'Preferences reset to defaults'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User preferences error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
