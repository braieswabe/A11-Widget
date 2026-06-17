# Documentation Website — Accessibility Widget v1

React + TypeScript documentation website for Accessibility Widget v1.

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **React Router** — Client-side routing

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Install Dependencies

```bash
cd website
npm install
```

### Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
website/
├── src/
│   ├── components/        # React components
│   │   ├── Layout.tsx    # Main layout with nav/footer
│   │   └── CodeBlock.tsx # Code block with copy button
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── GettingStarted.tsx
│   │   ├── Tutorials.tsx
│   │   ├── Examples.tsx
│   │   ├── Download.tsx
│   │   └── Docs.tsx
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Base styles
├── downloads/            # Downloadable files (plain HTML)
│   └── example.html      # Example HTML with widget
├── public/               # Static assets
├── dist/                # Build output (generated)
└── package.json
```

## Widget Integration

**Release tag for docs and copy-paste snippets:** update `src/constants.ts` (`WIDGET_VERSION`, `WIDGET_CDN_REF`, `WIDGET_LOADER_FILENAME`, `WIDGET_RUNTIME_FILENAME`, and `WIDGET_CSS_URL` if paths change) so Home, Getting Started, Tutorials, Examples, WordPress, Download, and `Layout` stay aligned with the GitHub branch/tag you ship on jsDelivr.

**Runtime on this site:** `npm run dev` and production builds load `a11y-widget-v1.7.1.js` and `a11y-widget.css` from the npm package copy in `packages/a11y-widget` (Vite middleware + `closeBundle` copy). Run `npm run sync-widget` before building so the package mirrors the GitHub release assets.

The website includes the widget for demonstration. The Layout component loads the widget script dynamically:

```typescript
// Widget is loaded in Layout.tsx
window.__A11Y_WIDGET__ = {
  siteId: "docs-site",
  position: "right",
  surfaces: ["body", "main"],
  enableTelemetry: true,
  telemetryEndpoint: "/api/telemetry"
};
```

When `telemetryEndpoint` is configured, the widget derives the heartbeat, widget error, support case, and translation endpoints from the same backend. Local development now reads `NEON_DATABASE_URL` from the repo `.env`, and `/api/health` should report `database: connected` when Neon is reachable.

The `Customize` tab has been removed from the widget. Visitors now use the `Tools` button in the widget header to reorder controls or hide/show unused tools inline.

## Deployment

### Vercel

The website is configured to deploy to Vercel:

1. **Build**: Runs `npm install && npm run build` in the `website/` directory
2. **Output**: Serves from `website/dist/`
3. **Routing**: All routes serve `index.html` for SPA routing

### Environment Variables

The public demo can load without a database, but tracking and admin monitoring require `NEON_DATABASE_URL` in local `.env` and in the deployment environment.

## Downloadable Example

The `downloads/example.html` file is a **plain HTML file** (not React) that can be downloaded and used immediately. It includes:

- Widget pre-installed
- Sample content
- Configuration comments
- Ready to use

This file is served statically and is not part of the React build.

## Features

- ✅ Responsive design (mobile-first)
- ✅ WCAG 2.1 AA compliant
- ✅ Client-side routing
- ✅ Code copy functionality
- ✅ Mobile menu
- ✅ Live widget demo on all pages

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
