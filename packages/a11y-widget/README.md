# Accessibility Widget

WCAG 2.1 AA-aligned accessibility widget support layer.

## Installation

```bash
npm install @careerdriver-ai/a11y-widget
```

## Usage

### NPM (ES Modules)

```javascript
import { initA11yWidget } from "@careerdriver-ai/a11y-widget";
import "@careerdriver-ai/a11y-widget/styles.css";

initA11yWidget({ 
  siteId: "example.com",
  position: "right"
});
```

### CDN (Traditional)

```html
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "example.com",
    position: "right"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.1.0/a11y-widget-loader-v1.1.0.js" defer></script>
```

## Configuration

Both methods support the same configuration options:

- `siteId`: Site identifier (auto-detected from hostname if not provided)
- `position`: Widget position - `"left"` or `"right"` (default: `"right"`)
- `surfaces`: CSS selectors for surfaces (default: `["body"]`)
- `globalMode`: Apply transformations to entire website (default: `false`)
- `keyboardShortcut`: Keyboard shortcut - `"Alt+A"`, `"Ctrl+Alt+A"`, or `null` to disable (default: `"Alt+A"`)
- `initialOpen`: Open widget on page load (default: `false`)
- `zIndex`: Widget z-index (default: `2147483000`)
- `features`: Feature flags object (all enabled by default)

See full documentation for complete configuration options.

## Browser Support

Modern browsers with ES module support.

## License

MIT
