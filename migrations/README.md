# Database Migration Guide

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
