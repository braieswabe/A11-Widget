# How to Run Database Migration

There are several ways to run the authentication migration. Choose the method that works best for you.

## Method 1: Neon SQL Editor (Recommended - Easiest)

This is the simplest method if you're using Neon database.

### Steps:

1. **Go to your Neon Dashboard**
   - Visit https://console.neon.tech
   - Sign in to your account
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Or navigate to: `https://console.neon.tech/app/projects/[your-project]/sql`

3. **Copy Migration SQL**
   - Open the file: `database/migrations/002_authentication.sql`
   - Copy all the contents (Ctrl+C / Cmd+C)

4. **Paste and Run**
   - Paste the SQL into the SQL Editor
   - Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for the migration to complete

5. **Verify Success**
   - You should see "Success" message
   - Check that tables were created:
     ```sql
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('users', 'clients', 'auth_tokens');
     ```

---

## Method 2: Using psql Command Line

If you have PostgreSQL client (`psql`) installed locally.

### Steps:

1. **Get your Neon connection string**
   ```bash
   # It should look like:
   # postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

2. **Run the migration**
   ```bash
   psql "your-neon-connection-string" -f database/migrations/002_authentication.sql
   ```

   Or if you have the connection string in an environment variable:
   ```bash
   psql $NEON_DATABASE_URL -f database/migrations/002_authentication.sql
   ```

3. **Verify**
   ```bash
   psql $NEON_DATABASE_URL -c "\dt users clients auth_tokens"
   ```

---

## Method 3: Using Node.js Script

We've created a helper script that will guide you through the process.

### Steps:

1. **Set your database URL**
   ```bash
   export NEON_DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   ```
   
   Or create a `.env` file:
   ```env
   NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

2. **Run the script**
   ```bash
   node scripts/run-migration.js
   ```

   **Note:** Due to Neon serverless driver limitations, this script will display the SQL for you to run manually in the Neon SQL Editor. It's mainly a helper to show you what needs to be run.

---

## Method 4: Using Neon CLI (If Installed)

If you have Neon CLI installed:

```bash
neon sql --project-id YOUR_PROJECT_ID --file database/migrations/002_authentication.sql
```

---

## Verification

After running the migration, verify it worked:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'clients', 'auth_tokens');

-- Check columns on users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check columns on clients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('users', 'clients', 'auth_tokens');
```

Expected output:
- ✅ `users` table with columns: id, email, password_hash, role, created_at, updated_at, last_login_at, is_active
- ✅ `clients` table with columns: id, email, password_hash, company_name, api_key, site_ids, created_at, updated_at, last_login_at, is_active, created_by
- ✅ `auth_tokens` table with columns: id, user_id, token_hash, expires_at, created_at, last_used_at, user_agent, ip_address
- ✅ Updated `site_configs` table with `client_id` and `requires_auth` columns
- ✅ Indexes created on all tables

---

## Troubleshooting

### Error: "relation already exists"
- This is OK! The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.
- If you want to start fresh, you can drop tables first (be careful!):
  ```sql
  DROP TABLE IF EXISTS auth_tokens CASCADE;
  DROP TABLE IF EXISTS clients CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```

### Error: "permission denied"
- Make sure you're using a connection string with proper permissions
- Check that your Neon user has CREATE TABLE permissions

### Error: "function already exists"
- This is OK! The migration uses `CREATE OR REPLACE FUNCTION`, so it's safe.

### Migration partially failed
- Check which statements succeeded
- You can run individual statements from the migration file
- Most statements use `IF NOT EXISTS` so re-running is safe

---

## Next Steps

After running the migration:

1. ✅ **Create your first admin user:**
   ```bash
   node scripts/create-admin.js admin@example.com secure-password
   ```

2. ✅ **Set environment variables** (if not already set):
   ```env
   NEON_DATABASE_URL=your-connection-string
   JWT_SECRET=your-secret-key-min-32-chars
   JWT_EXPIRES_IN=3600
   ```

3. ✅ **Test the admin portal:**
   - Navigate to `/admin/login`
   - Login with your admin credentials

4. ✅ **Create a test client:**
   - Go to `/admin/dashboard`
   - Click "Create New Client"
   - Save the API key for widget testing

---

## Need Help?

- Check `docs/AUTHENTICATION_SETUP.md` for full setup guide
- Review `docs/AUTHENTICATION_PLAN.md` for architecture details
- Neon Documentation: https://neon.tech/docs
