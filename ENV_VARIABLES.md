# Environment Variables Guide

This guide explains what environment variables you need and how to get them.

## Required Environment Variables

### 1. `NEON_DATABASE_URL` (Required for API routes)

**What it is:**
- PostgreSQL connection string for your Neon database
- Used by API routes (`/api/telemetry`, `/api/config/[siteId]`, `/api/health`)

**When you need it:**
- ✅ Required if you want to use telemetry features
- ✅ Required if you want to use site-specific configurations
- ❌ Not required if you only want to serve the widget files and website

**How to get it:**

#### Step 1: Create a Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account (no credit card required)
3. Log in to your dashboard

#### Step 2: Create a Project
1. Click **"Create Project"** or **"New Project"**
2. Enter a project name (e.g., "a11y-widget")
3. Choose a region close to your users
4. Select PostgreSQL version (default is fine)
5. Click **"Create Project"**

#### Step 3: Get Connection String
1. In your Neon project dashboard, look for **"Connection Details"** or **"Connection String"**
2. You'll see something like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Click **"Copy"** to copy the connection string
4. **Important**: Make sure it includes `?sslmode=require` at the end

#### Step 4: Run Database Schema
1. In Neon dashboard, click **"SQL Editor"**
2. Open `database/schema.sql` from this repository
3. Copy the entire contents
4. Paste into Neon SQL Editor
5. Click **"Run"** to create the tables

#### Step 5: Set in Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Click **"Add New"**
4. Enter:
   - **Name**: `NEON_DATABASE_URL`
   - **Value**: Paste your connection string
   - **Environment**: Select all (Production, Preview, Development)
5. Click **"Save"**
6. **Redeploy** your project for changes to take effect

## Optional Environment Variables

Currently, there are no optional environment variables. All configuration is done via:
- Widget configuration object (`window.__A11Y_WIDGET__`)
- Vercel project settings
- Database tables (for site configs)

## Environment Variable Format

### `NEON_DATABASE_URL`
```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
postgresql://myuser:mypassword@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Setting Up in Different Environments

### Local Development

Create a `.env.local` file in the project root:

```bash
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

**Note**: `.env.local` is already in `.gitignore` - never commit this file!

### Vercel Production

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `NEON_DATABASE_URL` with your connection string
3. Select **Production** environment
4. Save and redeploy

### Vercel Preview/Development

Same as above, but select **Preview** and/or **Development** environments when adding the variable.

## Testing Your Environment Variables

### Test Database Connection

After setting up `NEON_DATABASE_URL`, test it:

```bash
# Health check endpoint
curl https://yourdomain.vercel.app/api/health

# Expected response:
# {"status":"ok","database":"connected"}
```

### Test Telemetry (if enabled)

```bash
curl -X POST https://yourdomain.vercel.app/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "test-site",
    "event": "widget_open",
    "payload": {},
    "url": "https://example.com",
    "userAgent": "Mozilla/5.0..."
  }'

# Expected response:
# {"success":true}
```

## Troubleshooting

### "Database connection failed"
- ✅ Verify `NEON_DATABASE_URL` is set correctly in Vercel
- ✅ Check that connection string includes `?sslmode=require`
- ✅ Ensure Neon project is active (not paused)
- ✅ Verify database schema has been run

### "Environment variable not found"
- ✅ Check variable name is exactly `NEON_DATABASE_URL` (case-sensitive)
- ✅ Ensure variable is set for the correct environment (Production/Preview/Development)
- ✅ Redeploy after adding environment variables

### "Table does not exist"
- ✅ Run `database/schema.sql` in Neon SQL Editor
- ✅ Verify tables exist: `telemetry_events` and `site_configs`

## Security Best Practices

1. **Never commit** `.env` files or connection strings to Git
2. **Use environment variables** for all sensitive data
3. **Rotate credentials** regularly
4. **Use different databases** for production and development
5. **Restrict access** - only add team members who need database access

## Quick Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `NEON_DATABASE_URL` | Only for API features | Database connection | Neon dashboard → Connection Details |

## Next Steps

1. ✅ Get `NEON_DATABASE_URL` from Neon
2. ✅ Run database schema
3. ✅ Set environment variable in Vercel
4. ✅ Redeploy your project
5. ✅ Test with `/api/health` endpoint

For detailed database setup, see [`database/setup.md`](database/setup.md)

