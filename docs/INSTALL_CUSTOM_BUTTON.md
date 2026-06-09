# Installation Guide — Custom Button Control

This guide shows how to hide the default floating widget button and control the panel with a custom button in your header/navigation.

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
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.8/a11y-widget-loader-v1.6.8.js" defer></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

## Step 2: Hide the Default Floating Button

Add CSS to hide only the built-in floating toggle button. Do not hide `#a11y-widget-root` or `#a11y-widget-panel`; the public API needs the panel to remain renderable.

```css
/* Hide only the default floating toggle */
.a11y-widget-custom-button #a11y-widget-toggle {
  display: none !important;
  visibility: hidden !important;
}
```

Then add the class to your HTML element on page load:

```javascript
// Add this script before </head> or in your main JS file
document.documentElement.classList.add('a11y-widget-custom-button');
```

## Step 3: Add Custom Header Button

Add a button in your header/navigation component:

### React Example

```tsx
import { Accessibility } from 'lucide-react' // or your icon library

function Header() {
  const toggleWidget = async () => {
    const widget = await window.__initA11yWidget();
    widget.toggle();
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
  document.getElementById('custom-a11y-button').addEventListener('click', async function() {
    const widget = await window.__initA11yWidget();
    widget.toggle();
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
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.8/a11y-widget-loader-v1.6.8.js" defer></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### `src/index.css`

```css
/* Hide only the default floating toggle */
.a11y-widget-custom-button #a11y-widget-toggle {
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

// Use a custom header button instead of the default floating toggle
document.documentElement.classList.add('a11y-widget-custom-button')

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
  const toggleWidget = async () => {
    const widget = await window.__initA11yWidget()
    widget.toggle()
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
2. **Default button hidden**: The `a11y-widget-custom-button` class hides only the built-in floating toggle
3. **Custom button**: Your header button calls `window.__initA11yWidget()` and then `widget.toggle()`
4. **Widget opens/closes**: The public widget API controls the panel without depending on private DOM selectors

## Benefits

- ✅ Consistent with your site's design
- ✅ Widget functionality remains intact
- ✅ Better UX - widget appears where users expect it
- ✅ Easy to integrate with existing navigation
- ✅ Works with any framework or vanilla HTML

## Advanced: Track Widget State

If you want to track whether the widget is open, read the panel state after the API call:

```tsx
import { useState } from 'react'

function Header() {
  const [widgetOpen, setWidgetOpen] = useState(false)

  const toggleWidget = async () => {
    const widget = await window.__initA11yWidget()
    widget.toggle()

    const panel = document.getElementById('a11y-widget-panel')
    setWidgetOpen(!!panel && !panel.hasAttribute('hidden'))
  }

  return (
    <button
      onClick={toggleWidget}
      aria-label={widgetOpen ? "Close accessibility widget" : "Open accessibility widget"}
      aria-expanded={widgetOpen}
    >
      <Accessibility />
      <span>Accessibility</span>
    </button>
  )
}
```

## Troubleshooting

### Default Floating Button Not Hiding

- Ensure CSS is loaded before widget script
- Check that `a11y-widget-custom-button` is added to `document.documentElement` (not `document.body`)
- Verify the selector targets only `#a11y-widget-toggle`

### Widget Panel Not Opening

- Check browser console for errors
- Verify the loader script URL returns HTTP 200
- Verify `window.__initA11yWidget` exists after the loader script runs
- Use `const widget = await window.__initA11yWidget(); widget.open();` to test the API directly

### Custom Button Not Working

- Check click handler is attached
- Verify button is not disabled
- Check for JavaScript errors in console

## Next Steps

- Customize button styling to match your design
- Add keyboard shortcuts (e.g., Alt+A to toggle)
- Integrate with your state management system
- Add analytics tracking for widget usage

