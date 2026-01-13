# Local Development Setup Guide

This guide will help you run the a11y widget project in your local environment.

## Prerequisites

- Node.js 18+ installed
- A Neon database (or PostgreSQL) configured
- npm or yarn package manager

## Step 1: Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
# Install root dependencies
npm install

# Install website dependencies
cd website
npm install
cd ..
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
# Get your Neon database URL from: https://console.neon.tech
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Configuration
# Generate a secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-here-min-32-chars-change-in-production
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Password Hashing
BCRYPT_ROUNDS=10

# Server Port (optional, defaults to 3000)
PORT=3000
```

### Generating a Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` value.

## Step 3: Set Up Database

### Option A: Using Neon (Recommended)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` file as `NEON_DATABASE_URL`

### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally:

```env
NEON_DATABASE_URL=postgresql://username:password@localhost:5432/a11y_widget
```

### Run Database Migrations

Run the database migrations to set up the schema:

```bash
# Run all migrations
node scripts/run-migration.js

# Or run migrations individually:
# psql $NEON_DATABASE_URL -f database/migrations/001_initial.sql
# psql $NEON_DATABASE_URL -f database/migrations/002_authentication.sql
# psql $NEON_DATABASE_URL -f database/migrations/003_allowed_domains.sql
```

## Step 4: Create Admin User

Create your first admin user:

```bash
node scripts/create-admin.js admin@example.com your-secure-password
```

Or run interactively:

```bash
node scripts/create-admin.js
```

## Step 5: Build Website (if needed)

The website is already built, but if you need to rebuild:

```bash
cd website
npm run build
cd ..
```

## Step 6: Start the Server

Start the development server:

```bash
npm start
```

Or:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## Step 7: Access the Application

- **Website**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **Admin Portal**: http://localhost:3000/admin/login

## Development Workflow

### Running Website in Development Mode

If you want to work on the website frontend with hot reload:

```bash
# Terminal 1: Start backend server
npm start

# Terminal 2: Start website dev server
cd website
npm run dev
```

The website dev server will run on `http://localhost:5173` (Vite default port).

### Testing API Endpoints

You can test the API endpoints using curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

## Troubleshooting

### Server Won't Start

1. **Check environment variables**: Make sure `.env` file exists and has all required variables
2. **Check database connection**: Verify `NEON_DATABASE_URL` is correct
3. **Check port availability**: Make sure port 3000 (or your custom PORT) is not in use

### Database Connection Errors

1. **Verify database URL**: Check that `NEON_DATABASE_URL` is correct
2. **Check database migrations**: Make sure migrations have been run
3. **Test connection**: Try connecting with psql: `psql $NEON_DATABASE_URL`

### Website Not Loading

1. **Check if website is built**: Verify `website/dist` directory exists
2. **Rebuild website**: Run `cd website && npm run build`
3. **Check server logs**: Look for errors in the terminal

### Authentication Issues

1. **Verify admin user exists**: Run `node scripts/create-admin.js` to create/verify admin user
2. **Check JWT_SECRET**: Make sure it's set and at least 32 characters
3. **Check token expiration**: Verify `JWT_EXPIRES_IN` is set correctly

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEON_DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | 3600 | JWT token expiration in seconds |
| `JWT_REFRESH_EXPIRES_IN` | No | 604800 | Refresh token expiration in seconds |
| `BCRYPT_ROUNDS` | No | 10 | Bcrypt hashing rounds |
| `PORT` | No | 3000 | Server port |

## Next Steps

After the server is running:

1. ✅ Access the admin portal at `/admin/login`
2. ✅ Create a client account
3. ✅ Test the widget on your website
4. ✅ Review the API documentation

For more information, see:
- [Authentication Setup](docs/AUTHENTICATION_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Developer Guide](docs/DEVELOPER.md)
