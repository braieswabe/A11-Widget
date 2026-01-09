# Installation Guide — Static HTML / Custom Sites

This guide covers installing the Accessibility Widget v1 on static HTML sites or custom-built websites.

## Prerequisites

- Access to your HTML files
- Ability to edit `<head>` or before `</body>`
- CDN domain where widget is hosted

## Installation Steps

### Step 1: Add Widget Loader Script

Add this single line to your HTML files before `</head>` or before `</body>`:

```html
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
```

That's it! The widget loads automatically from GitHub. No configuration needed.

### Step 2: Optional - Customize Settings

If you want to customize the widget, add configuration before the loader script:

```html
<script>
  window.__A11Y_WIDGET__ = {
    position: "right",  // Optional: "left" or "right"
    surfaces: ["body", "main"]  // Optional: CSS selectors
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
```

### Step 3: Optional - Custom Button Control

If you want to hide the default button and control it with your own header button, see [Custom Button Control Guide](INSTALL_CUSTOM_BUTTON.md).

### Step 4: Test

1. Open your site in a browser
2. Look for the accessibility widget toggle button (top-right by default)
3. Click to open the widget panel
4. Test settings (contrast, text size, spacing)
5. Reload page — settings should persist

## CSP Considerations

### If CSP Blocks External Scripts

The loader script loads from `cdn.jsdelivr.net`. If your CSP blocks this, update your CSP headers:

```
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' https://cdn.jsdelivr.net https://raw.githubusercontent.com;
```

Or use a local copy of the widget files and serve them from your domain.

## Multiple Pages

### Option 1: Include in Every Page

Add the widget snippet to every HTML file.

### Option 2: Use a Template/Include

If using a templating system (Jekyll, Hugo, etc.), add to your base template:

**Jekyll** (`_includes/head.html` or `_layouts/default.html`):
```liquid
<!-- Just one line - widget loads automatically! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
```

**Hugo** (`layouts/partials/head.html`):
```go
<!-- Just one line - widget loads automatically! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
```

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify script loads**: Open DevTools → Network tab, look for `a11y-widget-loader.js`
3. **Check CSP**: Look for CSP violation errors in console
4. **Verify CDN URL**: Ensure `https://cdn.jsdelivr.net` is accessible

### Settings Not Persisting

1. **Check localStorage**: DevTools → Application → Local Storage → Look for `__a11yWidgetPrefs__`
2. **Verify cookies**: If localStorage fails, widget falls back to cookies
3. **Check domain**: Preferences are per-domain (subdomains are separate)

### Surfaces Not Transforming

1. **Verify selectors**: Check that `surfaces` selectors match your HTML
2. **Check DOM**: Inspect elements — they should have `data-a11y-surface="true"`
3. **Check CSS**: Verify `a11y-widget.css` loads correctly

### CSP Errors

If you see CSP errors:

1. Update CSP headers to allow `cdn.jsdelivr.net` and `raw.githubusercontent.com`
2. Or download widget files and serve from your domain
3. Or use a proxy/CDN that you control

## Example: Complete HTML Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Site</title>
  
  <!-- Accessibility Widget - Just one line! -->
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
</head>
<body>
  <main>
    <h1>Welcome</h1>
    <p>This content will receive accessibility transforms.</p>
  </main>
</body>
</html>
```

## Next Steps

- See [Custom Button Control Guide](INSTALL_CUSTOM_BUTTON.md) to hide default button and use your own
- Customize [surfaces](README.md#surface-scoping) for your content
- Review [support statement](../support-statement.md) for scope boundaries

