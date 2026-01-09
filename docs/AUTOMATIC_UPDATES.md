# Automatic Updates — How Widget Updates Propagate

This document explains how widget updates automatically propagate to all existing user integrations.

## How It Works

When users install the widget using the loader script:

```html
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
```

The widget files (`a11y-widget.js` and `a11y-widget.css`) are loaded directly from the GitHub repository via jsDelivr CDN.

## Update Propagation

### ✅ Automatic Updates

1. **You update widget files** in the GitHub repository (e.g., button design, new features, bug fixes)
2. **You commit and push** changes to the `main` branch
3. **jsDelivr CDN** automatically serves the updated files
4. **All existing integrations** automatically receive updates on their next page load

### Cache-Busting Mechanism

The loader script includes cache-busting query parameters (`?v=timestamp`) to ensure:

- Fresh loads on every page visit
- Updates propagate immediately
- No stale cached versions

Example:
```javascript
// CSS loads with cache-busting
link.href = CDN_BASE + "a11y-widget.css?v=" + new Date().getTime();

// JS loads with cache-busting
script.src = CDN_BASE + "a11y-widget.js?v=" + new Date().getTime();
```

## What Gets Updated Automatically

When you update widget files, all users automatically get:

- ✅ **Design changes** (CSS updates, button styling, colors)
- ✅ **Feature updates** (new presets, new controls, bug fixes)
- ✅ **Accessibility improvements** (ARIA attributes, keyboard navigation)
- ✅ **Performance optimizations** (code improvements, smaller file sizes)

## Update Timeline

- **Immediate**: Changes are available as soon as you push to GitHub
- **CDN Propagation**: jsDelivr typically updates within minutes
- **User Updates**: Users get updates on their next page load (no action required)

## Best Practices

### For Widget Maintainers

1. **Test thoroughly** before pushing to `main` branch
2. **Use semantic versioning** for major changes (consider versioned URLs)
3. **Document breaking changes** in release notes
4. **Monitor CDN status** if updates don't propagate

### For Users

1. **Use the loader script** (not direct file links) for automatic updates
2. **Don't pin versions** unless you need stability
3. **Test updates** in staging before production
4. **Monitor widget functionality** after updates

## Version Pinning (Optional)

If you need to pin to a specific version for stability:

```html
<!-- Pin to specific commit -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@COMMIT_HASH/a11y-widget-loader.js" defer></script>
```

**Note**: Version pinning prevents automatic updates. Use only when necessary.

## Troubleshooting

### Updates Not Appearing

1. **Check GitHub**: Verify changes are pushed to `main` branch
2. **Clear CDN cache**: jsDelivr cache clears automatically, but may take a few minutes
3. **Hard refresh**: Users may need to hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. **Check browser cache**: Some browsers cache aggressively

### Force Update

To force an immediate update for testing:

```html
<!-- Add timestamp to loader script URL -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js?v=<?php echo time(); ?>" defer></script>
```

## Benefits

- ✅ **Zero maintenance** for users - updates happen automatically
- ✅ **Consistent experience** - all users get the same version
- ✅ **Security patches** - fixes propagate immediately
- ✅ **Feature rollouts** - new features available to all users
- ✅ **Bug fixes** - issues resolved without user action

## Example: Button Design Update

1. **You update** `a11y-widget.css` with new button styling
2. **You commit** and push to GitHub
3. **All existing integrations** automatically get the new button design
4. **No user action required** - updates happen on next page load

This is exactly how the recent box-style button update propagated to all users!

