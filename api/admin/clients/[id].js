import { getDb } from '../../utils/db.js';
import { authenticateAdmin } from '../../utils/middleware.js';
import { hashPassword, generateApiKey, isValidEmail, validatePassword } from '../../utils/auth.js';
import { del } from '../../utils/cache.js';

// GET /api/admin/clients/:id - Get client details
async function getClient(req, res) {
  const { id } = req.query;

  try {
    const sql = getDb();
    const result = await sql`
      SELECT 
        c.id,
        c.email,
        c.company_name,
        c.site_ids,
        c.api_key,
        c.is_active,
        c.created_at,
        c.updated_at,
        c.last_login_at,
        u.email as created_by_email
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = result[0];

    return res.status(200).json({
      client: {
        id: client.id,
        email: client.email,
        companyName: client.company_name,
        siteIds: client.site_ids || [],
        apiKey: client.api_key,
        isActive: client.is_active,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
        lastLoginAt: client.last_login_at,
        createdBy: client.created_by_email
      }
    });
  } catch (error) {
    console.error('Get client error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/admin/clients/:id - Update client
async function updateClient(req, res) {
  const { id } = req.query;
  const { email, password, companyName, siteIds, isActive } = req.body;

  try {
    const sql = getDb();

    // Get current client
    const current = await sql`
      SELECT id, email FROM clients WHERE id = ${id}
    `;

    if (current.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updates = {};
    const values = [];

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check if email is already taken by another client
      const existing = await sql`
        SELECT id FROM clients WHERE email = ${email.toLowerCase()} AND id != ${id}
      `;
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updates.email = email.toLowerCase();
    }

    if (password !== undefined) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.error });
      }
      updates.password_hash = await hashPassword(password);
    }

    if (companyName !== undefined) {
      updates.company_name = companyName || null;
    }

    if (siteIds !== undefined) {
      updates.site_ids = Array.isArray(siteIds) ? siteIds : [];
    }

    if (isActive !== undefined) {
      updates.is_active = isActive === true;
    }

    // Build update query dynamically using template literals
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Build combined update - use conditional SQL fragments
    const emailPart = updates.email ? sql`email = ${updates.email},` : sql``;
    const passwordPart = updates.password_hash ? sql`password_hash = ${updates.password_hash},` : sql``;
    const companyPart = updates.company_name !== undefined ? sql`company_name = ${updates.company_name},` : sql``;
    const sitesPart = updates.site_ids !== undefined ? sql`site_ids = ${updates.site_ids},` : sql``;
    const activePart = updates.is_active !== undefined ? sql`is_active = ${updates.is_active},` : sql``;

    const result = await sql`
      UPDATE clients SET 
        ${emailPart}
        ${passwordPart}
        ${companyPart}
        ${sitesPart}
        ${activePart}
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, company_name, site_ids, api_key, is_active, updated_at
    `;

    // Invalidate client cache if client data changed
    del(`client:${id}`);

    return res.status(200).json({
      success: true,
      client: {
        id: result[0].id,
        email: result[0].email,
        companyName: result[0].company_name,
        siteIds: result[0].site_ids || [],
        apiKey: result[0].api_key,
        isActive: result[0].is_active,
        updatedAt: result[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update client error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/admin/clients/:id - Deactivate client (soft delete)
async function deleteClient(req, res) {
  const { id } = req.query;

  try {
    const sql = getDb();

    const result = await sql`
      UPDATE clients
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Invalidate client cache
    del(`client:${id}`);

    return res.status(200).json({
      success: true,
      message: 'Client deactivated successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
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
      return getClient(req, res);
    } else if (req.method === 'PUT') {
      return updateClient(req, res);
    } else if (req.method === 'DELETE') {
      return deleteClient(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}
