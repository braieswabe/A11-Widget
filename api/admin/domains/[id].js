import { neon } from '@neondatabase/serverless';
import { authenticateAdmin } from '../../utils/middleware.js';

// Helper function to validate domain format
function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^localhost$|^localhost:\d+$|^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
  
  const cleanDomain = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
  
  return domainRegex.test(cleanDomain);
}

// Helper function to normalize domain
function normalizeDomain(domain) {
  return domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

// GET /api/admin/domains/:id - Get domain details
async function getDomain(req, res) {
  const { id } = req.query;

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const result = await sql`
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
      WHERE d.id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const domain = result[0];

    return res.status(200).json({
      domain: {
        id: domain.id,
        domain: domain.domain,
        description: domain.description,
        isActive: domain.is_active,
        createdAt: domain.created_at,
        updatedAt: domain.updated_at,
        createdBy: domain.created_by_email
      }
    });
  } catch (error) {
    console.error('Get domain error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/admin/domains/:id - Update domain
async function updateDomain(req, res) {
  const { id } = req.query;
  const { domain, description, isActive } = req.body;

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Get current domain
    const current = await sql`
      SELECT id, domain FROM allowed_domains WHERE id = ${id}
    `;

    if (current.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const updates = {};

    if (domain !== undefined) {
      const normalizedDomain = normalizeDomain(domain);
      if (!isValidDomain(normalizedDomain)) {
        return res.status(400).json({ error: 'Invalid domain format' });
      }
      // Check if domain is already taken by another record
      const existing = await sql`
        SELECT id FROM allowed_domains WHERE domain = ${normalizedDomain} AND id != ${id}
      `;
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Domain already in use' });
      }
      updates.domain = normalizedDomain;
    }

    if (description !== undefined) {
      updates.description = description || null;
    }

    if (isActive !== undefined) {
      updates.is_active = isActive === true;
    }

    // Build update query dynamically
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const domainPart = updates.domain ? sql`domain = ${updates.domain},` : sql``;
    const descriptionPart = updates.description !== undefined ? sql`description = ${updates.description},` : sql``;
    const activePart = updates.is_active !== undefined ? sql`is_active = ${updates.is_active},` : sql``;

    const result = await sql`
      UPDATE allowed_domains SET 
        ${domainPart}
        ${descriptionPart}
        ${activePart}
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, domain, description, is_active, updated_at
    `;

    return res.status(200).json({
      success: true,
      domain: {
        id: result[0].id,
        domain: result[0].domain,
        description: result[0].description,
        isActive: result[0].is_active,
        updatedAt: result[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update domain error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/admin/domains/:id - Delete domain
async function deleteDomain(req, res) {
  const { id } = req.query;

  try {
    const sql = neon(process.env.NEON_DATABASE_URL);

    const result = await sql`
      DELETE FROM allowed_domains
      WHERE id = ${id}
      RETURNING id, domain
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    console.error('Delete domain error:', error);
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
      return getDomain(req, res);
    } else if (req.method === 'PUT') {
      return updateDomain(req, res);
    } else if (req.method === 'DELETE') {
      return deleteDomain(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}
