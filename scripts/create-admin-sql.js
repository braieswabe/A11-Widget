#!/usr/bin/env node
/**
 * Script to generate SQL for creating an admin user
 * Usage: node scripts/create-admin-sql.js <email> <password> [output-file]
 * 
 * Example:
 *   node scripts/create-admin-sql.js joseph@careerdriver.com 12345678 database/admin-user-joseph.sql
 */

import bcrypt from 'bcryptjs';
import { writeFileSync } from 'fs';

async function generateAdminSQL(email, password, outputFile) {
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-sql.js <email> <password> [output-file]');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }

  // Validate password
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    const sql = `-- Admin User Creation SQL
-- Email: ${email}
-- Generated at: ${new Date().toISOString()}

-- Insert admin user
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
  '${email.toLowerCase()}',
  '${passwordHash}',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email = '${email.toLowerCase()}';
`;

    if (outputFile) {
      writeFileSync(outputFile, sql, 'utf-8');
      console.log(`✅ SQL file created: ${outputFile}`);
      console.log('');
      console.log('📋 SQL Content:');
      console.log('─'.repeat(60));
      console.log(sql);
      console.log('─'.repeat(60));
    } else {
      console.log('📋 Generated SQL:');
      console.log('─'.repeat(60));
      console.log(sql);
      console.log('─'.repeat(60));
      console.log('');
      console.log('💡 To save to a file, run:');
      console.log(`   node scripts/create-admin-sql.js "${email}" "${password}" database/admin-user.sql`);
    }

    console.log('');
    console.log('🚀 To run this SQL:');
    console.log('   1. Copy the SQL above');
    console.log('   2. Paste it into Neon SQL Editor');
    console.log('   3. Click "Run"');
    console.log('');
    console.log('   OR use psql:');
    console.log(`   psql \$NEON_DATABASE_URL -f ${outputFile || 'database/admin-user.sql'}`);

  } catch (error) {
    console.error('Error generating SQL:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];
const outputFile = process.argv[4] || 'database/admin-user.sql';

generateAdminSQL(email, password, outputFile);
