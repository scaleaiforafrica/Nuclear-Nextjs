# Styling Guide - Light Theme

## Overview

This document describes the light theme styling approach for the Nuclear-Nextjs application, including the color palette, typography, design tokens, and accessibility considerations.

## Color Palette

The light theme uses the following color scheme:

### Primary Colors

- **Primary**: `#124F72` - Deep blue used for primary actions, headings, and important UI elements
  - RGB: `rgb(18, 79, 114)`
  - HSL: `hsl(200, 73%, 26%)`
  - Use for: Primary buttons, links, main navigation, key headings

- **Secondary**: `#5F5A5F` - Warm gray used for secondary content and subtle UI elements
  - RGB: `rgb(95, 90, 95)`
  - HSL: `hsl(300, 3%, 36%)`
  - Use for: Secondary buttons, borders, icons, supporting text

- **Accent**: `#67D794` - Fresh green used for highlights, success states, and calls-to-action
  - RGB: `rgb(103, 215, 148)`
  - HSL: `hsl(144, 58%, 62%)`
  - Use for: Success messages, highlights, active states, CTAs

### Neutral Colors

- **Background**: `#CBCACF` - Light gray background for main content areas
  - RGB: `rgb(203, 202, 207)`
  - HSL: `hsl(252, 5%, 80%)`
  - Use for: Page backgrounds, card backgrounds, container backgrounds

- **Text**: `#3F3029` - Dark brown for optimal readability
  - RGB: `rgb(63, 48, 41)`
  - HSL: `hsl(19, 21%, 20%)`
  - Use for: Body text, headings, labels

### Additional Colors

- **Destructive/Error**: `#D4183D` - Red for error states and destructive actions (retained from original)
- **Border**: `rgba(18, 79, 114, 0.2)` - Subtle borders derived from primary color
- **Input Background**: `rgba(203, 202, 207, 0.3)` - Semi-transparent background for inputs

## Typography

### Font Family

- **Headings**: "Erotique Regular", Georgia, Times New Roman, serif
- **Body**: System font stack for optimal performance

### Font Sizes

Following a modular scale for consistency:

- **Headings**: 
  - H1: 3.5rem (56px) desktop, 2.5rem (40px) mobile
  - H2: 2.5rem (40px) desktop, 2rem (32px) mobile
  - H3: 2rem (32px) desktop, 1.5rem (24px) mobile
  - H4: 1.5rem (24px)
  - H5: 1.25rem (20px)
  - H6: 1.125rem (18px)

- **Body**: 1rem (16px) base size
- **Small**: 0.875rem (14px)
- **Extra Small**: 0.75rem (12px)

### Font Weights

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Line Heights

- Headings: 1.2
- Body: 1.5
- Tight: 1.25
- Relaxed: 1.75

## Design Tokens

Design tokens are implemented using CSS custom properties (CSS variables) defined in `/styles/globals.css`. This approach provides:

- **Centralized Control**: Change colors site-wide from one location
- **Theme Support**: Easy switching between themes (light/dark)
- **Consistency**: Ensures consistent usage across components
- **Type Safety**: Integrated with Tailwind CSS for utility classes

### Token Structure

```css
:root {
  /* Core Colors */
  --primary: #124F72;
  --secondary: #5F5A5F;
  --accent: #67D794;
  --background: #CBCACF;
  --foreground: #3F3029;
  
  /* Semantic Colors */
  --card: #ffffff;
  --card-foreground: #3F3029;
  --muted: rgba(95, 90, 95, 0.1);
  --muted-foreground: #5F5A5F;
  
  /* Interactive States */
  --primary-hover: #0F3F5A;
  --accent-hover: #52C47F;
  
  /* Spacing & Layout */
  --radius: 0.625rem;
}
```

## Responsive Design

The styling follows mobile-first design principles:

### Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: > 1024px (lg+)

### Mobile-First Approach

1. Start with mobile styles as the base
2. Use Tailwind's responsive prefixes to add larger screen styles
3. Ensure touch targets are at least 44x44px
4. Optimize font sizes for mobile readability

### Example

```tsx
<button className="
  px-4 py-2          // Mobile spacing
  sm:px-6 sm:py-3    // Tablet spacing
  lg:px-8 lg:py-4    // Desktop spacing
  text-base          // Mobile text size
  sm:text-lg         // Tablet text size
">
  Click Me
</button>
```

## Accessibility (WCAG 2.1 Compliance)

### Color Contrast

All color combinations meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text):

- **Primary on Background**: #124F72 on #CBCACF = 5.40:1 ✓ (WCAG AA compliant)
- **Text on Background**: #3F3029 on #CBCACF = 7.74:1 ✓ (WCAG AAA compliant)
- **Accent on Background**: #67D794 on #CBCACF = 1.10:1 ✗ (decorative only - DO NOT use for text or interactive elements)
- **White on Primary**: #FFFFFF on #124F72 = 8.80:1 ✓ (WCAG AAA compliant)
- **White on Accent**: #FFFFFF on #67D794 = 1.79:1 ✗ (insufficient contrast - use accent-foreground (#3F3029) instead)
- **Text on Accent**: #3F3029 on #67D794 = 7.04:1 ✓ (WCAG AA compliant - preferred for text on accent backgrounds)
- **White on Secondary**: #FFFFFF on #5F5A5F = 6.74:1 ✓ (WCAG AA compliant)

### Best Practices

1. **Never use color alone** to convey information
2. **Focus indicators**: All interactive elements have visible focus states
3. **Touch targets**: Minimum 44x44px for mobile
4. **Text sizing**: Minimum 16px for body text
5. **Alt text**: All images have descriptive alt text
6. **Semantic HTML**: Use proper heading hierarchy
7. **Keyboard navigation**: All interactive elements are keyboard accessible
8. **Screen reader support**: ARIA labels where appropriate

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- Chrome DevTools Lighthouse
- Axe DevTools

## Performance

### CSS Optimization

- **Tailwind JIT**: Only generates used utility classes
- **PurgeCSS**: Removes unused CSS in production
- **Critical CSS**: Inline critical styles
- **Font Loading**: Use `font-display: swap` to prevent FOIT

### Best Practices

1. Avoid excessive class names
2. Use design tokens for consistency
3. Leverage Tailwind's built-in utilities
4. Minimize custom CSS
5. Use CSS containment where appropriate

## Implementation Examples

### Button Component

```tsx
// Primary Button
<button className="
  bg-primary 
  text-white 
  hover:bg-primary/90 
  px-6 py-3 
  rounded-lg 
  font-medium
  transition-colors
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2
">
  Primary Action
</button>

// Secondary Button
<button className="
  bg-secondary 
  text-white 
  hover:bg-secondary/90 
  px-6 py-3 
  rounded-lg 
  font-medium
  transition-colors
">
  Secondary Action
</button>

// Accent Button
<button className="
  bg-accent 
  text-foreground 
  hover:bg-accent/90 
  px-6 py-3 
  rounded-lg 
  font-semibold
  transition-colors
">
  Get Started
</button>
```

### Card Component

```tsx
<div className="
  bg-card 
  text-card-foreground 
  rounded-lg 
  shadow-md 
  p-6
  border 
  border-border
">
  <h3 className="font-heading text-2xl mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
```

## Migration from Previous Theme

The following changes were made from the previous theme:

1. **Background**: Changed from white (#ffffff) to light gray (#CBCACF)
2. **Primary**: Changed from near-black (#030213) to deep blue (#124F72)
3. **Accent**: Changed from light gray (#e9ebef) to fresh green (#67D794)
4. **Text**: Changed from near-black to dark brown (#3F3029)
5. **Font**: Added "Erotique Regular" for headings

### Update Checklist

When updating components:

- [ ] Replace old color references with new design tokens
- [ ] Update heading elements to use `font-heading` class
- [ ] Verify color contrast ratios
- [ ] Test responsive breakpoints
- [ ] Ensure keyboard accessibility
- [ ] Test with screen readers

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web.dev Accessibility](https://web.dev/accessibility/)
