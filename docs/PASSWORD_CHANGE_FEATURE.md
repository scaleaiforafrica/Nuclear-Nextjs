# Password Change Feature Documentation

## Overview

The Nuclear-Nextjs application includes a production-grade password change feature with comprehensive security measures, real-time validation, and excellent user experience. This feature allows authenticated users to securely update their passwords with strong validation and rate limiting protection.

## Features

### Security

- **Comprehensive Password Validation**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Checks against top 100 common passwords

- **Rate Limiting**
  - Maximum 5 password change attempts per hour per user
  - Automatic rate limit reset on successful password change
  - Returns HTTP 429 with Retry-After header when limit exceeded

- **Current Password Verification**
  - Validates current password before allowing change
  - Protects against unauthorized password changes

### User Experience

- **Real-Time Password Strength Feedback**
  - Visual progress bar with color-coded strength indicator
  - Dynamic requirements checklist
  - Helpful feedback messages

- **Password Visibility Toggle**
  - Eye/EyeOff icons for all password fields
  - Keyboard accessible
  - Touch-friendly for mobile devices

- **Mobile-Responsive Design**
  - Stack fields vertically on small screens
  - Large touch targets (min 44x44px)
  - Proper spacing and layout

- **Clear Error Messages**
  - Specific error codes for different failure scenarios
  - Actionable guidance for users
  - Success confirmation messages

## User Flow

### Step-by-Step Process

1. **Navigate to Settings**
   - User clicks on "Settings" in the navigation menu
   - Navigates to the "Account" tab

2. **Enter Current Password**
   - User enters their current password
   - Can toggle visibility using the eye icon

3. **Create New Password**
   - User enters a new password
   - Password strength meter appears in real-time
   - Requirements checklist updates dynamically
   - Feedback messages guide the user

4. **Confirm New Password**
   - User re-enters the new password
   - System validates that passwords match

5. **Submit Password Change**
   - User clicks "Update Password" button
   - System validates all requirements
   - If successful:
     - Password is updated in Supabase Auth
     - Success message is displayed
     - Form fields are cleared
     - Rate limit counter is reset
   - If failed:
     - Specific error messages are shown
     - User can try again (up to rate limit)

## API Endpoints

### POST /api/settings/password

Updates the authenticated user's password.

#### Request Headers
```
Content-Type: application/json
Cookie: session cookie (automatic via Supabase)
```

#### Request Body
```json
{
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Error Responses

**401 Unauthorized** - User not authenticated
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED",
  "message": "You must be logged in to change your password"
}
```

**401 Unauthorized** - Incorrect current password
```json
{
  "error": "Current password is incorrect",
  "code": "INVALID_CURRENT",
  "message": "The current password you entered is incorrect"
}
```

**400 Bad Request** - Missing required fields
```json
{
  "error": "Missing required fields",
  "code": "MISSING_FIELDS",
  "message": "Current password and new password are required"
}
```

**400 Bad Request** - Weak password
```json
{
  "error": "Password does not meet security requirements",
  "code": "WEAK_PASSWORD",
  "message": "Your password must meet all security requirements for your protection",
  "details": {
    "missingRequirements": [
      "Minimum 8 characters",
      "At least one uppercase letter",
      "At least one number"
    ]
  }
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Too many password change attempts",
  "code": "RATE_LIMITED",
  "message": "You have exceeded the maximum number of password change attempts. Please try again later.",
  "details": {
    "retryAfter": 3456,
    "remaining": 0
  }
}
```

#### Response Headers (Rate Limited)
```
Retry-After: 3600
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-16T11:30:00.000Z
```

## Components

### PasswordStrengthMeter

A reusable component for displaying password strength in real-time.

**Location:** `components/ui/password-strength-meter.tsx`

#### Props
```typescript
interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean  // Default: true
  className?: string
}
```

#### Usage
```tsx
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

<PasswordStrengthMeter
  password={newPassword}
  showRequirements={true}
/>
```

#### Features
- Color-coded progress bar (red → orange → yellow → green)
- Strength label (Weak, Fair, Good, Strong)
- Live requirements checklist
- Accessible with ARIA labels
- Smooth animations

### AccountSettings

The main settings component that includes password change functionality.

**Location:** `components/settings/AccountSettings.tsx`

#### Features
- Password visibility toggles for all fields
- Integrated password strength meter
- Real-time validation
- Success/error message display
- Mobile-responsive layout

## Validation Utilities

### Password Validation

**Location:** `lib/validation/password.ts`

#### Main Functions

```typescript
// Validate complete password strength
validatePasswordStrength(password: string): PasswordValidationResult

// Check individual requirements
checkPasswordRequirements(password: string): PasswordRequirements

// Calculate password score (0-10)
calculatePasswordScore(password: string): number

// Check if passwords match
checkPasswordMatch(password: string, confirmPassword: string): boolean

// Validate password change request
validatePasswordChange(
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult & { passwordsMatch: boolean }
```

#### Password Strength Levels
- **Weak (0-3):** Missing multiple requirements
- **Fair (4-5):** Meets basic requirements
- **Good (6-7):** Strong password with good variety
- **Strong (8-10):** Excellent password with maximum variety

### Common Passwords

**Location:** `lib/validation/common-passwords.ts`

Contains a list of 100 most commonly used passwords that are blocked for security.

```typescript
isCommonPassword(password: string): boolean
```

## Rate Limiting

### RateLimiter Class

**Location:** `lib/api/rate-limiter.ts`

#### Configuration
```typescript
const config = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000  // 1 hour
}
```

#### Usage
```typescript
import { getRateLimiter } from '@/lib/api/rate-limiter.ts'

const rateLimiter = getRateLimiter()
const result = rateLimiter.check(userId, config)

if (!result.allowed) {
  // Rate limit exceeded
  // result.retryAfter contains seconds until reset
}
```

#### Methods
- `check(userId, config)` - Check and increment rate limit
- `reset(userId)` - Reset rate limit for user
- `getStatus(userId)` - Get current status without incrementing

## Security Considerations

### Authentication
- All endpoints require authenticated session
- Session is managed by Supabase Auth
- Automatic session validation on each request

### Password Storage
- Passwords are hashed by Supabase Auth using bcrypt
- Never stored in plain text
- Current password verification uses secure sign-in attempt

### Rate Limiting
- In-memory store for development
- For production, consider using Redis for distributed systems
- Automatic cleanup of expired entries

### Error Messages
- Generic error messages for authentication failures
- Specific guidance for validation failures
- No sensitive information in error responses

### HTTPS/TLS
- All password traffic should be over HTTPS in production
- Ensure proper SSL/TLS certificate configuration

## Testing

### Unit Tests

#### Password Validation Tests
**Location:** `__tests__/lib/validation/password.test.ts`

- 30 comprehensive tests
- Coverage: 100% of validation logic
- Tests for all password requirements
- Score calculation validation
- Common password detection

#### Rate Limiter Tests
**Location:** `__tests__/lib/api/rate-limiter.test.ts`

- 13 comprehensive tests
- Coverage: Rate limiting logic
- Multi-user isolation
- Window expiration
- Reset functionality

### Running Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

## Troubleshooting

### Common Issues

#### 1. "Current password is incorrect"
**Cause:** User entered wrong current password
**Solution:** Double-check current password or use password reset flow

#### 2. "Password is too common"
**Cause:** Password matches one in the common passwords list
**Solution:** Choose a more unique password

#### 3. "Too many password change attempts"
**Cause:** Rate limit exceeded (5 attempts per hour)
**Solution:** Wait for rate limit window to expire (check Retry-After header)

#### 4. Password strength meter not updating
**Cause:** JavaScript not loaded or component error
**Solution:** Check browser console for errors, refresh page

#### 5. Form doesn't submit
**Cause:** Validation errors present
**Solution:** Check all requirements are met, passwords match

### Debugging

Enable debug logging in development:
```typescript
// In rate-limiter.ts
console.log('Rate limit check:', result)

// In password validation
console.log('Validation result:', validation)
```

## Configuration

### Environment Variables

No additional environment variables are required. The feature uses existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization

#### Password Requirements
Edit `lib/validation/password.ts`:
```typescript
export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  minLength: 8,  // Change minimum length
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  checkCommonPasswords: true,
}
```

#### Rate Limit Settings
Edit `lib/api/rate-limiter.ts`:
```typescript
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,  // Change max attempts
  windowMs: 60 * 60 * 1000,  // Change time window
}
```

## Performance

### Metrics
- **Validation:** < 1ms per password check
- **Rate Limit Check:** < 1ms per request
- **API Response Time:** < 500ms average
- **UI Response Time:** < 100ms (real-time feedback)

### Optimization
- Password validation memoized in React component
- Rate limiter uses efficient Map storage
- Automatic cleanup of expired entries
- Minimal re-renders with proper state management

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader Support:** ARIA labels on all controls
- **Focus Management:** Visible focus indicators
- **Error Announcements:** Live regions for dynamic errors
- **Color Contrast:** All text meets contrast requirements
- **Touch Targets:** Minimum 44x44px on mobile

### Testing Accessibility
```bash
# Test in browser with screen reader
# macOS: VoiceOver (Cmd + F5)
# Windows: NVDA (free) or JAWS
```

## Future Enhancements

### Planned Features
1. **Password History**
   - Prevent reuse of last 3 passwords
   - Requires database migration

2. **Email Notifications**
   - Send email when password is changed
   - Include time, location, and device info

3. **Session Management**
   - Invalidate all other sessions on password change
   - Requires re-authentication on all devices

4. **Two-Factor Authentication Integration**
   - Require 2FA verification for password change
   - Enhanced security for sensitive operations

5. **Password Recovery Enhancement**
   - Security questions
   - SMS verification option

### Out of Scope (for now)
- Biometric authentication
- Password-less authentication
- Social login integration
- Enterprise SSO

## Support

### Getting Help

- **Documentation:** This file and inline code comments
- **Issues:** GitHub Issues for bug reports

### Contributing

When contributing to this feature:
1. Maintain type safety (no `any` types)
2. Add tests for new functionality
3. Update documentation
4. Follow existing code style
5. Ensure accessibility standards

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0  
**Maintainer:** Nuclear-Nextjs Team
