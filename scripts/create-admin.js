#!/usr/bin/env node
/**
 * Script to create the first admin user
 * Usage: node scripts/create-admin.js <email> <password>
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: NEON_DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    const sql = neon(dbUrl);

    // Get email and password
    const email = process.argv[2] || await question('Admin email: ');
    const password = process.argv[3] || await question('Admin password: ');

    if (!email || !password) {
      console.error('Error: Email and password are required');
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

    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existing.length > 0) {
      console.log('Admin user already exists with this email');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${email.toLowerCase()}, ${passwordHash}, 'admin')
      RETURNING id, email, role
    `;

    console.log('Admin user created successfully!');
    console.log('Email:', result[0].email);
    console.log('Role:', result[0].role);
    console.log('ID:', result[0].id);

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
