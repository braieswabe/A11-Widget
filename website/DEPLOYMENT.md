# Website Deployment Guide

This guide covers deploying the React + TypeScript documentation website.

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
cd website
npm install
```

### Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

The widget files (`a11y-widget.js` and `a11y-widget.css`) are referenced from the project root (`/a11y-widget.css`). For local development, you may need to:

1. Copy widget files to `public/` directory, OR
2. Use a local server from the project root, OR  
3. Update paths in `Layout.tsx` to use relative paths for local dev

## Building for Production

```bash
npm run build
```

This will:
1. Build the React app to `dist/`
2. Copy widget files (`a11y-widget.js`, `a11y-widget.css`) to `dist/` root
3. Copy `public/downloads/example.html` to `dist/downloads/`

## Vercel Deployment

### Automatic Deployment

1. Connect your repository to Vercel
2. Set **Root Directory** to `website`
3. Vercel will detect the React app and build automatically

### Manual Configuration

If needed, configure in Vercel dashboard:

- **Framework Preset**: Vite
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

No environment variables required for basic deployment.

### Routing

The `vercel.json` in the website directory handles SPA routing:

- All routes serve `index.html`
- Widget files served from root (`/a11y-widget.js`, `/a11y-widget.css`)
- Downloads folder served from `/downloads/`

## Project Structure After Build

```
dist/
├── index.html              # React app entry
├── assets/                 # Built JS/CSS
├── a11y-widget.js         # Copied from root
├── a11y-widget.css        # Copied from root
└── downloads/
    └── example.html        # Downloadable example
```

## Widget File Paths

The website references widget files from root:

- Production: `/a11y-widget.js`, `/a11y-widget.css`
- These are copied to `dist/` during build
- Vercel serves them from the dist root

## Downloadable Example

The `public/downloads/example.html` file is a **plain HTML file** (not React):

- Served statically at `/downloads/example.html`
- Can be downloaded directly
- Includes widget pre-installed
- Uses relative paths (`../a11y-widget.css`) - users need to adjust for their setup

## Troubleshooting

### Widget Not Loading Locally

- Ensure widget files exist at project root
- Or copy them to `public/` and update paths in `Layout.tsx`
- Or use a server from project root

### Build Fails

- Check Node.js version (18+)
- Run `npm install` first
- Check that widget files exist at `../a11y-widget.js`

### Routes Not Working

- Ensure `vercel.json` has SPA rewrite rules
- Check that all routes serve `index.html`

### Downloads Not Working

- Ensure `public/downloads/` folder exists
- Check file is copied to `dist/downloads/` after build
- Verify Vercel serves `/downloads/` correctly

