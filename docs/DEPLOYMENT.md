# Deployment Workflow

This document describes the workflow for deploying updates to the A11Y Widget. **Always follow this process** when making changes to ensure the live widget gets updated properly.

## Why This Matters

The widget is served via **jsDelivr CDN** which aggressively caches files referenced by branch names (like `@main`). Simply pushing to GitHub won't update the live widget for existing users. You **must** create version tags to bypass CDN caching.

## Deployment Steps

### 1. Make Your Changes

Edit the widget files as needed:
- `a11y-widget.js` - Main widget JavaScript
- `a11y-widget.css` - Widget styles
- `a11y-widget-loader.js` - Loader script (if needed)

### 2. Test Locally

Run the local development server to test your changes:

```bash
cd website
npm run dev
```

Open `http://localhost:5173` to test the widget.

### 3. Commit and Push

```bash
# Stage your changes
git add a11y-widget.js a11y-widget.css

# Commit with a descriptive message
git commit -m "feat: Add new feature description"

# Push to main branch
git push origin main
```

### 4. Create a Version Tag (REQUIRED!)

**This is the critical step!** jsDelivr caches `@main` branch URLs for up to 7 days. Version tags are served immediately.

```bash
# Create an annotated tag with version number
git tag -a v1.X.X -m "Description of changes"

# Push the tag to GitHub
git push origin v1.X.X
```

#### Version Number Guidelines

- **Patch version** (v1.4.1 → v1.4.2): Bug fixes, minor improvements
- **Minor version** (v1.4.x → v1.5.0): New features, significant changes
- **Major version** (v1.x.x → v2.0.0): Breaking changes, major rewrites

### 5. Update the Loader (If Major Changes)

If you've made significant changes, update the `WIDGET_VERSION_TAG` in `a11y-widget-loader.js`:

```javascript
var WIDGET_VERSION_TAG = "v1.X.X";  // Update to new version
```

Then commit, push, and tag again.

### 6. Verify Deployment

Test that the new version is available:

```bash
# Check if jsDelivr serves the new version
curl -s "https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.X.X/a11y-widget.js" | head -20
```

You should see your updated code.

## Quick Reference Commands

```bash
# Full deployment workflow (copy and paste)
git add -A
git commit -m "Your commit message"
git push origin main
git tag -a v1.X.X -m "Your tag message"
git push origin v1.X.X
```

## Purging CDN Cache (Emergency)

If you need to purge jsDelivr cache for the `@main` branch (not recommended, use tags instead):

```bash
curl "https://purge.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget.js"
curl "https://purge.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget.css"
curl "https://purge.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js"
```

**Note:** Cache purges are not always reliable. Always use version tags for production deployments.

## Troubleshooting

### Widget Not Updating?

1. **Check if changes are committed**: `git status`
2. **Check if pushed to GitHub**: Visit https://github.com/braieswabe/A11-Widget
3. **Check if tag exists**: `git tag -l` or check GitHub releases
4. **Verify CDN serves new version**: Use curl commands above

### Local Works But Live Doesn't?

This usually means you forgot to:
1. Push changes to GitHub
2. Create and push a version tag
3. Update `WIDGET_VERSION_TAG` in the loader

### jsDelivr Returning Old Version?

1. Create a new version tag
2. The tagged URL will serve fresh content immediately
3. Users of `@main` will need to wait for cache expiry (up to 7 days)

## Version History

Track all releases with meaningful tags:

```bash
# List all tags
git tag -l

# Show tag details
git show v1.X.X
```

## Best Practices

1. **Always use version tags** for production deployments
2. **Test locally first** before committing
3. **Write descriptive commit messages** for tracking changes
4. **Increment version numbers** logically following semver
5. **Update loader** when making breaking changes
6. **Verify deployment** by testing the CDN URL

---

## Example Workflow

```bash
# 1. Make changes to widget files
# 2. Test locally with `npm run dev`
# 3. Deploy:

git add a11y-widget.js a11y-widget.css
git commit -m "fix: Improve magnifier performance and add translation status"
git push origin main

# 4. Create version tag
git tag -a v1.6.0 -m "Magnifier improvements, translation status, preset feedback"
git push origin v1.6.0

# 5. Verify
curl -s "https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.0/a11y-widget.js" | head -10
```

Remember: **No tag = No update for live users!**

