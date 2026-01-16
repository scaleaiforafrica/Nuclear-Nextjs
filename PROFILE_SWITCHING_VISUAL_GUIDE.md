# Profile Switching Feature - Visual Guide

## Feature Overview

The profile switching feature allows users to seamlessly switch between different organizational roles without logging out. This improves workflow efficiency for users who perform multiple roles within the organization.

## UI Location

```
┌─────────────────────────────────────────────┐
│  Dashboard Sidebar                           │
├─────────────────────────────────────────────┤
│                                              │
│  📊 Dashboard                                │
│  🛒 Procurement                              │
│  🚚 Shipments                                │
│  🛡️ Compliance                               │
│  🔗 Traceability                             │
│  📈 Reports                                  │
│                                              │
├─────────────────────────────────────────────┤
│  ⚙️ Settings                                 │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │  👤 PK                               │  │ ← Profile Switcher
│  │  Princesskwaniya               ▼     │  │   (Clickable)
│  │  Hospital Administrator              │  │
│  └───────────────────────────────────────┘  │
│  🚪 Logout                                   │
└─────────────────────────────────────────────┘
```

## Dropdown Menu (When Clicked)

```
┌───────────────────────────────────────┐
│  Switch Profile                        │
├───────────────────────────────────────┤
│  👤 PK    Princesskwaniya         ✓   │ ← Current Profile
│           Hospital Administrator       │
├───────────────────────────────────────┤
│  👤 PK    Princesskwaniya             │ ← Available Profile
│           Logistics Manager            │
├───────────────────────────────────────┤
│  👤 PK    Princesskwaniya             │ ← Available Profile
│           Compliance Officer           │
└───────────────────────────────────────┘
```

## Collapsed Sidebar View

When sidebar is collapsed, only the avatar is shown:

```
┌──────┐
│  📊  │
│  🛒  │
│  🚚  │
│  🛡️  │
│  🔗  │
│  📈  │
├──────┤
│  ⚙️  │
├──────┤
│  👤  │ ← Click to open dropdown
│  PK  │
└──────┘
```

## User Interaction Flow

1. **Initial State**
   - User sees their profile in the sidebar
   - Name and current role are displayed
   - Chevron down icon indicates it's interactive

2. **Click to Open**
   - Click anywhere on the profile area
   - Dropdown menu appears with smooth animation
   - Shows all available profiles

3. **Select Profile**
   - Click on a different profile
   - UI updates instantly
   - Check mark moves to selected profile
   - Dropdown closes automatically

4. **Persistence**
   - Selected profile is saved to localStorage
   - Persists across page reloads
   - Cleared on logout

## Visual States

### Hover State
```
┌───────────────────────────────────────┐
│  👤 PK                               │
│  Princesskwaniya               ▼     │  ← Light gray background
│  Hospital Administrator              │
└───────────────────────────────────────┘
```

### Active/Selected State
```
┌───────────────────────────────────────┐
│  👤 PK    Princesskwaniya         ✓   │  ← Blue check mark
│           Hospital Administrator       │
└───────────────────────────────────────┘
```

## Technical Implementation

### Component Structure
```
ProfileSwitcher
├── DropdownMenu (Radix UI)
│   ├── DropdownMenuTrigger
│   │   └── Button (Profile Display)
│   │       ├── Avatar with Initials
│   │       ├── Name & Role
│   │       └── Chevron Icon
│   └── DropdownMenuContent
│       └── DropdownMenuItem (for each profile)
│           ├── Avatar
│           ├── Name & Role
│           └── Check Icon (if current)
```

### State Management
```
AuthContext
├── availableProfiles[]
├── selectedRole
├── switchProfile()
└── localStorage persistence
```

## Animations

1. **Dropdown Open/Close**: Smooth fade + scale animation (150ms)
2. **Hover Effect**: Background color transition (200ms)
3. **Profile Switch**: Instant UI update (no loading state)

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader friendly (ARIA labels)
- ✅ Focus visible indicators
- ✅ Semantic HTML structure
- ✅ Descriptive button text

## Responsive Behavior

### Desktop (> 1024px)
- Full profile display with name and role
- Dropdown aligns to the right edge
- Smooth hover effects

### Tablet (768px - 1024px)
- Same as desktop

### Mobile (< 768px)
- Profile section in slide-out menu
- Touch-friendly target sizes (min 44x44px)
- Same dropdown functionality

## Color Scheme

- **Avatar**: Purple-to-blue gradient
- **Hover**: Light gray (#F9FAFB)
- **Active**: Lighter gray (#F3F4F6)
- **Check Mark**: Purple (#9333EA)
- **Text**: Dark gray (#374151)
- **Secondary Text**: Medium gray (#6B7280)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
