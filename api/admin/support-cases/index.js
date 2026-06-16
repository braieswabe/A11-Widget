import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';

async function listCases(req, res) {
  const { siteId, status } = req.query;
  const sql = getDb();

  const rows = await sql`
    SELECT sc.*, assignee.email AS assigned_to_email
    FROM support_cases sc
    LEFT JOIN users assignee ON sc.assigned_to = assignee.id
    WHERE (${siteId || null}::text IS NULL OR sc.site_id = ${siteId || null})
      AND (${status || null}::text IS NULL OR sc.status = ${status || null})
    ORDER BY sc.created_at DESC
    LIMIT 250
  `;

  return res.status(200).json({
    cases: rows.map((row) => ({
      id: row.id,
      siteId: row.site_id,
      domain: row.domain,
      url: row.url,
      issueType: row.issue_type,
      message: row.message,
      contactEmail: row.contact_email,
      widgetVersion: row.widget_version,
      browser: row.browser || {},
      recentErrors: row.recent_errors || [],
      status: row.status,
      assignedTo: row.assigned_to_email,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
}

async function updateCase(req, res) {
  const { id, status, assignToMe } = req.body || {};
  if (!id || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'id and valid status are required' });
  }

  const sql = getDb();
  const result = await sql`
    UPDATE support_cases
    SET
      status = ${status},
      assigned_to = CASE WHEN ${!!assignToMe} THEN ${req.admin.id} ELSE assigned_to END,
      resolved_at = CASE WHEN ${status === 'resolved' || status === 'closed'} THEN NOW() ELSE NULL END
    WHERE id = ${id}
    RETURNING id, site_id, status, assigned_to, resolved_at
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Support case not found' });
  }

  return res.status(200).json({ success: true, case: result[0] });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  return authenticateAdmin(req, res, async () => {
    if (!process.env.NEON_DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    if (req.method === 'GET') return listCases(req, res);
    if (req.method === 'PATCH') return updateCase(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}
