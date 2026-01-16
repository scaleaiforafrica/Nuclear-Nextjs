# Migration Management Guide

This document describes how database migrations are managed and automatically deployed in this project.

## Overview

All database migrations are stored in the `migrations/` directory and are automatically deployed to Supabase when merged to the `main` branch.

## Automatic Deployment

### GitHub Actions Workflow

The repository uses GitHub Actions to automatically deploy migrations when:
1. Changes to any file in the `migrations/` directory are pushed to `main`
2. The workflow is manually triggered via GitHub Actions UI

**Workflow File**: `.github/workflows/deploy-migrations.yml`

### How It Works

1. **On Merge to Main**: When a PR with migration changes is merged to `main`, the workflow automatically:
   - Detects changed migration files
   - Connects to Supabase using stored secrets
   - Applies migrations in order
   - Verifies the schema
   - Comments on the commit with success status

2. **Manual Trigger**: You can also manually trigger migrations via the GitHub Actions UI:
   - Go to Actions → Deploy Database Migrations
   - Click "Run workflow"
   - Optionally specify a specific migration file

## Required Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### `SUPABASE_ACCESS_TOKEN`
Your Supabase access token for CLI authentication.

**How to get it:**
```bash
# Login to Supabase CLI
supabase login

# Get your access token
cat ~/.supabase/access-token
```

### `SUPABASE_PROJECT_ID`
Your Supabase project reference ID (found in your project settings).

**Example**: `abcdefghijklmnop`

### `SUPABASE_DB_PASSWORD`
Your database password for the postgres user.

**Where to find it:**
- Supabase Dashboard → Project Settings → Database → Database Password
- You may need to reset it if you don't have it saved

## Migration Naming Convention

Migrations should follow this naming pattern:

```
migrations/
  001_initial_schema.sql          # Initial schema
  002_add_feature_xyz.sql         # Next migration
  003_modify_table_abc.sql        # Another migration
```

**Rules:**
- Use sequential numbers (001, 002, 003, etc.)
- Use descriptive names
- Always use `.sql` extension
- Include comments describing what the migration does

## Creating a New Migration

### Step 1: Create the Migration File

```bash
# Create a new numbered migration file
touch migrations/00X_description_of_change.sql
```

### Step 2: Write the Migration

```sql
-- Migration: Description of what this does
-- Author: Your Name
-- Date: YYYY-MM-DD

-- Your SQL here
-- Use IF NOT EXISTS to make migrations idempotent
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- columns...
);

-- Always include RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name" 
ON public.new_table FOR SELECT TO authenticated USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_field ON public.new_table(field);
```

### Step 3: Test Locally

```bash
# Start local Supabase
supabase start

# Apply migration locally
supabase db push --file migrations/00X_description_of_change.sql

# Verify it works
supabase db dump --schema public
```

### Step 4: Create PR and Merge

1. Create a PR with your migration file
2. Get it reviewed
3. Merge to `main`
4. GitHub Actions will automatically apply it to production

## Migration Best Practices

### 1. Make Migrations Idempotent

Always use `IF NOT EXISTS`, `IF EXISTS`, etc. to ensure migrations can be run multiple times safely:

```sql
-- Good
CREATE TABLE IF NOT EXISTS public.my_table (...);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Bad
CREATE TABLE public.my_table (...);  -- Will fail if table exists
ALTER TABLE public.profiles ADD COLUMN new_field TEXT;  -- Will fail if column exists
```

### 2. Use Transactions

Wrap related changes in transactions:

```sql
BEGIN;
  -- Multiple related changes
  CREATE TABLE IF NOT EXISTS public.table1 (...);
  CREATE TABLE IF NOT EXISTS public.table2 (...);
  -- Add foreign key between them
  ALTER TABLE public.table2 ADD CONSTRAINT fk_table1 
    FOREIGN KEY (table1_id) REFERENCES public.table1(id);
COMMIT;
```

### 3. Always Include RLS

Never forget Row Level Security:

```sql
-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Add appropriate policies
CREATE POLICY "Users can view their own data" 
ON public.my_table FOR SELECT USING (auth.uid() = user_id);
```

### 4. Add Indexes for Performance

Include indexes for:
- Foreign keys
- Fields used in WHERE clauses
- Fields used in ORDER BY
- Fields used in JOINs

```sql
CREATE INDEX IF NOT EXISTS idx_table_user_id ON public.my_table(user_id);
CREATE INDEX IF NOT EXISTS idx_table_created_at ON public.my_table(created_at DESC);
```

### 5. Document Your Changes

Include comments explaining:
- What the migration does
- Why it's needed
- Any special considerations

```sql
-- Migration: Add user preferences table
-- This allows users to customize their dashboard layout and notification settings
-- Related to feature: Dashboard Customization (#123)
```

## Rollback Strategy

### Automatic Rollback

If a migration fails during deployment, the GitHub Actions workflow will:
1. Stop execution
2. Report the error
3. Not apply subsequent migrations

### Manual Rollback

To manually rollback a migration:

1. **Option A: Create a Reverse Migration**
   ```sql
   -- migrations/00X_rollback_previous_change.sql
   DROP TABLE IF EXISTS public.new_table;
   ALTER TABLE public.profiles DROP COLUMN IF EXISTS new_field;
   ```

2. **Option B: Direct Database Access**
   ```bash
   # Connect to Supabase
   supabase link --project-ref your-project-ref
   
   # Run rollback SQL
   psql "$(supabase db url)" -f rollback.sql
   ```

## Troubleshooting

### Migration Not Running

**Symptom**: Workflow doesn't trigger after merge

**Solutions**:
1. Check that files are in `migrations/` directory
2. Verify file has `.sql` extension
3. Check workflow file is in `.github/workflows/`
4. Manually trigger via GitHub Actions UI

### Migration Fails

**Symptom**: Workflow runs but migration fails

**Solutions**:
1. Check workflow logs in GitHub Actions
2. Verify SQL syntax locally first
3. Ensure migration is idempotent
4. Check for permission issues (RLS, grants)
5. Verify secrets are configured correctly

### Secret Issues

**Symptom**: Authentication errors in workflow

**Solutions**:
1. Verify all three secrets are set in GitHub
2. Ensure `SUPABASE_ACCESS_TOKEN` is valid (try `supabase login` locally)
3. Verify `SUPABASE_PROJECT_ID` matches your project
4. Check `SUPABASE_DB_PASSWORD` is correct

### Schema Conflicts

**Symptom**: Migration fails due to existing objects

**Solutions**:
1. Use `IF NOT EXISTS` / `IF EXISTS` clauses
2. Check current schema: `supabase db dump --schema public`
3. Make migration additive (don't drop/recreate)

## Monitoring

### View Deployment Status

1. Go to GitHub Actions tab
2. Click on "Deploy Database Migrations" workflow
3. View recent runs and their status

### Verify Applied Migrations

```bash
# Connect to your database
supabase link --project-ref your-project-ref

# View current schema
supabase db dump --schema public

# Check specific table
psql "$(supabase db url)" -c "\d+ public.table_name"
```

## Emergency Procedures

### Disable Auto-Deployment

If you need to temporarily disable automatic migrations:

1. Go to `.github/workflows/deploy-migrations.yml`
2. Change branches to a different branch:
   ```yaml
   on:
     push:
       branches:
         - disabled  # Change from 'main'
   ```

### Force Re-run Migration

If you need to re-apply a migration:

1. Go to GitHub Actions
2. Select "Deploy Database Migrations"
3. Click "Run workflow"
4. Enter the migration file path
5. Click "Run workflow"

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project-specific: `migrations/README.md`
