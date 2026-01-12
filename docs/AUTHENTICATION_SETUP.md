# Authentication Setup Guide

This guide will help you set up the authentication system for the a11y widget.

## Prerequisites

1. Node.js 18+ installed
2. Neon database (or PostgreSQL) configured
3. Environment variables set up

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `bcryptjs` - For password hashing
- `jsonwebtoken` - For JWT token generation

## Step 2: Run Database Migration

Run the authentication migration to create the necessary tables:

```sql
-- Run this in your Neon database SQL editor
-- File: database/migrations/002_authentication.sql
```

Or use psql:
```bash
psql $NEON_DATABASE_URL -f database/migrations/002_authentication.sql
```

This creates:
- `users` table (for admin accounts)
- `clients` table (for client accounts)
- `auth_tokens` table (for token tracking)
- Updates `site_configs` table

## Step 3: Set Environment Variables

Add these to your `.env` file or Vercel environment variables:

```env
NEON_DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here-min-32-chars-change-in-production
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800
BCRYPT_ROUNDS=10
```

**Important**: Generate a strong JWT_SECRET (at least 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Create First Admin User

Run the admin creation script:

```bash
node scripts/create-admin.js admin@example.com secure-password-123
```

Or interactively:
```bash
node scripts/create-admin.js
```

## Step 5: Update Widget Loader

The widget loader now requires authentication. Make sure `a11y-widget-auth.js` is accessible at the same CDN/base URL as your widget files.

If using GitHub/CDN, ensure `a11y-widget-auth.js` is in your repository root.

## Step 6: Configure API Base URL (Optional)

If your API is hosted at a different domain, configure the auth API base:

```html
<script>
  window.__A11Y_AUTH_API_BASE__ = "https://your-api-domain.com/api/auth";
</script>
<script src="a11y-widget-loader.js" defer></script>
```

## Step 7: Test the System

### Test Admin Portal

1. Navigate to `/admin/login`
2. Login with your admin credentials
3. Create a test client account
4. Copy the API key

### Test Widget Authentication

1. Include the widget loader on a test page:
```html
<script src="a11y-widget-loader.js" defer></script>
```

2. The login modal should appear
3. Login with:
   - Email/password (client credentials), OR
   - API key (from admin portal)

4. Widget should load after successful authentication

## Admin Portal Features

### Dashboard (`/admin/dashboard`)
- View all clients
- Search/filter clients
- Create new clients
- Edit client details
- Deactivate clients
- Regenerate API keys

### Client Management
- **Create**: `/admin/clients/new`
- **Edit**: `/admin/clients/:id/edit`
- **View**: Dashboard table

## API Endpoints

### Authentication (Widget Users)
- `POST /api/auth/login` - Login with email/password or API key
- `POST /api/auth/validate` - Validate token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/clients` - List clients
- `POST /api/admin/clients` - Create client
- `GET /api/admin/clients/:id` - Get client
- `PUT /api/admin/clients/:id` - Update client
- `DELETE /api/admin/clients/:id` - Deactivate client
- `POST /api/admin/clients/:id/regenerate-api-key` - Regenerate API key

## Security Considerations

1. **JWT Secret**: Use a strong, random secret (32+ characters)
2. **Password Requirements**: Enforced on creation (min 8 chars, uppercase, lowercase, number)
3. **Token Expiration**: Default 1 hour (configurable via JWT_EXPIRES_IN)
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to login endpoints
6. **CORS**: Configure CORS properly for your domains

## Troubleshooting

### Widget shows login but API calls fail
- Check CORS settings in `vercel.json`
- Verify API base URL is correct
- Check browser console for errors

### Admin login fails
- Verify admin user was created successfully
- Check database connection
- Verify JWT_SECRET is set

### Token validation fails
- Check token expiration
- Verify JWT_SECRET matches between requests
- Check database connection

### Client can't access widget
- Verify client account is active (`is_active = true`)
- Check site IDs match (if restricted)
- Verify API key is correct

## Migration from Public to Authenticated

If you have existing sites using the widget:

1. Create client accounts for each site
2. Link `site_configs` to clients:
```sql
UPDATE site_configs 
SET client_id = 'client-uuid-here', requires_auth = true
WHERE site_id = 'example.com';
```

3. Notify clients about new authentication requirement
4. Provide login credentials or API keys

## Next Steps

- Set up email notifications for account creation
- Add password reset functionality
- Implement usage analytics
- Add subscription/billing integration
