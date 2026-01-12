import { getDb } from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId } = req.query;

  if (!siteId) {
    return res.status(400).json({ error: 'Missing siteId' });
  }

  try {
    const sql = getDb();
    const result = await sql`
      SELECT config FROM site_configs WHERE site_id = ${siteId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(result[0].config);
  } catch (error) {
    console.error('Config error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

