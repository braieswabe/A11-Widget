# Deployment Guide — Accessibility Widget v1

This guide walks you through deploying the Accessibility Widget v1 to Vercel with Neon database integration.

## Prerequisites

- [Vercel account](https://vercel.com) (free tier works)
- [Neon account](https://neon.tech) (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ (for local testing, optional)

## Step-by-Step Deployment

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd a11y_widget_v1
```

### 2. Set Up Neon Database

Follow the detailed guide in [`database/setup.md`](database/setup.md):

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Run the schema from `database/schema.sql` in Neon SQL Editor
3. Copy your connection string (format: `postgresql://user:pass@host/db?sslmode=require`)

### 3. Configure Vercel Project

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and click "New Project"
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: Leave empty (no build step)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install` (installs Neon driver)

#### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts to link your project.

### 4. Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEON_DATABASE_URL` | Your Neon connection string | Production, Preview, Development |

**Important**: Include `?sslmode=require` in your connection string.

### 5. Deploy

#### Via Dashboard:
- Push to your main branch (Vercel auto-deploys)
- Or click "Redeploy" in the Vercel dashboard

#### Via CLI:
```bash
vercel --prod
```

### 6. Verify Deployment

#### Check Static Assets

```bash
# Widget JavaScript
curl https://yourdomain.vercel.app/a11y-widget/v1/a11y-widget.js

# Widget CSS
curl https://yourdomain.vercel.app/a11y-widget/v1/a11y-widget.css
```

Both should return the file contents with `Cache-Control: public, max-age=31536000, immutable` header.

#### Check API Endpoints

```bash
# Health check
curl https://yourdomain.vercel.app/api/health
# Expected: {"status":"ok","database":"connected"}

# Test telemetry (POST)
curl -X POST https://yourdomain.vercel.app/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"siteId":"test","event":"widget_open","payload":{}}'
# Expected: {"success":true}
```

#### Test Widget Embed

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://yourdomain.vercel.app/a11y-widget/v1/a11y-widget.css" />
  <script>
    window.__A11Y_WIDGET__ = {
      siteId: "test-site",
      position: "right",
      enableTelemetry: true,
      telemetryEndpoint: "https://yourdomain.vercel.app/api/telemetry"
    };
  </script>
  <script src="https://yourdomain.vercel.app/a11y-widget/v1/a11y-widget.js" defer></script>
</head>
<body>
  <h1>Test Page</h1>
  <p>This is a test page for the accessibility widget.</p>
</body>
</html>
```

Open in a browser and verify:
- Widget toggle button appears
- Widget opens/closes correctly
- Settings persist after reload
- Telemetry events are sent (check Neon database)

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEON_DATABASE_URL` | Yes | Neon database connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `CDN_DOMAIN` | No | CDN domain for CORS (auto-detected) | `https://yourdomain.vercel.app` |
| `TELEMETRY_ENDPOINT` | No | Override telemetry endpoint path | `/api/telemetry` |

## Database Management

### Querying Telemetry

Connect to Neon via SQL Editor or psql:

```sql
-- Recent events
SELECT * FROM telemetry_events 
ORDER BY timestamp DESC 
LIMIT 100;

-- Events by site
SELECT site_id, event_type, COUNT(*) 
FROM telemetry_events 
GROUP BY site_id, event_type;

-- Daily event counts
SELECT DATE(timestamp) as date, COUNT(*) 
FROM telemetry_events 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;
```

### Managing Site Configs

```sql
-- Insert a site config
INSERT INTO site_configs (site_id, config)
VALUES ('my-site', '{"position":"left","surfaces":["body"]}');

-- Update a site config
UPDATE site_configs 
SET config = '{"position":"right"}' 
WHERE site_id = 'my-site';

-- Get a site config
SELECT config FROM site_configs WHERE site_id = 'my-site';
```

## CDN Configuration

The widget is served via versioned paths:

- **JavaScript**: `/a11y-widget/v1/a11y-widget.js`
- **CSS**: `/a11y-widget/v1/a11y-widget.css`

These paths are configured in `vercel.json` with:
- Immutable caching (1 year)
- CORS headers for cross-origin embedding

### Versioning Strategy

- Current version: `v1`
- Future versions: `v2`, `v3`, etc.
- Each version is immutable (never changes)
- Clients pin to specific versions

## Monitoring & Logging

### Vercel Logs

View logs in Vercel Dashboard → Project → Functions → View Logs

Look for:
- API route errors (`/api/telemetry`, `/api/config/*`)
- Database connection issues
- Request/response logs

### Neon Monitoring

In Neon Dashboard:
- View query performance
- Monitor connection pool usage
- Check database size

### Health Check Endpoint

Monitor the health endpoint:

```bash
# Simple check
curl https://yourdomain.vercel.app/api/health

# With monitoring (cron job example)
*/5 * * * * curl -f https://yourdomain.vercel.app/api/health || echo "Health check failed"
```

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify CDN URLs are correct
3. Check CORS headers (should allow `*`)
4. Verify CSP allows external scripts/styles

### API Endpoints Returning 500

1. Check Vercel function logs
2. Verify `NEON_DATABASE_URL` is set correctly
3. Test database connection in Neon dashboard
4. Check that schema was run successfully

### Database Connection Errors

1. Verify connection string format
2. Check Neon project is active (not paused)
3. Ensure SSL mode is included: `?sslmode=require`
4. Verify IP allowlist (if configured)

### CORS Issues

- Verify `vercel.json` headers include `Access-Control-Allow-Origin: *`
- Check browser console for CORS errors
- Ensure client is using correct endpoint URLs

## Production Checklist

Before going live:

- [ ] Neon database schema deployed
- [ ] Environment variables set in Vercel
- [ ] Health endpoint returns `{"status":"ok","database":"connected"}`
- [ ] Static assets accessible at `/a11y-widget/v1/*`
- [ ] Widget loads and functions correctly
- [ ] Telemetry endpoint accepts POST requests
- [ ] Test widget on multiple browsers
- [ ] Verify mobile responsiveness (320px width)
- [ ] Check Vercel logs for errors
- [ ] Monitor Neon database usage

## Cost Estimation

### Vercel (Free Tier)

- Static assets: Unlimited (free)
- Serverless functions: 100GB-hours/month (free)
- Bandwidth: 100GB/month (free)

**Typical usage**: Well within free tier for moderate traffic

### Neon (Free Tier)

- Database size: 0.5 GB (free)
- Compute: 0.5 vCPU (free)
- Storage: 0.5 GB (free)

**Typical usage**: 
- Telemetry: ~1KB per event
- 1000 events/day ≈ 30MB/month
- Well within free tier

## Next Steps

- Review [README.md](README.md) for installation instructions
- Check [docs/](docs/) for platform-specific guides
- Read [support-statement.md](support-statement.md) for scope boundaries
- See [wcag-matrix.md](wcag-matrix.md) for WCAG coverage

