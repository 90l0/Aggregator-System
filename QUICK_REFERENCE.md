# 📋 QUICK REFERENCE CARD - Complete Setup in 3 Steps

## ✅ Backend: LIVE NOW

```
https://aims-aggregator.aims-aggregator.workers.dev
```

---

## ⏳ Frontend: Complete These 3 Steps

### STEP 1️⃣: GitHub Secrets (10 min)
Link: https://github.com/90l0/Aggregator-System/settings/secrets/actions

**Copy-Paste These Values:**

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | [See instructions below] |
| `CLOUDFLARE_ACCOUNT_ID` | `757aeca7c03d238cf5897c0deb39b9cd` |
| `REACT_APP_API_URL` | `https://aims-aggregator.aims-aggregator.workers.dev` |
| `SECRET_KEY` | Generate a fresh 32-byte random hex value |

**How to get CLOUDFLARE_API_TOKEN:**
1. Go: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token" → Use template "Edit Cloudflare Workers"
3. Keep all permissions (Account Workers Scripts, Pages, D1, KV)
4. Click "Create Token"
5. Copy & paste the token value

---

### STEP 2️⃣: Connect Cloudflare Pages (5 min)
Link: https://dash.cloudflare.com/pages

**Do This:**
1. Click "Create a project" → "Connect to Git"
2. Select repo: `90l0/Aggregator-System`
3. Use these settings:
   - Production branch: `master`
   - Build command: `npm run build`
   - Build output: `frontend/build`
   - Root directory: `frontend`
   - Add env var: `REACT_APP_API_URL` = `https://aims-aggregator.aims-aggregator.workers.dev`
4. Click "Save and Deploy"

---

### STEP 3️⃣: Monitor & Verify (5 min)
Link: https://github.com/90l0/Aggregator-System/actions

**What to do:**
1. Watch the workflow run
2. Wait 3-5 minutes for completion
3. Once done, visit: https://aims-aggregator.pages.dev

---

## 🎉 DONE!

Your system is live:
- **Frontend**: https://aims-aggregator.pages.dev
- **Backend**: https://aims-aggregator.aims-aggregator.workers.dev
- **Health**: https://aims-aggregator.aims-aggregator.workers.dev/health

---

## 📞 If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| GitHub Actions fails | Check GitHub Secrets spelling |
| Pages shows 404 | Wait 2-3 min & clear cache |
| Frontend can't reach API | Check `REACT_APP_API_URL` is exact |
| Workers not responding | Run `wrangler tail` to see logs |

---

## 🔄 After Setup: How to Deploy Changes

```bash
git add .
git commit -m "your message"
git push origin master
# Done! GitHub Actions handles the rest automatically
```

---

**Total remaining time: ~20 minutes to fully production-ready! 🚀**
