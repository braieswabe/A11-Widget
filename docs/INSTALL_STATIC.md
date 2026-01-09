# Installation Guide — Static HTML / Custom Sites

This guide covers installing the Accessibility Widget v1 on static HTML sites or custom-built websites.

## Prerequisites

- Access to your HTML files
- Ability to edit `<head>` or before `</body>`
- CDN domain where widget is hosted

## Installation Steps

### Step 1: Add Widget Snippets

Add the widget code to your HTML files. You have two options:

#### Option A: Canonical Installation (Recommended)

Add this code before `</head>` or before `</body>`:

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "YOUR_SITE_ID",
    position: "right",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

#### Option B: CSP-Friendly Installation

If your Content Security Policy blocks inline scripts:

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="YOUR_SITE_ID"
  data-position="right"
  data-surfaces="body"
  defer
></script>
```

### Step 2: Configure Surfaces

If you have specific content areas to transform, update the `surfaces` array:

```javascript
surfaces: ["body", "[data-canonical-surface='true']", ".main-content"]
```

Elements matching these selectors will get `data-a11y-surface="true"` and receive accessibility transforms.

### Step 3: Test

1. Open your site in a browser
2. Look for the accessibility widget toggle button (top-right by default)
3. Click to open the widget panel
4. Test settings (contrast, text size, spacing)
5. Reload page — settings should persist

## CSP Considerations

### If CSP Blocks Inline Scripts

Use data attributes (Option B above) or serve config from your backend:

```html
<!-- Load config from your server -->
<script src="/api/a11y-config.js"></script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

Where `/api/a11y-config.js` returns:
```javascript
window.__A11Y_WIDGET__ = { siteId: "YOUR_SITE_ID", ... };
```

### CSP Headers Example

If you control CSP headers, allow:

```
script-src 'self' https://cdn.YOURDOMAIN.com;
style-src 'self' https://cdn.YOURDOMAIN.com;
```

## Multiple Pages

### Option 1: Include in Every Page

Add the widget snippet to every HTML file.

### Option 2: Use a Template/Include

If using a templating system (Jekyll, Hugo, etc.), add to your base template:

**Jekyll** (`_includes/head.html` or `_layouts/default.html`):
```liquid
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ site.a11y_site_id }}",
    position: "right",
    surfaces: ["body"]
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

**Hugo** (`layouts/partials/head.html`):
```go
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ .Site.Params.a11ySiteId }}",
    position: "right",
    surfaces: ["body"]
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify script loads**: Open DevTools → Network tab, look for `a11y-widget.js`
3. **Check CSP**: Look for CSP violation errors in console
4. **Verify CDN URL**: Ensure `https://cdn.YOURDOMAIN.com` is correct

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

1. Use data attributes instead of inline config
2. Or serve config from your server
3. Or update CSP headers to allow the CDN domain

## Example: Complete HTML Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Site</title>
  
  <!-- Accessibility Widget -->
  <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
  <script>
    window.__A11Y_WIDGET__ = {
      siteId: "my-site-123",
      position: "right",
      surfaces: ["body", "main"],
      enableTelemetry: false
    };
  </script>
  <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
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

- Configure [telemetry](README.md#telemetry-optional) if needed
- Customize [surfaces](README.md#surface-scoping) for your content
- Review [support statement](../support-statement.md) for scope boundaries

