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

The website includes the widget for demonstration. The Layout component loads the widget script dynamically:

```typescript
// Widget is loaded in Layout.tsx
window.__A11Y_WIDGET__ = {
  siteId: "docs-site",
  position: "right",
  surfaces: ["body", "main"],
  enableTelemetry: false
};
```

## Deployment

### Vercel

The website is configured to deploy to Vercel:

1. **Build**: Runs `npm install && npm run build` in the `website/` directory
2. **Output**: Serves from `website/dist/`
3. **Routing**: All routes serve `index.html` for SPA routing

### Environment Variables

No environment variables required for basic deployment.

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
