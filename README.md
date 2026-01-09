# Accessibility Widget v1 — Embed Anywhere

A lightweight, embeddable accessibility widget that provides WCAG 2.1 AA–aligned enhancements for the widget surface + any canonical-rendered content you control, without claiming "full ADA compliance" for the host site.

## Overview

This widget is a **support layer** + **render-time accessibility controls** — not an overlay that "fixes the whole site." It provides:

- ✅ Accessibility enhancements for widget UI itself
- ✅ CSS-based user preference transforms (contrast, text size, spacing)
- ✅ Keyboard and screen reader support
- ✅ Preference persistence (localStorage/cookie)
- ✅ Optional profile presets (dyslexia-friendly, low-vision, reduced motion)

**Scope boundaries**: This widget only affects elements you explicitly declare as surfaces. It does not fix host-site HTML outside those surfaces, third-party embeds, PDFs, or guarantee full-site compliance.

## Quick Start

### Canonical Installation

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "CLIENT_SITE_ID",
    position: "right",
    surfaces: ["body", "[data-canonical-surface='true']"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

### CSP-Friendly Installation (No Inline Config)

If your Content Security Policy blocks inline scripts:

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="CLIENT_SITE_ID"
  data-position="right"
  data-surfaces="body,[data-canonical-surface='true']"
  defer
></script>
```

## Configuration Options

All configuration is via `window.__A11Y_WIDGET__` object or data attributes:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteId` | string | `null` | Required: Site identifier for telemetry/config |
| `position` | `"left"\|"right"` | `"right"` | Widget position on screen |
| `surfaces` | string[] | `["body"]` | CSS selectors to mark as `data-a11y-surface="true"` |
| `enableTelemetry` | boolean | `false` | Enable telemetry events |
| `telemetryEndpoint` | string | `null` | Backend endpoint for telemetry (e.g., `/api/telemetry`) |
| `zIndex` | number | `2147483000` | Widget z-index |
| `initialOpen` | boolean | `false` | Open widget on page load |
| `locale` | string | `"en"` | Locale (future use) |
| `features` | object | See below | Toggle individual features |

### Feature Flags

```javascript
features: {
  contrast: true,        // Contrast modes (default/high/dark/light)
  fontScale: true,       // Text size slider (100-160%)
  spacing: true,         // Text spacing presets (normal/comfortable/max)
  reduceMotion: true,    // Reduce motion toggle
  readableFont: true,    // Readable font toggle
  presets: true,         // Preset buttons (low vision, dyslexia, motion)
  reset: true,           // Reset button
  skipLink: true         // Skip to content link
}
```

## Platform-Specific Installation Guides

- **[Static HTML / Custom Sites](docs/INSTALL_STATIC.md)** — Basic HTML sites
- **[WordPress](docs/INSTALL_WORDPRESS.md)** — WordPress themes/plugins
- **[Next.js](docs/INSTALL_NEXTJS.md)** — Next.js App Router or Pages Router
- **[React SPA](docs/INSTALL_REACT.md)** — Create React App, Vite, etc.
- **[Shopify](docs/INSTALL_SHOPIFY.md)** — Shopify themes
- **[Google Tag Manager](docs/INSTALL_GTM.md)** — GTM implementation
- **[Django/Rails/.NET](docs/INSTALL_DJANGO.md)** — Server-side rendered apps

## How It Works

### Surface Scoping

The widget only applies transforms to elements you declare in `surfaces`. Those elements get `data-a11y-surface="true"`:

```html
<!-- Your HTML -->
<body>
  <main data-canonical-surface="true">
    <p>This content will be transformed</p>
  </main>
  <aside>
    <p>This content will NOT be transformed</p>
  </aside>
</body>
```

```javascript
// Widget config
surfaces: ["body", "[data-canonical-surface='true']"]
```

### Preference Persistence

User preferences are stored per domain in:
1. `localStorage` (primary)
2. Cookies (fallback if localStorage unavailable)

Storage key: `__a11yWidgetPrefs__`

### Telemetry (Optional)

If `enableTelemetry: true` and `telemetryEndpoint` is set, the widget sends events to your backend:

- `widget_open` — Widget panel opened
- `setting_change` — User changed a setting
- `reset` — User reset preferences
- `widget_close` — Widget panel closed

Events include: `siteId`, `event`, `payload`, `url`, `userAgent` (no PII).

## API Reference

### Telemetry Endpoint

**POST** `/api/telemetry`

```json
{
  "siteId": "your-site-id",
  "event": "widget_open",
  "payload": {},
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0..."
}
```

### Config Endpoint (Optional)

**GET** `/api/config/[siteId]`

Returns site-specific configuration JSON.

### Health Check

**GET** `/api/health`

Returns: `{"status":"ok","database":"connected"}`

See [DEPLOYMENT.md](DEPLOYMENT.md) for backend setup.

## Files

- `a11y-widget.js` — Main widget (IIFE, no dependencies)
- `a11y-widget.css` — Widget styles + surface transforms
- `support-statement.md` — Public support statement (scope boundaries)
- `wcag-matrix.md` — WCAG 2.1 AA coverage matrix
- `DEPLOYMENT.md` — Deployment guide (Vercel + Neon)

## Support Statement

This widget provides **accessibility enhancements aligned with WCAG 2.1 AA for supported surfaces only**.

**What we cover**:
- Widget UI accessibility
- Declared content surfaces
- User preference controls

**What we don't cover**:
- Host-site HTML outside declared surfaces
- Third-party embeds (maps, iframes, booking engines)
- PDFs or downloads
- Full-site ADA compliance guarantee

See [support-statement.md](support-statement.md) for full details.

## WCAG Coverage

For widget UI + declared surfaces, we cover:

- ✅ 1.4.3 Contrast (Minimum) — Widget UI + contrast modes
- ✅ 1.4.4 Resize text — Font scaling 100-160%
- ✅ 1.4.10 Reflow — Responsive at 320px width
- ✅ 1.4.12 Text spacing — Spacing presets
- ✅ 2.1.1 Keyboard — Full keyboard operation
- ✅ 2.4.1 Bypass blocks — Skip link
- ✅ 2.4.7 Focus visible — Strong focus indicators
- ✅ 3.2.3 Consistent navigation — Consistent widget UI
- ✅ 3.3.2 Labels/instructions — All controls labeled
- ✅ 4.1.2 Name, role, value — Correct ARIA roles/states

See [wcag-matrix.md](wcag-matrix.md) for detailed coverage matrix.

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify script loads: `curl https://yourdomain.com/a11y-widget/v1/a11y-widget.js`
3. Check CSP allows external scripts/styles
4. Verify `surfaces` selectors match your HTML

### Settings Not Persisting

1. Check browser localStorage (DevTools → Application → Local Storage)
2. Verify cookies aren't blocked
3. Check storage key: `__a11yWidgetPrefs__`

### CSP Issues

If CSP blocks inline scripts, use data attributes:

```html
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="YOUR_SITE_ID"
  data-position="right"
  defer
></script>
```

### Telemetry Not Sending

1. Verify `enableTelemetry: true`
2. Check `telemetryEndpoint` is set correctly
3. Check browser network tab for POST requests
4. Verify backend endpoint is accessible
5. Check CORS headers allow your domain

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires: ES5+ JavaScript, CSS Custom Properties (CSS Variables)

## License

MIT License — See LICENSE file

## Contributing

See [docs/DEVELOPER.md](docs/DEVELOPER.md) for development guidelines.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel + Neon setup instructions.
