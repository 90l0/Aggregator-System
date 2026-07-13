# 🔧 AIMS Cloudflare Deployment - Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Authentication Issues

#### `wrangler login` fails
**Symptom**: "Error: Could not authenticate"
```bash
# Solution: Clear cache and retry
wrangler logout
rm ~/.wrangler/config.toml  # Or %APPDATA%\.wrangler on Windows
wrangler login
```

#### API Token Invalid
**Symptom**: "Invalid API token" during deployment
```bash
# Solution: Regenerate token
1. Go to Cloudflare Dashboard → Account Settings → API Tokens
2. Delete old token
3. Create new token with scopes:
   - Account Workers Scripts: Edit
   - Cloudflare Pages: Edit
4. Re-export or update GitHub secret
```

---

### 🔴 Database Issues

#### D1 Database Not Found
**Symptom**: "Database not found" error
```bash
# Solution: Check configuration
1. Verify in wrangler.toml: [[d1_databases]]
2. Confirm database_id is correct
3. Check database exists:
   wrangler d1 list
```

#### PostgreSQL Connection Fails
**Symptom**: "Could not connect to database"
```bash
# Solution: Test connection locally
1. Verify DATABASE_URL format:
   postgresql://user:password@host:port/database
2. Test locally:
   psql $DATABASE_URL -c "SELECT 1;"
3. Check firewall allows Cloudflare IPs:
   https://www.cloudflare.com/ips/
4. Ensure database is publicly accessible or use proxy
```

---

### 🔴 Deployment Issues

#### Workers Deployment Fails
**Symptom**: "Error deploying to Workers"
```bash
# Solution: Debug step by step
1. Clear build cache:
   rm -rf dist node_modules
   npm install
   
2. Type check first:
   npm run type-check
   
3. Build locally:
   npm run build
   
4. Deploy with verbose:
   npm run deploy -- --verbose
   
5. Check logs:
   wrangler tail
```

#### Pages Deployment Fails
**Symptom**: GitHub Actions workflow fails
```
# Check the workflow log in GitHub Actions tab
1. Go to Actions → Deploy to Cloudflare
2. Click on failed job
3. Scroll down to see error
4. Common causes:
   - Missing REACT_APP_API_URL environment variable
   - Build directory incorrect in wrangler.toml
   - npm run build fails (check React code)
```

**Fix Build Issues**:
```bash
cd frontend
npm install
npm run build  # Check for errors
npm run test   # Run tests
```

---

### 🔴 CORS Issues

#### Frontend Can't Reach Backend
**Symptom**: "Access to XMLHttpRequest blocked by CORS"
```bash
# Solution: Check configuration

# 1. Verify API URL in frontend:
# frontend/src/api.ts or similar
const API_URL = 'https://aims-aggregator.workers.dev'

# 2. Verify CORS is enabled in backend:
# src/index.ts
app.use('*', cors({
  origin: '*',  // or your specific domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

# 3. Deploy backend:
npm run deploy

# 4. Test:
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     https://aims-aggregator.workers.dev/health
```

#### CORS Works Locally But Not Production
**Solution**: Check origin URL
```typescript
app.use('*', cors({
  origin: 'https://aims-aggregator.pages.dev',  // Specific origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### 🔴 Performance Issues

#### API Endpoints Slow
**Symptom**: Requests take >5 seconds
```bash
# Solution: Check and optimize

1. Check worker logs:
   wrangler tail
   
2. View analytics:
   Cloudflare Dashboard → Workers → Analytics
   
3. Enable KV caching:
   const cached = await c.env.CACHE.get('key');
   
4. Check database queries
5. Enable Cloudflare compression
```

#### Frontend Loads Slowly
**Symptom**: Pages take >3 seconds to load
```bash
# Solution: Optimize

1. Check build size:
   cd frontend && npm run build
   ls -lh build/static/

2. Enable Pages caching:
   Cloudflare Dashboard → Pages → Build Settings
   
3. Clear cache:
   Pages → Your Project → Environment
   
4. Check browser cache:
   Ctrl+Shift+Delete (Chrome) or Cmd+Shift+Delete (Safari)
```

---

### 🔴 Environment Variable Issues

#### Variables Not Available in Worker
**Symptom**: `c.env.SECRET_KEY` is undefined
```bash
# Solution: Configure properly

1. Set in .env.production:
   SECRET_KEY=your-key

2. In wrangler.toml:
   [env.production]
   vars = { SECRET_KEY = "your-key" }

3. Or use Cloudflare Dashboard:
   Workers → Your Worker → Settings → Variables

4. Test locally:
   wrangler dev --env production
```

#### Frontend Environment Variables Missing
**Symptom**: process.env.REACT_APP_* is undefined
```bash
# Solution: Ensure correct naming

1. Must start with REACT_APP_:
   ✅ REACT_APP_API_URL
   ❌ API_URL
   
2. Build with environment:
   REACT_APP_API_URL=https://... npm run build
   
3. In Cloudflare Pages:
   Settings → Environment Variables
   Add: REACT_APP_API_URL
```

---

### 🔴 GitHub Actions Issues

#### Workflow Hangs
**Symptom**: GitHub Actions job never completes
```bash
# Solution: Check and cancel

1. Go to Actions tab
2. Click on hanging workflow
3. Click "Cancel workflow"
4. Check if any step needs input/approval
5. Review logs for stuck processes
```

#### Insufficient Permissions
**Symptom**: "Permission denied" in workflow
```bash
# Solution: Verify token permissions

1. Cloudflare Dashboard → API Tokens
2. Edit token → Check all required scopes are enabled:
   ✅ Account Workers Scripts: Edit
   ✅ Cloudflare Pages: Edit
   ✅ D1: Edit
   ✅ KV: Edit
   ✅ Zone: Edit

3. Update GitHub secret with new token
```

#### Secret Not Found
**Symptom**: "Secret not found in environment"
```bash
# Solution: Verify secret setup

1. GitHub repo → Settings → Secrets
2. Verify secret exists and is named correctly
3. Secrets are case-sensitive!
   CLOUDFLARE_API_TOKEN ≠ cloudflare_api_token
4. Update workflow if needed
```

---

### 🔴 DNS & Domain Issues

#### Domain Not Pointing to Cloudflare
**Symptom**: 404 error or timeout when visiting domain
```bash
# Solution: Verify DNS setup

1. Nameservers set correctly:
   nslookup -type=NS yourdomain.com
   # Should show: ns1.cloudflare.com, ns2.cloudflare.com

2. Wait for propagation:
   # Can take 24-48 hours

3. Check DNS records:
   Cloudflare Dashboard → DNS → Records
   
4. For Pages, ensure CNAME record:
   Type: CNAME
   Name: www
   Target: aims-aggregator.pages.dev
```

#### SSL Certificate Not Issued
**Symptom**: "Not Secure" warning in browser
```bash
# Solution: Wait for certificate

1. Cloudflare auto-issues certs (usually quick)
2. Check status:
   Cloudflare Dashboard → SSL/TLS → Overview
3. If stuck, try:
   - Pages: Purge Cache → Purge Everything
   - Try HTTPS in browser address bar
   - Wait 30 minutes and try again
```

---

### 🟡 Warning: Slow Initial Response

**Issue**: First request takes 5-10 seconds
**Cause**: Cloudflare Workers cold start
**Solution**: Normal behavior, subsequent requests are fast

```bash
# Warm up the worker
for i in {1..5}; do curl https://aims-aggregator.workers.dev/health; done
```

---

## Quick Diagnostic Script

Run this to diagnose your setup:

```bash
#!/bin/bash
echo "🔍 Diagnosing AIMS Cloudflare Setup..."
echo ""

# Check CLI
echo -n "✓ Wrangler installed: "
wrangler --version || echo "❌ Not installed"

# Check auth
echo -n "✓ Wrangler authenticated: "
wrangler whoami > /dev/null && echo "✅" || echo "❌"

# Check config
echo -n "✓ wrangler.toml exists: "
test -f wrangler.toml && echo "✅" || echo "❌"

# Check backend files
echo -n "✓ Backend files: "
test -f src/index.ts && echo "✅" || echo "❌"

# Check frontend
echo -n "✓ Frontend files: "
test -d frontend && echo "✅" || echo "❌"

# Check deployment docs
echo -n "✓ Deployment docs: "
test -f DEPLOYMENT_SUMMARY.md && echo "✅" || echo "❌"

echo ""
echo "🔗 Next: Follow DEPLOYMENT_SUMMARY.md"
```

---

## Getting Help

1. **Check Logs**:
   ```bash
   wrangler tail
   ```

2. **Verbose Mode**:
   ```bash
   wrangler deploy --verbose
   npm run build -- --verbose
   ```

3. **Community**:
   - [Cloudflare Discord](https://discord.gg/cloudflaredev)
   - [Hono Discussions](https://github.com/honojs/hono/discussions)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/cloudflare-workers)

4. **Support**:
   - GitHub Issues: Create detailed issue with logs
   - Cloudflare Support: For account/billing issues
