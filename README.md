# 📅 Family Calendar App

A comprehensive family calendar application optimized for iPad kitchen displays and all Apple devices, featuring SMS notifications, event management, and real-time synchronization.

## 🌟 Features

### 📱 **Cross-Device Experience**
- **iPad-Optimized**: Perfect for always-on kitchen displays
- **iPhone-Ready**: Mobile-first responsive design with bottom navigation
- **PWA Support**: Add to home screen for app-like experience
- **Offline Mode**: Works without internet connection

### 👨‍👩‍👧‍👦 **Family Management**
- **Multi-Member Support**: Color-coded family member profiles
- **Event Assignment**: Assign events to specific family members
- **Family Filters**: Show/hide events by family member
- **Emergency Contacts**: Priority notifications for urgent events

### 📅 **Calendar Features**
- **Month/Week Views**: Intuitive calendar navigation
- **Event Management**: Create, edit, delete, and duplicate events
- **Recurring Events**: Daily, weekly, monthly recurring options
- **Event Categories**: Organize by type (work, school, personal, etc.)
- **Quick Actions**: Fast event creation and editing

### 🔔 **Smart Notifications**
- **Browser Notifications**: Real-time alerts when app is open
- **SMS/Text Messages**: Send reminders to family phones
- **Multiple Reminder Types**: 5min, 15min, 1hr, 1day before events
- **Custom Templates**: Personalized message templates

### 📱 **SMS Integration**
- **FREE Email-to-SMS**: No cost SMS via carrier gateways (Telus supported!)
- **Twilio Premium**: Professional SMS service ($0.0075/message)
- **Custom Webhooks**: Integrate with your own SMS service
- **Family Broadcasting**: Send to individual members or entire family

### 🏒 **Hockey Stats & Expense Tracking**
- **Player Management**: Track multiple hockey players with stats
- **Game Statistics**: Goals, assists, points, penalties, +/-, shots
- **Season Analytics**: Comprehensive season summaries and records
- **Milestone Tracking**: Automatic achievement detection (hat tricks, career goals, etc.)
- **Expense Management**: Complete AAA hockey cost tracking
- **Category Breakdown**: Equipment, travel, tournaments, registration fees
- **Budget Analysis**: Monthly/seasonal spending projections
- **Tax Reporting**: Track deductible expenses for tax purposes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/family-calendar-app.git
cd family-calendar-app
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Run development server**
```bash
pnpm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Production Build

```bash
pnpm run build --no-lint
pnpm start
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js and configure build settings

2. **Environment Variables** (Optional)
   ```bash
   # For Email-to-SMS (Free)
   EMAIL_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=your_verified_sender@gmail.com
   
   # For Twilio SMS (Premium)
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Deploy**
   - Push to GitHub main branch
   - Vercel auto-deploys on every commit

## ⚙️ SMS Setup Guide

### Option 1: FREE Email-to-SMS
1. Sign up for a free email service (SendGrid, AWS SES, Resend)
2. Get API key and verified sender email
3. Add environment variables to Vercel
4. Configure family members' carriers in app

**Supported Carriers:**
- Verizon: `number@vtext.com`
- AT&T: `number@txt.att.net`
- T-Mobile: `number@tmomail.net`
- Sprint: `number@messaging.sprintpcs.com`
- Plus 6+ more carriers

### Option 2: Twilio Premium
1. Create Twilio account at https://twilio.com
2. Purchase phone number ($1/month)
3. Get Account SID and Auth Token
4. Add to Vercel environment variables
5. Costs ~$0.0075 per SMS

## 📱 Usage Guide

### Setting Up Your Family
1. Click "Family" button to add family members
2. Assign unique colors to each person
3. Set up phone numbers for SMS notifications
4. Configure emergency contacts

### Creating Events
1. Click the "+" button (floating or mobile nav)
2. Fill in event details (title, date, time, location)
3. Assign to family members
4. Set reminders (browser and/or SMS)
5. Choose recurring pattern if needed

### SMS Notifications
1. Access SMS settings via "SMS" button
2. Choose provider (Free or Premium)
3. Configure family phone numbers and carriers
4. Test the system with your number
5. Create events with SMS reminders enabled

### iPad Kitchen Setup
1. Open app in Safari on iPad
2. Add to Home Screen for full-screen experience
3. Enable notifications in browser settings
4. Mount iPad in kitchen for always-on display
5. Use touch-friendly interface for quick updates

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Date Handling**: date-fns + react-day-picker
- **Notifications**: Browser Notification API
- **SMS**: Multiple provider support (Email-to-SMS, Twilio, Webhook)
- **PWA**: Service worker with offline functionality
- **TypeScript**: Full type safety throughout

## 🎯 API Endpoints

- `POST /api/send-email-sms` - Send SMS via email gateways (FREE)
- `POST /api/send-twilio-sms` - Send SMS via Twilio (Premium)
- `GET /api/send-email-sms` - Get setup instructions for email-to-SMS
- `GET /api/send-twilio-sms` - Get Twilio configuration guide

## 🔐 Privacy & Data

- **Local Storage**: All data stored locally in browser
- **No Analytics**: No tracking or data collection
- **Cross-Device Sync**: Via URL sharing and local storage events
- **Offline First**: Core functionality works without internet
- **SMS Privacy**: Phone numbers stored locally only

## 📸 Screenshots

### iPad Kitchen View
The calendar is optimized for large touch screens with:
- Large, easy-to-read text and buttons
- High contrast colors
- Month view with clear event indicators
- Quick access to add events and manage family

### iPhone Mobile Experience
- Bottom navigation for thumb-friendly access
- Swipe gestures for month navigation
- Compact event display
- Full functionality on small screens

### SMS Configuration
- Easy setup wizard for free or premium SMS
- Family member phone number management
- Carrier selection for email-to-SMS
- Test messaging functionality

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/family-calendar-app)

## 📄 License

This project is licensed under the MIT License.

---

**Perfect for families who want to stay organized with a beautiful, touch-friendly calendar that works on all their Apple devices! 🍎📱**
