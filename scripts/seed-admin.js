import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';
import { hashPassword } from '../api/utils/auth.js';

function loadEnv() {
  const envPath = '.env';
  if (!fs.existsSync(envPath)) {
    throw new Error('.env not found');
  }

  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    env[key] = value;
  }
  return env;
}

const email = process.argv[2] || 'admin@widget.com';
const password = process.argv[3];

if (!password) {
  throw new Error('Usage: node scripts/seed-admin.js <email> <password>');
}

const env = loadEnv();
if (!env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is required');
}

const sql = neon(env.NEON_DATABASE_URL);
const passwordHash = await hashPassword(password);

const rows = await sql`
  INSERT INTO users (email, password_hash, role, is_active)
  VALUES (${email.toLowerCase()}, ${passwordHash}, 'admin', true)
  ON CONFLICT (email)
  DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_active = true,
    updated_at = NOW()
  RETURNING id, email, role, is_active, created_at, updated_at
`;

console.log(JSON.stringify(rows[0], null, 2));
