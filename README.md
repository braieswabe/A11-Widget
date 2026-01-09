# Accessibility Widget v1 — Embed Anywhere

A lightweight, embeddable accessibility widget that provides WCAG 2.1 AA–aligned enhancements for the widget surface + any canonical-rendered content you control, without claiming "full ADA compliance" for the host site.

## Overview

This widget is a **support layer** + **render-time accessibility controls** — not an overlay that "fixes the whole site." It provides:

- ✅ Accessibility enhancements for widget UI itself
- ✅ CSS-based user preference transforms (contrast, text size, spacing)
- ✅ Keyboard and screen reader support
- ✅ Global keyboard shortcut (Alt+A) to quickly open widget
- ✅ Preference persistence (localStorage/cookie)
- ✅ Optional profile presets (dyslexia-friendly, low-vision, reduced motion)
- ✅ **Text-to-Speech**: Read selected text or full page aloud with customizable voice settings (including PDF text extraction when available)
- ✅ **Translation**: Automatically translate page content into multiple languages (translates all text on declared surfaces)
- ✅ **Reading Aids**: Reading ruler, screen mask, text-only mode, adjustable margins
- ✅ **Focus Tools**: Customizable cursor size, page magnifier
- ✅ **Dictionary**: Double-click words to see definitions

**Scope boundaries**: This widget only affects elements you explicitly declare as surfaces. It does not fix host-site HTML outside those surfaces, third-party embeds, or guarantee full-site compliance. PDF text extraction is attempted for same-origin PDFs but may be limited by CORS restrictions.

## Quick Start

### Simple Installation (Recommended)

Just add this single line to your HTML:

```html
<!-- Use versioned tag to ensure you get the latest stable version -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
```

**Note:** We use version tags (`@v1.6.1`) instead of branch names (`@main`) because jsDelivr CDN aggressively caches branch URLs for up to 7 days. Version tags are served immediately and ensure you always get the exact version you specify.

That's it! The widget loads automatically from GitHub. No configuration needed.

**✨ Version Updates**: When a new version is released, update the version tag in your script tag (e.g., `@v1.6.1` → `@v1.7.0`). This ensures you get the latest features and fixes immediately.

**⌨️ Keyboard Shortcut**: Press **Alt+A** (Option+A on Mac) from anywhere on the page to quickly open/close the accessibility widget. The shortcut doesn't interfere with typing in input fields.

### Optional: Customize Settings

If you want to customize the widget, add configuration before the loader script:

```html
<script>
  window.__A11Y_WIDGET__ = {
    position: "right",  // Optional: "left" or "right"
    keyboardShortcut: "Alt+A",  // Optional: "Alt+A", "Ctrl+Alt+A", or null to disable
    globalMode: false,  // Optional: If true, applies transformations to entire website (fonts, colors, sizes)
    surfaces: ["body", "main"]  // Optional: CSS selectors (ignored if globalMode is true)
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
```

**Global Mode**: When enabled, the widget applies transformations (fonts, font sizes, colors, spacing) to the entire website, completely overhauling the user interface. When disabled (default), transformations only apply to declared surfaces.

### Custom Button Control

To hide the default button and control it with your own header button, see [Custom Button Control Guide](docs/INSTALL_CUSTOM_BUTTON.md).

## Configuration Options

All configuration is via `window.__A11Y_WIDGET__` object or data attributes:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteId` | string | `null` | Auto-detected from hostname if not provided |
| `position` | `"left"\|"right"` | `"right"` | Widget position on screen |
| `keyboardShortcut` | string\|null | `"Alt+A"` | Global keyboard shortcut to open/close widget (e.g., `"Alt+A"`, `"Ctrl+Alt+A"`, or `null` to disable) |
| `globalMode` | boolean | `false` | If `true`, applies transformations to entire website (fonts, colors, sizes). When enabled, `surfaces` is ignored. |
| `surfaces` | string[] | `["body"]` | CSS selectors to mark as `data-a11y-surface="true"` (ignored if `globalMode` is `true`) |
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
- **[React SPA](docs/INSTALL_REACT.md)** — Create React App, Vite, etc.
- **[Next.js](docs/INSTALL_NEXTJS.md)** — Next.js App Router or Pages Router
- **[WordPress](docs/INSTALL_WORDPRESS.md)** — WordPress themes/plugins
- **[Shopify](docs/INSTALL_SHOPIFY.md)** — Shopify themes
- **[Google Tag Manager](docs/INSTALL_GTM.md)** — GTM implementation
- **[Django/Rails/.NET](docs/INSTALL_DJANGO.md)** — Server-side rendered apps
- **[Custom Button Control](docs/INSTALL_CUSTOM_BUTTON.md)** — Hide default button, use your own header button

## How It Works

### Surface Scoping vs Global Mode

**By Default (Surface Mode)**: The widget only applies transforms to elements you declare in `surfaces`. Those elements get `data-a11y-surface="true"`:

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

**Global Mode**: When `globalMode: true` is set, the widget applies transformations to the entire website, completely overhauling fonts, font sizes, background colors, and other UI elements. This replaces existing website styles globally:

```javascript
// Widget config
globalMode: true  // Applies to entire website, not just surfaces
```

**Note**: When global mode is enabled, the `surfaces` configuration is ignored - all elements are transformed.

### Preference Persistence

User preferences are stored per domain in:
1. `localStorage` (primary)
2. Cookies (fallback if localStorage unavailable)

Storage key: `__a11yWidgetPrefs__`

### Translation Behavior

When translation is enabled:
- All text content within declared surfaces (`[data-a11y-surface="true"]`) is automatically translated
- Original text is preserved and restored when translation is disabled
- Language changes trigger automatic re-translation
- Translations are cached to improve performance
- Translation API rate limits apply (MyMemory API free tier)

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
