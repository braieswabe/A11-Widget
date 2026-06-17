# Accessibility Widget

WCAG 2.1 AA-aligned accessibility widget support layer.

## Installation

```bash
npm install @careerdriver/a11y-widget
```

## Usage

### NPM (ES Modules)

```javascript
import { initA11yWidget } from "@careerdriver/a11y-widget";
import "@careerdriver/a11y-widget/styles.css";

initA11yWidget({ 
  siteId: "example.com",
  apiKey: "YOUR_CLIENT_API_KEY",
  position: "right",
  telemetryEndpoint: "https://your-widget-backend.com/api/telemetry"
});
```

### CDN (Traditional)

```html
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "example.com",
    apiKey: "YOUR_CLIENT_API_KEY",
    position: "right",
    telemetryEndpoint: "https://your-widget-backend.com/api/telemetry"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.1/a11y-widget-loader-v1.7.1.js" defer></script>
```

## Configuration

Both methods support the same configuration options:

- `siteId`: Site identifier (auto-detected from hostname if not provided)
- `apiKey`: Client API key for protected backend endpoints
- `licenseKey`: License key alias for backend authorization
- `position`: Widget position - `"left"` or `"right"` (default: `"right"`)
- `surfaces`: CSS selectors for surfaces (default: `["body"]`)
- `globalMode`: Apply transformations to entire website (default: `false`)
- `keyboardShortcut`: Keyboard shortcut - `"Alt+A"`, `"Ctrl+Alt+A"`, or `null` to disable (default: `"Alt+A"`)
- `initialOpen`: Open widget on page load (default: `false`)
- `zIndex`: Widget z-index (default: `2147483000`)
- `telemetryEndpoint`: Backend telemetry endpoint. Heartbeat, error, support, and translation endpoints are derived from this backend unless set directly.
- `heartbeatEndpoint`: Widget installation tracking endpoint
- `errorEndpoint`: Widget runtime error logging endpoint
- `supportEndpoint`: Visitor support case endpoint
- `translateEndpoint`: Server-side translation endpoint
- `features`: Feature flags object (all enabled by default)

Visitors can click `Tools` inside the widget header to reorder tools and hide/show controls inline. Those preferences persist per visitor.

Backend monitoring, support, and translation endpoints validate production installs against the database. Register the domain in the employee/admin dashboard or include a valid `apiKey`/`licenseKey` before enabling `telemetryEndpoint` on a deployed site. Localhost and `127.0.0.1` are allowed for development logging tests.

See full documentation for complete configuration options.

## Browser Support

Modern browsers with ES module support.

## License

MIT
