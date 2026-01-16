# Demo Account Quick Start Guide

## For End Users

### Try the Demo (Easiest Way)

1. Go to the login page
2. Click the **"Try Demo Account"** button (yellow button at the top)
3. You're in! Explore the Nuclear Supply Chain Management system with realistic African healthcare data

### Manual Login

If you prefer to type the credentials:
- **Email**: `demo@nuclearflow.com`
- **Password**: `DemoNuclear2026!`

### What You'll See

- **9 Isotope Shipments** across 11 African countries (Kenya, Nigeria, Ghana, South Africa, Egypt, Ethiopia, Tanzania, Zimbabwe, Uganda, Morocco, Tunisia)
- **20 Recent Activities** from supply chain operations
- **7 Compliance Alerts** including permit expirations and documentation issues
- **6 Regulatory Permits** with various statuses
- **8 Upcoming Deliveries** to major African hospitals

### Demo Mode Banner

When logged in as the demo user, you'll see a yellow banner at the top:
- Shows "Demo Mode" status
- Has a "Reset Data" button to restore original seed data
- Can be dismissed with the X button

### Resetting Data

- **Manual Reset**: Click the "Reset Data" button in the demo banner
- **Automatic Reset**: Data resets automatically when you log out

## For Developers

### Initial Setup

**Step 1: Create Demo User (Choose One Method)**

**Method A: Automated Script (Recommended)**
```bash
# Set environment variables in .env.local
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run setup script
node scripts/setup-demo-account.js
```

**Method B: Supabase Admin API**
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: 'demo@nuclearflow.com',
  password: 'DemoNuclear2026!',
  email_confirm: true,
  user_metadata: {
    full_name: 'Demo User',
    role: 'Hospital Administrator'
  }
})
```

**Method C: Manual SQL (Development Only)**
```sql
-- Generate password hash first
SELECT crypt('DemoNuclear2026!', gen_salt('bf', 10));
-- Then run migration with the hash
```

**Step 2: Run Database Migration**

```bash
# Via Supabase CLI
supabase migration up

# Or via Supabase Dashboard
# Copy migrations/002_demo_account_setup.sql to SQL Editor and run
```

**Step 3: Verify Setup**

```bash
# Check if demo user exists
node scripts/setup-demo-account.js

# Or query directly
SELECT id, email FROM auth.users WHERE email = 'demo@nuclearflow.com';
SELECT * FROM profiles WHERE is_demo_account = true;
```

### Using Demo Features in Code

**Check if User is Demo Account**
```typescript
import { isDemoAccount } from '@/lib/demo/utils'
import { useAuth } from '@/contexts/auth.context'

const { supabaseUser } = useAuth()
const isDemo = isDemoAccount(supabaseUser)

if (isDemo) {
  // Show demo-specific UI
}
```

**Trigger Manual Restoration**
```typescript
import { useDemoRestore } from '@/hooks/useDemoRestore'

function MyComponent() {
  const { restoreData, isRestoring, error, success } = useDemoRestore()

  const handleReset = async () => {
    await restoreData()
    if (success) {
      console.log('Demo data restored!')
    }
  }

  return (
    <button onClick={handleReset} disabled={isRestoring}>
      {isRestoring ? 'Restoring...' : 'Reset Demo Data'}
    </button>
  )
}
```

**Get Demo Status**
```typescript
const response = await fetch('/api/demo/status')
const { data } = await response.json()

console.log('Is Demo:', data.isDemo)
console.log('Coverage:', data.coverage, '%')
console.log('Last Restore:', data.lastRestore)
console.log('Version:', data.version)
```

**Call Restoration API**
```typescript
const response = await fetch('/api/demo/restore', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})

const result = await response.json()
if (result.success) {
  console.log('Tables restored:', result.data.tablesRestored)
  console.log('Records restored:', result.data.recordsRestored)
  console.log('Duration:', result.data.duration, 'ms')
}
```

### Configuration

Edit `lib/demo/config.ts` to customize:

```typescript
// Feature flags
export const DEMO_FEATURES = {
  showBanner: true,           // Show demo mode banner
  allowManualRestore: true,   // Enable manual restore button
  trackRestorations: true,    // Log to database
  validateOnRestore: true,    // Validate seed data
}

// Restoration behavior
export const RESTORATION_CONFIG = {
  timeoutMs: 30000,           // 30 second timeout
  retryAttempts: 2,           // Retry twice on failure
  retryDelayMs: 1000,         // Wait 1s between retries
  batchSize: 50,              // Insert 50 records per batch
}
```

### Troubleshooting

**Problem: "Try Demo" button doesn't work**
- Check if demo user was created: `SELECT * FROM auth.users WHERE email = 'demo@nuclearflow.com'`
- Verify password is set correctly
- Check browser console for errors

**Problem: Demo banner not showing**
- Verify `DEMO_FEATURES.showBanner` is `true`
- Check if user is authenticated as demo account
- Look for JavaScript errors in console

**Problem: Data restoration fails**
- Check Supabase connection
- Verify RLS policies allow operations
- Check if seed files exist in `lib/demo/seeds/`
- Look at server logs for detailed errors

**Problem: Auto-restore on logout not working**
- Verify `DEMO_CONFIG.restoration.onLogout` is `true`
- Check auth context implementation
- Look for errors during logout process

### Monitoring

**Check Restoration History**
```sql
SELECT 
  restored_at,
  tables_restored,
  records_restored,
  duration_ms,
  success,
  triggered_by
FROM demo_restorations
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY restored_at DESC
LIMIT 10;
```

**Check Seed Versions**
```sql
SELECT 
  table_name,
  version,
  record_count,
  generated_by,
  generated_at
FROM demo_seed_versions
WHERE is_active = true;
```

## Security Notes

- Demo account has the same RLS policies as regular users
- Cannot access other users' data
- Password should be changed for production deployments
- Consider rate limiting demo account API calls
- Monitor demo restoration frequency

## Support

For issues:
1. Check [DEMO_ACCOUNT_IMPLEMENTATION.md](./DEMO_ACCOUNT_IMPLEMENTATION.md) for detailed docs
2. Review configuration in `lib/demo/config.ts`
3. Check browser console and server logs
4. Verify database migration completed successfully

## Demo Data Details

All seed data features authentic African healthcare context:

- **Countries**: Kenya, Nigeria, Ghana, South Africa, Egypt, Ethiopia, Tanzania, Zimbabwe, Uganda, Morocco, Tunisia
- **Hospitals**: Kenyatta National Hospital, Lagos University Teaching Hospital, Mulago Hospital, Chris Hani Baragwanath Hospital, and more
- **Isotopes**: Tc-99m, I-131, F-18, Lu-177, Y-90, Ra-223, Co-60, Sr-89, Sm-153
- **Scenarios**: Import/export, customs clearance, permit management, compliance monitoring, delivery tracking

## Version

**Current Version**: 1.0.0
**Last Updated**: January 2026
**Seed Data Records**: 50 total across 5 tables
