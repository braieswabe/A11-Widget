# Developer Guide — Accessibility Widget v1

This guide is for developers working on or extending the Accessibility Widget v1.

## Architecture Overview

The widget follows a modular architecture with these components:

### 1. WidgetShell (UI + Open/Close)

Located in `buildWidget()` function. Handles:
- Widget toggle button
- Panel open/close behavior
- Focus management
- Keyboard event handling

### 2. PreferenceStore (localStorage/cookie)

Located in `Store` object. Handles:
- Reading preferences from localStorage
- Writing preferences to localStorage
- Cookie fallback if localStorage unavailable
- Clearing preferences

### 3. StyleApplier (Applies classnames/data-attributes + CSS variables)

Located in `applyPrefs()` function. Handles:
- Setting `data-a11y-*` attributes on `<html>`
- Setting CSS custom properties (`--a11y-*`)
- Marking surfaces with `data-a11y-surface="true"`

### 4. A11yGuard (Keyboard trap prevention, focus management)

Built into `buildWidget()`:
- No focus trap (non-modal dialog)
- Focus returns to opener on close
- Escape key closes panel
- Tab navigation through all controls

### 5. TelemetryHook (Optional – logs usage events)

Located in `emit()` function:
- Dispatches CustomEvents for client-side listeners
- Optionally POSTs to backend if `telemetryEndpoint` configured
- No PII collection

## Code Structure

### File Organization

```
a11y-widget.js
├── DEFAULTS (configuration defaults)
├── Helpers (assign, clamp, safeJSONParse, nowISO)
├── Store (localStorage/cookie persistence)
├── Preferences (normalizePrefs, PREF_DEFAULTS)
├── DOM Application (applyPrefs, markSurfaces)
├── Telemetry (emit function)
├── UI (el helper, buildWidget, updateUIControls)
└── Bootstrap (getConfig, init)
```

### Key Functions

#### `buildWidget(cfg, prefs, onChange, onReset)`

Builds the widget UI and returns:
- `root`: Root DOM element
- `open`: Function to open panel
- `close`: Function to close panel
- `controls`: Object with control references
- `updateControls`: Function to sync UI with preferences

#### `applyPrefs(prefs)`

Applies preferences to DOM:
- Sets `data-a11y-*` attributes on `<html>`
- Sets CSS custom properties
- Called whenever preferences change

#### `updateUIControls(controls, prefs)`

Syncs UI controls with current preferences:
- Updates select value
- Updates range value and display
- Updates radio button checked states
- Updates checkbox checked states

#### `emit(cfg, evt, payload)`

Emits telemetry events:
- Dispatches CustomEvent for client-side listeners
- Optionally POSTs to backend if configured
- Handles errors gracefully (doesn't break widget)

## Adding New Features

### Step 1: Update DEFAULTS

Add new feature flag or config option:

```javascript
features: {
  // ... existing features
  newFeature: true
}
```

### Step 2: Add Preference Default

```javascript
var PREF_DEFAULTS = {
  // ... existing prefs
  newFeature: false
};
```

### Step 3: Update normalizePrefs

```javascript
function normalizePrefs(p) {
  // ... existing normalization
  return {
    // ... existing prefs
    newFeature: !!p.newFeature
  };
}
```

### Step 4: Apply to DOM

```javascript
function applyPrefs(prefs) {
  // ... existing application
  html.setAttribute("data-a11y-new-feature", prefs.newFeature ? "1" : "0");
}
```

### Step 5: Add UI Control

In `buildWidget()`, add control:

```javascript
if (cfg.features.newFeature) {
  var newFeatureRow = toggleRow(
    "a11y-new-feature",
    "New Feature",
    prefs.newFeature,
    function (v) { onChange({ newFeature: v }); },
    "Description of new feature."
  );
  controls.newFeatureCheckbox = newFeatureRow.checkbox;
  panel.appendChild(newFeatureRow.row);
}
```

### Step 6: Update updateUIControls

```javascript
function updateUIControls(controls, prefs) {
  // ... existing updates
  if (controls.newFeatureCheckbox !== undefined) {
    controls.newFeatureCheckbox.checked = !!prefs.newFeature;
  }
}
```

### Step 7: Add CSS (if needed)

In `a11y-widget.css`:

```css
html[data-a11y][data-a11y-new-feature="1"] [data-a11y-surface="true"] {
  /* New feature styles */
}
```

## Testing Guidelines

### Manual Testing

1. **Keyboard navigation**: Tab through all controls, test Escape, Enter, Space
2. **Screen reader**: Test with NVDA/VoiceOver
3. **Visual**: Test all contrast modes, text scaling, spacing
4. **Persistence**: Change settings, reload, verify persistence
5. **Presets**: Test all preset buttons update controls
6. **Mobile**: Test at 320px, 375px, 768px widths

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Automated Testing (Future)

Consider adding:
- Unit tests for preference normalization
- Integration tests for DOM application
- E2E tests for user flows

## Scope Boundaries

**CRITICAL**: Always maintain scope boundaries:

### ✅ DO

- Apply transforms only to `data-a11y-surface="true"` elements
- Use CSS variables for transforms
- Keep widget UI accessible
- Follow WCAG 2.1 AA for widget + surfaces

### ❌ DON'T

- Auto-inject ARIA into host-site elements
- Rewrite host HTML
- Claim to fix third-party embeds
- Use "ADA compliant" language
- Modify elements outside declared surfaces

## Versioning Strategy

### Version Paths

- Current: `/a11y-widget/v1/...`
- Future: `/a11y-widget/v2/...`, `/a11y-widget/v3/...`

### Versioning Rules

1. **Breaking changes**: New major version
2. **New features**: New minor version (within major)
3. **Bug fixes**: Patch version (within minor)
4. **Immutable**: Once published, version never changes

### Migration Guide

When creating v2:

1. Document breaking changes
2. Provide migration guide
3. Keep v1 available for existing clients
4. Update documentation

## Contributing

### Code Style

- Use ES5 (no ES6+ features)
- Use `var` (not `let`/`const`)
- Use function declarations (not arrows)
- Use IIFE pattern
- No dependencies

### Naming Conventions

- Functions: `camelCase`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- IDs: `kebab-case`

### Comments

- Use `//` for single-line comments
- Use `/* */` for multi-line comments
- Document complex logic
- Include purpose of functions

### Error Handling

- Use try/catch for risky operations
- Fail gracefully (don't break widget)
- Log errors to console in development
- Don't expose errors to users

## Performance Considerations

### Minimize DOM Queries

Cache DOM references:

```javascript
var html = document.documentElement; // Cache once
```

### Defer Non-Critical Operations

Use `defer` for script loading:

```html
<script src="..." defer></script>
```

### Avoid Layout Thrashing

Batch DOM updates:

```javascript
// Good: Batch updates
applyPrefs(prefs);
updateUIControls(controls, prefs);

// Bad: Multiple separate updates
```

## Security Considerations

### No PII Collection

Telemetry must not collect:
- Names
- Email addresses
- IP addresses (if possible)
- Personal information

### XSS Prevention

- Use `textContent` (not `innerHTML`) for user content
- Escape user input if displaying
- Validate configuration values

### CSP Compatibility

- Support CSP-friendly installation (data attributes)
- Don't require inline scripts
- Use external stylesheet or inject CSS safely

## Debugging

### Enable Debug Mode

Add debug logging:

```javascript
var DEBUG = false; // Set to true for debugging

function debugLog(msg) {
  if (DEBUG) console.log('[A11Y Widget]', msg);
}
```

### Common Issues

1. **Widget not appearing**: Check script loads, CSP, console errors
2. **Settings not persisting**: Check localStorage, cookies, domain
3. **Controls not updating**: Check `updateUIControls` is called
4. **Telemetry not sending**: Check endpoint, CORS, network tab

## Release Checklist

Before releasing:

- [ ] All acceptance tests pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Tested on all browsers
- [ ] Mobile responsiveness verified
- [ ] No console errors
- [ ] Scope boundaries maintained
- [ ] No "ADA compliant" claims

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) for browser compatibility

## Questions?

- Review [README.md](../README.md) for usage
- Check [support-statement.md](../support-statement.md) for scope
- See [wcag-matrix.md](../wcag-matrix.md) for coverage

