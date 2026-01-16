# Database Migration Guide

## CI/CD Automated Migrations

Database migrations are automatically applied to Supabase when a pull request is opened against the `main` branch that includes changes to migration files.

### How It Works

The GitHub Action workflow (`.github/workflows/supabase-migration.yml`) automatically:

1. **Detects changes** to database-related files:
   - `migrations/**/*.sql` - Individual migration files
   - `schema.sql` - Main schema file
   - `full_db_setup.sql` - Full database setup

2. **Runs migrations** using the Supabase CLI when changes are detected

3. **Validates** the database schema after migrations

### Required GitHub Secrets

To enable automated migrations, configure these secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase access token (from [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)) |
| `SUPABASE_DB_PASSWORD` | Your Supabase database password |
| `SUPABASE_PROJECT_ID` | Your Supabase project reference ID (found in Project Settings) |

### Adding New Migrations

1. Create a new SQL file in the `migrations/` directory (e.g., `migrations/add_new_feature.sql`)
2. Use `IF NOT EXISTS` clauses for idempotency
3. Open a pull request - migrations will run automatically

---

## Settings Page Migration

## 🚀 Automatic Deployment

**Migrations are automatically deployed to production when merged to `main`!**

A GitHub Actions workflow automatically:
- Detects changes to migration files
- Applies them to your Supabase database
- Verifies the schema
- Reports success/failure

**See [MIGRATION_MANAGEMENT.md](../MIGRATION_MANAGEMENT.md) for complete details on:**
- Creating new migrations
- Testing locally
- Rollback procedures
- Troubleshooting

**Required Setup:**
Configure these GitHub secrets (one-time setup):
- `SUPABASE_ACCESS_TOKEN` - Your Supabase CLI token
- `SUPABASE_PROJECT_ID` - Your project reference ID
- `SUPABASE_DB_PASSWORD` - Database password

---

## Available Migrations

### 1. Initial Schema (`001_initial_schema.sql`)
**Primary migration for Vercel/Supabase deployment**

This comprehensive migration creates the complete database schema including:
- 8 core tables (profiles, shipments, compliance_alerts, permits, activities, deliveries, login_history, user_sessions)
- Row Level Security (RLS) policies for all tables
- Database functions and triggers
- Performance indexes
- Optional seed data (commented out by default)

### 2. Settings Fields Migration (`add_settings_fields.sql`)
**Legacy migration - fields now included in 001_initial_schema.sql**

This migration adds settings-related fields to the profiles table and creates login_history and user_sessions tables. Since these are now part of the initial schema, this file is kept only for reference.

---

## Manual Deployment (if needed)

### Option 1: Vercel + Supabase Integration (Recommended)

This is the recommended approach for production deployments.

#### Step 1: Set Up Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing project
3. Wait for project to be fully provisioned

#### Step 2: Run the Migration in Supabase
Choose one of these methods:

**Method A: Supabase SQL Editor (Easiest)**
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration
6. Verify success in the output panel

**Method B: Supabase CLI**
```bash
# Install Supabase CLI if not already installed
bun install -g supabase

# Login to Supabase
supabase login

# Link your project (follow prompts)
supabase link --project-ref your-project-ref

# Apply migration
supabase db push

# Or run the migration file directly
psql \
  --host=db.your-project-ref.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=migrations/001_initial_schema.sql
```

#### Step 3: Connect Vercel to Supabase
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Integrations**
4. Search for and add **Supabase**
5. Follow the integration setup wizard
6. Select your Supabase project
7. The integration will automatically add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Step 4: Deploy to Vercel
```bash
# Deploy using Vercel CLI
vercel --prod

# Or push to your main branch (if auto-deploy is enabled)
git push origin main
```

### Option 2: Vercel Postgres (Alternative)

If you prefer to use Vercel's native Postgres offering:

#### Step 1: Create Vercel Postgres Database
1. Go to your project in Vercel Dashboard
2. Go to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Follow the setup wizard

#### Step 2: Connect to Database
```bash
# Install Vercel CLI if not already installed
bun install -g vercel

# Pull environment variables
vercel env pull .env.local

# Install PostgreSQL client (if not already installed)
# For macOS: brew install postgresql
# For Ubuntu: sudo apt-get install postgresql-client

# Connect to Vercel Postgres
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)"
```

#### Step 3: Run Migration
```bash
# Option A: Run from file
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)" -f migrations/001_initial_schema.sql

# Option B: Copy and paste in psql interactive mode
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)"
# Then copy-paste the contents of 001_initial_schema.sql
```

**Note:** Vercel Postgres doesn't have `auth.users` table by default. You'll need to:

1. **Remove auth.users references** in the migration file:
   - Lines 6, 104, 111, 120: Remove `REFERENCES auth.users(id)` from foreign keys
   - Lines 202-214: Remove or modify the `handle_new_user()` function
   - Lines 221-224: Remove the trigger `on_auth_user_created`
   
2. **Implement your own authentication**:
   - Create a `users` table in public schema
   - Update profile creation logic
   - Implement your own auth system
   
3. **Or use Supabase for auth** and Vercel Postgres for data (requires custom setup)

### Option 3: Local Development with Supabase

For local development and testing:

```bash
# Install Supabase CLI
bun install -g supabase

# Initialize Supabase in your project
supabase init

# Start local Supabase
supabase start

# Apply migration
supabase db push

# Or manually run the migration
psql -h localhost -p 54322 -U postgres -d postgres -f migrations/001_initial_schema.sql

# Get local credentials
supabase status
# Use the provided API URL and anon key in your .env.local
```

---

## Verification Steps

After running the migration, verify it was successful:

### Check Tables
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected tables:
- activities
- compliance_alerts
- deliveries
- login_history
- permits
- profiles
- shipments
- user_sessions

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Indexes
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Functions and Triggers
```sql
-- Check functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;

-- Check triggers
SELECT tgname, tgrelid::regclass, tgtype 
FROM pg_trigger 
WHERE tgrelid IN (
  SELECT oid 
  FROM pg_class 
  WHERE relnamespace = 'public'::regnamespace
);
```

---

## Seed Data (Optional)

The migration file includes commented seed data. To populate your database with sample data:

1. Open `migrations/001_initial_schema.sql`
2. Locate the "SEED DATA" section (near the end)
3. Uncomment the INSERT statements
4. Run the migration again (or just run the seed section)

Alternatively, use the standalone seed file:
```bash
psql <connection-string> -f seed.sql
```

---

## Environment Variables

Ensure these variables are set in your Vercel project:

### Required for Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### For Vercel Postgres (Alternative)
```bash
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

---

## Troubleshooting

### "relation auth.users does not exist"
- You're using Vercel Postgres without Supabase Auth
- Solution: Use Supabase (recommended) or modify migration to remove auth dependencies

### "permission denied for schema public"
- Insufficient database permissions
- Solution: Ensure you're connecting as a superuser or database owner

### "extension uuid-ossp does not exist"
- Extension not enabled
- Solution: Run as superuser or enable extensions in dashboard

### RLS Policies Not Working
- Check if RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Ensure you're authenticated when querying (RLS policies check `auth.uid()`)

### Connection Issues from Vercel
- Verify environment variables are set in Vercel project settings
- Check if database allows connections from Vercel IPs
- For Supabase: Ensure "Pooler" connection string is used for serverless functions

---

## Rollback (If Needed)

To rollback this migration:

```sql
-- Drop all tables (will cascade to related objects)
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.login_history CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.permits CASCADE;
DROP TABLE IF EXISTS public.compliance_alerts CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel + Supabase Integration](https://vercel.com/integrations/supabase)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
