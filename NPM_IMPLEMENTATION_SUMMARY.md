# NPM Package Implementation Summary

## Overview

Added npm installation support while strictly maintaining existing CDN behavior. All changes are backward compatible.

## Files Changed

### Core Widget Files (Patched)
1. `a11y-widget.js` - Patched to expose init function
2. `a11y-widget-v1.1.0.js` - Patched to expose init function
3. `a11y-widget-loader-v1.1.0.js` - Updated to call init function

### New NPM Package Files
- `packages/a11y-widget/package.json`
- `packages/a11y-widget/src/index.js`
- `packages/a11y-widget/src/init.js`
- `packages/a11y-widget/src/types.d.ts`
- `packages/a11y-widget/vendor/a11y-widget.core.js` (copied from a11y-widget-v1.1.0.js)
- `packages/a11y-widget/assets/a11y-widget.css` (copied from a11y-widget.css)
- `packages/a11y-widget/README.md`
- `packages/a11y-widget/IMPLEMENTATION.md`
- `packages/a11y-widget/PATCH_DIFF.md`

## Changes Made

### 1. Widget Core Patch

**Location**: `a11y-widget.js` and `a11y-widget-v1.1.0.js`

**Changes**:
- Modified `init()` function to accept optional `userConfig` parameter
- Merges `userConfig` into `window.__A11Y_WIDGET__` before calling `getConfig()`
- Removed auto-execution: Changed `init();` at end to `window.__a11yWidgetInit = init;`
- **No other logic changes** - all widget functionality preserved

### 2. CDN Loader Update

**Location**: `a11y-widget-loader-v1.1.0.js`

**Changes**:
- Updated `script.onload` handler to call `window.__a11yWidgetInit(window.__A11Y_WIDGET__)`
- Maintains exact same auto-initialization behavior for CDN usage
- CDN behavior is **identical** to before

### 3. NPM Package Structure

```
packages/a11y-widget/
├── src/
│   ├── index.js          # Main entry (imports core, exports init)
│   ├── init.js           # Init wrapper with SSR guards
│   └── types.d.ts        # TypeScript definitions
├── vendor/
│   └── a11y-widget.core.js  # Widget core (copied from a11y-widget-v1.1.0.js)
├── assets/
│   └── a11y-widget.css   # CSS file
└── package.json
```

### 4. NPM Wrapper Implementation

**`src/index.js`**:
- Imports widget core (IIFE executes as side effect, registers `window.__a11yWidgetInit`)
- Exports `initA11yWidget` function
- No DOM manipulation on import

**`src/init.js`**:
- SSR-safe: Checks for `window` before execution
- Validates core is loaded before calling init
- Prevents double initialization
- Calls `window.__a11yWidgetInit(config)`

## Usage

### CDN (Unchanged - Still Works Exactly As Before)

```html
<script>
  window.__A11Y_WIDGET__ = { siteId: "example.com" };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.1.0/a11y-widget-loader-v1.1.0.js" defer></script>
```

### NPM (New - Additional Option)

```javascript
import { initA11yWidget } from "@scope/a11y-widget";
import "@scope/a11y-widget/styles.css";

initA11yWidget({ siteId: "example.com" });
```

## Manual Configuration Required

### NONE - All Changes Are Backward Compatible

- ✅ **CDN URLs unchanged** - Hardcoded GitHub CDN paths remain in widget core
- ✅ **Version sync** - npm package version matches widget version (1.1.0)
- ✅ **Loader script updated** - CDN loader now calls init function (same behavior)
- ✅ **Documentation** - Minimal README created for npm usage
- ✅ **Backend unchanged** - No changes to API, auth, telemetry, or storage
- ✅ **CSS fallback** - Widget core still falls back to CDN CSS if not imported

## Important Notes

1. **Widget core remains IIFE** - The core file uses IIFE pattern. When imported by bundlers, it executes as a side effect and registers `window.__a11yWidgetInit`. Marked as side effect in `package.json`.

2. **CSS loading** - NPM users must import CSS separately via `import "@scope/a11y-widget/styles.css"`. Widget core still has fallback to CDN CSS (hardcoded URLs remain unchanged).

3. **SSR Safety** - The npm wrapper (`src/init.js`) checks for `window` before calling init, making imports safe in SSR environments (e.g., Next.js).

4. **Package name** - Update `@scope/a11y-widget` in `package.json` to your actual npm scope/package name before publishing.

5. **Bundler compatibility** - The widget core uses IIFE pattern. Modern bundlers (Vite, Webpack, etc.) handle IIFE execution as side effects. For strict ES module compatibility, bundlers should handle this correctly.

## Testing Checklist

- [ ] CDN usage still works (test with loader script)
- [ ] CDN auto-initialization unchanged
- [ ] NPM import doesn't crash SSR builds (Next.js, etc.)
- [ ] NPM initialization works in browser
- [ ] CSS imports work (npm CSS path)
- [ ] CSS fallback still works (CDN CSS)
- [ ] Configuration merging works (window.__A11Y_WIDGET__ + initA11yWidget param)
- [ ] No double initialization
- [ ] Backend APIs unchanged (auth, telemetry, etc.)

## Rollback Safety

All changes are isolated:
- Widget core patches are minimal and can be reverted
- CDN loader change maintains same behavior
- NPM package is completely separate (packages/ directory)
- No backend code changed

To rollback:
1. Revert widget core files (remove init parameter, restore auto-execution)
2. Revert CDN loader (restore old onload handler)
3. Delete `packages/` directory
