# Profile Switching Feature

## Overview

The profile switching feature allows users to smoothly switch between different role profiles without logging out. Each user can have multiple roles (e.g., Hospital Administrator, Logistics Manager, Compliance Officer) and can switch between them with a single click.

## Implementation Details

### Components Added

1. **ProfileSwitcher Component** (`components/profile/ProfileSwitcher.tsx`)
   - A dropdown menu component that displays the current profile and available profiles
   - Supports both expanded and collapsed sidebar states
   - Uses Radix UI's DropdownMenu for accessibility and smooth animations
   - Shows a check mark next to the currently selected profile

### Auth Context Updates

The `contexts/auth.context.tsx` has been enhanced with:

1. **availableProfiles**: An array of all profiles available to the user
2. **switchProfile()**: Function to switch between profiles
3. **localStorage persistence**: Selected role is persisted across sessions

#### Profile Structure

```typescript
interface Profile {
  name: string
  role: UserRole  // 'Hospital Administrator' | 'Logistics Manager' | 'Compliance Officer'
  initials: string
}
```

### User Experience

1. **Profile Display**: The user's current profile is displayed in the sidebar with:
   - Avatar with initials
   - Full name
   - Current role
   - Chevron down icon (indicating it's clickable)

2. **Profile Switching**:
   - Click on the profile area to open the dropdown
   - Select a different profile from the list
   - The UI updates instantly with smooth transitions
   - Selected profile is persisted in localStorage

3. **Visual Feedback**:
   - Hover effects on the profile button
   - Smooth dropdown animations
   - Check mark indicator on current profile
   - Distinct styling for each profile option

### Location in UI

The ProfileSwitcher is located in the sidebar:
- Just below the Settings link
- Above the Logout button
- In the bottom section of the sidebar

### Technical Features

1. **State Management**:
   - Profile switching updates the auth context
   - Changes propagate throughout the application
   - No page reload required

2. **Persistence**:
   - Selected role stored in localStorage
   - Automatically restored on page reload
   - Cleared on logout

3. **Accessibility**:
   - Proper ARIA labels
   - Keyboard navigation support
   - Screen reader friendly

4. **Responsive Design**:
   - Works in both expanded and collapsed sidebar states
   - Adapts to mobile and desktop layouts

### Default Behavior

- By default, users have access to all three roles:
  - Hospital Administrator
  - Logistics Manager  
  - Compliance Officer
- The first profile in the list is selected by default
- If a user has specific roles defined in their metadata, only those roles are available

## Testing

Unit tests are provided in `__tests__/components/ProfileSwitcher.test.tsx`:

```bash
npm test -- ProfileSwitcher
```

Tests cover:
- Rendering of current profile information
- Button accessibility attributes
- Collapsed view rendering
- Icon presence
- CSS classes

## Usage Example

```typescript
import { ProfileSwitcher } from '@/components/profile'
import { useAuth } from '@/contexts'

function Sidebar() {
  const { user, availableProfiles, switchProfile } = useAuth()
  
  return (
    <ProfileSwitcher
      currentProfile={{
        name: user.name,
        role: user.role,
        initials: user.initials
      }}
      availableProfiles={availableProfiles}
      onProfileSwitch={switchProfile}
      collapsed={false}
    />
  )
}
```

## Future Enhancements

Potential improvements for the feature:

1. **Custom Roles**: Allow administrators to define custom roles
2. **Role Permissions**: Different permissions for different roles
3. **Profile Images**: Support for custom profile pictures
4. **Quick Switch Keyboard Shortcut**: Keyboard shortcut for profile switching
5. **Recent Profiles**: Show recently used profiles at the top
6. **Profile-Specific Settings**: Different preferences per profile

## Browser Support

The feature works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 19.2.0+
- Radix UI (DropdownMenu)
- lucide-react (icons)
- Tailwind CSS (styling)
