# Installation Guide — React SPA

This guide covers installing the Accessibility Widget v1 on React Single Page Applications (Create React App, Vite, etc.).

## Prerequisites

- React project (CRA, Vite, or custom setup)
- Access to `public/index.html` or root component

## Installation Methods

### Method 1: Simple Installation (Recommended)

Add the loader script to `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
    <!-- Accessibility Widget - Just one line! -->
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

That's it! The widget will appear automatically. No configuration needed.

### Method 2: Custom Button Control (Advanced)

If you want to hide the default button and control it with your own header button, see [Custom Button Control Guide](INSTALL_CUSTOM_BUTTON.md).

### Method 3: public/index.html with Configuration (Legacy)

If you need to customize settings, add configuration before the loader script:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
    <!-- Optional: Customize widget settings -->
    <script>
      window.__A11Y_WIDGET__ = {
        position: "right",  // Optional: "left" or "right"
        surfaces: ["body", "#root"]  // Optional: CSS selectors
      };
    </script>
    <!-- Load widget from GitHub -->
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Method 4: Dynamic Load in Root Component

If you need to load conditionally or use environment variables:

In `src/index.js` or `src/App.js`:

```jsx
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Prevent duplicate loads
    if (document.getElementById('a11y-widget-loader')) {
      return
    }

    // Load widget from GitHub
    const script = document.createElement('script')
    script.id = 'a11y-widget-loader'
    script.src = 'https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js'
    script.defer = true
    
    // Optional: Set config before loading
    window.__A11Y_WIDGET__ = {
      position: 'right',
      surfaces: ['body', '#root']
    }
    
    document.body.appendChild(script)
  }, [])

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  )
}

export default App
```

### Method 5: Custom Hook

Create `src/hooks/useA11yWidget.js`:

```jsx
import { useEffect } from 'react'

export function useA11yWidget(config = {}) {
  useEffect(() => {
    // Prevent duplicate loads
    if (document.getElementById('a11y-widget-loader')) {
      return
    }

    // Set config (optional)
    if (Object.keys(config).length > 0) {
      window.__A11Y_WIDGET__ = {
        position: config.position || 'right',
        surfaces: config.surfaces || ['body'],
        ...config
      }
    }

    // Load widget from GitHub
    const script = document.createElement('script')
    script.id = 'a11y-widget-loader'
    script.src = 'https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js'
    script.defer = true
    document.body.appendChild(script)
  }, [])
}
```

Use in your app:

```jsx
import { useA11yWidget } from './hooks/useA11yWidget'

function App() {
  useA11yWidget({
    position: 'right',
    surfaces: ['body', '#root', 'main']
  })

  return <div>Your app</div>
}
```

### Method 6: CSP-Friendly (Data Attributes)

If CSP blocks inline scripts, the loader script works without any configuration:

```html
<!-- In public/index.html -->
<script
  src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js"
  defer
></script>
```

The widget auto-detects your site ID from the domain name.

## Environment Variables

**Note**: Environment variables are optional. The widget auto-detects your site ID from the domain.

If you want to customize settings via environment variables:

### Create React App

Create `.env`:

```env
REACT_APP_A11Y_POSITION=right
```

Use in code:

```javascript
window.__A11Y_WIDGET__ = {
  position: process.env.REACT_APP_A11Y_POSITION || 'right',
  surfaces: ['body', '#root']
}
```

### Vite

Create `.env`:

```env
VITE_A11Y_POSITION=right
```

Use in code:

```javascript
window.__A11Y_WIDGET__ = {
  position: import.meta.env.VITE_A11Y_POSITION || 'right',
  surfaces: ['body', '#root']
}
```

## React-Specific Configuration

### Recommended Surfaces

```javascript
surfaces: [
  "body",
  "main",
  "#root", // React root
  "[data-canonical-surface='true']"
]
```

### TypeScript Types

Create `src/types/a11y-widget.d.ts`:

```typescript
declare global {
  interface Window {
    __A11Y_WIDGET__?: {
      siteId?: string
      position?: 'left' | 'right'
      surfaces?: string[]
      enableTelemetry?: boolean
      telemetryEndpoint?: string
    }
    __a11yWidget?: {
      __loaded: boolean
      getPrefs: () => any
      setPrefs: (prefs: any) => void
      reset: () => void
    }
  }
}

export {}
```

## Preventing Duplicate Loads

The loader script has built-in guards to prevent duplicate loads. If loading manually:

```jsx
useEffect(() => {
  if (document.getElementById('a11y-widget-loader')) {
    return // Already loaded
  }
  
  // Load widget...
}, [])
```

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for errors
2. **Verify script loads**: DevTools → Network → Look for `a11y-widget.js`
3. **Check React root**: Ensure widget loads after React mounts
4. **Verify environment variables**: Check `.env` file is loaded

### Hot Reload Issues

If widget doesn't reload during development:

1. Use `useEffect` with empty dependency array
2. Or add widget to `public/index.html` (doesn't hot reload)
3. Or manually reload page

### TypeScript Errors

1. Add type definitions (see above)
2. Or use `// @ts-ignore` for window properties
3. Or extend Window interface globally

### Build Errors

If build fails:

1. Ensure env vars have correct prefix (`REACT_APP_*` or `VITE_*`)
2. Check script tags are in correct location
3. Verify CDN URLs are accessible

## Example: Complete CRA Setup

`public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
    <!-- Just one line - widget loads automatically! -->
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## Example: Vite Setup

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- Just one line - widget loads automatically! -->
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Example: Custom Button Control

See [Custom Button Control Guide](INSTALL_CUSTOM_BUTTON.md) for hiding the default button and controlling it with your own header button.

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your React content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

