# Authentication Implementation Plan

## Overview
This document outlines the plan to add authentication to the a11y widget, making it accessible only to authenticated users. The system will include:
1. **Widget Authentication**: Users must login to access the widget
2. **Admin Portal**: Admins can create and manage client accounts
3. **Token-Based Authentication**: Secure JWT-based authentication system

## Architecture

### User Roles
- **Admin**: Can create/manage client accounts, view all clients
- **Client**: Can login and use the widget on their site(s)

### Authentication Flow

#### Widget Authentication Flow
1. Widget loader checks for valid authentication token
2. If no token or token expired → Show login modal
3. User enters credentials (email/password or API key)
4. Widget calls `/api/auth/login` endpoint
5. On success → Store JWT token in localStorage
6. Widget loads and functions normally
7. Token is validated on each widget initialization

#### Admin Portal Flow
1. Admin logs in at `/admin/login`
2. Admin dashboard shows list of clients
3. Admin can:
   - Create new client accounts
   - View/edit client details
   - Generate API keys for clients
   - Deactivate/reactivate clients
   - View client usage statistics

## Database Schema Changes

### New Tables

#### `users` table (Admins)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
```

#### `clients` table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT,
  api_key TEXT UNIQUE NOT NULL, -- For API-based authentication
  site_ids TEXT[], -- Array of site IDs this client can use
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id)
);
```

#### `auth_tokens` table
```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address TEXT
);
```

#### Update `site_configs` table
```sql
ALTER TABLE site_configs 
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN requires_auth BOOLEAN DEFAULT true;
```

### Indexes
```sql
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_api_key ON clients(api_key);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_site_configs_client_id ON site_configs(client_id);
```

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/login`
- **Purpose**: Authenticate widget users (clients)
- **Request Body**:
  ```json
  {
    "email": "client@example.com",
    "password": "password123",
    "siteId": "example.com" // Optional, for site-specific auth
  }
  ```
  OR
  ```json
  {
    "apiKey": "client-api-key-here",
    "siteId": "example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt-token-here",
    "expiresIn": 3600,
    "client": {
      "id": "uuid",
      "email": "client@example.com",
      "companyName": "Example Corp"
    }
  }
  ```

#### `POST /api/auth/validate`
- **Purpose**: Validate existing token
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "valid": true,
    "client": { ... }
  }
  ```

#### `POST /api/auth/logout`
- **Purpose**: Invalidate token
- **Headers**: `Authorization: Bearer <token>`

#### `POST /api/auth/refresh`
- **Purpose**: Refresh expired token
- **Headers**: `Authorization: Bearer <token>`

### Admin Endpoints

#### `POST /api/admin/login`
- **Purpose**: Admin authentication
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

#### `GET /api/admin/clients`
- **Purpose**: List all clients
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**:
  ```json
  {
    "clients": [
      {
        "id": "uuid",
        "email": "client@example.com",
        "companyName": "Example Corp",
        "siteIds": ["example.com"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T00:00:00Z"
      }
    ]
  }
  ```

#### `POST /api/admin/clients`
- **Purpose**: Create new client
- **Headers**: `Authorization: Bearer <admin-token>`
- **Request Body**:
  ```json
  {
    "email": "newclient@example.com",
    "password": "secure-password",
    "companyName": "New Client Corp",
    "siteIds": ["newsite.com", "anothersite.com"]
  }
  ```

#### `PUT /api/admin/clients/:id`
- **Purpose**: Update client
- **Headers**: `Authorization: Bearer <admin-token>`

#### `DELETE /api/admin/clients/:id`
- **Purpose**: Deactivate client (soft delete)
- **Headers**: `Authorization: Bearer <admin-token>`

#### `POST /api/admin/clients/:id/regenerate-api-key`
- **Purpose**: Generate new API key for client
- **Headers**: `Authorization: Bearer <admin-token>`

## Widget Changes

### Authentication Module (`a11y-widget-auth.js`)
New module to handle authentication:
- Check for stored token on load
- Show login modal if not authenticated
- Handle login form submission
- Store/validate tokens
- Handle token expiration

### Modified Widget Loader
- Check authentication before loading widget
- Show login UI if needed
- Pass auth token to widget

### Login UI Components
- Login modal with email/password fields
- API key input option
- Error message display
- Loading states

## Website Changes

### New Admin Pages

#### `/admin/login`
- Admin login page
- Email/password form
- Redirect to dashboard on success

#### `/admin/dashboard`
- List of all clients
- Create new client button
- Search/filter clients
- Client management actions

#### `/admin/clients/new`
- Create new client form
- Fields: email, password, company name, site IDs

#### `/admin/clients/:id/edit`
- Edit client form
- Regenerate API key
- Activate/deactivate client

### Protected Routes
- All `/admin/*` routes require authentication
- Redirect to `/admin/login` if not authenticated

## Security Considerations

### Password Security
- Use bcrypt for password hashing (10+ rounds)
- Enforce password requirements (min 8 chars, complexity)
- Never store plaintext passwords

### Token Security
- JWT tokens with expiration (1 hour default)
- Refresh tokens for longer sessions (7 days)
- Store tokens in httpOnly cookies when possible (fallback to localStorage)
- Include user ID, role, and expiration in token payload
- Validate token signature on every request

### API Security
- Rate limiting on login endpoints (5 attempts per 15 minutes)
- CORS restrictions for API endpoints
- Input validation and sanitization
- SQL injection prevention (using parameterized queries)

### Widget Security
- Validate token on widget initialization
- Check token expiration before widget functions
- Secure token storage (consider httpOnly cookies if possible)
- Clear tokens on logout

## Implementation Steps

### Phase 1: Database Setup
1. Create migration file for new tables
2. Add indexes
3. Update existing schema

### Phase 2: Authentication API
1. Install dependencies (bcrypt, jsonwebtoken)
2. Create `/api/auth/login` endpoint
3. Create `/api/auth/validate` endpoint
4. Create `/api/auth/logout` endpoint
5. Create `/api/auth/refresh` endpoint
6. Add password hashing utilities
7. Add JWT token utilities

### Phase 3: Admin API
1. Create `/api/admin/login` endpoint
2. Create `/api/admin/clients` endpoints (CRUD)
3. Add admin authentication middleware
4. Add API key generation utilities

### Phase 4: Widget Authentication
1. Create `a11y-widget-auth.js` module
2. Add login UI to widget
3. Modify widget loader to check authentication
4. Add token validation on widget init
5. Handle token expiration

### Phase 5: Admin Portal
1. Create admin login page
2. Create admin dashboard
3. Create client management pages
4. Add protected route wrapper
5. Add admin authentication context

### Phase 6: Testing & Security
1. Test authentication flows
2. Test token expiration
3. Test admin portal functionality
4. Security audit
5. Rate limiting implementation

## Environment Variables

Add to `.env`:
```
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800
BCRYPT_ROUNDS=10
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-admin-password
```

## Migration Strategy

### For Existing Users
1. Create default admin account from environment variables
2. Migrate existing `site_configs` to require authentication
3. Provide migration script to create client accounts for existing sites
4. Notify existing users about new authentication requirement

### Backward Compatibility
- Consider a grace period where authentication is optional
- Add feature flag to enable/disable authentication requirement
- Allow existing sites to continue working temporarily

## Future Enhancements
- OAuth integration (Google, Microsoft)
- Two-factor authentication (2FA)
- Password reset functionality
- Email notifications for account creation
- Usage analytics per client
- Subscription/billing integration
- Multi-tenant support with organizations
