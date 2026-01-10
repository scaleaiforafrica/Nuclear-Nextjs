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

This migration adds all required fields for the comprehensive settings page.

### Migration File
`migrations/add_settings_fields.sql`

### What This Migration Does

1. **Extends `profiles` table** with new columns:
   - Basic profile: `phone`, `job_title`, `department`, `avatar_url`
   - App preferences: `timezone`, `date_format`, `theme`
   - Account settings: `two_factor_enabled`
   - Notification preferences: `email_notifications`, `push_notifications`, `in_app_notifications`, `shipment_alerts`, `compliance_reminders`, `daily_digest`, `weekly_digest`

2. **Creates `login_history` table** to track:
   - Login timestamps
   - IP addresses
   - User agents
   - Device information
   - Location data

3. **Creates `user_sessions` table** to manage:
   - Active user sessions
   - Session tokens
   - Device and browser info
   - Last active timestamps

4. **Sets up Row Level Security (RLS)** policies:
   - Users can only view their own login history
   - Users can only view and delete their own sessions

### How to Run This Migration

#### Using Supabase CLI
```bash
supabase db push
```

#### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/add_settings_fields.sql`
4. Paste and run the SQL

#### Using Direct SQL Connection
```bash
psql -h your-supabase-host -U postgres -d postgres -f migrations/add_settings_fields.sql
```

### Important Notes

- This migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
- All new columns have default values, so existing profiles won't break
- RLS policies are automatically enabled for security
- Indexes are created for performance on user_id lookups

### Testing the Migration

After running the migration, verify:

```sql
-- Check new columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone', 'timezone', 'theme', 'two_factor_enabled');

-- Check new tables were created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('login_history', 'user_sessions');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Rollback (if needed)

If you need to rollback this migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.user_sessions;
DROP TABLE IF EXISTS public.login_history;

-- Remove new columns (optional, only if you want to completely revert)
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS job_title,
DROP COLUMN IF EXISTS department,
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS timezone,
DROP COLUMN IF EXISTS date_format,
DROP COLUMN IF EXISTS theme,
DROP COLUMN IF EXISTS two_factor_enabled,
DROP COLUMN IF EXISTS email_notifications,
DROP COLUMN IF EXISTS push_notifications,
DROP COLUMN IF EXISTS in_app_notifications,
DROP COLUMN IF EXISTS shipment_alerts,
DROP COLUMN IF EXISTS compliance_reminders,
DROP COLUMN IF EXISTS daily_digest,
DROP COLUMN IF EXISTS weekly_digest;
```
