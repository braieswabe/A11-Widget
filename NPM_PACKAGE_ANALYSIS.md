# NPM Package Conversion Analysis

## Framework & Runtime

### Widget Files (Core Package)
- **Language**: Vanilla JavaScript (ES5-compatible IIFE pattern)
- **No framework dependencies**: Pure JavaScript, no React/Vue/Angular
- **No TypeScript**: Widget files are `.js` (TypeScript definitions exist separately in `website/src/types/`)

### Website/Documentation (Separate)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Router**: React Router v6
- **Note**: The website is separate from the widget package and uses Vite for its own build

---

## Widget Architecture

### Entry Point Files
1. **Primary widget**: `a11y-widget.js` / `a11y-widget-v1.1.0.js` (~4,681 lines)
2. **Auto-loader**: `a11y-widget-loader-v1.1.0.js` (loads widget from CDN)
3. **CSS**: `a11y-widget.css` / `a11y-widget-v1.1.0.css`

### Initialization Pattern
- **Auto-execution**: IIFE (Immediately Invoked Function Expression) - widget initializes automatically when script loads
- **Init function**: `init()` called at end of file: `init(); }());`
- **DOM readiness**: Checks `document.readyState` and waits for `DOMContentLoaded` if needed
- **Mount function**: Builds UI after DOM is ready, appends to `document.body`

### Global Variables Exposed
- **`window.__a11yWidget`**: Widget API object
  - `__loaded`: boolean flag
  - `config`: configuration object
  - `getPrefs()`: Get current preferences
  - `setPrefs(prefs)`: Update preferences
  - `reset()`: Reset to defaults
- **`window.__A11Y_WIDGET__`**: Configuration object (set before script loads)
- **`window.__a11yAuth`**: Authentication API (from loader, if using loader)

### DOM Injection
- Creates `#a11y-widget-root` element (main widget container)
- Creates `#a11y-widget-toggle` button (floating toggle button)
- Injects styles via `<link>` tag: `document.head.appendChild(link)`
- Can inject `<script>` tags for PDF.js dependency (if text-to-speech PDF feature used)

### Configuration Method
- Configuration via `window.__A11Y_WIDGET__` object (must be set before widget script loads)
- Supports data attributes (not primary method)
- Defaults defined in `DEFAULTS` object inside widget

---

## Styling

### CSS Strategy
- **File**: `a11y-widget.css` (standalone CSS file, ~2,000+ lines)
- **Scope**: Primarily scoped to `#a11y-widget-root`
- **Global styles**: Some styles on `html[data-a11y]` for preference CSS variables
- **CSS Variables**: Extensive design system using CSS custom properties
  - Design tokens (colors, spacing, fonts, shadows)
  - Customizable variables (can be overridden by JS)
  - Preference variables on `html[data-a11y]` element

### Style Isolation
- **Mostly isolated**: Widget UI styles scoped to `#a11y-widget-root`
- **Partial global**: CSS variables on `html` element and some surface transformations
- **No global resets**: Does not reset host site styles
- **Surface styling**: Can apply transformations to elements marked with `data-a11y-surface="true"` or in `globalMode`

### CSS Loading
- **Dynamic injection**: Widget injects CSS via `<link>` tag in `ensureCSS()` function
- **Fallback URLs**: Hardcoded GitHub CDN URLs as fallback
- **No CSS bundling**: CSS is separate file, not bundled with JS

---

## Dependencies

### Widget Files (Runtime - Zero Dependencies)
- **No npm dependencies**: Widget is self-contained vanilla JavaScript
- **No external libraries**: All code is in single file (IIFE pattern)
- **Conditional PDF.js**: Only loads if text-to-speech PDF feature is used (via CDN script tag)

### Root `package.json` (Server/API Dependencies - NOT widget)
- `@neondatabase/serverless`: ^0.9.0 (database)
- `bcryptjs`: ^2.4.3 (password hashing)
- `jsonwebtoken`: ^9.0.2 (JWT auth)
- **Note**: These are for the backend API, not the widget itself

### Website `package.json` (Documentation Site - Separate)
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `react-router-dom`: ^6.20.0
- **Dev dependencies**: TypeScript, Vite, ESLint
- **Note**: This is for the documentation website, not the widget package

---

## Environment Assumptions

### Browser-Only
- **No SSR support**: Direct `window`, `document`, `localStorage`, `document.cookie` usage
- **Browser APIs used**:
  - `window.localStorage` / `document.cookie` (preference storage)
  - `window.speechSynthesis` (text-to-speech)
  - `document.createElement`, `document.getElementById`, `document.querySelector`
  - `document.body.appendChild`
  - `IndexedDB` (for icon uploads/customization)
  - `window.location` (for siteId detection)
  - `window.getSelection` (for text selection)

### SSR Incompatibilities
- ❌ Cannot run on server (Node.js) - will throw errors
- ❌ Must run in browser environment
- ❌ Requires DOM APIs to be available

### Browser Compatibility
- Modern browsers (localStorage, IndexedDB support implied)
- Cookie fallback for localStorage (graceful degradation)

---

## Current Build Setup

### Widget Files
- **No bundler**: Widget files are raw JavaScript/CSS, copied as-is
- **No transpilation**: ES5-compatible code (var, function declarations, IIFE)
- **No minification**: Full source code (not minified)
- **Copy step**: Vite build copies widget files to `website/dist` (for documentation site)

### Website Build
- **Bundler**: Vite
- **Scripts**:
  - `dev`: Vite dev server
  - `build`: TypeScript compilation + Vite build
  - `preview`: Preview production build
- **Output**: `website/dist/` directory

### Root Build
- **No build scripts**: Only test script placeholder
- **No bundling**: Widget files are source files
- **Deployment**: Files served directly from repository (via GitHub CDN)

---

## Potential Issues for NPM Packaging

### Global Side Effects
1. **Auto-execution**: Widget runs immediately when script loads (IIFE pattern)
   - **Issue**: Cannot be imported as module without side effects
   - **Solution needed**: Export initialization function or support ES modules

2. **Global namespace pollution**:
   - `window.__a11yWidget`
   - `window.__A11Y_WIDGET__`
   - `window.__a11yAuth` (if using loader)

3. **DOM manipulation on load**:
   - Creates elements immediately
   - Appends to `document.body`
   - Injects CSS into `document.head`

### Hardcoded Paths
1. **GitHub CDN URLs in code**:
   - `a11y-widget.js`: `GITHUB_REPO = "braieswabe/A11-Widget"`, `CDN_BASE` hardcoded
   - `a11y-widget-loader-v1.1.0.js`: Same hardcoded repo paths
   - CSS loading: Falls back to GitHub raw URLs

2. **CSS loading strategy**:
   - Tries to load CSS from GitHub CDN
   - Should load from npm package path instead

### SSR Incompatibilities
1. **Direct DOM access**: Will break in SSR environments (Next.js, Nuxt, etc.)
2. **Window/document usage**: No guards for server-side rendering
3. **localStorage access**: Will throw errors on server

### Module System
1. **No ES modules**: Uses IIFE pattern (global scope)
2. **No CommonJS**: Cannot `require()` the widget
3. **No TypeScript definitions**: Types exist separately (in website folder)

### Package Structure Issues
1. **Multiple entry points**: Which file is the "main" entry?
   - `a11y-widget.js` vs `a11y-widget-v1.1.0.js`
   - Loader vs widget vs standalone?

2. **CSS file separation**: CSS must be loaded separately
   - Not bundled with JS
   - No clear import path

3. **Version files**: Multiple versioned files in root
   - `a11y-widget.js`
   - `a11y-widget-v1.1.0.js`
   - `a11y-widget-loader-v1.1.0.js`
   - Need clear versioning strategy for npm

### Build Process
1. **No build step**: Widget is source code
2. **No minification**: Large file sizes
3. **No tree-shaking**: Everything included (even if features disabled)
4. **No source maps**: Debugging harder

### Dependencies
1. **PDF.js conditional loading**: Loads from CDN when needed
   - Should this be a peer dependency?
   - Or keep as optional CDN load?

### Testing
1. **No test script**: Package.json has placeholder test script
2. **No test files**: No visible test suite

---

## Recommendations for NPM Package

1. **Create ES module wrapper**: Export initialization function
2. **Remove hardcoded GitHub URLs**: Use relative paths or configuration
3. **Add SSR guards**: Check for `window`/`document` before executing
4. **Unified entry point**: Single entry file that exports widget
5. **TypeScript definitions**: Include `.d.ts` files in package
6. **Build process**: Consider bundling/minification
7. **CSS import**: Provide CSS import path or bundling option
8. **Clear versioning**: Use npm versioning (not file-based versions)
9. **Documentation**: Clear usage instructions for npm install
10. **Optional features**: Consider making features optional to reduce bundle size
