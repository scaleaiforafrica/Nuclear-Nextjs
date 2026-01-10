# Font Installation Guide

## Erotique Regular Font Integration

This document describes the integration of the "Erotique Regular" font into the Nuclear-Nextjs application.

## Overview

The application uses the "Erotique Regular" font for headings and subheadings to match the design requirements of the light theme.

## Installation Steps

### 1. Obtain the Font Files

The "Erotique Regular" font files need to be obtained from a licensed source. Supported formats:
- `.woff2` (recommended for best performance and browser support)
- `.woff` (fallback for older browsers)
- `.ttf` (fallback)

### 2. Place Font Files

Place the font files in the `/public/fonts` directory:
```
public/
  fonts/
    erotique-regular.woff2
    erotique-regular.woff
    erotique-regular.ttf (optional)
```

### 3. Font Configuration

The font is configured in the application through:
- **CSS Variables**: Defined in `/styles/globals.css` using `@font-face`
- **Tailwind Config**: Extended in `/tailwind.config.ts` with the custom font family
- **Layout**: Applied in `/app/layout.tsx` through the body className

## Usage

### In Components

The font is automatically applied to headings through Tailwind's font family utilities:

```tsx
// Headings use the custom font
<h1 className="font-heading">My Heading</h1>

// Subheadings also use the custom font
<h2 className="font-heading">My Subheading</h2>
```

### Fallback Fonts

The font stack includes fallback options for graceful degradation:
```
font-family: 'Erotique Regular', 'Georgia', 'Times New Roman', serif;
```

## Accessibility Considerations

- **Font Size**: Minimum 16px for body text to meet WCAG 2.1 AA standards
- **Line Height**: 1.5 or greater for readability
- **Font Weight**: Normal (400) for body, medium (500-600) for headings
- **Contrast**: All text meets WCAG 2.1 AA contrast ratios against backgrounds

## Performance Optimization

- **Font Display**: Uses `font-display: swap` to prevent invisible text during loading
- **Preloading**: Critical font files are preloaded in the document head
- **Subsetting**: Consider using font subsetting tools to reduce file size
- **Compression**: WOFF2 format provides built-in compression

## Troubleshooting

### Font Not Loading

1. Check that font files are in `/public/fonts`
2. Verify file names match exactly in the CSS
3. Check browser console for 404 errors
4. Ensure correct MIME types are served

### Font Rendering Issues

1. Clear browser cache
2. Check `@font-face` syntax in `globals.css`
3. Verify font file integrity
4. Test in multiple browsers

## License

Ensure compliance with the font's license terms. Most commercial fonts require:
- Proper licensing for web use
- Attribution where required
- Compliance with usage restrictions

## Resources

- [Google Fonts](https://fonts.google.com/) - Free web fonts
- [Adobe Fonts](https://fonts.adobe.com/) - Licensed fonts with Creative Cloud
- [Font Squirrel](https://www.fontsquirrel.com/) - Free fonts for commercial use
- [MDN @font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
