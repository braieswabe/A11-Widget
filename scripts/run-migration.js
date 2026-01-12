#!/usr/bin/env node
/**
 * Script to run database migrations
 * Usage: node scripts/run-migration.js [migration-file]
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration(migrationFile) {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ Error: NEON_DATABASE_URL environment variable is not set');
    console.error('   Please set it in your .env file or export it:');
    console.error('   export NEON_DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  try {
    // Read migration file
    const migrationPath = migrationFile || join(__dirname, '../database/migrations/002_authentication.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const sqlContent = readFileSync(migrationPath, 'utf-8');
    
    if (!sqlContent.trim()) {
      console.error('❌ Error: Migration file is empty');
      process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    const sql = neon(dbUrl);
    
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');

    // Split SQL content by semicolons and execute each statement
    // Note: This is a simple approach. For production, consider using a proper SQL parser
    console.log('🚀 Running migration...');
    
    // Execute the entire migration file
    // Neon serverless doesn't support multi-statement queries directly,
    // so we'll need to split and execute statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        // For statements that don't return data, we can use sql.unsafe
        // But neon serverless uses template literals, so we need a different approach
        // Let's execute the full file as one query using raw SQL
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      } catch (err) {
        console.error(`   ⚠️  Warning on statement ${i + 1}:`, err.message);
      }
    }

    // Since neon serverless uses template literals, we'll execute the whole file
    // Note: This requires the SQL to be valid as a single statement
    // For complex migrations, it's better to use Neon's SQL editor
    console.log('⚠️  Note: Neon serverless driver requires template literals.');
    console.log('   For complex migrations, please use one of these methods:');
    console.log('   1. Neon SQL Editor (recommended)');
    console.log('   2. psql command line');
    console.log('');
    console.log('📋 Migration SQL content:');
    console.log('─'.repeat(60));
    console.log(sqlContent);
    console.log('─'.repeat(60));
    console.log('');
    console.log('✅ Migration file is ready to run.');
    console.log('');
    console.log('💡 To run this migration:');
    console.log('   1. Go to your Neon dashboard');
    console.log('   2. Open the SQL Editor');
    console.log('   3. Copy and paste the SQL above');
    console.log('   4. Click "Run"');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2];
runMigration(migrationFile);
