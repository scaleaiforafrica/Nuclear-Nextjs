# Theme Integration Guide

This guide shows how to adopt the brand system across the app with accessibility, performance, and maintainability.

## Included
- `styles/design-tokens.json` — Source of truth for colors, spacing, typography, radii, shadows, breakpoints.
- `styles/theme.css` — Global CSS variables, base styles, components (buttons, cards, forms), and a11y patterns.
- `components/Button.tsx` — Typed React Button using the global theme classes.

## Fonts
- Headings: "The Seasons" (self-host recommended). Fallbacks provided.
- Body: Roboto via next/font/google.

Example self-host (add WOFF2 files to `public/fonts` and in your root layout/page via next/font/local):

```ts
import localFont from 'next/font/local';
export const theSeasons = localFont({
  src: [
    { path: '/fonts/TheSeasons-Regular.woff2', weight: '400', style: 'normal' }
  ],
  variable: '--font-heading'
});
```

## Usage
1) Import global theme once (App Router `app/layout.tsx` or Pages Router `_app.tsx`):
```ts
import '@/styles/theme.css';
```
2) Use components and classes:
```html
<button class="btn btn--primary btn--md">Click me</button>
<div class="card">Card content</div>
<div class="container section">Page content</div>
```

## Testing
- Unit: Vitest + Testing Library for Button (render, aria-busy, disabled, variants).
- Accessibility: Playwright smoke with screenshots and basic navigation.

## Design Guardrails
- Use #F7F8FA as page background, white surfaces for cards.
- Keep Warm Gold to ~10–15% usage.
- Avoid pure black; use #2B2B2B.
- Avoid dark-heavy sections in light theme.
