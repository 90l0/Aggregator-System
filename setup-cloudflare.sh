#!/bin/bash

# AIMS Cloudflare Deployment Setup Script

echo "🚀 AIMS Cloudflare Deployment Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node &> /dev/null || { echo "❌ Node.js not installed"; exit 1; }
command -v npm &> /dev/null || { echo "❌ npm not installed"; exit 1; }
command -v git &> /dev/null || { echo "❌ git not installed"; exit 1; }

echo "✅ Prerequisites met"
echo ""

# Install Wrangler globally
echo "📦 Installing Cloudflare CLI (Wrangler)..."
npm install -g wrangler

# Login to Cloudflare
echo ""
echo "🔐 Logging into Cloudflare..."
wrangler login

# Get account ID
echo ""
echo "📝 Getting your Cloudflare Account ID..."
ACCOUNT_ID=$(wrangler whoami | grep "Account ID" | awk '{print $NF}')
echo "Your Account ID: $ACCOUNT_ID"

# Create D1 Database
echo ""
echo "🗄️  Creating D1 Database..."
read -p "Create new D1 database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler d1 create aims-db
    echo "📝 Update wrangler.toml with the database_id"
fi

# Create KV Namespace
echo ""
echo "💾 Creating KV Namespace..."
read -p "Create new KV namespace? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler kv:namespace create CACHE
    echo "📝 Update wrangler.toml with the namespace id and preview_id"
fi

# Install dependencies
echo ""
echo "📥 Installing npm dependencies..."
npm install
cd frontend && npm install && cd ..

# Setup environment variables
echo ""
echo "🔧 Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production file..."
    read -p "Enter your PostgreSQL DATABASE_URL: " DATABASE_URL
    read -p "Enter your SECRET_KEY: " SECRET_KEY
    
    cat > .env.production << EOF
DATABASE_URL=$DATABASE_URL
SECRET_KEY=$SECRET_KEY
ENVIRONMENT=production
EOF
    echo "✅ .env.production created"
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
cd frontend && npm run build && cd ..

# Build backend
echo ""
echo "⚙️  Building backend..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update wrangler.toml with D1 and KV ids"
echo "2. Set up GitHub secrets:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID: $ACCOUNT_ID"
echo "   - SECRET_KEY"
echo "   - DATABASE_URL"
echo "   - REACT_APP_API_URL"
echo "3. Push to GitHub to trigger deployment"
echo ""
echo "🚀 Or deploy manually:"
echo "   npm run deploy             # Deploy backend"
echo "   wrangler pages deploy frontend/build  # Deploy frontend"
echo ""
