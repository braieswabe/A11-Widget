import { getDb, checkDbHealth } from './utils/db.js';

export default async function handler(req, res) {
  try {
    if (process.env.NEON_DATABASE_URL) {
      const health = await checkDbHealth();
      if (health.healthy) {
        return res.status(200).json({ status: 'ok', database: 'connected' });
      } else {
        return res.status(500).json({ status: 'error', database: 'disconnected', error: health.error });
      }
    }
    return res.status(200).json({ status: 'ok', database: 'not_configured' });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ status: 'error', database: 'disconnected' });
  }
}

