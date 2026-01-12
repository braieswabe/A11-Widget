#!/usr/bin/env node
/**
 * Quick script to generate bcrypt hash for admin password
 * Usage: node scripts/generate-admin-hash.js [password]
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2] || '12345678';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Password hash generated:');
    console.log('─'.repeat(60));
    console.log(hash);
    console.log('─'.repeat(60));
    console.log('\n📋 SQL INSERT statement:');
    console.log('─'.repeat(60));
    console.log(`INSERT INTO users (email, password_hash, role, is_active)`);
    console.log(`VALUES (`);
    console.log(`  'joseph@careerdriver.com',`);
    console.log(`  '${hash}',`);
    console.log(`  'admin',`);
    console.log(`  true`);
    console.log(`)`);
    console.log(`ON CONFLICT (email) DO UPDATE SET`);
    console.log(`  password_hash = EXCLUDED.password_hash,`);
    console.log(`  role = EXCLUDED.role,`);
    console.log(`  is_active = EXCLUDED.is_active,`);
    console.log(`  updated_at = NOW();`);
    console.log('─'.repeat(60));
    console.log('\n💡 Copy the SQL above and run it in Neon SQL Editor');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.error('\n💡 Make sure dependencies are installed:');
    console.error('   npm install');
    process.exit(1);
  });
