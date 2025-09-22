#!/bin/bash

# 🚀 Family Calendar App - Quick Setup Script
# This script helps you get started quickly with the Family Calendar App

set -e

echo "🎯 Family Calendar App Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
elif command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install
else
    echo "Using npm..."
    npm install
fi

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

echo -e "${BLUE}🔨 Step 2: Building the application...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm run build --no-lint
elif command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi

echo -e "${GREEN}✅ Application built successfully!${NC}"

echo -e "${BLUE}🔧 Step 3: Setting up git repository (if needed)...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized!${NC}"
else
    echo -e "${YELLOW}⚠️  Git repository already exists.${NC}"
fi

echo -e "${BLUE}📝 Step 4: Creating initial commit (if needed)...${NC}"
if git diff --cached --quiet && git diff --quiet 2>/dev/null; then
    git add .
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit.${NC}"
    else
        git commit -m "Initial commit: Family Calendar App with SMS notifications" || true
        echo -e "${GREEN}✅ Initial commit created!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Repository has uncommitted changes. Skipping commit.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "===================="
echo ""
echo "Your Family Calendar App is ready! Here's what you can do next:"
echo ""
echo -e "${BLUE}🏃 Quick Start:${NC}"
if command -v pnpm &> /dev/null; then
    echo "  pnpm start                 # Start production server"
    echo "  pnpm run dev              # Start development server"
else
    echo "  npm start                 # Start production server"  
    echo "  npm run dev              # Start development server"
fi
echo ""
echo -e "${BLUE}📱 Access the App:${NC}"
echo "  Local:     http://localhost:3000"
echo ""
echo -e "${BLUE}🐙 Deploy to GitHub:${NC}"
echo "  1. Create repository on GitHub"
echo "  2. git remote add origin https://github.com/USERNAME/family-calendar-app.git"
echo "  3. git push -u origin main"
echo ""
echo -e "${BLUE}☁️  Deploy to Vercel:${NC}"
echo "  1. Go to https://vercel.com"
echo "  2. Import your GitHub repository" 
echo "  3. Deploy automatically!"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "  README.md       - Project overview and features"
echo "  DEPLOYMENT.md   - Detailed deployment guide"
echo ""
echo -e "${BLUE}🔧 SMS Configuration:${NC}"
echo "  - Open app and click 'SMS' button"
echo "  - Choose FREE email-to-SMS or Twilio premium"
echo "  - Add family phone numbers"
echo "  - Test messaging functionality"
echo ""
echo -e "${GREEN}Happy organizing! 📅✨${NC}"