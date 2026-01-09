# Vercel Deployment Setup Guide

## Important: Vercel Project Configuration

For the website to deploy correctly on Vercel, you need to configure the project settings:

### Option 1: Set Root Directory (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings → General**
3. Under **Root Directory**, select **website**
4. Click **Save**

This tells Vercel to:
- Build from the `website/` directory
- Use `website/package.json` for dependencies
- Output to `website/dist/`
- Serve from `website/dist/` root

### Option 2: Use Root vercel.json (Current Setup)

The root `vercel.json` is configured to:
- Build from `website/` directory
- Output to `website/dist/`
- Serve React app with SPA routing

## Build Process

When Vercel builds:

1. **Install**: Runs `cd website && npm install`
2. **Build**: Runs `cd website && npm run build`
   - This builds React app to `website/dist/`
   - Widget files are copied to `website/dist/` root
   - Downloads folder is copied to `website/dist/downloads/`
3. **Serve**: Serves from `website/dist/` as root

## File Structure After Build

```
website/dist/
├── index.html              # React app (served at /)
├── assets/                 # JS/CSS bundles
├── a11y-widget.js         # Widget JS (served at /a11y-widget.js)
├── a11y-widget.css        # Widget CSS (served at /a11y-widget.css)
└── downloads/
    └── example.html        # Served at /downloads/example.html
```

## Routes

- `/` → `index.html` (React app)
- `/getting-started` → `index.html` (React Router handles)
- `/tutorials` → `index.html` (React Router handles)
- `/examples` → `index.html` (React Router handles)
- `/download` → `index.html` (React Router handles)
- `/docs` → `index.html` (React Router handles)
- `/downloads/example.html` → `downloads/example.html` (static file)
- `/a11y-widget/v1/a11y-widget.js` → `a11y-widget.js`
- `/a11y-widget/v1/a11y-widget.css` → `a11y-widget.css`
- `/api/*` → API routes (serverless functions)

## Troubleshooting 404 Errors

If you get 404 errors:

1. **Check Root Directory**: Ensure it's set to `website` in Vercel dashboard
2. **Check Build Logs**: Verify build completes successfully
3. **Check Output**: Ensure `website/dist/index.html` exists after build
4. **Check Rewrites**: Verify rewrites in `vercel.json` are correct
5. **Check Base Path**: Ensure Vite `base` is `/` (not `/website/`)

## Environment Variables

No environment variables required for basic website deployment.

For API routes (telemetry, config), set:
- `NEON_DATABASE_URL` — Neon database connection string

## Testing Locally

Before deploying, test the build:

```bash
cd website
npm install
npm run build
npm run preview
```

This will build and serve the production version locally.

