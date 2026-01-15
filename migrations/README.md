# Database Migration Guide

This directory contains SQL migration files for the Nuclear Supply Chain Management application.

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

## How to Deploy to Vercel

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
npm install -g supabase

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
npm install -g vercel

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
1. Remove references to `auth.users` in the migration
2. Implement your own authentication table structure
3. Or use Supabase for auth and Vercel Postgres for data (more complex)

### Option 3: Local Development with Supabase

For local development and testing:

```bash
# Install Supabase CLI
npm install -g supabase

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
