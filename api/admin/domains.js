import { neon } from '@neondatabase/serverless';
import { authenticateAdmin } from '../utils/middleware.js';

// Helper function to validate domain format
function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  // Basic domain validation regex
  // Allows domains like: example.com, subdomain.example.com, localhost, etc.
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^localhost$|^localhost:\d+$|^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
  
  // Remove protocol and path if present
  const cleanDomain = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, ''); // Remove port for validation
  
  return domainRegex.test(cleanDomain);
}

// Helper function to normalize domain
function normalizeDomain(domain) {
  return domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

// GET /api/admin/domains - List all allowed domains
async function listDomains(req, res) {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const { isActive } = req.query;

    let query = sql`
      SELECT 
        d.id,
        d.domain,
        d.description,
        d.is_active,
        d.created_at,
        d.updated_at,
        u.email as created_by_email
      FROM allowed_domains d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE 1=1
    `;

    if (isActive !== undefined) {
      query = sql`
        SELECT 
          d.id,
          d.domain,
          d.description,
          d.is_active,
          d.created_at,
          d.updated_at,
          u.email as created_by_email
        FROM allowed_domains d
        LEFT JOIN users u ON d.created_by = u.id
        WHERE d.is_active = ${isActive === 'true'}
        ORDER BY d.created_at DESC
      `;
    } else {
      query = sql`
        SELECT 
          d.id,
          d.domain,
          d.description,
          d.is_active,
          d.created_at,
          d.updated_at,
          u.email as created_by_email
        FROM allowed_domains d
        LEFT JOIN users u ON d.created_by = u.id
        ORDER BY d.created_at DESC
      `;
    }

    const domains = await query;

    return res.status(200).json({
      domains: domains.map(domain => ({
        id: domain.id,
        domain: domain.domain,
        description: domain.description,
        isActive: domain.is_active,
        createdAt: domain.created_at,
        updatedAt: domain.updated_at,
        createdBy: domain.created_by_email
      }))
    });
  } catch (error) {
    console.error('List domains error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/admin/domains - Create new allowed domain
async function createDomain(req, res) {
  const { domain, description } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const normalizedDomain = normalizeDomain(domain);
  
  if (!isValidDomain(normalizedDomain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Check if domain already exists
    const existing = await sql`
      SELECT id FROM allowed_domains WHERE domain = ${normalizedDomain}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Domain already exists' });
    }

    // Create domain
    const result = await sql`
      INSERT INTO allowed_domains (domain, description, created_by)
      VALUES (
        ${normalizedDomain},
        ${description || null},
        ${req.admin.id}
      )
      RETURNING id, domain, description, is_active, created_at
    `;

    const newDomain = result[0];

    return res.status(201).json({
      success: true,
      domain: {
        id: newDomain.id,
        domain: newDomain.domain,
        description: newDomain.description,
        isActive: newDomain.is_active,
        createdAt: newDomain.created_at
      }
    });
  } catch (error) {
    console.error('Create domain error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authenticate admin
  return authenticateAdmin(req, res, async () => {
    if (req.method === 'GET') {
      return listDomains(req, res);
    } else if (req.method === 'POST') {
      return createDomain(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}
