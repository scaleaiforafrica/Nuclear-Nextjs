# NuClear - Nuclear Supply Chain Management

Comprehensive nuclear supply chain management platform for radiopharmaceutical delivery.

## Database Setup

This application requires a PostgreSQL database with the proper schema. For Vercel deployment with Supabase:

**Initial Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration from `migrations/001_initial_schema.sql` in Supabase SQL Editor
3. Connect Supabase to Vercel via the integration
4. Set up GitHub secrets for automatic migrations (see [MIGRATION_MANAGEMENT.md](./MIGRATION_MANAGEMENT.md))

**🚀 Automatic Migrations:**
After initial setup, all future database migrations are **automatically deployed when merged to `main`** via GitHub Actions. No manual deployment needed!

**📖 Documentation:**
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Quick setup guide
- [MIGRATION_MANAGEMENT.md](./MIGRATION_MANAGEMENT.md) - Creating and managing migrations
- [migrations/README.md](./migrations/README.md) - Detailed migration reference

## Environment Setup

This application requires Supabase environment variables to be configured:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Vercel Deployment

If you've connected Supabase via the Vercel integration, these variables should be automatically configured. If you're seeing authentication errors, try:

1. Go to your Vercel project → Settings → Environment Variables
2. Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present
3. Redeploy your application to ensure the variables are picked up

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build
```

## Tech Stack

- **Framework**: Next.js 16 (with Turbopack)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Package Manager**: Bun

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── auth/              # Authentication routes
│   └── login/             # Login page
├── components/            # React components
├── contexts/              # React contexts (Auth, etc.)
├── controllers/           # Business logic controllers
├── lib/                   # Utility libraries
│   └── supabase/         # Supabase client configuration
├── models/                # TypeScript models/types
├── services/              # External services
└── styles/                # Global styles
```

## Features

- 🔐 Secure authentication with Supabase
- 📦 Shipment tracking and management
- 📊 Compliance monitoring
- 🔍 Full traceability
- 📈 Reporting and analytics
- ⚙️ Settings and configuration

## License

Proprietary - Scale AI for Africa
