import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';
import { sendAdminAlert } from '../../utils/alerts.js';
import { extractToken } from '../../utils/auth.js';

async function runSweep(req, res) {
  const staleMinutes = Math.max(5, Number(req.body?.staleMinutes || process.env.WIDGET_STALE_MINUTES || 60));
  const downMinutes = Math.max(staleMinutes + 1, Number(req.body?.downMinutes || process.env.WIDGET_DOWN_MINUTES || 1440));
  const sql = getDb();

  const stale = await sql`
    UPDATE widget_installations
    SET status = 'stale'
    WHERE last_seen_at < NOW() - (${staleMinutes} || ' minutes')::interval
      AND last_seen_at >= NOW() - (${downMinutes} || ' minutes')::interval
      AND status <> 'stale'
    RETURNING site_id, domain, last_seen_at, last_url
  `;

  const down = await sql`
    UPDATE widget_installations
    SET status = 'down'
    WHERE last_seen_at < NOW() - (${downMinutes} || ' minutes')::interval
      AND status <> 'down'
    RETURNING site_id, domain, last_seen_at, last_url
  `;

  if (stale.length || down.length) {
    const rows = [...stale.map((item) => ({ ...item, status: 'stale' })), ...down.map((item) => ({ ...item, status: 'down' }))];
    sendAdminAlert({
      subject: `[A11y Widget] ${rows.length} site health alert${rows.length === 1 ? '' : 's'}`,
      html: `
        <h2>Widget site health alerts</h2>
        <p>${rows.length} widget installation${rows.length === 1 ? '' : 's'} changed status.</p>
        <ul>
          ${rows.map((row) => `<li><strong>${row.status}</strong>: ${row.site_id} (${row.domain}) last seen ${row.last_seen_at}</li>`).join('')}
        </ul>
      `
    }).catch(() => {});
  }

  return res.status(200).json({
    success: true,
    staleCount: stale.length,
    downCount: down.length,
    stale,
    down
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cronSecret = process.env.CRON_SECRET;
  const token = extractToken(req) || req.headers['x-cron-secret'];
  if (cronSecret && token === cronSecret) {
    if (!process.env.NEON_DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    return runSweep(req, res);
  }

  return authenticateAdmin(req, res, async () => {
    if (!process.env.NEON_DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    return runSweep(req, res);
  });
}
