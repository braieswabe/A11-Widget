# Final Publishing Instructions

## Pre-Publish Checklist

### ✅ Package Configuration
- [x] Package name: `@careerdriver-ai/a11y-widget`
- [x] Version: `1.1.0`
- [x] All exports configured correctly
- [x] Side effects declared
- [x] TypeScript definitions included

### ✅ Code Verification
- [x] Widget core patched (exposes `window.__a11yWidgetInit`)
- [x] CDN loader updated (calls init function)
- [x] SSR guards implemented
- [x] No backend dependencies
- [x] No breaking changes

### ✅ Testing
- [x] npm pack successful
- [x] Local installation tested
- [x] SSR safety verified
- [x] CDN behavior confirmed

### ✅ Documentation
- [x] README updated with actual package name
- [x] Examples match actual exports
- [x] Version references consistent

---

## Publishing Steps

### 1. Final Verification

```bash
cd packages/a11y-widget

# Verify package.json
cat package.json

# Test packaging one more time
npm pack --dry-run

# Create final package
npm pack
```

**Expected output**: `careerdriver-ai-a11y-widget-1.1.0.tgz`

### 2. Verify Package Contents

```bash
# Extract and inspect
tar -tzf careerdriver-ai-a11y-widget-1.1.0.tgz | sort
```

**Expected files** (7 total):
- `package/package.json`
- `package/README.md`
- `package/src/index.js`
- `package/src/init.js`
- `package/src/types.d.ts`
- `package/vendor/a11y-widget.core.js`
- `package/assets/a11y-widget.css`

### 3. NPM Authentication

Ensure you're logged in to npm with access to `@careerdriver-ai` scope:

```bash
# Check current user
npm whoami

# Login if needed
npm login

# Verify scope access
npm access ls-packages @careerdriver-ai
```

### 4. Publish to npm

```bash
cd packages/a11y-widget

# Dry run (optional - shows what would be published)
npm publish --dry-run

# Actual publish
npm publish --access public
```

**Note**: Use `--access public` if the scope requires explicit public access.

### 5. Verify Publication

```bash
# Check package on npm
npm view @careerdriver-ai/a11y-widget

# Test installation in clean directory
cd /tmp
mkdir test-install && cd test-install
npm init -y
npm install @careerdriver-ai/a11y-widget

# Verify it works
node -e "import('@careerdriver-ai/a11y-widget').then(m => console.log('✅ Import successful:', Object.keys(m)))"
```

---

## Post-Publish

### 1. Update Documentation

- [x] Root README.md already updated
- [x] Package README.md already updated
- [ ] Update any external documentation if needed

### 2. Version Management

For future updates:
1. Update version in `package.json`
2. Update version in root widget files if needed
3. Update CDN version tags if applicable
4. Update README version references
5. Publish new version

### 3. CDN Compatibility

**Important**: CDN usage remains unchanged and independent:
- CDN users continue using: `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.1.0/...`
- npm users use: `@careerdriver-ai/a11y-widget`
- Both methods work independently
- No breaking changes to CDN behavior

---

## Package Information

**Package Name**: `@careerdriver-ai/a11y-widget`  
**Version**: `1.1.0`  
**License**: MIT  
**Type**: ESM Module  

**Exports**:
- `.` → Main entry (`src/index.js`)
- `./styles.css` → CSS file (`assets/a11y-widget.css`)

**Usage**:
```javascript
import { initA11yWidget } from "@careerdriver-ai/a11y-widget";
import "@careerdriver-ai/a11y-widget/styles.css";

initA11yWidget({ siteId: "example.com" });
```

---

## Troubleshooting

### If publish fails with scope access error:
```bash
# Verify you have access to the scope
npm access ls-packages @careerdriver-ai

# Request access if needed (contact npm org admin)
```

### If package not found after publish:
```bash
# Wait a few minutes for npm registry propagation
# Then verify:
npm view @careerdriver-ai/a11y-widget
```

### If TypeScript types not found:
- Verify `types` field in package.json points to `./src/types.d.ts`
- Ensure `types.d.ts` file is included in package

---

## ✅ READY TO PUBLISH

All checks passed. Package is production-ready.

**Final Command**:
```bash
cd packages/a11y-widget && npm publish --access public
```
