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
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.2/a11y-widget-loader-v1.7.2.js" defer></script>
```

That's it! The widget loads automatically from GitHub. No configuration needed.

### Step 2: Optional - Configure Settings

If you want to configure surfaces or backend tracking, add configuration before the loader script:

```html
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "example.com",
    apiKey: "YOUR_CLIENT_API_KEY",
    position: "right",  // Optional: "left" or "right"
    surfaces: ["body", "main"],  // Optional: CSS selectors
    telemetryEndpoint: "https://your-widget-backend.com/api/telemetry"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.2/a11y-widget-loader-v1.7.2.js" defer></script>
```

When `telemetryEndpoint` is set, heartbeat, widget error, support case, and translation endpoints are derived from the same backend unless you override them directly.

### Step 3: Authorize the Site for Monitoring

Backend monitoring and translation endpoints are protected by database validation. Before installing the monitored snippet on a production site:

1. Log in to the employee/admin dashboard.
2. Create or select the client record and copy its API key.
3. Add each production domain without protocol, for example `example.com` and `www.example.com`.
4. Use the same `siteId` in the widget snippet that is assigned to the client.
5. Add the copied key as `apiKey` or `licenseKey` in `window.__A11Y_WIDGET__`.
6. Verify `/api/health` on the backend returns `database: connected`.

Local development origins such as `localhost` and `127.0.0.1` can send support cases, heartbeats, widget errors, and telemetry for testing. Deployed domains still require a registered domain match or valid key.

### Step 4: Optional - Custom Button Control

If you want to hide the default button and control it with your own header button, see [Custom Button Control Guide](INSTALL_CUSTOM_BUTTON.md).

### Step 5: Test

1. Open your site in a browser
2. Look for the accessibility widget toggle button (top-right by default)
3. Click to open the widget panel
4. Test settings (contrast, text size, spacing)
5. Click Tools in the widget header to reorder or hide/show controls
6. Reload page — settings should persist

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
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.2/a11y-widget-loader-v1.7.2.js" defer></script>
```

**Hugo** (`layouts/partials/head.html`):
```go
<!-- Just one line - widget loads automatically! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.2/a11y-widget-loader-v1.7.2.js" defer></script>
```

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify script loads**: Open DevTools → Network tab, look for `a11y-widget-loader-v1.7.2.js`
3. **Check CSP**: Look for CSP violation errors in console
4. **Verify CDN URL**: Ensure `https://cdn.jsdelivr.net` is accessible

### Support, Heartbeat, Errors, or Translation Return 403

1. Confirm the production domain is registered in the employee/admin dashboard without protocol.
2. Confirm the snippet uses the assigned `siteId`.
3. Confirm `apiKey` or `licenseKey` is present when the domain is not already allowed.
4. Confirm `telemetryEndpoint` points to the correct backend `/api/telemetry` URL.
5. Confirm `/api/health` returns `database: connected`.

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
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.7.2/a11y-widget-loader-v1.7.2.js" defer></script>
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
