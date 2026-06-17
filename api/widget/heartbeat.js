import { getDb } from '../utils/db.js';
import { validateWidgetAccess } from '../utils/license.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, url, widgetVersion, metadata, licenseKey, apiKey } = req.body || {};

  try {
    const access = await validateWidgetAccess(req, { siteId, licenseKey, apiKey, allowDevOrigin: true });
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    if (!process.env.NEON_DATABASE_URL) {
      return res.status(200).json({ success: true, message: 'Heartbeat accepted: database not configured' });
    }

    const sql = getDb();
    const domain = access.domain || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    const result = await sql`
      INSERT INTO widget_installations (
        site_id, domain, client_id, first_seen_at, last_seen_at,
        last_url, widget_version, user_agent, status, metadata
      )
      VALUES (
        ${siteId}, ${domain}, ${access.clientId || null}, NOW(), NOW(),
        ${url || null}, ${widgetVersion || null}, ${userAgent}, 'active',
        ${JSON.stringify(metadata || {})}
      )
      ON CONFLICT (site_id, domain)
      DO UPDATE SET
        client_id = COALESCE(EXCLUDED.client_id, widget_installations.client_id),
        last_seen_at = NOW(),
        last_url = EXCLUDED.last_url,
        widget_version = EXCLUDED.widget_version,
        user_agent = EXCLUDED.user_agent,
        status = 'active',
        metadata = EXCLUDED.metadata
      RETURNING id, site_id, domain, status, last_seen_at
    `;

    return res.status(200).json({ success: true, installation: result[0] });
  } catch (error) {
    console.error('Widget heartbeat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
