import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    if (process.env.NEON_DATABASE_URL) {
      const sql = neon(process.env.NEON_DATABASE_URL);
      await sql`SELECT 1`;
      return res.status(200).json({ status: 'ok', database: 'connected' });
    }
    return res.status(200).json({ status: 'ok', database: 'not_configured' });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ status: 'error', database: 'disconnected' });
  }
}

