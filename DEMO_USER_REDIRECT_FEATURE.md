# Demo User Redirect Feature

## Overview
This feature automatically redirects demo users from the Home page to the Settings page to provide a tailored experience for test/demo accounts.

## How It Works

### Demo User Detection
A user is considered a "demo user" if their email address starts with:
- `demo@` (e.g., `demo@example.com`, `Demo@Company.com`)
- `test@` (e.g., `test@example.com`, `TEST@example.com`)

The check is case-insensitive.

### Redirect Behavior
1. When the Home page (`/`) loads
2. After authentication state is loaded
3. If the user is authenticated AND is a demo user
4. They are automatically redirected to `/dashboard/settings`

### Redirect Loop Prevention
- Uses a React `useRef` to track if redirect has already occurred
- Only redirects once per component mount
- Skips redirect while auth is still loading

## Testing the Feature

### Automatic Tests
Run the test suite to verify the demo user detection logic:
```bash
npm test
```

All tests should pass (16/16), including 5 tests specifically for `isDemoUser()`.

### Manual Testing

#### 1. Test with a Demo User
1. Create a test account with email `demo@example.com`
2. Log in to the application
3. Navigate to the Home page (`/`)
4. **Expected**: Automatically redirected to `/dashboard/settings`

#### 2. Test with a Regular User
1. Create a test account with email `user@example.com`
2. Log in to the application
3. Navigate to the Home page (`/`)
4. **Expected**: Remain on the Home page (no redirect)

#### 3. Test Unauthenticated State
1. Log out if logged in
2. Navigate to the Home page (`/`)
3. **Expected**: Remain on the Home page (no redirect)

## Implementation Details

### Files Modified
- `lib/utils.ts` - Added `isDemoUser()` utility function
- `app/page.tsx` - Added redirect logic using Next.js navigation
- `__tests__/utils.test.ts` - Added comprehensive tests

### Key Features
✅ Minimal changes - only 3 files modified  
✅ No layout or styling changes  
✅ Mobile responsiveness fully maintained  
✅ Type-safe implementation  
✅ Comprehensive test coverage  
✅ No security vulnerabilities  
✅ No redirect loops  

## Future Enhancements
If needed, the demo user detection logic can be extended to:
- Check user metadata flags in Supabase
- Support additional email patterns
- Redirect to different pages based on user type
- Add configurable redirect destinations
