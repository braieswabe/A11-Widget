import { neon } from '@neondatabase/serverless';
import { comparePassword, generateToken, hashToken, getClientIp, getUserAgent, isValidEmail } from '../utils/auth.js';

function writeLog(data) {
  const logData = {...data, timestamp: Date.now()};
  // Log to console for Vercel logs
  console.log('[DEBUG]', JSON.stringify(logData));
  // Try HTTP logging for local dev
  try {
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(() => {});
  } catch (e) {}
  // Try filesystem logging as fallback
  try {
    const fs = require('fs');
    const logPath = '/Users/braiebook/a11y_widget_v1/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
  } catch (e) {}
}

export default async function handler(req, res) {
  // #region agent log
  writeLog({location:'api/auth/login.js:4',message:'Login handler called',data:{method:req.method,url:req.url,hasBody:!!req.body},sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
  // #endregion
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    // #region agent log
    writeLog({location:'api/auth/login.js:10',message:'Method not allowed',data:{method:req.method},sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
    // #endregion
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, apiKey, siteId } = req.body;
  // #region agent log
  writeLog({location:'api/auth/login.js:13',message:'Request body parsed',data:{hasEmail:!!email,hasPassword:!!password,hasApiKey:!!apiKey,siteId:siteId},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
  // #endregion

  // Validate input
  if (!apiKey && (!email || !password)) {
    return res.status(400).json({ error: 'Either email/password or apiKey is required' });
  }

  if (apiKey && (email || password)) {
    return res.status(400).json({ error: 'Cannot use both email/password and apiKey' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!process.env.NEON_DATABASE_URL) {
    // #region agent log
    writeLog({location:'api/auth/login.js:28',message:'Database URL not configured',data:{hasEnvVar:false},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
    // #endregion
    return res.status(500).json({ error: 'Database not configured' });
  }

  // #region agent log
  writeLog({location:'api/auth/login.js:32',message:'Database connection starting',data:{hasDbUrl:!!process.env.NEON_DATABASE_URL,dbUrlPrefix:process.env.NEON_DATABASE_URL?.substring(0,20)},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
  // #endregion
  try {
    const { getDb } = await import('../utils/db.js');
    const { set } = await import('../utils/cache.js');
    const sql = getDb();
    let client;

    if (apiKey) {
      // #region agent log
      writeLog({location:'api/auth/login.js:36',message:'API key authentication path',data:{apiKeyPrefix:apiKey?.substring(0,10)},sessionId:'debug-session',runId:'run1',hypothesisId:'D'});
      // #endregion
      // API key authentication
      const result = await sql`
        SELECT id, email, password_hash, company_name, site_ids, is_active, api_key
        FROM clients
        WHERE api_key = ${apiKey} AND is_active = true
      `;
      // #region agent log
      writeLog({location:'api/auth/login.js:42',message:'API key query result',data:{resultCount:result.length,foundClient:result.length>0,clientId:result[0]?.id},sessionId:'debug-session',runId:'run1',hypothesisId:'D'});
      // #endregion

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      client = result[0];
    } else {
      // #region agent log
      writeLog({location:'api/auth/login.js:49',message:'Email/password authentication path',data:{email:email?.toLowerCase()},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
      // #endregion
      // Email/password authentication
      const result = await sql`
        SELECT id, email, password_hash, company_name, site_ids, is_active, api_key
        FROM clients
        WHERE email = ${email.toLowerCase()} AND is_active = true
      `;
      // #region agent log
      writeLog({location:'api/auth/login.js:55',message:'Email query result',data:{resultCount:result.length,foundClient:result.length>0,clientId:result[0]?.id},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
      // #endregion

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      client = result[0];

      // Verify password
      const passwordMatch = await comparePassword(password, client.password_hash);
      // #region agent log
      writeLog({location:'api/auth/login.js:64',message:'Password verification',data:{passwordMatch:passwordMatch},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
      // #endregion
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Check site access if siteId is provided
    if (siteId) {
      const hasAccess = !client.site_ids || client.site_ids.length === 0 || 
                       client.site_ids.includes(siteId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied for this site' });
      }
    }

    // Generate token
    const tokenPayload = {
      clientId: client.id,
      email: client.email,
      type: 'client'
    };

    const token = generateToken(tokenPayload);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store token hash in database
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    await sql`
      INSERT INTO auth_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES (${client.id}, ${tokenHash}, ${expiresAt.toISOString()}, ${userAgent}, ${ipAddress})
    `;

    // Update last login
    await sql`
      UPDATE clients
      SET last_login_at = NOW()
      WHERE id = ${client.id}
    `;

    // #region agent log
    writeLog({location:'api/auth/login.js:106',message:'Login successful',data:{clientId:client.id,email:client.email,hasToken:!!token},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
    // #endregion
    return res.status(200).json({
      success: true,
      token,
      expiresIn: 3600,
      client: {
        id: client.id,
        email: client.email,
        companyName: client.company_name,
        siteIds: client.site_ids || []
      }
    });
  } catch (error) {
    // #region agent log
    writeLog({location:'api/auth/login.js:117',message:'Login error caught',data:{error:error.message,errorType:error.name,stack:error.stack?.substring(0,200)},sessionId:'debug-session',runId:'run1',hypothesisId:'C'});
    // #endregion
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
