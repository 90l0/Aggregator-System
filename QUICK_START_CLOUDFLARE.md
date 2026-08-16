# ⚡ Quick Start - Cloudflare Deployment

Follow these steps to deploy AIMS to Cloudflare in 10 minutes.

## 1. Prerequisites ✅

- Cloudflare account (free tier works)
- GitHub account
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`

## 2. Authenticate with Cloudflare

```bash
wrangler login
```

Your browser will open. Authorize the CLI.

## 3. Get Your Account ID

```bash
wrangler whoami
# Look for: "Account ID: xxxxxxxxxxxx"
```

Save this ID for later.

## 4. Create Databases & Namespaces

```bash
# Create D1 Database
wrangler d1 create aims-db

# Create KV Namespace (for caching)
wrangler kv:namespace create CACHE
wrangler kv:namespace create CACHE --preview
```

Copy the IDs returned into `wrangler.toml`.

## 5. Set Up Environment Variables

Create `.env.production`:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/aims
SECRET_KEY=your-super-secret-key-generate-one
```

## 6. Deploy Backend (Workers)

```bash
npm install
npm run deploy
```

Your backend is now live at: `https://aims-aggregator.{account}.workers.dev`

## 7. Deploy Frontend (Pages)

### Option A: Via GitHub (Automatic) - RECOMMENDED

```bash
# Push to GitHub
git add .
git commit -m "Setup Cloudflare deployment"
git push origin master
```

Then:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Pages** → **Create project** → **Connect to Git**
3. Select this repository
4. Configure:
   - Framework: React
   - Build command: `npm run build`
   - Build output: `build`
   - Root directory: `frontend`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://aims-aggregator.workers.dev
   ```
6. Deploy!

### Option B: Manual Deployment

```bash
cd frontend
npm install
npm run build
wrangler pages deploy build
```

## 8. Add Custom Domain (Optional)

1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Wait 24-48 hours for propagation
4. Go to **Pages** → Your project → **Custom domains**
5. Add your domain

## 9. Verify Deployment

```bash
# Test backend
curl https://aims-aggregator.workers.dev/health

# Test frontend (after deployment)
# Open in browser: https://aims-aggregator.pages.dev
```

## 10. Set Up GitHub Secrets (for CI/CD)

Go to your GitHub repo → Settings → Secrets and add:

```
CLOUDFLARE_API_TOKEN         # Get from Cloudflare Dashboard
CLOUDFLARE_ACCOUNT_ID        # From step 3
SECRET_KEY                   # Your secret key
DATABASE_URL                 # Your PostgreSQL URL
REACT_APP_API_URL            # https://aims-aggregator.workers.dev
```

## That's It! 🎉

Your system is now deployed on Cloudflare!

### Dashboard Links
- Frontend: https://aims-aggregator.pages.dev
- Backend: https://aims-aggregator.workers.dev/health
- Admin: https://dash.cloudflare.com

### Next Steps
- Monitor logs: `wrangler tail`
- View analytics in Cloudflare Dashboard
- Set up error tracking (Sentry, etc.)
- Configure caching rules
- Scale as needed (it's automatic!)

## Troubleshooting

### CORS Errors?
Frontend can't reach backend - check REACT_APP_API_URL is correct

### Database Connection Failed?
- Verify DATABASE_URL in environment variables
- Check PostgreSQL is publicly accessible
- Test connection: `psql $DATABASE_URL`

### Pages Not Deploying?
- Check GitHub Actions logs
- Verify CLOUDFLARE_API_TOKEN is valid
- Check build directory matches `wrangler.toml`

### Workers Not Responding?
```bash
wrangler tail              # View live logs
npm run dev               # Test locally
npm run deploy --force    # Force redeploy
```

Need help? See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed guide.
