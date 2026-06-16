import { getDb } from '../utils/db.js';
import { validateWidgetAccess } from '../utils/license.js';
import { sendAdminAlert } from '../utils/alerts.js';

function clampText(value, max) {
  if (!value) return null;
  return String(value).slice(0, max);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    siteId,
    severity = 'error',
    source = 'widget',
    message,
    stack,
    url,
    widgetVersion,
    browser,
    metadata,
    licenseKey,
    apiKey
  } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const access = await validateWidgetAccess(req, { siteId, licenseKey, apiKey });
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    if (!process.env.NEON_DATABASE_URL) {
      return res.status(200).json({ success: true, message: 'Error accepted: database not configured' });
    }

    const normalizedSeverity = ['info', 'warning', 'error', 'critical'].includes(severity) ? severity : 'error';
    const sql = getDb();
    const result = await sql`
      INSERT INTO widget_errors (
        site_id, domain, severity, source, message, stack_summary,
        url, widget_version, browser, metadata
      )
      VALUES (
        ${siteId},
        ${access.domain || null},
        ${normalizedSeverity},
        ${clampText(source, 80) || 'widget'},
        ${clampText(message, 1000)},
        ${clampText(stack, 2000)},
        ${url || null},
        ${widgetVersion || null},
        ${JSON.stringify(browser || {})},
        ${JSON.stringify(metadata || {})}
      )
      RETURNING id, site_id, severity, created_at
    `;

    if (normalizedSeverity === 'critical' || normalizedSeverity === 'error') {
      sendAdminAlert({
        subject: `[A11y Widget] ${normalizedSeverity.toUpperCase()} on ${siteId}`,
        html: `
          <h2>Widget error detected</h2>
          <p><strong>Site:</strong> ${siteId}</p>
          <p><strong>Domain:</strong> ${access.domain || 'unknown'}</p>
          <p><strong>URL:</strong> ${url || 'unknown'}</p>
          <p><strong>Message:</strong> ${clampText(message, 1000)}</p>
        `
      }).catch(() => {});
    }

    return res.status(201).json({ success: true, error: result[0] });
  } catch (error) {
    console.error('Widget error log error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
