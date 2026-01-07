# Nuclear Next.js

Nuclear supply chain management platform built with Next.js.

## Project Structure

This repository contains two projects:
- `NuClear/` - Original Vite-based React application (deprecated)
- `nuclear-nextjs/` - Current Next.js application (active)

## Deployment

### Vercel Deployment

This project is configured for Vercel deployment with the Next.js application located in the `nuclear-nextjs` subdirectory.

#### Option 1: Using Vercel Configuration (Recommended)

The repository includes a `vercel.json` configuration file that specifies custom build commands to install and build from the `nuclear-nextjs` subdirectory.

Simply connect your repository to Vercel and it will deploy correctly.

#### Option 2: Manual Configuration

If deploying manually or the automatic configuration doesn't work:

1. In your Vercel project settings, set the **Root Directory** to `nuclear-nextjs`
2. Set the **Framework Preset** to `Next.js`
3. Use the following build settings:
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next` (default)

### Local Development

```bash
# Option 1: Install from root (recommended)
npm run setup

# Option 2: Install directly in subdirectory
cd nuclear-nextjs
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Requirements

- Node.js >= 20.9.0
- npm or yarn

## Notes

- The `--legacy-peer-deps` flag is required due to React 19 peer dependency conflicts with some packages
- The main application is located in the `nuclear-nextjs` directory
