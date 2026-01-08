# Mobile Responsive Design Guide

## Overview
This document outlines the mobile responsive design patterns, breakpoints, and best practices implemented across the NuclearFlow dashboard.

## Breakpoint System

We use Tailwind CSS's default breakpoint system:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `base` (default) | 0px | Mobile phones (portrait) |
| `sm:` | 640px | Mobile phones (landscape), small tablets |
| `md:` | 768px | Tablets (portrait) |
| `lg:` | 1024px | Tablets (landscape), small laptops |
| `xl:` | 1280px | Desktop, large laptops |

## Design Principles

### 1. Mobile-First Approach
All styles are written mobile-first, with progressive enhancement for larger screens:

```tsx
// ✅ Good: Mobile-first
<div className="p-4 sm:p-6 lg:p-8">

// ❌ Bad: Desktop-first
<div className="p-8 lg:p-6 sm:p-4">
```

### 2. Touch-Friendly Targets
All interactive elements meet minimum touch target sizes (44x44px):

```tsx
// Buttons
<button className="px-4 py-2 min-h-[44px]">

// Icons as buttons
<button className="p-2 w-10 h-10">  // Minimum 40px
```

### 3. Flexible Grids
Use responsive grid systems that adapt to screen size:

```tsx
// Stats grids
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

// Forms
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### 4. Responsive Typography
Scale typography appropriately for readability:

```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl">
<p className="text-sm sm:text-base">
```

### 5. Stacked Layouts
Stack horizontal layouts vertically on mobile:

```tsx
<div className="flex flex-col sm:flex-row gap-3">
```

## Component Patterns

### Navigation (Sidebar)

**Mobile (< 1024px):**
- Hidden by default
- Hamburger menu button in header
- Overlay drawer when opened
- Full-width sidebar

**Desktop (≥ 1024px):**
- Always visible
- Collapsible (280px → 72px)
- Static positioning

```tsx
// Sidebar implementation
<aside className={`
  w-[280px]               // Width
  fixed lg:static         // Mobile: fixed, Desktop: static
  inset-y-0 left-0       // Full height on left
  z-50 lg:z-auto         // High z-index on mobile
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
```

### Header Bar

**Mobile:**
- Hamburger menu button
- Condensed title
- Search icon (expands modal)
- Essential actions only

**Desktop:**
- Full search bar inline
- All action buttons visible

```tsx
<header className="px-4 sm:px-6 lg:px-8">
  {/* Mobile menu button */}
  <button className="lg:hidden">
    <Menu />
  </button>
  
  {/* Search - hidden on mobile */}
  <div className="hidden md:flex">
    <input type="text" placeholder="Search..." />
  </div>
  
  {/* Search button for mobile */}
  <button className="md:hidden">
    <Search />
  </button>
</header>
```

### Data Tables

**Mobile:**
- Horizontal scroll wrapper
- Minimum width preserved
- Condensed padding
- Smaller font sizes

**Desktop:**
- Full width layout
- Standard spacing

```tsx
<div className="overflow-x-auto">
  <table className="w-full min-w-[640px]">
    <thead>
      <tr>
        <th className="px-4 sm:px-6 py-3 text-xs">
    </thead>
    <tbody>
      <tr>
        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
```

### Forms

**Mobile:**
- Single column layout
- Full-width inputs
- Stacked buttons
- Larger touch targets

**Desktop:**
- Multi-column when appropriate
- Side-by-side buttons

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm mb-2">First Name</label>
    <input className="w-full px-4 py-3" />
  </div>
</div>

<div className="flex flex-col sm:flex-row gap-3">
  <button className="flex-1">Submit</button>
  <button>Cancel</button>
</div>
```

### Cards & Stats

**Responsive Grid:**
```tsx
// 1 column mobile → 2 columns tablet → 4 columns desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  <div className="p-4 sm:p-6">
    <div className="text-2xl sm:text-3xl">87%</div>
    <div className="text-xs sm:text-sm">Documents Compliant</div>
  </div>
</div>
```

### Filters & Actions

**Mobile:**
- Stack vertically
- Full-width select/inputs
- Grouped related filters

**Desktop:**
- Horizontal layout
- Inline filters

```tsx
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
  <div className="relative flex-1 max-w-full sm:max-w-md">
    <input type="text" />
  </div>
  <div className="flex flex-col sm:flex-row gap-3">
    <select>...</select>
    <select>...</select>
  </div>
</div>
```

## Page-Specific Implementations

### Dashboard Home (`/dashboard`)
- 1/2/4 column stats grid
- Responsive banner with stacked buttons
- Scrollable table on mobile
- 1/2 column compliance/deliveries section

### Procurement (`/dashboard/procurement`)
- Responsive quote comparison (1/3 columns)
- Multi-step form with mobile progress indicator
- Stacked filters
- Scrollable table

### Shipments (`/dashboard/shipments`)
- Scrollable shipment table
- Responsive detail view with stacked header
- Horizontal scroll tabs
- 1/2 column charts

### Compliance (`/dashboard/compliance`)
- 1/2/3 column stats
- 2/4 column jurisdiction grid
- Responsive document cards
- Stacked action buttons

### Reports (`/dashboard/reports`)
- 1/2/4 column metrics
- 1/2 column charts
- Responsive date filters
- Adaptive chart heights

### Settings (`/dashboard/settings`)
- Grid tab navigation (2/3/1 columns on mobile/tablet/desktop)
- Single column forms on mobile
- Responsive team member cards

### Traceability (`/dashboard/traceability`)
- 1/2/3 column search filters
- 2/4 column shipment info
- Timeline without line on mobile
- Stacked audit event cards

## Spacing System

Use responsive spacing throughout:

```tsx
// Padding
p-4 sm:p-6 lg:p-8        // 16px → 24px → 32px

// Gap
gap-3 sm:gap-4 lg:gap-6   // 12px → 16px → 24px

// Margins
mb-4 lg:mb-6              // 16px → 24px
```

## Testing Guidelines

### Required Test Viewports

1. **Mobile (320px - 640px)**
   - iPhone SE (375×667)
   - iPhone 12 (390×844)
   - Small Android phones

2. **Tablet (640px - 1024px)**
   - iPad Mini (768×1024)
   - iPad (820×1180)
   - Android tablets

3. **Desktop (1024px+)**
   - Laptop (1280×800)
   - Desktop (1920×1080)

### Testing Checklist

- [ ] All interactive elements are tappable (min 44x44px)
- [ ] No horizontal scroll on any page (except intended tables)
- [ ] Text is readable without zooming
- [ ] Forms are fully usable on mobile
- [ ] Navigation works smoothly
- [ ] All content is accessible
- [ ] Performance is acceptable on mobile networks

### Browser Testing

Test on:
- Safari (iOS)
- Chrome (Android)
- Chrome (Desktop)
- Firefox (Desktop)
- Edge (Desktop)

## Accessibility Considerations

### Touch Targets
- Minimum 44×44px for all interactive elements
- Adequate spacing between clickable elements (8px minimum)

### Typography
- Minimum 16px base font size (prevents zoom on iOS)
- Sufficient contrast ratios (WCAG 2.1 AA)
- Line height 1.5 for body text

### Focus States
```tsx
className="focus:outline-none focus:ring-2 focus:ring-purple-600"
```

### Screen Readers
- All images have alt text
- Form inputs have labels
- ARIA labels for icon-only buttons

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Provide appropriate sizes for different viewports
- Lazy load below-the-fold images

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting (automatic in Next.js)

### CSS
- Tailwind purges unused styles
- No custom media queries needed

## Common Pitfalls to Avoid

❌ **Fixed Widths**
```tsx
// Bad
<div className="w-[300px]">

// Good
<div className="w-full max-w-[300px]">
```

❌ **Desktop-First Styles**
```tsx
// Bad
<div className="text-lg md:text-base sm:text-sm">

// Good
<div className="text-sm sm:text-base md:text-lg">
```

❌ **Hidden Important Content**
```tsx
// Bad - hiding important content on mobile
<div className="hidden md:block">Important info</div>

// Good - adapt presentation instead
<div className="text-sm md:text-base">Important info</div>
```

❌ **Overflow Issues**
```tsx
// Bad
<div className="flex">
  <div className="min-w-[200px]">...</div>
  <div className="min-w-[200px]">...</div>
</div>

// Good
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-auto">...</div>
</div>
```

## Future Enhancements

Potential improvements for future iterations:

1. **Gesture Support**
   - Swipe to navigate between pages
   - Pull to refresh
   - Swipe to delete items

2. **Progressive Web App (PWA)**
   - Add manifest.json
   - Service worker for offline support
   - Install prompts

3. **Advanced Responsive Patterns**
   - Skeleton screens while loading
   - Infinite scroll for long lists
   - Virtual scrolling for performance

4. **Device-Specific Optimizations**
   - iOS safe area insets
   - Android system bars
   - Notch/island handling

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Responsive Images](https://nextjs.org/docs/api-reference/next/image)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Touch Target Size](https://www.nngroup.com/articles/touch-target-size/)
