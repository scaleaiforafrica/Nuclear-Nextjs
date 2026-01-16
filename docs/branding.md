# Renova Brand Theme - Implementation Guide

## Overview

This document provides guidance on the Renova brand theme implementation, including migration checklist, accessibility considerations, CI integration recommendations, and self-hosted font setup instructions.

## Brand Colors

The Renova brand uses the following color palette:

- **Primary White Background**: `#ffffff` (`--color-bg`)
- **Navy**: `#153057` (`--color-navy`) - Trust & Authority
- **Gold**: `#c69c6d` (`--color-gold`) - Quality & Elegance
- **Muted Gray**: `#bec1c4` (`--color-muted`) - Secondary UI Elements

## Typography

- **Heading Font**: Playfair Display (elegant serif)
- **Body Font**: Roboto (clean sans-serif)

## Migration Checklist

### Initial Setup

- [x] Create `styles/theme.css` with CSS variables
- [x] Create `styles/fonts.css` with font configurations
- [x] Update `tailwind.config.ts` with brand colors and fonts
- [x] Update `app/layout.tsx` to import theme and font files
- [x] Add Google Fonts preconnect and import in layout

### Component Updates (To Be Done By Developers)

- [ ] Review all components for color usage
- [ ] Update components using old color variables to use new brand tokens
- [ ] Test components with new theme in light mode
- [ ] Verify all interactive states (hover, focus, active)
- [ ] Check all text contrast ratios for accessibility

### Testing

- [ ] Run visual regression tests with `npm run test:visual`
- [ ] Review generated baseline screenshots
- [ ] Verify theme consistency across all pages
- [ ] Test keyboard navigation and focus styles
- [ ] Validate with screen readers if applicable

### Font Self-Hosting (Optional)

- [ ] Download font files (see instructions below)
- [ ] Place font files in `/public/fonts/` directory
- [ ] Uncomment `@font-face` blocks in `styles/fonts.css`
- [ ] Update font paths in `@font-face` declarations
- [ ] Remove or comment out Google Fonts link in `app/layout.tsx`
- [ ] Test font loading and fallbacks

## Accessibility Guidance

### Color Contrast Requirements

**IMPORTANT**: The gold color (`#c69c6d`) has limited contrast on white backgrounds.

#### Contrast Ratios (Gold on White)
- **Small text**: ~3.1:1 (FAILS WCAG AA - requires 4.5:1)
- **Large text**: ~3.1:1 (PASSES WCAG AA - requires 3:1)

#### Usage Guidelines

✅ **DO USE gold for:**
- Large headings (18px+ bold or 24px+ regular)
- Decorative elements and accents
- Icons with text labels
- Borders and dividers
- Background fills with contrasting text

❌ **DO NOT use gold for:**
- Small body text (under 18px)
- Important labels or descriptions
- Critical UI text
- Links without additional indicators
- Form labels and input text

#### Recommended Pairings

For small text, use these color combinations instead:
- **Navy on White**: Excellent contrast (10.8:1)
- **Navy on Gold**: Good contrast for buttons/CTAs
- **White on Navy**: Excellent contrast for dark backgrounds

### Focus Styles

The theme includes accessible focus styles:
- Gold outline (`2px solid`) for keyboard navigation
- `2px` offset for clarity
- Works with reduced motion preferences

### Reduced Motion

The theme respects user preferences for reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations and transitions are minimized */
}
```

## Self-Hosting Fonts

Self-hosting fonts improves performance and privacy. Follow these steps:

### 1. Download Fonts

#### Playfair Display
- Visit: [Google Fonts - Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- Select weights: 400, 500, 600, 700
- Download and extract

#### Roboto
- Visit: [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- Select weights: 300, 400, 500, 700
- Download and extract

### 2. Organize Font Files

Create directory structure:
```
/public/fonts/
├── playfair-display/
│   ├── playfair-display-regular.woff2
│   ├── playfair-display-regular.woff
│   ├── playfair-display-medium.woff2
│   ├── playfair-display-medium.woff
│   ├── playfair-display-semibold.woff2
│   ├── playfair-display-semibold.woff
│   ├── playfair-display-bold.woff2
│   └── playfair-display-bold.woff
└── roboto/
    ├── roboto-light.woff2
    ├── roboto-light.woff
    ├── roboto-regular.woff2
    ├── roboto-regular.woff
    ├── roboto-medium.woff2
    ├── roboto-medium.woff
    ├── roboto-bold.woff2
    └── roboto-bold.woff
```

**Note**: Prefer `.woff2` format (modern, better compression). Include `.woff` as fallback.

### 3. Enable @font-face Declarations

In `styles/fonts.css`, uncomment the `@font-face` blocks and verify the paths match your file structure.

### 4. Remove Google Fonts (Optional)

Once self-hosted fonts are working:
1. Remove or comment out Google Fonts `<link>` tags in `app/layout.tsx`
2. Keep `preconnect` if you're using other Google services

### 5. Verify Font Loading

Test in browser:
- Open DevTools → Network tab
- Filter by "Font"
- Verify fonts load from `/fonts/` directory
- Check no external Google Fonts requests (if fully self-hosted)

## CI Integration Recommendations

### Visual Regression Testing in CI

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run visual tests
        run: npm run test:visual
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
          retention-days: 30
      
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-screenshots
          path: tests/visual/*.spec.ts-snapshots/
          retention-days: 30
```

### Baseline Screenshot Management

**First Run (Generate Baselines)**:
```bash
npm run test:visual
```

**Review and Commit Baselines**:
```bash
git add tests/visual/*.spec.ts-snapshots/
git commit -m "chore: add visual regression baselines"
```

**Update Baselines** (after intentional design changes):
```bash
npm run test:visual -- --update-snapshots
```

### CI Best Practices

1. **Pin Playwright version** in `package.json` for consistency
2. **Use same OS** in CI as development (e.g., Ubuntu)
3. **Store baselines** in Git for comparison
4. **Review diffs** in CI artifacts when tests fail
5. **Update baselines** only for intentional changes

## Theme Usage Examples

### Using CSS Variables

```css
.my-component {
  background-color: var(--color-bg);
  color: var(--color-navy);
  border: 1px solid var(--color-muted);
}

.my-heading {
  font-family: var(--font-heading);
  color: var(--color-navy);
}

.my-button {
  background-color: var(--color-gold);
  color: var(--color-navy);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
}
```

### Using Tailwind Classes

```jsx
// Brand colors
<div className="bg-brand-white text-brand-navy">
<button className="bg-renova-gold text-renova-navy">

// Typography
<h1 className="font-heading text-4xl">
<p className="font-body text-base">

// With semantic tokens
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
```

## Troubleshooting

### Fonts Not Loading

1. Check font file paths in `styles/fonts.css`
2. Verify fonts exist in `/public/fonts/`
3. Check browser console for 404 errors
4. Ensure `font-display: swap` for fallback behavior

### Colors Not Updating

1. Clear browser cache and hard refresh
2. Verify import order in `app/layout.tsx` (theme.css before globals.css)
3. Check CSS variable specificity in browser DevTools
4. Ensure no component-level overrides

### Visual Test Failures

1. Check if intentional design change
2. Review diff images in test results
3. Update baselines if change is expected: `npm run test:visual -- --update-snapshots`
4. Investigate if unintentional change detected

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google Fonts](https://fonts.google.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Questions or Issues?

For questions about the theme implementation or to report issues, please open an issue in the repository or contact the design team.
