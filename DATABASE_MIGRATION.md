# Database Migration for Vercel Deployment

This document provides quick instructions for setting up the database for this application on Vercel.

## Quick Start

### For Vercel + Supabase (Recommended)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the migration** in Supabase SQL Editor:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents from `migrations/001_initial_schema.sql`
   - Paste and click "Run"

3. **Connect to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Integrations
   - Add the Supabase integration
   - Select your Supabase project

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## What's Included

The migration creates a complete database schema for the Nuclear Supply Chain Management application:

### Tables
- **profiles** - User profiles and settings
- **shipments** - Radioactive isotope shipment tracking
- **compliance_alerts** - Compliance notifications
- **permits** - Regulatory permits management
- **activities** - Activity log
- **deliveries** - Scheduled deliveries
- **login_history** - User login tracking
- **user_sessions** - Active session management

### Security
- Row Level Security (RLS) enabled on all tables
- Policies for authenticated user access
- Secure functions with SECURITY DEFINER

### Performance
- 14 indexes for optimized queries
- Proper foreign key relationships
- Timestamp tracking on all tables

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are automatically set when you use the Vercel + Supabase integration.

## Detailed Documentation

For detailed instructions, troubleshooting, and alternative deployment options, see:
- `migrations/README.md` - Complete migration guide
- `migrations/001_initial_schema.sql` - The migration file with inline documentation

## Seed Data (Optional)

The migration includes optional seed data (sample shipments, alerts, etc.) that is commented out by default. To include seed data:

1. Open `migrations/001_initial_schema.sql`
2. Find the "SEED DATA" section near the end
3. Uncomment the INSERT statements
4. Re-run the migration

## Verification

After deployment, verify the setup:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected: activities, compliance_alerts, deliveries, login_history, 
--           permits, profiles, shipments, user_sessions
```

## Support

For issues or questions:
1. Check `migrations/README.md` for troubleshooting
2. Verify environment variables in Vercel dashboard
3. Check Supabase logs for database errors
