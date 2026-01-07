# Vercel Deployment Configuration Guide

## Deployment

This Next.js application is configured for seamless Vercel deployment.

### Configuration

The repository includes a `vercel.json` configuration file:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Next.js configuration
3. Deploy!

### Important Notes

#### Legacy Peer Dependencies
The `--legacy-peer-deps` flag is required because the project uses React 19, which has peer dependency conflicts with some packages (notably `react-day-picker@8.10.1` which expects React 18).

## Verification

After deployment, verify that:
1. The homepage loads correctly at your Vercel URL
2. Navigation to `/dashboard` works
3. No 404 errors occur
4. Static assets load properly

## Troubleshooting

### If build fails:

1. **Install Issues**: Make sure `--legacy-peer-deps` is used in the install command
2. **Node Version**: Verify Node.js version is >= 20.9.0
3. **Environment Variables**: Check if any required environment variables are missing

## Local Development

To develop locally:

```bash
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
