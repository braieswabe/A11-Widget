# Installation Guide — React SPA

This guide covers installing the Accessibility Widget v1 on React Single Page Applications (Create React App, Vite, etc.).

## Prerequisites

- React project (CRA, Vite, or custom setup)
- Access to `public/index.html` or root component
- CDN domain where widget is hosted

## Installation Methods

### Method 1: public/index.html (Recommended)

Add to `public/index.html` before `</head>` or before `</body>`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
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
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Method 2: Dynamic Load in Root Component

If you need to load conditionally or use environment variables:

In `src/index.js` or `src/App.js`:

```jsx
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Load CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css'
    document.head.appendChild(link)

    // Set config
    window.__A11Y_WIDGET__ = {
      siteId: process.env.REACT_APP_A11Y_SITE_ID || 'react-app',
      position: 'right',
      surfaces: ['body'],
      enableTelemetry: false
    }

    // Load script
    const script = document.createElement('script')
    script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js'
    script.defer = true
    
    // Prevent duplicate loads
    if (!window.__a11yWidget || !window.__a11yWidget.__loaded) {
      document.body.appendChild(script)
    }

    return () => {
      // Cleanup (optional)
      link.remove()
      script.remove()
    }
  }, [])

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  )
}

export default App
```

### Method 3: Custom Hook

Create `src/hooks/useA11yWidget.js`:

```jsx
import { useEffect } from 'react'

export function useA11yWidget(config = {}) {
  useEffect(() => {
    // Prevent duplicate loads
    if (window.__a11yWidget && window.__a11yWidget.__loaded) {
      return
    }

    // Load CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css'
    document.head.appendChild(link)

    // Set config
    window.__A11Y_WIDGET__ = {
      siteId: config.siteId || process.env.REACT_APP_A11Y_SITE_ID || 'react-app',
      position: config.position || 'right',
      surfaces: config.surfaces || ['body'],
      enableTelemetry: config.enableTelemetry || false,
      ...config
    }

    // Load script
    const script = document.createElement('script')
    script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js'
    script.defer = true
    document.body.appendChild(script)

    return () => {
      link.remove()
      script.remove()
    }
  }, [])
}
```

Use in your app:

```jsx
import { useA11yWidget } from './hooks/useA11yWidget'

function App() {
  useA11yWidget({
    siteId: 'my-react-app',
    surfaces: ['body', 'main']
  })

  return <div>Your app</div>
}
```

### Method 4: CSP-Friendly (Data Attributes)

If CSP blocks inline scripts, use data attributes:

```html
<!-- In public/index.html -->
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="YOUR_SITE_ID"
  data-position="right"
  data-surfaces="body"
  defer
></script>
```

## Environment Variables

### Create React App

Create `.env`:

```env
REACT_APP_A11Y_SITE_ID=your-site-id
REACT_APP_A11Y_POSITION=right
REACT_APP_A11Y_TELEMETRY=false
```

Use in code:

```javascript
siteId: process.env.REACT_APP_A11Y_SITE_ID
```

### Vite

Create `.env`:

```env
VITE_A11Y_SITE_ID=your-site-id
VITE_A11Y_POSITION=right
```

Use in code:

```javascript
siteId: import.meta.env.VITE_A11Y_SITE_ID
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

The widget has built-in guards, but for extra safety:

```jsx
useEffect(() => {
  if (window.__a11yWidget && window.__a11yWidget.__loaded) {
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
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "react-app",
        position: "right",
        surfaces: ["body", "#root"],
        enableTelemetry: false
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
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
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "vite-app",
        position: "right",
        surfaces: ["body"],
        enableTelemetry: false
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your React content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

