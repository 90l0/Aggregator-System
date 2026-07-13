# 🚀 AIMS Deployment Guide - Cloudflare

This guide walks you through deploying the AIMS (Aggregator Intelligence & Monitoring System) to Cloudflare.

## Architecture Overview

```
┌─────────────────────┐
│ Cloudflare Pages    │  (Frontend - React)
│ Static Site         │
└──────────┬──────────┘
           │
           ├──────────► API Requests
           │
┌──────────▼──────────┐
│ Cloudflare Workers  │  (Backend - Hono/Node.js)
│ API Endpoints       │
└──────────┬──────────┘
           │
           ├──────────► KV Store (Caching/Sessions)
           ├──────────► D1 Database (SQLite)
           └──────────► PostgreSQL (External)
```

## Prerequisites

- Cloudflare account with Workers & Pages enabled
- Node.js 18+ installed
- `npm` or `yarn` package manager
- Git configured
- GitHub account (for Pages deployment)

## Step 1: Install Cloudflare CLI

```bash
npm install -g wrangler
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 2: Configure Cloudflare Account

### Get Your Account ID
```bash
wrangler whoami
```

### Create D1 Database (Optional - for SQLite)
```bash
wrangler d1 create aims-db
```

### Create KV Namespace
```bash
wrangler kv:namespace create CACHE
```

Update `wrangler.toml` with the IDs returned.

## Step 3: Deploy Backend (Workers)

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Deploy to production
npm run deploy
```

Your backend will be available at: `https://aims-aggregator.{account}.workers.dev`

## Step 4: Deploy Frontend (Pages)

### Option A: Via GitHub (Recommended)

1. Push your repository to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to **Pages**
4. Click **Create a project** → **Connect to Git**
5. Select your repository
6. Configure build settings:
   - **Framework preset**: React
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `frontend`
7. Add environment variables if needed
8. Click **Save and Deploy**

### Option B: Manual Deployment

```bash
cd frontend
npm install
npm run build

# Deploy using Wrangler
wrangler pages deploy build
```

Your frontend will be available at: `https://aims-aggregator.pages.dev`

## Step 5: Configure Environment Variables

### In Cloudflare Dashboard (Workers):

1. Go to **Workers** → Your worker → **Settings** → **Variables**
2. Add the following environment variables:

```
DATABASE_URL = postgresql://user:password@host:5432/aims
SECRET_KEY = your-super-secret-key
ENVIRONMENT = production
```

### For KV Namespace Access:

The KV namespace is automatically available in your code as `c.env.CACHE`.

## Step 6: Connect to External PostgreSQL (Optional)

If you want to connect to your existing PostgreSQL database:

1. Ensure your PostgreSQL is accessible from the internet (or use a proxy)
2. In `wrangler.toml`, add environment variable:
   ```toml
   [env.production]
   vars = { DATABASE_URL = "postgresql://..." }
   ```
3. Update `src/index.ts` to query the database:
   ```typescript
   import postgres from 'postgres';
   const sql = postgres(c.env.DATABASE_URL);
   ```

## Step 7: Set Custom Domain

### Add Domain to Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Add your domain as a new site
3. Update your domain registrar's nameservers
4. Wait for nameserver propagation (can take up to 48 hours)

### Point Pages to Domain:

1. Go to **Pages** → Your project → **Custom domains**
2. Add your domain (e.g., `aims.yourdomain.com`)
3. Cloudflare will generate SSL certificate automatically

## Step 8: Deploy Frontend API Integration

Update `frontend/src/config.ts` (or similar):

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://aims-aggregator.workers.dev';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

Set environment variable in Cloudflare Pages:
```
REACT_APP_API_URL=https://aims-aggregator.workers.dev
```

## Step 9: Monitor & Scale

### View Logs

```bash
# Stream live logs from your worker
wrangler tail

# View specific worker logs
wrangler logs
```

### Set Up Analytics

In Cloudflare Dashboard:
- **Pages** → Your project → **Analytics**
- **Workers** → Your worker → **Analytics**

### Enable Caching

Cloudflare automatically caches your Pages. For optimal performance:

1. Go to **Caching** → **Cache Rules**
2. Set cache TTL for API endpoints
3. Configure cache purge on deployment

## Troubleshooting

### CORS Issues

If you see CORS errors, they're already handled in the Worker. If issues persist:

```typescript
// In src/index.ts
app.use('*', cors({
  origin: 'https://your-domain.com',  // Add your domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### Database Connection Errors

- Ensure PostgreSQL is publicly accessible or use a proxy
- Check firewall rules allow Cloudflare IP ranges
- Verify `DATABASE_URL` environment variable is set correctly

### Deployment Fails

```bash
# Clear cache and redeploy
npm run build
wrangler deploy --force

# For Pages
cd frontend && npm run build
wrangler pages deploy build --force
```

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL/TLS certificate active (automatic with Cloudflare)
- [ ] Environment variables set for production
- [ ] Database backups enabled
- [ ] Monitoring and logging configured
- [ ] CORS origin restricted to your domain
- [ ] Rate limiting enabled on Workers
- [ ] Error tracking set up (Sentry, Datadog, etc.)
- [ ] Performance monitoring active

## Scaling Considerations

- **Workers**: Automatically scales globally across Cloudflare's network
- **Pages**: CDN-distributed, cached at edge
- **Database**: Consider upgrading PostgreSQL plan or adding read replicas
- **KV Store**: Use for distributed caching and session storage

## Cost Estimation

- **Workers**: Free tier includes 100k requests/day
- **Pages**: Free tier includes unlimited deployments
- **D1**: Database pricing based on storage and operations
- **Custom Domain**: Requires Cloudflare paid plan

## Next Steps

1. Monitor performance metrics
2. Set up alerting for errors
3. Implement feature flags using Cloudflare KV
4. Add authentication layer (JWT tokens)
5. Set up CI/CD pipeline for automated deployments

## Support & Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Hono Framework Docs](https://hono.dev/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/cli-wrangler/)
