# Installation Guide — Custom Button Control

This guide shows how to hide the widget by default and control it with a custom button in your header/navigation.

## Overview

This pattern allows you to:
- Hide the default widget toggle button
- Add your own custom button in your header/navigation
- Control widget visibility programmatically
- Maintain full widget functionality

## Step 1: Add Widget Loader Script

Add the loader script globally in your `index.html` (or equivalent):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Site</title>
  
  <!-- Accessibility Widget Loader -->
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

## Step 2: Hide Widget by Default

Add CSS to hide the widget on page load. Add this to your global CSS file (e.g., `index.css`, `global.css`, `App.css`):

```css
/* Hide widget by default */
.a11y-widget-hidden #a11y-widget-root,
.a11y-widget-hidden #a11y-widget-toggle,
.a11y-widget-hidden #a11y-widget-panel {
  display: none !important;
  visibility: hidden !important;
}
```

Then add the class to your HTML element on page load:

```javascript
// Add this script before </head> or in your main JS file
document.documentElement.classList.add('a11y-widget-hidden');
```

**For React/Vite:**

In `src/index.css` or `src/index.js`:

```css
/* Hide widget by default */
.a11y-widget-hidden #a11y-widget-root,
.a11y-widget-hidden #a11y-widget-toggle,
.a11y-widget-hidden #a11y-widget-panel,
.a11y-widget-hidden #a11y-widget-header,
.a11y-widget-hidden #a11y-widget-title,
.a11y-widget-hidden #a11y-widget-close,
.a11y-widget-hidden .a11y-widget-help {
  display: none !important;
  visibility: hidden !important;
}
```

In `src/index.js` or `src/main.jsx`:

```javascript
// Hide widget on startup
document.documentElement.classList.add('a11y-widget-hidden');
```

## Step 3: Add Custom Header Button

Add a button in your header/navigation component:

### React Example

```tsx
import { Accessibility } from 'lucide-react' // or your icon library

function Header() {
  const toggleWidget = () => {
    document.documentElement.classList.toggle('a11y-widget-hidden');
  };

  return (
    <header>
      <nav>
        {/* Your navigation items */}
        
        <button
          onClick={toggleWidget}
          data-testid="button-a11y-widget"
          aria-label="Open accessibility widget"
          className="accessibility-button"
        >
          <Accessibility size={20} />
          <span>Accessibility</span>
        </button>
      </nav>
    </header>
  );
}
```

### Vanilla HTML/JavaScript Example

```html
<header>
  <nav>
    <!-- Your navigation -->
    
    <button
      id="custom-a11y-button"
      aria-label="Open accessibility widget"
      class="accessibility-button"
    >
      <span aria-hidden="true">♿</span>
      <span>Accessibility</span>
    </button>
  </nav>
</header>

<script>
  document.getElementById('custom-a11y-button').addEventListener('click', function() {
    document.documentElement.classList.toggle('a11y-widget-hidden');
  });
</script>
```

## Step 4: Style Your Custom Button (Optional)

```css
.accessibility-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.accessibility-button:hover {
  background: #f5f5f5;
  border-color: #999;
}

.accessibility-button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Hide text on mobile if needed */
@media (max-width: 480px) {
  .accessibility-button span:not([aria-hidden]) {
    display: none;
  }
}
```

## Complete React Example

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### `src/index.css`

```css
/* Hide widget by default */
.a11y-widget-hidden #a11y-widget-root,
.a11y-widget-hidden #a11y-widget-toggle,
.a11y-widget-hidden #a11y-widget-panel,
.a11y-widget-hidden #a11y-widget-header,
.a11y-widget-hidden #a11y-widget-title,
.a11y-widget-hidden #a11y-widget-close,
.a11y-widget-hidden .a11y-widget-help {
  display: none !important;
  visibility: hidden !important;
}
```

### `src/index.js` or `src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Hide widget on startup
document.documentElement.classList.add('a11y-widget-hidden')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### `src/components/layout/Header.tsx`

```tsx
import { Accessibility } from 'lucide-react'

export default function Header() {
  const toggleWidget = () => {
    document.documentElement.classList.toggle('a11y-widget-hidden')
  }

  return (
    <header>
      <nav>
        {/* Your navigation items */}
        
        <button
          onClick={toggleWidget}
          data-testid="button-a11y-widget"
          aria-label="Open accessibility widget"
          className="accessibility-button"
        >
          <Accessibility size={20} />
          <span>Accessibility</span>
        </button>
      </nav>
    </header>
  )
}
```

## How It Works

1. **Widget loads**: The loader script loads CSS and JS from GitHub
2. **Widget hidden**: The `a11y-widget-hidden` class hides the default toggle button
3. **Custom button**: Your header button toggles the class
4. **Widget shows/hides**: Removing the class shows the widget, adding it hides it

## Benefits

- ✅ Consistent with your site's design
- ✅ Widget functionality remains intact
- ✅ Better UX - widget appears where users expect it
- ✅ Easy to integrate with existing navigation
- ✅ Works with any framework or vanilla HTML

## Advanced: Track Widget State

If you want to track whether the widget is open:

```tsx
import { useState, useEffect } from 'react'

function Header() {
  const [widgetVisible, setWidgetVisible] = useState(false)

  useEffect(() => {
    const checkVisibility = () => {
      setWidgetVisible(!document.documentElement.classList.contains('a11y-widget-hidden'))
    }

    // Check on mount
    checkVisibility()

    // Watch for changes (optional - uses MutationObserver)
    const observer = new MutationObserver(checkVisibility)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const toggleWidget = () => {
    document.documentElement.classList.toggle('a11y-widget-hidden')
    setWidgetVisible(!widgetVisible)
  }

  return (
    <button
      onClick={toggleWidget}
      aria-label={widgetVisible ? "Close accessibility widget" : "Open accessibility widget"}
      aria-expanded={widgetVisible}
    >
      <Accessibility />
      <span>Accessibility</span>
    </button>
  )
}
```

## Troubleshooting

### Widget Not Hiding

- Ensure CSS is loaded before widget script
- Check that class is added to `document.documentElement` (not `document.body`)
- Verify CSS selectors match widget elements

### Widget Not Showing When Class Removed

- Check browser console for errors
- Verify widget script loaded successfully
- Ensure widget root element exists in DOM

### Custom Button Not Working

- Check click handler is attached
- Verify button is not disabled
- Check for JavaScript errors in console

## Next Steps

- Customize button styling to match your design
- Add keyboard shortcuts (e.g., Alt+A to toggle)
- Integrate with your state management system
- Add analytics tracking for widget usage

