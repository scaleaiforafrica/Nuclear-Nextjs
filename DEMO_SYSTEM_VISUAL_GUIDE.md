# Demo Account System - Visual Guide

This document provides a visual description of all UI components in the demo account system.

## 1. Login Page - "Try Demo" Button

### Location
Login page at `/login`

### Appearance
```
┌─────────────────────────────────────────┐
│           NUCLEAR Logo                   │
│   Nuclear Supply Chain Management        │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  🚀 Try Demo Account               │ │  ← Yellow button
│  └────────────────────────────────────┘ │
│  Explore with sample data from          │
│  African healthcare facilities          │
│                                          │
│  ──────── Or continue with ────────     │
│                                          │
│  [Login Tab] [Sign Up Tab]             │
│  ...                                     │
└─────────────────────────────────────────┘
```

### Styling
- **Background**: Yellow-50 (#FEF3C7)
- **Border**: Yellow-300 (#FCD34D)
- **Text**: Yellow-800 (#92400E)
- **Hover**: Yellow-100 (#FEF9C3)
- **Icon**: 🚀 emoji

### Behavior
- Click → Automatically logs in as demo@nuclearflow.com
- Redirects to /dashboard
- No password entry required
- Loading state shows "Signing in..."

---

## 2. Demo Mode Banner

### Location
Sticky at top of all dashboard pages when logged in as demo account

### Appearance
```
┌────────────────────────────────────────────────────────┐
│ 🎭 Demo Mode                    [Reset Data]  [×]      │
│ All changes reset on logout                            │
└────────────────────────────────────────────────────────┘
```

### Styling
- **Background**: Yellow-100 (#FEF3C7)
- **Border Bottom**: Yellow-300 (#FCD34D)
- **Text**: Yellow-800 (#92400E)
- **Icon Color**: Yellow-500 (#F59E0B)
- **Position**: Sticky top, z-index 50
- **Height**: ~48px
- **Shadow**: Small shadow for depth

### Responsive Behavior
**Desktop (>1024px)**
```
┌────────────────────────────────────────────────────────┐
│ 🎭 Demo Mode - All changes reset on logout             │
│                              [Reset Data]  [×]         │
└────────────────────────────────────────────────────────┘
```

**Tablet (768-1024px)**
```
┌──────────────────────────────────────────┐
│ 🎭 Demo Mode                              │
│ Reset on logout  [Reset Data]  [×]       │
└──────────────────────────────────────────┘
```

**Mobile (<768px)**
```
┌────────────────────────────────┐
│ 🎭 Demo    [Reset]  [×]        │
└────────────────────────────────┘
```

### Interactive Elements

#### Reset Data Button
- **Default State**: 
  - Background: Transparent
  - Border: Yellow-300
  - Text: "Reset Data"
  - Icon: ↻ (RefreshCw)

- **Hover State**:
  - Background: Yellow-100
  - Cursor: pointer

- **Loading State** (during restoration):
  - Icon: Spinning animation
  - Text: "Resetting..."
  - Disabled: true

- **Cooldown State** (after success):
  - Disabled for 5 seconds
  - Shows checkmark icon
  - Text: "Reset Complete"

- **Error State**:
  - Border: Red-300
  - Text color: Red-600
  - Shows error icon

#### Dismiss Button (×)
- **Size**: 24x24px minimum touch target
- **Color**: Yellow-600
- **Hover**: Yellow-700
- **Action**: Hides banner until next page load

---

## 3. Demo Data Visualization

### Dashboard Overview (with demo data)

```
┌────────────────────────────────────────────────────┐
│ DEMO BANNER (as shown above)                       │
├────────────────────────────────────────────────────┤
│  Dashboard                                         │
│                                                    │
│  Active Shipments: 9                              │
│  ┌──────────────────────────────────────────┐    │
│  │ Tc-99m → Kenyatta Hospital, Nairobi      │    │
│  │ Status: In Transit  ETA: Jan 20, 2026    │    │
│  │ Origin: Pretoria, South Africa            │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ I-131 → Lagos University Teaching Hosp.  │    │
│  │ Status: At Customs  ETA: Jan 18, 2026    │    │
│  │ Origin: Cairo, Egypt                      │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  Recent Activities (20)                           │
│  • Tc-99m cleared at Nairobi customs             │
│  • I-131 delivery scheduled for Lagos            │
│  • Compliance alert: Ghana permit renewal        │
│                                                    │
│  Compliance Alerts (7)                            │
│  ⚠️  Permit Expiration Approaching                │
│  ❌  Missing Documentation                        │
│  ℹ️  New Regulation Update                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Isotope Types in Demo Data
- Technetium-99m (Tc-99m) - Imaging
- Iodine-131 (I-131) - Thyroid treatment
- Fluorine-18 (F-18) - PET scans
- Lutetium-177 (Lu-177) - Cancer therapy
- Yttrium-90 (Y-90) - Cancer treatment
- Radium-223 (Ra-223) - Bone cancer
- Cobalt-60 (Co-60) - Radiation therapy
- Strontium-89 (Sr-89) - Bone pain relief
- Samarium-153 (Sm-153) - Bone metastases

### African Locations Featured
1. **Kenya**: Kenyatta National Hospital, Nairobi Hospital, Nairobi Nuclear Center
2. **Nigeria**: Lagos University Teaching Hospital
3. **Ghana**: Korle Bu Teaching Hospital, Accra Medical Center
4. **South Africa**: Chris Hani Baragwanath Hospital, University of Cape Town Hospital, Pretoria facilities
5. **Egypt**: Cairo Nuclear Medicine Center, Alexandria Nuclear Medicine
6. **Ethiopia**: Addis Ababa Medical College
7. **Tanzania**: Dar es Salaam Nuclear Center
8. **Zimbabwe**: Harare Medical Complex
9. **Uganda**: Mulago Hospital, Kampala
10. **Morocco**: Casablanca University Hospital
11. **Tunisia**: Tunis Research Institute

---

## 4. Restoration Process - Visual Flow

### Step-by-Step Visual

```
User clicks "Reset Data" or logs out
        ↓
┌─────────────────────────┐
│  Verifying demo account │  ← 100ms
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│  Deleting old data...   │  ← 500ms
│  [████████░░░░] 60%     │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│  Restoring seed data... │  ← 1.5s
│  [████████████] 100%    │
│  • Shipments ✓          │
│  • Activities ✓         │
│  • Alerts ✓             │
│  • Permits ✓            │
│  • Deliveries ✓         │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│  ✅ Reset Complete      │  ← 200ms
│  50 records restored    │
└─────────────────────────┘
```

### Loading States

**Button During Restoration:**
```
[↻ Resetting...] ← Spinning icon, disabled
```

**Success State:**
```
[✓ Reset Complete] ← Green checkmark, 5s cooldown
```

**Error State:**
```
[❌ Reset Failed] ← Red X, can retry immediately
```

---

## 5. Mobile Responsive Views

### Login Page Mobile
```
┌──────────────────┐
│  NUCLEAR Logo    │
│                  │
│ ┌──────────────┐ │
│ │ 🚀 Try Demo  │ │
│ └──────────────┘ │
│ Sample data from │
│ African hospitals│
│                  │
│ ─── Or login ─── │
│                  │
│ [Login] [Sign Up]│
└──────────────────┘
```

### Demo Banner Mobile
```
┌──────────────────┐
│ 🎭 Demo [↻] [×] │
└──────────────────┘
```

### Dashboard Mobile (with banner)
```
┌──────────────────┐
│ 🎭 Demo [↻] [×] │  ← Banner
├──────────────────┤
│ ☰  Dashboard     │  ← Header
├──────────────────┤
│ Shipments: 9     │
│                  │
│ Tc-99m → Nairobi │
│ In Transit       │
│                  │
│ I-131 → Lagos    │
│ At Customs       │
│                  │
│ [View All]       │
└──────────────────┘
```

---

## 6. Color Palette

### Demo Mode Colors
```
Primary Yellow Scheme:
- Background:    #FEF3C7 (yellow-100)
- Border:        #FCD34D (yellow-300)
- Text:          #92400E (yellow-800)
- Icon:          #F59E0B (yellow-500)
- Hover:         #FEF9C3 (yellow-50)
```

### Status Colors (in data)
```
Shipment Status:
- In Transit:    #3B82F6 (blue-500)
- At Customs:    #F59E0B (yellow-500)
- Dispatched:    #10B981 (green-500)
- Delivered:     #6B7280 (gray-500)
- Pending:       #F97316 (orange-500)
```

### Alert Severity
```
Compliance Alerts:
- Error:         #EF4444 (red-500)
- Warning:       #F59E0B (yellow-500)
- Info:          #3B82F6 (blue-500)
```

---

## 7. Accessibility Features

### Screen Reader Support
- Demo banner announces: "Demo Mode: All changes reset on logout"
- Reset button: "Reset demo data to original state"
- Loading state: "Resetting demo data, please wait"
- Success: "Demo data successfully reset"

### Keyboard Navigation
- Tab order: Try Demo → Email → Password → Login
- Banner: Tab to Reset button → Tab to Dismiss button
- Enter key activates buttons
- Escape key dismisses banner

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between clickable areas
- Visual feedback on touch (active states)

### ARIA Labels
```html
<button aria-label="Try demo account with sample data">
<div role="alert" aria-live="polite"> <!-- for status messages -->
<button aria-label="Reset demo data" aria-busy="true"> <!-- during load -->
```

---

## 8. Animation & Transitions

### Demo Banner Entry
```
Slide down from top: 300ms ease-out
Opacity: 0 → 1 over 200ms
```

### Reset Button Loading
```
Icon rotation: 360deg continuous during reset
Duration: 1s linear infinite
```

### Success Feedback
```
Scale: 1.0 → 1.05 → 1.0 over 300ms
Opacity: 0 → 1 over 200ms
Green checkmark fade-in
```

### Dismiss Animation
```
Slide up: 200ms ease-in
Opacity: 1 → 0 over 150ms
```

---

## 9. Error States & Messages

### Restoration Failed
```
┌────────────────────────────────────────┐
│ ❌ Demo Mode                           │
│ Failed to reset data. Try again?      │
│                          [Retry]  [×]  │
└────────────────────────────────────────┘
```

### Network Error
```
┌────────────────────────────────────────┐
│ ⚠️  Demo Mode                           │
│ Network error. Check connection.       │
│                          [Retry]  [×]  │
└────────────────────────────────────────┘
```

### Authentication Error
```
┌────────────────────────────────────────┐
│ 🔒 Demo Mode                           │
│ Session expired. Please log in again. │
│                    [Login Again]  [×]  │
└────────────────────────────────────────┘
```

---

## 10. Implementation Notes

### CSS Classes Used
```css
/* Banner */
.demo-banner: sticky top-0 z-50 border-b shadow-sm
.demo-banner-content: container mx-auto px-4 py-2

/* Button */
.demo-button: border-yellow-300 bg-yellow-50 hover:bg-yellow-100
.demo-button-text: text-yellow-800

/* Mobile */
@media (max-width: 768px) {
  .demo-banner-text: text-sm
  .demo-button: text-xs px-2
}
```

### Tailwind Classes
```
bg-yellow-50     Background light yellow
border-yellow-300    Border medium yellow
text-yellow-800      Text dark yellow
hover:bg-yellow-100  Hover slightly lighter
sticky top-0         Sticky positioning
z-50                 Above most content
shadow-sm            Subtle shadow
```

---

## Summary

The demo account system provides a visually consistent, accessible, and mobile-responsive interface that clearly indicates demo mode status while maintaining the application's design language. All interactive elements have appropriate feedback states, and the system gracefully handles errors and edge cases.

**Key Visual Elements:**
1. ✅ Yellow color scheme for demo mode (consistent branding)
2. ✅ Prominent "Try Demo" button on login
3. ✅ Persistent banner with clear status
4. ✅ Visual feedback for all actions
5. ✅ Mobile-responsive layouts
6. ✅ Accessible design with ARIA labels
7. ✅ Smooth animations and transitions
8. ✅ Clear error states and recovery options
