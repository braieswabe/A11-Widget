import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';

async function listErrors(req, res) {
  const { siteId, severity, resolved } = req.query;
  const sql = getDb();

  let rows = await sql`
    SELECT we.*, u.email AS resolved_by_email
    FROM widget_errors we
    LEFT JOIN users u ON we.resolved_by = u.id
    WHERE (${siteId || null}::text IS NULL OR we.site_id = ${siteId || null})
      AND (${severity || null}::text IS NULL OR we.severity = ${severity || null})
      AND (${resolved ?? null}::text IS NULL OR we.is_resolved = ${(resolved === 'true')})
    ORDER BY we.created_at DESC
    LIMIT 250
  `;

  return res.status(200).json({
    errors: rows.map((row) => ({
      id: row.id,
      siteId: row.site_id,
      domain: row.domain,
      severity: row.severity,
      source: row.source,
      message: row.message,
      stackSummary: row.stack_summary,
      url: row.url,
      widgetVersion: row.widget_version,
      browser: row.browser || {},
      metadata: row.metadata || {},
      isResolved: row.is_resolved,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by_email,
      createdAt: row.created_at
    }))
  });
}

async function updateError(req, res) {
  const { id, isResolved } = req.body || {};
  if (!id || typeof isResolved !== 'boolean') {
    return res.status(400).json({ error: 'id and isResolved are required' });
  }

  const sql = getDb();
  const result = await sql`
    UPDATE widget_errors
    SET
      is_resolved = ${isResolved},
      resolved_at = CASE WHEN ${isResolved} THEN NOW() ELSE NULL END,
      resolved_by = CASE WHEN ${isResolved} THEN ${req.admin.id} ELSE NULL END
    WHERE id = ${id}
    RETURNING id, site_id, is_resolved, resolved_at
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Widget error not found' });
  }

  return res.status(200).json({ success: true, error: result[0] });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  return authenticateAdmin(req, res, async () => {
    if (!process.env.NEON_DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    if (req.method === 'GET') return listErrors(req, res);
    if (req.method === 'PATCH') return updateError(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}
