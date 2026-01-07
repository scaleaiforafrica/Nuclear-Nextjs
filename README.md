# Nuclear Next.js

Nuclear supply chain management platform built with Next.js.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **React**: React 19

## Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel Deployment

This project is configured for Vercel deployment. Simply connect your repository to Vercel and it will deploy automatically.

The `vercel.json` configuration file specifies the necessary build settings.

## Environment Requirements

- Node.js >= 20.9.0
- npm or yarn

## Notes

- The `--legacy-peer-deps` flag is required due to React 19 peer dependency conflicts with some packages
