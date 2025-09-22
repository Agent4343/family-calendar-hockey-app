# 🚀 Deployment Guide - Family Calendar App

This guide will help you deploy your Family Calendar app to GitHub and host it on Vercel.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account
- Vercel account (free)
- Your app code ready

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Family Calendar App"
```

### 1.2 Verify Required Files
Make sure these files are in your project:
- ✅ `README.md` - Project documentation
- ✅ `package.json` - Dependencies and scripts
- ✅ `vercel.json` - Vercel configuration
- ✅ `.gitignore` - Files to ignore in Git
- ✅ `LICENSE` - MIT license file
- ✅ `.github/workflows/deploy.yml` - GitHub Actions (optional)

## 🐙 Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub
1. Go to https://github.com
2. Click "New repository" or use the "+" menu
3. Repository name: `family-calendar-app` (or your preferred name)
4. Description: `📅 Family Calendar App with SMS notifications for iPad and iPhone`
5. Set to **Public** (recommended) or Private
6. **Don't** initialize with README, .gitignore, or license (we already have them)
7. Click "Create repository"

### 2.2 Connect Local Repository to GitHub
```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOURUSERNAME/family-calendar-app.git

# Replace YOURUSERNAME with your actual GitHub username
```

### 2.3 Push Code to GitHub
```bash
# Push your code to GitHub
git branch -M main
git push -u origin main
```

## ☁️ Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to https://vercel.com
2. Sign up/login (can use your GitHub account)
3. Click "New Project"
4. Import your `family-calendar-app` repository
5. Vercel will automatically detect it's a Next.js project

### 3.2 Configure Build Settings
Vercel should auto-detect these settings:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build --no-lint`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next` (default)

If not auto-detected, set them manually.

### 3.3 Environment Variables (Optional)
Add these in Vercel's dashboard under "Environment Variables" if you want SMS functionality:

#### For FREE Email-to-SMS:
```bash
EMAIL_API_KEY=your_sendgrid_or_ses_api_key
FROM_EMAIL=your_verified_sender@yourdomain.com
```

#### For Twilio Premium SMS:
```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_phone_number_here
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Get your live URL: `https://your-app-name.vercel.app`

## 🎯 Step 4: Configure Your Live App

### 4.1 Test Basic Functionality
1. Open your Vercel URL
2. Add a family member
3. Create a test event
4. Verify calendar displays correctly

### 4.2 Set Up SMS (if desired)
1. Click "SMS" button in your live app
2. Choose your SMS method:
   - **FREE**: Email-to-SMS (requires email service setup)
   - **Premium**: Twilio (requires account + $1/month phone number)
3. Configure family phone numbers
4. Test with your own phone number first

### 4.3 Add to iPhone/iPad Home Screen
1. Open your Vercel URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Family Calendar"
5. Tap "Add"

## 🔄 Step 5: Set Up Automatic Deployments

Every time you push code to your GitHub `main` branch, Vercel will automatically:
1. Build your app
2. Deploy the new version
3. Update your live URL

### Update Process:
```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main
# Vercel automatically deploys in ~2 minutes
```

## 🌐 Custom Domain (Optional)

### 5.1 Add Your Domain
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your domain (e.g., `familycalendar.yourdomain.com`)
4. Follow DNS setup instructions

### 5.2 SSL Certificate
- Vercel automatically provides free SSL certificates
- Your app will be accessible via `https://`

## 📱 SMS Service Setup (Detailed)

### Option A: FREE Email-to-SMS Setup

#### A.1 Choose Email Service
**SendGrid (Recommended)**:
1. Sign up at https://sendgrid.com
2. Verify your sender email
3. Get API key from Settings > API Keys
4. Free tier: 100 emails/day (100 SMS/day)

**AWS SES**:
1. Sign up for AWS account
2. Set up SES in your region
3. Verify sender email
4. Get access keys
5. Free tier: 200 emails/day

#### A.2 Add to Vercel
1. Go to your Vercel project dashboard
2. Settings > Environment Variables
3. Add:
   ```
   EMAIL_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@yourdomain.com
   ```
4. Redeploy your app

#### A.3 Configure in App
1. Open your live app
2. Click "SMS" button
3. Select "Email-to-SMS (Free)"
4. Add family member phone numbers
5. Select their carriers (Verizon, AT&T, etc.)
6. Test with your own number

### Option B: Twilio Premium Setup

#### B.1 Create Twilio Account
1. Sign up at https://twilio.com
2. Verify your phone number
3. Get $15 free trial credit

#### B.2 Buy Phone Number
1. In Twilio Console, go to Phone Numbers
2. Buy a number (~$1/month)
3. Note your Account SID and Auth Token

#### B.3 Add to Vercel
```
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

#### B.4 Configure in App
1. Select "Twilio (Premium)" in SMS settings
2. Enter your credentials
3. Test messaging
4. Add family member phone numbers

## 🐛 Troubleshooting

### Build Errors
- **Error**: `Module not found`
  - **Solution**: Run `pnpm install` locally to check dependencies
- **Error**: `Build timeout`
  - **Solution**: Check vercel.json configuration

### SMS Issues
- **Email-to-SMS not working**: Verify email service credentials and sender verification
- **Twilio SMS failed**: Check account balance and phone number format (+1234567890)
- **Wrong carrier**: Update family member carrier selection

### Performance
- **Slow loading**: Enable Vercel's Edge Network (automatic)
- **Large bundle size**: Vercel automatically optimizes Next.js builds

## 📊 Monitoring

### Vercel Analytics (Free)
1. Enable in your Vercel dashboard
2. Track page views and performance
3. Monitor deployment success/failures

### Usage Monitoring
- **Email-to-SMS**: Monitor your email service quota
- **Twilio**: Check usage and billing in Twilio console

## 🔒 Security Considerations

- ✅ All sensitive API keys stored as environment variables
- ✅ No hardcoded secrets in code
- ✅ HTTPS enforced by Vercel
- ✅ Phone numbers stored locally only
- ✅ No user data collection or tracking

## 🎉 You're Live!

Your Family Calendar app is now:
- 🌐 **Live on the internet** at your Vercel URL
- 🔄 **Auto-deploying** from GitHub
- 📱 **Ready for your family** to use on all devices
- 💬 **SMS-enabled** (if configured)
- 🏠 **Perfect for your kitchen iPad**

### Share with Your Family
Send your family members the link and have them add it to their home screens for the best experience!

---

**Need help?** Check the main README.md or create an issue in your GitHub repository.