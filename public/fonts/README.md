# Font Files Directory

Place the "Erotique Regular" font files here:

## Required Files

1. **erotique-regular.woff2** (Recommended - Best compression and browser support)
2. **erotique-regular.woff** (Fallback for older browsers)
3. **erotique-regular.ttf** (Optional - Additional fallback)

## Font Information

- **Font Name**: Erotique Regular
- **Format**: Web fonts (WOFF2, WOFF)
- **Usage**: Headings and subheadings throughout the application

## Installation

1. Obtain licensed copies of the Erotique Regular font files
2. Place the font files in this directory
3. Ensure file names match exactly:
   - `erotique-regular.woff2`
   - `erotique-regular.woff`
4. The font is already configured in `/styles/globals.css`

## Licensing

Ensure you have the appropriate license for web usage of the Erotique Regular font.

## Alternative

If the Erotique Regular font is not available, the application will gracefully fall back to:
- Georgia
- Times New Roman
- System serif font

These fallback fonts are configured in `/tailwind.config.ts` under the `font-heading` family.

## Testing

After adding the font files:
1. Run `npm run build` to verify no errors
2. Check the browser console for any 404 errors related to font files
3. Inspect heading elements to confirm the font is applied

## References

See `/FONT_INSTALLATION_GUIDE.md` for detailed installation and configuration instructions.
