# Neon Database Setup Guide

This guide walks you through setting up the Neon database for the Accessibility Widget v1.

## Prerequisites

- A Neon account (sign up at [neon.tech](https://neon.tech))
- Access to your Neon project dashboard

## Step-by-Step Setup

### 1. Create a Neon Project

1. Log in to your Neon dashboard
2. Click "Create Project"
3. Choose a project name (e.g., "a11y-widget")
4. Select a region close to your users
5. Click "Create Project"

### 2. Get Your Connection String

1. In your Neon project dashboard, go to the "Connection Details" section
2. Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
3. Save this securely - you'll need it for Vercel environment variables

### 3. Run the Schema

You have two options:

#### Option A: Using Neon SQL Editor (Recommended)

1. In your Neon dashboard, click "SQL Editor"
2. Open the `database/schema.sql` file from this repository
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to execute the schema

#### Option B: Using psql Command Line

```bash
psql $NEON_DATABASE_URL -f database/schema.sql
```

### 4. Verify Tables Created

Run this query in Neon SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('telemetry_events', 'site_configs');
```

You should see both tables listed.

### 5. Set Up Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `NEON_DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"

### 6. Test the Connection

After deploying to Vercel, test the health endpoint:

```bash
curl https://yourdomain.vercel.app/api/health
```

You should see:
```json
{"status":"ok","database":"connected"}
```

## Database Schema Overview

### `telemetry_events` Table

Stores widget usage events (if telemetry is enabled).

- `id`: UUID primary key
- `site_id`: Site identifier
- `event_type`: Type of event (widget_open, setting_change, reset, widget_close)
- `event_data`: JSON payload with event details
- `url`: Page URL where event occurred
- `user_agent`: Browser user agent
- `timestamp`: When the event occurred

### `site_configs` Table

Stores site-specific widget configurations (optional).

- `site_id`: Site identifier (primary key)
- `config`: JSON configuration object
- `created_at`: When config was created
- `updated_at`: When config was last updated

## Querying Telemetry Data

Example queries:

```sql
-- Get all events for a specific site
SELECT * FROM telemetry_events 
WHERE site_id = 'your-site-id' 
ORDER BY timestamp DESC;

-- Count events by type
SELECT event_type, COUNT(*) 
FROM telemetry_events 
GROUP BY event_type;

-- Get recent events (last 24 hours)
SELECT * FROM telemetry_events 
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

## Troubleshooting

### Connection Issues

- Verify your `NEON_DATABASE_URL` is correct in Vercel
- Check that your Neon project is active (not paused)
- Ensure SSL mode is included: `?sslmode=require`

### Schema Errors

- Make sure you're running the schema in the correct database
- Check that you have the necessary permissions
- Verify the schema file hasn't been modified incorrectly

### Performance Issues

- The indexes are automatically created by the schema
- For high-volume telemetry, consider partitioning the `telemetry_events` table by date
- Monitor query performance in Neon dashboard

## Security Notes

- Never commit your `NEON_DATABASE_URL` to version control
- Use environment variables for all sensitive data
- Regularly rotate database credentials
- Consider IP allowlisting in Neon for additional security

