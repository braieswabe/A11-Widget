# Package Transfer: @mcelestino-conversion/a11y-widget → @careerdriver/a11y-widget

## Overview

This guide covers transferring the npm package from your personal scope (`@mcelestino-conversion/a11y-widget`) to your organization scope (`@careerdriver/a11y-widget`).

**Important**: npm does not support direct package transfers between scopes. You'll need to:
1. Publish the package under the new scope
2. Deprecate the old package with a migration message
3. Update any internal dependencies

---

## Step 1: Verify Organization Access

Ensure you have access to publish under the `@careerdriver` scope:

```bash
# Check your npm user
npm whoami

# Verify organization access
npm access ls-packages @careerdriver

# If you don't have access, you'll need to:
# 1. Join the organization at https://www.npmjs.com/org/careerdriver
# 2. Or have an org admin add you
```

---

## Step 2: Check Current Package Status

Verify the existing package details:

```bash
# Check the old package
npm view @mcelestino-conversion/a11y-widget

# Check if the new package name is available
npm view @careerdriver/a11y-widget
# Should return 404 (package not found) - this is good!
```

---

## Step 3: Verify Package Configuration

The package is already configured for the new scope. Verify:

```bash
cd packages/a11y-widget
cat package.json | grep name
# Should show: "name": "@careerdriver/a11y-widget"
```

---

## Step 4: Publish Under New Scope

Publish the package under the new organization scope:

```bash
cd packages/a11y-widget

# Test packaging first
npm pack --dry-run

# Create package tarball
npm pack

# Publish to npm
npm publish --access public
```

**Note**: The `--access public` flag is required for scoped packages to make them publicly accessible.

---

## Step 5: Verify New Package

After publishing, verify it's available:

```bash
# Check the new package (may take 2-5 minutes for registry propagation)
npm view @careerdriver/a11y-widget

# If you get 404, wait a few minutes and try again
# Or check directly in browser:
# https://www.npmjs.com/package/@careerdriver/a11y-widget

# Test installation
cd /tmp
mkdir test-transfer && cd test-transfer
npm init -y
npm install @careerdriver/a11y-widget

# Verify it works
node -e "import('@careerdriver/a11y-widget').then(m => console.log('✅ Import successful:', Object.keys(m)))"
```

**Note**: If you see "Access token expired or revoked" warnings but the publish shows `+ @careerdriver/a11y-widget@1.1.0`, the package was likely published successfully. The 404 error when viewing immediately after publishing is normal - npm registry propagation can take 2-5 minutes.

---

## Step 6: Deprecate Old Package

Deprecate the old package with a message pointing users to the new location:

```bash
# Deprecate the old package
npm deprecate @mcelestino-conversion/a11y-widget "This package has been moved to @careerdriver/a11y-widget. Please update your dependencies: npm install @careerdriver/a11y-widget"
```

**Alternative**: If you want to keep it available but just warn users:

```bash
npm deprecate @mcelestino-conversion/a11y-widget "⚠️ This package has been moved to @careerdriver/a11y-widget. Please migrate: npm install @careerdriver/a11y-widget"
```

**Verify deprecation**:
```bash
npm view @mcelestino-conversion/a11y-widget
# Should show deprecation message
```

---

## Step 7: Update Internal Dependencies

Update any internal projects that use the old package:

### Update website/package.json

```bash
cd website
# Update package.json to use new scope
# Change: "@mcelestino-conversion/a11y-widget" 
# To: "@careerdriver/a11y-widget"
npm install
```

### Update root package.json (if applicable)

Check if the root `package.json` references the old package and update it.

---

## Step 8: Update Documentation

Update any external documentation, README files, or installation guides to reference the new package name:

- ✅ `packages/a11y-widget/README.md` - Already updated
- ✅ `packages/a11y-widget/PUBLISH_INSTRUCTIONS.md` - Already updated
- ✅ `packages/a11y-widget/PUBLISH_TO_NPM.md` - Already updated

---

## Migration Notice for Users

If you have users of the old package, you can add this to your README or create a migration guide:

### For Users of @mcelestino-conversion/a11y-widget

**⚠️ This package has moved!**

The package has been transferred to the `@careerdriver` organization scope.

**Migration Steps**:

1. **Uninstall old package**:
   ```bash
   npm uninstall @mcelestino-conversion/a11y-widget
   ```

2. **Install new package**:
   ```bash
   npm install @careerdriver/a11y-widget
   ```

3. **Update imports**:
   ```javascript
   // Old
   import { initA11yWidget } from "@mcelestino-conversion/a11y-widget";
   import "@mcelestino-conversion/a11y-widget/styles.css";
   
   // New
   import { initA11yWidget } from "@careerdriver/a11y-widget";
   import "@careerdriver/a11y-widget/styles.css";
   ```

4. **Update package.json**:
   ```json
   {
     "dependencies": {
       "@careerdriver/a11y-widget": "^1.1.0"
     }
   }
   ```

**No code changes required** - the API is identical, only the package name changed.

---

## Optional: Unpublish Old Package

**⚠️ WARNING**: Only do this if you're certain no one is using it and you want to free up the package name.

npm allows unpublishing packages within 72 hours of publishing. After that, you can only deprecate.

If you want to unpublish (within 72 hours):

```bash
npm unpublish @mcelestino-conversion/a11y-widget --force
```

**After 72 hours**, unpublishing is not allowed. You can only deprecate the package.

---

## Verification Checklist

- [ ] Verified access to `@careerdriver` organization
- [ ] Published `@careerdriver/a11y-widget` successfully
- [ ] Verified new package is installable
- [ ] Deprecated `@mcelestino-conversion/a11y-widget` with migration message
- [ ] Updated internal dependencies (website/package.json, etc.)
- [ ] Updated all documentation
- [ ] Tested installation and usage of new package

---

## Troubleshooting

### Package Published but Shows 404 When Viewing

**Symptom**: `npm publish` shows success (`+ @careerdriver/a11y-widget@1.1.0`) but `npm view` returns 404.

**Solutions**:
1. **Wait 2-5 minutes**: npm registry propagation takes time. This is normal!
2. **Check in browser**: Visit https://www.npmjs.com/package/@careerdriver/a11y-widget directly
3. **Re-authenticate**: If you saw "Access token expired" warnings:
   ```bash
   npm logout
   npm login
   # Then try viewing again after waiting
   npm view @careerdriver/a11y-widget
   ```
4. **Verify organization access**:
   ```bash
   npm access ls-packages @careerdriver
   # Should show @careerdriver/a11y-widget if you have access
   ```

### "Access token expired or revoked" warnings during publish

**Symptom**: Warnings appear but publish shows success message (`+ @careerdriver/a11y-widget@1.1.0`).

**Solution**:
- If publish shows the success message, **the package was published successfully**
- The warnings are about viewing/reading permissions, not publishing permissions
- Re-authenticate to clear warnings: `npm logout && npm login`
- Wait 2-5 minutes for registry propagation, then verify: `npm view @careerdriver/a11y-widget`

### Error: "You do not have permission to publish"

**Solution**: 
- Verify you're logged in: `npm whoami`
- Check if scope exists: `npm access ls-packages @careerdriver`
- If scope doesn't exist, create npm organization or use your username as scope
- Ensure you're a member/owner of the `@careerdriver` organization

### Error: "Package name already exists"

**Solution**: 
- Check if package exists: `npm view @careerdriver/a11y-widget`
- If it exists, you need to update version number
- If you don't own it, you'll need a different package name

---

## Quick Reference Commands

```bash
# Publish new package
cd packages/a11y-widget
npm publish --access public

# Deprecate old package
npm deprecate @mcelestino-conversion/a11y-widget "This package has been moved to @careerdriver/a11y-widget. Please update: npm install @careerdriver/a11y-widget"

# Verify both packages
npm view @careerdriver/a11y-widget
npm view @mcelestino-conversion/a11y-widget

# Update internal dependencies
cd website
npm install @careerdriver/a11y-widget
```

---

## Package URLs

- **New Package**: https://www.npmjs.com/package/@careerdriver/a11y-widget
- **Old Package**: https://www.npmjs.com/package/@mcelestino-conversion/a11y-widget (deprecated)
