# Publishing @careerdriver/a11y-widget to npm Registry

## Prerequisites

1. **npm Account**: Create one at https://www.npmjs.com/signup
2. **npm CLI**: Make sure you have npm installed (`npm --version`)
3. **Package Ready**: Ensure all changes are synced and tested

---

## Step 1: Enable Two-Factor Authentication (REQUIRED)

**Two-factor authentication is REQUIRED to publish packages to npm.**

### Enable 2FA on npm:

1. Go to https://www.npmjs.com/settings/[your-username]/security
2. Under "Two-Factor Authentication", click "Enable 2FA"
3. Choose your preferred method:
   - **Authenticator App** (recommended): Use Google Authenticator, Authy, etc.
   - **SMS**: Receive codes via text message
4. Follow the setup instructions
5. **Save your backup codes** in a secure location

### Alternative: Use Granular Access Token (Bypass 2FA)

If you prefer not to enable 2FA on your account, you can create a granular access token:

1. Go to https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token"
3. Select "Granular Access Token"
4. Configure:
   - **Token name**: `a11y-widget-publish`
   - **Expiration**: Choose appropriate duration
   - **Type**: Automation (or Publish)
   - **Packages**: Select `@careerdriver/a11y-widget` or all packages
   - **Permissions**: Enable "Publish" and "Read"
5. Copy the token (you won't see it again!)
6. Use it for authentication:
   ```bash
   npm login --auth-type=legacy
   # When prompted for password, paste your token
   ```

## Step 2: Login to npm

```bash
# Login to npm
npm login

# Enter your credentials:
# - Username: (your npm username)
# - Password: (your npm password)
# - Email: (your npm email)
# - OTP: (Enter your 2FA code from authenticator app or SMS)
```

**Verify login**:
```bash
npm whoami
# Should output your npm username
```

**If your token expired** (you'll see "Access token expired or revoked"):
```bash
# Logout and login again
npm logout
npm login
# Enter credentials + 2FA code
```

---

## Step 2: Set Up npm Organization Scope

Since your package uses a scoped name `@careerdriver/a11y-widget`, you need to ensure the scope exists:

### Option A: Use Your Organization Scope (Recommended)
If you're a member of the `careerdriver` organization on npm, you can publish under `@careerdriver` scope.

### Option B: Create/Join npm Organization
1. Go to https://www.npmjs.com/org/create
2. Create organization named `careerdriver` (or join existing one)
3. Add yourself as owner/member

**Verify scope access**:
```bash
npm access ls-packages @careerdriver
# Should show packages you have access to (may be empty initially)
```

---

## Step 3: Update Package Metadata

Before publishing, ensure package.json has correct information:

```bash
cd packages/a11y-widget

# Verify package.json
cat package.json
```

**Important fields**:
- `name`: `@careerdriver/a11y-widget` ✅
- `version`: `1.1.0` (or your desired version)
- `author`: Add your name/email (optional but recommended)
- `repository`: Add GitHub repo URL (optional but recommended)

**Example with author and repository**:
```json
{
  "name": "@careerdriver/a11y-widget",
  "version": "1.1.0",
  "author": "careerdriver",
  "repository": {
    "type": "git",
    "url": "https://github.com/braieswabe/A11-Widget.git"
  }
}
```

---

## Step 4: Sync Latest Widget Files

Make sure the npm package has the latest widget files:

```bash
# From root directory
npm run sync-widget

# Or manually
cd packages/a11y-widget
node ../../scripts/sync-widget-to-npm.js
```

---

## Step 5: Test Package Locally

Before publishing, test the package:

```bash
cd packages/a11y-widget

# Create a test package tarball
npm pack --dry-run

# Create actual tarball
npm pack
```

**Expected output**: `careerdriver-a11y-widget-1.1.0.tgz`

**Verify contents**:
```bash
tar -tzf careerdriver-a11y-widget-1.1.0.tgz | sort
```

**Should include**:
- `package/package.json`
- `package/README.md`
- `package/src/index.js`
- `package/src/init.js`
- `package/src/types.d.ts`
- `package/vendor/a11y-widget.core.js`
- `package/assets/a11y-widget.css`

---

## Step 6: Publish to npm

**⚠️ IMPORTANT: Two-Factor Authentication (2FA) is REQUIRED**

npm requires 2FA to publish packages. If you get a 403 error, you need to:

### Option A: Enable 2FA on Your Account (Recommended)

1. Go to: https://www.npmjs.com/settings/[your-username]/security
2. Enable "Two-Factor Authentication"
3. Use an authenticator app (Google Authenticator, Authy, etc.) or SMS
4. Save your backup codes securely

### Option B: Use Granular Access Token (Bypass 2FA)

1. Go to: https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Configure:
   - **Token name**: `a11y-widget-publish`
   - **Type**: Automation
   - **Packages**: Select `@careerdriver/a11y-widget`
   - **Permissions**: Enable "Publish" and "Read"
4. Copy the token
5. Login with token:
   ```bash
   npm logout
   npm login --auth-type=legacy
   # Username: your-username
   # Password: paste-your-token-here
   # Email: your-email
   ```

### Publishing:

```bash
cd packages/a11y-widget

# Dry run (see what would be published without actually publishing)
npm publish --dry-run

# Actual publish (use --access public for scoped packages)
npm publish --access public
```

**If you get "Access token expired or revoked"**:
```bash
npm logout
npm login
# Enter credentials + 2FA code when prompted
```

**If you get "403 Forbidden - Two-factor authentication required"**:
- Enable 2FA on your npm account (see Option A above)
- Or use a granular access token (see Option B above)

**Note**: The `--access public` flag is required for scoped packages (`@careerdriver/...`) to make them publicly accessible.

---

## Step 7: Verify Publication

```bash
# Check package on npm registry
npm view @careerdriver/a11y-widget

# View package page in browser
# https://www.npmjs.com/package/@careerdriver/a11y-widget
```

**Test installation**:
```bash
# Create test directory
cd /tmp
mkdir test-a11y-widget && cd test-a11y-widget
npm init -y

# Install your package
npm install @careerdriver/a11y-widget

# Verify it works
node -e "import('@careerdriver/a11y-widget').then(m => console.log('✅ Import successful:', Object.keys(m)))"
```

---

## Updating the Package (After Making Changes)

When you make changes to the widget and want to publish a new version:

### 1. Sync Widget Files
```bash
# From root directory
npm run sync-widget
```

### 2. Update Version
```bash
cd packages/a11y-widget

# Option A: Manual version bump
# Edit package.json and change version (e.g., 1.1.0 → 1.1.1)

# Option B: Use npm version command
npm version patch    # 1.1.0 → 1.1.1 (bug fixes)
npm version minor    # 1.1.0 → 1.2.0 (new features)
npm version major    # 1.1.0 → 2.0.0 (breaking changes)
```

### 3. Publish New Version
```bash
npm publish --access public
```

---

## Troubleshooting

### Error: "You do not have permission to publish"
**Solution**: 
- Verify you're logged in: `npm whoami`
- Check if scope exists: `npm access ls-packages @careerdriver`
- If scope doesn't exist, create npm organization or use your username as scope

### Error: "Package name already exists"
**Solution**: 
- Check if package exists: `npm view @careerdriver/a11y-widget`
- If it exists, you need to update version number
- If you don't own it, you'll need a different package name

### Error: "Invalid package name"
**Solution**:
- Package name must be lowercase
- Scoped packages format: `@username/package-name`
- No spaces or special characters (except `-` and `_`)

### Package not found after publishing
**Solution**:
- Wait 2-5 minutes for npm registry propagation
- Clear npm cache: `npm cache clean --force`
- Try again: `npm view @careerdriver/a11y-widget`

---

## Quick Reference Commands

```bash
# Login
npm login

# Check current user
npm whoami

# Check scope access
npm access ls-packages @braieswabe

# Sync widget files
npm run sync-widget

# Test package
cd packages/a11y-widget
npm pack --dry-run

# Publish
npm publish --access public

# View published package
npm view @careerdriver/a11y-widget

# Update version and publish
npm version patch && npm publish --access public
```

---

## Package Information

**Package Name**: `@careerdriver/a11y-widget`  
**Current Version**: `1.1.0`  
**License**: MIT  
**Type**: ESM Module  

**Installation**:
```bash
npm install @careerdriver/a11y-widget
```

**Usage**:
```javascript
import { initA11yWidget } from "@careerdriver/a11y-widget";
import "@careerdriver/a11y-widget/styles.css";

initA11yWidget({ siteId: "example.com" });
```

---

## Next Steps After Publishing

1. ✅ Update root `package.json` to use published version:
   ```json
   "@careerdriver/a11y-widget": "^1.1.0"
   ```

2. ✅ Update `website/package.json` to use published version:
   ```json
   "@careerdriver/a11y-widget": "^1.1.0"
   ```

3. ✅ Update README.md with npm installation instructions

4. ✅ Test installation in a clean environment

5. ✅ Share package link: https://www.npmjs.com/package/@careerdriver/a11y-widget
