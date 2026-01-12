import { getDb } from './utils/db.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, event, payload, url, userAgent } = req.body;

  // Validate (no PII)
  if (!siteId || !event) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validEvents = ['widget_open', 'setting_change', 'reset', 'widget_close'];
  if (!validEvents.includes(event)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }

  // Check if database is configured
  if (!process.env.NEON_DATABASE_URL) {
    // Silently succeed if database not configured (telemetry is optional)
    return res.status(200).json({ success: true, message: 'Telemetry disabled: database not configured' });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO telemetry_events (site_id, event_type, event_data, url, user_agent)
      VALUES (${siteId}, ${event}, ${JSON.stringify(payload || {})}, ${url || null}, ${userAgent || null})
    `;
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Telemetry error:', error);
    // Return success even on error to not break widget functionality
    return res.status(200).json({ success: false, error: 'Telemetry storage failed' });
  }
}

