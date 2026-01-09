# Review and Testing Guide — Accessibility Widget v1

This guide explains how to review the widget code and test it on a website before deployment.

## Quick Start: Testing Locally

### Option 1: Simple HTML Test Page

Create a test HTML file (`test.html`) in the project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Widget Test</title>
  
  <!-- Widget CSS -->
  <link rel="stylesheet" href="./a11y-widget.css" />
  
  <!-- Widget Config -->
  <script>
    window.__A11Y_WIDGET__ = {
      siteId: "test-site",
      position: "right",
      surfaces: ["body", "main"],
      enableTelemetry: false
    };
  </script>
  
  <!-- Widget Script -->
  <script src="./a11y-widget.js" defer></script>
  
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    main {
      background: #f5f5f5;
      padding: 2rem;
      border-radius: 8px;
    }
    h1 { color: #333; }
    p { margin-bottom: 1rem; }
    .test-section {
      margin: 2rem 0;
      padding: 1rem;
      background: white;
      border-left: 4px solid #007bff;
    }
  </style>
</head>
<body>
  <main>
    <h1>Accessibility Widget Test Page</h1>
    
    <div class="test-section">
      <h2>Test Content</h2>
      <p>This is a paragraph of text that should receive accessibility transforms when you configure surfaces.</p>
      <p>Try adjusting the widget settings:</p>
      <ul>
        <li>Change contrast modes</li>
        <li>Adjust text size (100-160%)</li>
        <li>Modify text spacing</li>
        <li>Enable readable font</li>
        <li>Reduce motion</li>
      </ul>
    </div>
    
    <div class="test-section">
      <h2>Form Elements</h2>
      <label for="test-input">Test Input:</label>
      <input type="text" id="test-input" placeholder="Type here" />
      <button onclick="alert('Button clicked!')">Test Button</button>
    </div>
    
    <div class="test-section">
      <h2>Links</h2>
      <p>Here are some <a href="#test">test links</a> to verify link styling.</p>
    </div>
  </main>
</body>
</html>
```

**To test:**
1. Open `test.html` in a web browser
2. Look for the accessibility widget toggle button (top-right)
3. Click to open and test all controls

### Option 2: Local Server

For better testing (avoids CORS issues):

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000/test.html`

## Code Review Checklist

### 1. Widget JavaScript (`a11y-widget.js`)

#### Structure Review
- [ ] Code is IIFE (Immediately Invoked Function Expression)
- [ ] No global variables (except `window.__a11yWidget`)
- [ ] No dependencies required
- [ ] Uses ES5 syntax (no ES6+)

#### Functionality Review
- [ ] Preset buttons update all controls visually
- [ ] Reset button resets all controls
- [ ] Preferences persist in localStorage
- [ ] Cookie fallback works if localStorage unavailable
- [ ] Telemetry emits CustomEvents (if enabled)
- [ ] Telemetry POSTs to backend (if endpoint configured)

#### Accessibility Review
- [ ] All controls have labels
- [ ] ARIA attributes correct (`aria-expanded`, `aria-controls`, `aria-labelledby`)
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Focus management correct (focus returns to opener)
- [ ] Screen reader announcements work

#### Code Quality
- [ ] No console errors
- [ ] Error handling present (try/catch blocks)
- [ ] No memory leaks
- [ ] Code is readable and commented

### 2. Widget CSS (`a11y-widget.css`)

#### Structure Review
- [ ] Styles scoped to `#a11y-widget-root`
- [ ] No global style resets
- [ ] CSS variables used for preferences
- [ ] Surface transforms only apply to `[data-a11y-surface="true"]`

#### Responsiveness Review
- [ ] Widget works at 320px width
- [ ] No horizontal scroll at mobile widths
- [ ] Panel adapts to viewport size
- [ ] Media queries present for small screens

#### Visual Review
- [ ] Focus styles visible and strong
- [ ] Contrast modes work correctly
- [ ] Dark mode styles present
- [ ] Widget doesn't cover important content

### 3. API Routes

#### Telemetry Endpoint (`api/telemetry.js`)
- [ ] Accepts POST requests
- [ ] Validates input (no PII)
- [ ] Handles errors gracefully
- [ ] Returns appropriate status codes
- [ ] CORS headers present

#### Config Endpoint (`api/config/[siteId].js`)
- [ ] Accepts GET requests
- [ ] Returns JSON config
- [ ] Handles missing configs (404)
- [ ] Cache headers present

#### Health Endpoint (`api/health.js`)
- [ ] Returns status OK
- [ ] Checks database connection
- [ ] Handles errors

### 4. Database Schema

#### Schema Review (`database/schema.sql`)
- [ ] Tables created correctly
- [ ] Indexes present for performance
- [ ] Constraints appropriate
- [ ] Triggers work (updated_at)

### 5. Documentation

#### README Review
- [ ] Installation instructions clear
- [ ] Configuration options documented
- [ ] Platform guides linked
- [ ] Troubleshooting section present

#### Platform Guides Review
- [ ] Each platform has clear steps
- [ ] Code examples work
- [ ] CSP considerations included
- [ ] Troubleshooting included

## Testing on Your Website

### Step 1: Prepare Widget Files

1. **Copy widget files** to your web server or CDN:
   - `a11y-widget.js`
   - `a11y-widget.css`

2. **Or use local files** for testing:
   - Place files in your project directory
   - Reference with relative paths

### Step 2: Add Widget to Your Site

#### For Static HTML Sites

Add to your HTML `<head>` or before `</body>`:

```html
<link rel="stylesheet" href="/path/to/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "your-site-id",
    position: "right",
    surfaces: ["body", "main"],
    enableTelemetry: false
  };
</script>
<script src="/path/to/a11y-widget.js" defer></script>
```

#### For React/Next.js

See [INSTALL_REACT.md](INSTALL_REACT.md) or [INSTALL_NEXTJS.md](INSTALL_NEXTJS.md)

#### For WordPress

See [INSTALL_WORDPRESS.md](INSTALL_WORDPRESS.md)

### Step 3: Configure Surfaces

Identify content areas to transform:

```javascript
surfaces: [
  "body",                    // All body content
  "main",                    // Main content area
  ".content",                // Content wrapper class
  "[data-canonical-surface='true']"  // Custom attribute
]
```

**Test**: Inspect elements in browser DevTools — they should have `data-a11y-surface="true"` attribute.

### Step 4: Test Functionality

#### Basic Tests

1. **Widget Appears**
   - [ ] Toggle button visible (top-right by default)
   - [ ] Button is clickable
   - [ ] Panel opens/closes correctly

2. **Settings Work**
   - [ ] Contrast modes change colors
   - [ ] Text size slider adjusts font size
   - [ ] Spacing presets modify spacing
   - [ ] Readable font toggle works
   - [ ] Reduce motion disables animations

3. **Persistence**
   - [ ] Change settings
   - [ ] Reload page
   - [ ] Settings persist

4. **Presets**
   - [ ] Low vision preset updates all controls
   - [ ] Dyslexia-friendly preset updates controls
   - [ ] Reduced motion preset updates checkbox

5. **Reset**
   - [ ] Reset button clears all settings
   - [ ] Controls return to defaults

#### Keyboard Tests

1. **Tab Navigation**
   - [ ] Tab to widget toggle button
   - [ ] Enter/Space opens panel
   - [ ] Tab through all controls
   - [ ] Escape closes panel
   - [ ] Focus returns to toggle

2. **Control Interaction**
   - [ ] Space toggles checkboxes
   - [ ] Arrow keys navigate radio buttons
   - [ ] Enter activates buttons

#### Screen Reader Tests

1. **NVDA (Windows)** or **VoiceOver (macOS)**
   - [ ] Toggle button announces state
   - [ ] Panel announces as dialog
   - [ ] Controls announce name and state
   - [ ] Range slider announces percentage

#### Mobile Tests

1. **Responsive Design**
   - [ ] Test at 320px width
   - [ ] Test at 375px width (iPhone)
   - [ ] Test at 768px width (Tablet)
   - [ ] No horizontal scroll
   - [ ] Widget remains usable

#### Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Step 5: Verify Scope Boundaries

**Important**: Widget should ONLY affect declared surfaces.

1. **Check Elements**
   - Inspect elements with `data-a11y-surface="true"`
   - Verify only these elements receive transforms
   - Check that other elements are unaffected

2. **Check CSS**
   - Open DevTools → Elements → Styles
   - Verify transforms only apply to surfaces
   - Check no global styles are modified

3. **Check JavaScript**
   - Open DevTools → Console
   - Verify no errors
   - Check that widget doesn't modify host HTML

## Common Issues and Solutions

### Widget Not Appearing

**Check:**
1. Script loads: DevTools → Network → Look for `a11y-widget.js`
2. Console errors: DevTools → Console
3. CSP: Check Content Security Policy allows scripts
4. Path: Verify file paths are correct

**Solution:**
- Fix file paths
- Update CSP headers
- Check browser console for errors

### Settings Not Persisting

**Check:**
1. localStorage: DevTools → Application → Local Storage
2. Cookies: Check if cookies are blocked
3. Domain: Preferences are per-domain

**Solution:**
- Clear browser cache
- Check localStorage is enabled
- Verify domain matches

### Surfaces Not Transforming

**Check:**
1. Selectors: Verify `surfaces` selectors match your HTML
2. Attributes: Inspect elements — should have `data-a11y-surface="true"`
3. CSS: Verify `a11y-widget.css` loads

**Solution:**
- Update `surfaces` array to match your HTML
- Check CSS file loads correctly
- Verify selectors are valid

### Widget Covers Important Content

**Check:**
1. z-index: Widget default is `2147483000`
2. Position: Try `position: "left"` instead

**Solution:**
- Lower `zIndex` in config
- Change `position` to `"left"`
- Adjust widget position CSS if needed

## Testing Checklist

Before deploying to production:

### Functionality
- [ ] Widget loads and appears
- [ ] All controls work correctly
- [ ] Settings persist after reload
- [ ] Presets update all controls
- [ ] Reset works correctly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus management works
- [ ] Focus styles visible

### Visual
- [ ] Widget responsive at 320px
- [ ] No horizontal scroll
- [ ] Contrast modes work
- [ ] Widget doesn't cover content

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile

### Scope Boundaries
- [ ] Only surfaces are transformed
- [ ] Host HTML not modified
- [ ] No global styles changed
- [ ] No console errors

## Next Steps

After testing:

1. **Deploy to staging** — Test in staging environment
2. **User acceptance testing** — Have users test the widget
3. **Deploy to production** — Follow [DEPLOYMENT.md](../DEPLOYMENT.md)
4. **Monitor** — Check telemetry (if enabled) and user feedback

## Resources

- [Acceptance Tests](ACCEPTANCE_TESTS.md) — Detailed test checklist
- [Deployment Guide](../DEPLOYMENT.md) — Production deployment
- [Platform Guides](INSTALL_*.md) — Platform-specific installation
- [Developer Guide](DEVELOPER.md) — Code architecture and contributing

## Questions?

- Check [README.md](../README.md) for general information
- Review [support-statement.md](../support-statement.md) for scope boundaries
- See [wcag-matrix.md](../wcag-matrix.md) for WCAG coverage

