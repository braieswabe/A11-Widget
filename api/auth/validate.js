import { extractToken, verifyToken } from '../utils/auth.js';
import { authenticateClient } from '../utils/middleware.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use middleware to authenticate
  return authenticateClient(req, res, () => {
    return res.status(200).json({
      valid: true,
      client: {
        id: req.client.id,
        email: req.client.email,
        companyName: req.client.company_name,
        siteIds: req.client.site_ids || []
      }
    });
  });
}
