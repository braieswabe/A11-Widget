import { neon } from '@neondatabase/serverless';
import { authenticateAdmin } from '../../../utils/middleware.js';
import { generateApiKey } from '../../../utils/auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate admin
  return authenticateAdmin(req, res, async () => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    try {
      const sql = neon(process.env.NEON_DATABASE_URL);

      // Check if client exists
      const existing = await sql`
        SELECT id, email FROM clients WHERE id = ${id}
      `;

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Generate new API key
      const newApiKey = generateApiKey();

      // Update client with new API key
      const result = await sql`
        UPDATE clients
        SET api_key = ${newApiKey}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, email, api_key, updated_at
      `;

      return res.status(200).json({
        success: true,
        client: {
          id: result[0].id,
          email: result[0].email,
          apiKey: result[0].api_key,
          updatedAt: result[0].updated_at
        }
      });
    } catch (error) {
      console.error('Regenerate API key error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
