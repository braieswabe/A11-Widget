import { getDb } from '../utils/db.js';
import { authenticateAdmin } from '../utils/middleware.js';
import { hashPassword, generateApiKey, isValidEmail, validatePassword } from '../utils/auth.js';
import { del } from '../utils/cache.js';

// GET /api/admin/clients - List all clients
async function listClients(req, res) {
  try {
    const sql = getDb();
    const { search, isActive } = req.query;

    let query = sql`
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
      WHERE 1=1
    `;

    if (isActive !== undefined) {
      query = sql`
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
        WHERE c.is_active = ${isActive === 'true'}
      `;
    }

    if (search) {
      query = sql`
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
        WHERE (
          c.email ILIKE ${'%' + search + '%'} OR
          c.company_name ILIKE ${'%' + search + '%'}
        )
        ${isActive !== undefined ? sql`AND c.is_active = ${isActive === 'true'}` : sql``}
      `;
    }

    const clients = await query;

    return res.status(200).json({
      clients: clients.map(client => ({
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
      }))
    });
  } catch (error) {
    console.error('List clients error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/admin/clients - Create new client
async function createClient(req, res) {
  const { email, password, companyName, siteIds } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: passwordValidation.error });
  }

  try {
    const sql = getDb();

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM clients WHERE email = ${email.toLowerCase()}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Client with this email already exists' });
    }

    // Hash password and generate API key
    const passwordHash = await hashPassword(password);
    const apiKey = generateApiKey();

    // Create client
    const result = await sql`
      INSERT INTO clients (email, password_hash, company_name, api_key, site_ids, created_by)
      VALUES (
        ${email.toLowerCase()},
        ${passwordHash},
        ${companyName || null},
        ${apiKey},
        ${siteIds && Array.isArray(siteIds) ? siteIds : []},
        ${req.admin.id}
      )
      RETURNING id, email, company_name, api_key, site_ids, created_at
    `;

    const client = result[0];

    // Cache will be populated on first access, no need to invalidate here

    return res.status(201).json({
      success: true,
      client: {
        id: client.id,
        email: client.email,
        companyName: client.company_name,
        siteIds: client.site_ids || [],
        apiKey: client.api_key,
        createdAt: client.created_at
      }
    });
  } catch (error) {
    console.error('Create client error:', error);
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
      return listClients(req, res);
    } else if (req.method === 'POST') {
      return createClient(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}
