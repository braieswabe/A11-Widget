import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';

async function listSites(req, res) {
  const { search, status } = req.query;
  const sql = getDb();

  let rows;
  if (search) {
    rows = await sql`
      SELECT
        wi.*,
        c.email AS client_email,
        c.company_name,
        (
          SELECT COUNT(*)::int
          FROM widget_errors we
          WHERE we.site_id = wi.site_id
            AND we.domain IS NOT DISTINCT FROM wi.domain
            AND we.is_resolved = false
        ) AS unresolved_error_count,
        (
          SELECT COUNT(*)::int
          FROM support_cases sc
          WHERE sc.site_id = wi.site_id
            AND sc.domain IS NOT DISTINCT FROM wi.domain
            AND sc.status NOT IN ('resolved', 'closed')
        ) AS open_support_case_count
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
      SELECT
        wi.*,
        c.email AS client_email,
        c.company_name,
        (
          SELECT COUNT(*)::int
          FROM widget_errors we
          WHERE we.site_id = wi.site_id
            AND we.domain IS NOT DISTINCT FROM wi.domain
            AND we.is_resolved = false
        ) AS unresolved_error_count,
        (
          SELECT COUNT(*)::int
          FROM support_cases sc
          WHERE sc.site_id = wi.site_id
            AND sc.domain IS NOT DISTINCT FROM wi.domain
            AND sc.status NOT IN ('resolved', 'closed')
        ) AS open_support_case_count
      FROM widget_installations wi
      LEFT JOIN clients c ON wi.client_id = c.id
      WHERE wi.status = ${status}
      ORDER BY wi.last_seen_at DESC
      LIMIT 250
    `;
  } else {
    rows = await sql`
      SELECT
        wi.*,
        c.email AS client_email,
        c.company_name,
        (
          SELECT COUNT(*)::int
          FROM widget_errors we
          WHERE we.site_id = wi.site_id
            AND we.domain IS NOT DISTINCT FROM wi.domain
            AND we.is_resolved = false
        ) AS unresolved_error_count,
        (
          SELECT COUNT(*)::int
          FROM support_cases sc
          WHERE sc.site_id = wi.site_id
            AND sc.domain IS NOT DISTINCT FROM wi.domain
            AND sc.status NOT IN ('resolved', 'closed')
        ) AS open_support_case_count
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
      title: row.metadata?.title || null,
      faviconUrl: row.metadata?.faviconUrl || null,
      unresolvedErrorCount: Number(row.unresolved_error_count || 0),
      openSupportCaseCount: Number(row.open_support_case_count || 0),
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
