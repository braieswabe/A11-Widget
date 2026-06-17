import { getDb } from './db.js';

export function normalizeDomain(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
}

export function getRequestDomain(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  const host = req.headers.host || '';
  if (origin) {
    try {
      return normalizeDomain(new URL(origin).hostname);
    } catch {
      return normalizeDomain(host);
    }
  }
  return normalizeDomain(host);
}

function domainMatches(requestDomain, allowedDomain) {
  if (!requestDomain || !allowedDomain) return false;
  return requestDomain === allowedDomain || requestDomain.endsWith(`.${allowedDomain}`);
}

function isDevDomain(domain) {
  return domain === 'localhost' ||
    domain === '127.0.0.1' ||
    domain === '::1' ||
    domain.endsWith('.localhost');
}

export async function validateWidgetAccess(req, { siteId, licenseKey, apiKey, allowDevOrigin = false } = {}) {
  const requestDomain = getRequestDomain(req);
  const key = licenseKey || apiKey || req.headers['x-a11y-api-key'] || req.headers['x-a11y-license-key'] || null;

  if (!siteId || typeof siteId !== 'string') {
    return { allowed: false, status: 400, error: 'siteId is required', domain: requestDomain };
  }

  if (allowDevOrigin && isDevDomain(requestDomain)) {
    return { allowed: true, domain: requestDomain, clientId: null, reason: 'Development origin allowed' };
  }

  if (!process.env.NEON_DATABASE_URL) {
    return { allowed: true, domain: requestDomain, clientId: null, reason: 'Database not configured' };
  }

  const sql = getDb();

  if (key) {
    const clients = await sql`
      SELECT id, site_ids, is_active
      FROM clients
      WHERE api_key = ${key} AND is_active = true
      LIMIT 1
    `;

    if (clients.length === 0) {
      return { allowed: false, status: 403, error: 'Invalid widget license key', domain: requestDomain };
    }

    const client = clients[0];
    const siteIds = client.site_ids || [];
    if (siteIds.length > 0 && !siteIds.includes(siteId)) {
      return { allowed: false, status: 403, error: 'License key is not authorized for this site', domain: requestDomain };
    }

    return { allowed: true, domain: requestDomain, clientId: client.id, reason: 'Client API key matched' };
  }

  const allowedDomains = await sql`
    SELECT domain
    FROM allowed_domains
    WHERE is_active = true
  `;

  if (allowedDomains.length === 0) {
    return { allowed: true, domain: requestDomain, clientId: null, reason: 'No domains configured' };
  }

  const matched = allowedDomains.some((row) => domainMatches(requestDomain, normalizeDomain(row.domain)));
  if (!matched) {
    return { allowed: false, status: 403, error: `Domain ${requestDomain || 'unknown'} is not licensed`, domain: requestDomain };
  }

  return { allowed: true, domain: requestDomain, clientId: null, reason: 'Allowed domain matched' };
}
