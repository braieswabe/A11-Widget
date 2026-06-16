import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';

async function listSites(req, res) {
  const { search, status } = req.query;
  const sql = getDb();

  let rows;
  if (search) {
    rows = await sql`
      SELECT wi.*, c.email AS client_email, c.company_name
      FROM widget_installations wi
      LEFT JOIN clients c ON wi.client_id = c.id
      WHERE wi.site_id ILIKE ${'%' + search + '%'}
        OR wi.domain ILIKE ${'%' + search + '%'}
        OR wi.last_url ILIKE ${'%' + search + '%'}
      ORDER BY wi.last_seen_at DESC
      LIMIT 250
    `;
  } else if (status) {
    rows = await sql`
      SELECT wi.*, c.email AS client_email, c.company_name
      FROM widget_installations wi
      LEFT JOIN clients c ON wi.client_id = c.id
      WHERE wi.status = ${status}
      ORDER BY wi.last_seen_at DESC
      LIMIT 250
    `;
  } else {
    rows = await sql`
      SELECT wi.*, c.email AS client_email, c.company_name
      FROM widget_installations wi
      LEFT JOIN clients c ON wi.client_id = c.id
      ORDER BY wi.last_seen_at DESC
      LIMIT 250
    `;
  }

  return res.status(200).json({
    sites: rows.map((row) => ({
      id: row.id,
      siteId: row.site_id,
      domain: row.domain,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      lastUrl: row.last_url,
      widgetVersion: row.widget_version,
      userAgent: row.user_agent,
      status: row.status,
      metadata: row.metadata || {},
      client: row.client_id ? {
        id: row.client_id,
        email: row.client_email,
        companyName: row.company_name
      } : null
    }))
  });
}

async function updateSite(req, res) {
  const { id, status } = req.body || {};
  if (!id || !['active', 'stale', 'down'].includes(status)) {
    return res.status(400).json({ error: 'id and valid status are required' });
  }

  const sql = getDb();
  const result = await sql`
    UPDATE widget_installations
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id, site_id, domain, status, last_seen_at
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Widget site not found' });
  }

  return res.status(200).json({ success: true, site: result[0] });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  return authenticateAdmin(req, res, async () => {
    if (!process.env.NEON_DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    if (req.method === 'GET') return listSites(req, res);
    if (req.method === 'PATCH') return updateSite(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}
