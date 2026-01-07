# Vercel Deployment Configuration Guide

## Problem Statement

When deploying this repository to Vercel, you may encounter a `404: NOT_FOUND` error with a code like:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cpt1::j5kxl-1767786255320-d3731dbd73e3
```

This error occurs because the Next.js application is located in the `nuclear-nextjs` subdirectory, not at the repository root.

## Solution

This repository has been configured with the following files to fix the deployment issue:

### 1. `vercel.json`
Located at the repository root, this file tells Vercel how to build and deploy the application from the subdirectory:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd nuclear-nextjs && npm install --legacy-peer-deps",
  "buildCommand": "cd nuclear-nextjs && npm run build",
  "devCommand": "cd nuclear-nextjs && npm run dev",
  "framework": "nextjs",
  "outputDirectory": "nuclear-nextjs/.next"
}
```

### 2. `package.json` (Root)
A monorepo-style package.json at the root that provides workspace configuration:

```json
{
  "name": "nuclear-nextjs-monorepo",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["nuclear-nextjs"],
  "scripts": {
    "dev": "cd nuclear-nextjs && npm run dev",
    "build": "cd nuclear-nextjs && npm run build",
    "start": "cd nuclear-nextjs && npm run start"
  }
}
```

### 3. `.vercelignore`
Excludes unnecessary directories from the deployment:

```
NuClear/
.vscode/
.kiro/
```

## Deployment Steps

### Automatic Deployment (Recommended)

With the configuration files in place, simply:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Deploy!

### Manual Configuration (Alternative)

If you prefer to configure manually in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to **Settings** > **General**
3. Set **Root Directory** to `nuclear-nextjs`
4. Set **Framework Preset** to `Next.js`
5. Under **Build & Development Settings**:
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next` (default)
6. Deploy

## Important Notes

### Legacy Peer Dependencies
The `--legacy-peer-deps` flag is required because the project uses React 19, which has peer dependency conflicts with some packages (notably `react-day-picker@8.10.1` which expects React 18).

### Monorepo Structure
This repository contains:
- `NuClear/` - Original Vite-based React app (deprecated)
- `nuclear-nextjs/` - Current Next.js application (active)

Only the `nuclear-nextjs` directory is deployed to production.

## Verification

After deployment, verify that:
1. The homepage loads correctly at your Vercel URL
2. Navigation to `/dashboard` works
3. No 404 errors occur
4. Static assets load properly

## Troubleshooting

### If you still get 404 errors:

1. **Check Build Logs**: Ensure the build completed successfully
2. **Verify Root Directory**: In Vercel settings, confirm the root directory is set to `nuclear-nextjs`
3. **Check Framework Detection**: Ensure Vercel detected it as a Next.js project
4. **Review Output Directory**: Should be `nuclear-nextjs/.next`

### If build fails:

1. **Install Issues**: Make sure `--legacy-peer-deps` is used in the install command
2. **Node Version**: Verify Node.js version is >= 20.9.0
3. **Environment Variables**: Check if any required environment variables are missing

## Local Development

To develop locally:

```bash
cd nuclear-nextjs
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Additional Resources

- [Vercel Documentation - Monorepos](https://vercel.com/docs/monorepos)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
