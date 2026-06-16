import { getDb } from '../utils/db.js';
import { validateWidgetAccess } from '../utils/license.js';
import { isValidEmail } from '../utils/auth.js';
import { sendAdminAlert } from '../utils/alerts.js';

function normalizeIssueType(value) {
  const allowed = ['bug', 'translation', 'accessibility', 'display', 'performance', 'other'];
  return allowed.includes(value) ? value : 'bug';
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
    url,
    issueType,
    message,
    contactEmail,
    widgetVersion,
    browser,
    recentErrors,
    licenseKey,
    apiKey
  } = req.body || {};

  if (!message || String(message).trim().length < 5) {
    return res.status(400).json({ error: 'Please describe the support issue' });
  }

  if (contactEmail && !isValidEmail(contactEmail)) {
    return res.status(400).json({ error: 'Invalid contact email' });
  }

  try {
    const access = await validateWidgetAccess(req, { siteId, licenseKey, apiKey });
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    if (!process.env.NEON_DATABASE_URL) {
      return res.status(200).json({ success: true, message: 'Support case accepted: database not configured' });
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO support_cases (
        site_id, domain, url, issue_type, message, contact_email,
        widget_version, browser, recent_errors
      )
      VALUES (
        ${siteId},
        ${access.domain || null},
        ${url || null},
        ${normalizeIssueType(issueType)},
        ${String(message).trim().slice(0, 5000)},
        ${contactEmail || null},
        ${widgetVersion || null},
        ${JSON.stringify(browser || {})},
        ${JSON.stringify(Array.isArray(recentErrors) ? recentErrors.slice(0, 10) : [])}
      )
      RETURNING id, site_id, status, created_at
    `;

    sendAdminAlert({
      subject: `[A11y Widget] New support case from ${siteId}`,
      html: `
        <h2>New widget support case</h2>
        <p><strong>Site:</strong> ${siteId}</p>
        <p><strong>Domain:</strong> ${access.domain || 'unknown'}</p>
        <p><strong>URL:</strong> ${url || 'unknown'}</p>
        <p><strong>Type:</strong> ${normalizeIssueType(issueType)}</p>
        <p><strong>Contact:</strong> ${contactEmail || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).trim().slice(0, 5000)}</p>
      `
    }).catch(() => {});

    return res.status(201).json({ success: true, case: result[0] });
  } catch (error) {
    console.error('Support case error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
