# Account Switching Feature

## Overview

The Account Switching feature allows users to manage and switch between multiple user accounts without having to log out and log in repeatedly. Users can have multiple accounts (e.g., work and personal accounts) and switch between them with a single click.

## Problem Solved

Previously, users had to:
1. Log out of their current account
2. Navigate to the login page
3. Enter credentials for the other account
4. Log in again

Now, users can:
1. Add multiple accounts once
2. Switch between them instantly from the sidebar
3. Each account maintains its own session

## Implementation Details

### Components Added

#### 1. **AccountSwitcher Component** (`components/account/AccountSwitcher.tsx`)
- Dropdown menu displaying all saved accounts
- Shows account name and email
- Green gradient avatar (vs purple for profile switching)
- Supports both expanded and collapsed sidebar states
- Shows checkmark next to active account
- "Add Account" button to add new accounts
- Shows total count of accounts

#### 2. **AddAccountDialog Component** (`components/account/AddAccountDialog.tsx`)
- Modal dialog for adding new accounts
- Email and password input fields
- Password visibility toggle
- Integrates with existing login flow
- Error handling and validation
- Does not log out current user during addition

#### 3. **Account Manager** (`lib/account-manager.ts`)
- Centralized account management service
- Stores accounts in localStorage
- Functions:
  - `getStoredAccounts()`: Get all saved accounts
  - `saveAccount(account)`: Save or update an account
  - `setActiveAccount(accountId)`: Set the active account
  - `getAccountById(accountId)`: Get specific account
  - `removeAccount(accountId)`: Delete an account
  - `clearAllAccounts()`: Delete all accounts
  - `updateAccountLastUsed(accountId)`: Update timestamp

### Auth Context Updates

The `contexts/auth.context.tsx` has been enhanced with:

#### New State
- **storedAccounts**: Array of all saved accounts

#### New Functions
1. **switchAccount(accountId)**
   - Switches to a different saved account
   - Uses Supabase's `setSession()` API
   - Updates UI immediately
   - Handles invalid/expired sessions

2. **addAccount(email, password)**
   - Adds a new account without logging out
   - Temporarily switches context to verify credentials
   - Saves session if successful
   - Returns to previous account

3. **removeStoredAccount(accountId)**
   - Removes a saved account
   - Clears active account if it was the removed one

#### Data Structure

```typescript
interface StoredAccount {
  id: string              // User ID from Supabase
  email: string          // Account email
  name: string           // Display name
  session: Session       // Supabase session object
  lastUsed: number       // Timestamp of last use
}
```

### Dashboard Integration

In `app/dashboard/layout.tsx`:
- AccountSwitcher placed above ProfileSwitcher in the sidebar
- Visual hierarchy: Account (who you are) > Profile (what role)
- AddAccountDialog modal managed by dashboard state
- Both switchers work together seamlessly

## User Experience

### Adding an Account

1. Click on the AccountSwitcher in the sidebar
2. Click "Add Account" button
3. Enter email and password in the dialog
4. Click "Add Account" to save
5. Account is added to the list

### Switching Accounts

1. Click on the AccountSwitcher in the sidebar
2. Select a different account from the dropdown
3. The UI updates immediately
4. You're now using the selected account

### Visual Design

- **Account Switcher**: Green gradient avatar (`from-green-600 to-teal-600`)
- **Profile Switcher**: Purple gradient avatar (`from-purple-600 to-blue-600`)
- **Active Account**: Checkmark indicator
- **Account Count**: Displayed in dropdown header
- **Responsive**: Works in both desktop and mobile layouts

## Technical Features

### Session Management
- Uses Supabase's session management
- Sessions stored securely in localStorage
- Automatic validation on switch
- Invalid sessions automatically removed

### State Management
- Account switching updates auth context
- Changes propagate throughout the application
- No page reload required
- Maintains separate sessions for each account

### Persistence
- Accounts stored in localStorage
- Sessions persist across browser restarts
- Last used timestamps track activity
- Cleared on logout

### Security
- **No passwords stored** - only session tokens
- Session tokens encrypted by Supabase
- Uses secure Supabase auth API
- Invalid sessions detected and removed
- localStorage is appropriate for client-side sessions

### Performance
- Instant account switching
- No API calls except for session validation
- Minimal localStorage operations
- Efficient state updates

## Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management in dialogs
- Clear visual indicators

## Relationship with Profile Switching

Account switching and profile switching are complementary:

- **Account Switching**: Switch between different users (different emails/identities)
  - Example: Switch from work@company.com to personal@email.com
  
- **Profile Switching**: Switch between roles within the same account
  - Example: Switch from "Hospital Administrator" to "Logistics Manager"

Both features work together:
1. Switch to a different account (Account Switcher)
2. Then switch to a different role in that account (Profile Switcher)

## Browser Compatibility

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 19.2.0+
- Supabase (@supabase/ssr, @supabase/supabase-js)
- Radix UI (DropdownMenu, Dialog)
- lucide-react (icons)
- Tailwind CSS (styling)

## Usage Example

```typescript
import { useAuth } from '@/contexts'

function MyComponent() {
  const {
    storedAccounts,     // Array of saved accounts
    switchAccount,      // Switch to an account
    addAccount,         // Add a new account
    removeStoredAccount // Remove an account
  } = useAuth()
  
  // Switch to a different account
  const handleSwitch = (accountId: string) => {
    switchAccount(accountId)
  }
  
  // Add a new account
  const handleAdd = async (email: string, password: string) => {
    const result = await addAccount(email, password)
    if (result.success) {
      console.log('Account added!')
    }
  }
  
  return (
    <div>
      {storedAccounts.map(account => (
        <button key={account.id} onClick={() => handleSwitch(account.id)}>
          {account.name} ({account.email})
        </button>
      ))}
    </div>
  )
}
```

## Future Enhancements

Potential improvements:

1. **Account Profiles**: Custom settings per account
2. **Quick Switch Shortcut**: Keyboard shortcut (e.g., Ctrl+K)
3. **Recent Accounts**: Show recently used accounts first
4. **Account Colors**: Custom colors/themes per account
5. **Account Nicknames**: Custom names for accounts
6. **Account Groups**: Organize accounts into groups
7. **Sync Across Devices**: Cloud sync of account list
8. **Biometric Auth**: Fingerprint/Face ID for switching
9. **Auto-Switch**: Switch based on time/location
10. **Account Search**: Search through many accounts

## Testing

To test the feature:

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build the project
npm run build

# Run tests (if available)
npm test
```

## Troubleshooting

### Account switch fails
- Check if session is still valid
- Invalid sessions are automatically removed
- Try adding the account again

### Accounts not persisting
- Check localStorage is enabled in browser
- Check browser privacy settings
- Clear localStorage and add accounts again

### Performance issues
- Consider limiting number of stored accounts
- Clear old/unused accounts
- Check localStorage size

## Security Considerations

1. **No Passwords Stored**: Only Supabase session tokens
2. **Token Encryption**: Handled by Supabase
3. **Session Validation**: Checked on every switch
4. **Auto-Cleanup**: Invalid sessions removed
5. **LocalStorage**: Appropriate for client-side sessions (browser-specific)
6. **XSS Protection**: Use Content Security Policy
7. **HTTPS Only**: Ensure app runs over HTTPS

## Migration Guide

For existing users:
1. Current session automatically saved on first use
2. No data migration needed
3. Backward compatible with profile switching
4. Old localStorage keys remain unchanged

## API Reference

### AccountManager Functions

```typescript
// Get all stored accounts
getStoredAccounts(): StoredAccount[]

// Get active account ID
getActiveAccountId(): string | null

// Save an account
saveAccount(account: StoredAccount): void

// Set active account
setActiveAccount(accountId: string): void

// Get account by ID
getAccountById(accountId: string): StoredAccount | null

// Remove an account
removeAccount(accountId: string): void

// Clear all accounts
clearAllAccounts(): void

// Update last used timestamp
updateAccountLastUsed(accountId: string): void
```

### Auth Context Functions

```typescript
// Switch to a saved account
switchAccount(accountId: string): Promise<void>

// Add a new account
addAccount(email: string, password: string): Promise<AuthResult>

// Remove a saved account
removeStoredAccount(accountId: string): void
```

## License

Same as the main project.

## Contributing

Follow the project's contributing guidelines when making changes to this feature.

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Open an issue on GitHub
4. Contact the development team
