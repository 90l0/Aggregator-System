# 🚀 GitHub Actions Deployment Setup

Your backend is now live! Let's set up GitHub Actions for automated frontend deployment.

## ✅ Current Status

**Backend (Workers)**
- ✅ Deployed: https://aims-aggregator.aims-aggregator.workers.dev
- ✅ Database: D1 (feaedfb7-52ed-463d-996a-3c9466bcc7ac)
- ✅ KV Cache: b1482d1ae6e94efb8417eb8838ddb769

**Frontend (Pages)**
- ⏳ Ready for deployment

---

## 📋 Step 1: Push Code to GitHub

```bash
# Commit all changes
git add .
git commit -m "feat: Configure Cloudflare deployment

- Set up Wrangler with D1 database and KV namespace
- Update frontend API configuration
- Configure GitHub Actions workflow
- Production backend deployed

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Push to master branch
git push origin master
```

---

## 🔑 Step 2: Configure GitHub Secrets

Go to your repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add these:

### Required Secrets

**CLOUDFLARE_API_TOKEN**
- Get from: https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token" → "Use template" → "Edit Cloudflare Workers"
- Permissions needed:
  - Account Workers Scripts: Edit
  - Cloudflare Pages: Edit
  - D1: Edit
  - KV: Edit

**CLOUDFLARE_ACCOUNT_ID**
- Value: `757aeca7c03d238cf5897c0deb39b9cd`

**REACT_APP_API_URL**
- Value: `https://aims-aggregator.aims-aggregator.workers.dev`

**SECRET_KEY**
- Value: Generate a fresh 32-byte random hex value

---

## 🔄 Step 3: Verify Workflow File

Check `.github/workflows/deploy-cloudflare.yml` exists and contains:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - master
      - production
```

This means deployment happens automatically on:
- Push to `master` branch
- Push to `production` branch

---

## 🎯 Step 4: Trigger Deployment

After pushing to GitHub:

1. Go to your repository
2. Click **Actions** tab
3. Look for "Deploy to Cloudflare" workflow
4. Watch it run (should take 3-5 minutes)

**Workflow steps:**
1. Build backend
2. Deploy backend to Workers
3. Build frontend
4. Deploy frontend to Pages
5. Notify on completion

---

## 📊 Deployment URLs After Setup

Once GitHub Actions completes:

**Frontend (React)**
- `https://aims-aggregator.pages.dev`

**Backend (API)**
- `https://aims-aggregator.aims-aggregator.workers.dev`
- Health: `/health`
- Status: `/api/v1/status`
- Root: `/api`

**Frontend API Config**
- Automatically uses: `https://aims-aggregator.aims-aggregator.workers.dev`
- Configurable via `REACT_APP_API_URL` environment variable

---

## 🐛 Troubleshooting

### GitHub Actions Failed?

1. Click the failed workflow
2. Check logs for errors
3. Common issues:
   - Missing or invalid GitHub secrets
   - Cloudflare token expired
   - Repository not connected

### Frontend Deployed but Can't Reach API?

1. Check network tab in browser dev tools
2. Verify `REACT_APP_API_URL` is correct
3. Check Cloudflare Workers logs: `wrangler tail`

### Want to Deploy Manually?

```bash
cd frontend && npm run build
wrangler pages deploy build
```

---

## 🔄 Making Changes

After setup, just:
1. Make code changes
2. Commit: `git commit -m "your message"`
3. Push: `git push origin master`
4. GitHub Actions automatically deploys!

No manual deployment needed.

---

## ✅ Next Steps

1. Push code to GitHub
2. Set GitHub Secrets (see Step 2 above)
3. Check Actions tab for deployment
4. Once complete, visit: https://aims-aggregator.pages.dev

🎉 Done!
