#!/bin/bash

# Setup script for local environment variables

echo "Setting up .env file for local development..."
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null)

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="change-this-secret-key-in-production-min-32-chars-$(date +%s)"
fi

# Create .env file
cat > .env << EOF
# Database Configuration
# Get your Neon database URL from: https://console.neon.tech
# Or use local PostgreSQL: postgresql://username:password@localhost:5432/a11y_widget
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Configuration
# Generated secure secret (change in production)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Password Hashing
BCRYPT_ROUNDS=10

# Server Port (optional, defaults to 3000)
PORT=3000
EOF

echo "✅ .env file created!"
echo ""
echo "⚠️  IMPORTANT: Please update NEON_DATABASE_URL with your actual database connection string"
echo ""
echo "Next steps:"
echo "1. Edit .env and set your NEON_DATABASE_URL"
echo "2. Run database migrations: node scripts/run-migration.js"
echo "3. Create admin user: node scripts/create-admin.js"
echo "4. Start server: npm start"
