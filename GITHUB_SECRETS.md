# GitHub Secrets Template for AIMS Cloudflare Deployment

This file documents the secrets you need to set up in your GitHub repository for automated deployment.

## How to Add Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret below

## Required Secrets

### CLOUDFLARE_API_TOKEN
**Description**: API token for Cloudflare authentication
**How to get**:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Account Settings → API Tokens
3. Create Token → Custom token
4. Permissions:
   - Account Workers Scripts: Edit
   - Cloudflare Pages: Edit
   - D1: Edit
   - KV: Edit
5. Copy and paste the token

### CLOUDFLARE_ACCOUNT_ID
**Description**: Your Cloudflare account ID
**How to get**:
```bash
wrangler whoami
# Look for "Account ID: xxxxxxxx"
```

### SECRET_KEY
**Description**: JWT secret key for API authentication
**How to generate**:
```bash
# Generate a secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### DATABASE_URL
**Description**: PostgreSQL connection string
**Format**: `postgresql://user:password@host:port/database`
**Example**: `postgresql://admin:secretpass@db.example.com:5432/aims`

### REACT_APP_API_URL
**Description**: Backend API URL for frontend
**Value**: `https://aims-aggregator.workers.dev`
(Replace with your custom domain if applicable)

## Optional Secrets

### SENTRY_DSN
**Description**: Sentry error tracking
**How to get**: Create Sentry account and project

### SLACK_WEBHOOK_URL
**Description**: For deployment notifications
**How to get**: Create incoming webhook in Slack workspace

## Verification Script

Run this to verify all secrets are set:

```bash
#!/bin/bash
SECRETS=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID" "SECRET_KEY" "DATABASE_URL" "REACT_APP_API_URL")

for secret in "${SECRETS[@]}"; do
  if gh secret list | grep -q "^$secret"; then
    echo "✅ $secret is set"
  else
    echo "❌ $secret is NOT set"
  fi
done
```

## Security Best Practices

- ⚠️ Never commit secrets to git
- 🔐 Rotate API tokens regularly
- 📝 Use strong, random SECRET_KEY
- 🔒 Restrict database access to Cloudflare IPs only
- 🛡️ Enable 2FA on Cloudflare account

## Testing Secrets

After setting secrets, test the workflow:

1. Make a commit and push to main
2. Go to Actions tab in GitHub
3. Check "Deploy to Cloudflare" workflow
4. Verify all jobs pass

If jobs fail:
- Check workflow logs for error messages
- Verify secret values are correct
- Ensure Cloudflare account has proper permissions
