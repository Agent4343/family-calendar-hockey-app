# 📱 SMS & Text Message Reminders Setup Guide

Your Family Calendar app now includes powerful SMS/texting capabilities for sending reminders to family members individually or as a group. Here's how it works and how to set it up:

## 🎯 How the Reminder System Works

### Current Features:
1. **Browser Notifications** - Pop-ups on devices/browsers when app is open
2. **SMS Text Messages** - Real text messages sent to phone numbers
3. **Individual Reminders** - Send to specific family members
4. **Group Messages** - Send to entire family or emergency contacts only
5. **Multiple Reminder Times** - 5 min, 15 min, 1 hour, 1 day before events
6. **Smart Templates** - Pre-written messages that auto-fill event details

## 🔧 SMS Setup Options

### Option 1: Email-to-SMS Gateway (FREE)
**Best for:** Small families, occasional use, budget-conscious users

**How it works:** 
- Uses email-to-SMS gateways provided by mobile carriers
- Each carrier has an email address that converts emails to texts
- Example: `5551234567@vtext.com` sends SMS to Verizon number 555-123-4567

**Setup:**
1. Click the **SMS button** in the app header
2. Choose "Email-to-SMS (Free)" as provider
3. For each family member:
   - Enter their phone number
   - Select their mobile carrier (Verizon, AT&T, T-Mobile, etc.)
   - Enable SMS notifications

**Carriers Supported:**
- Verizon → `@vtext.com`
- AT&T → `@txt.att.net`
- T-Mobile → `@tmomail.net`
- Sprint → `@messaging.sprintpcs.com`
- Boost Mobile → `@smsmyboostmobile.com`
- Cricket → `@sms.cricketwireless.net`
- MetroPCS → `@mymetropcs.com`

**Pros:** Completely free, no account needed
**Cons:** Slower delivery, less reliable, carrier-dependent

### Option 2: Twilio SMS Service (PAID - $0.0075 per text)
**Best for:** Reliable delivery, families who text frequently, professional use

**How it works:**
- Professional SMS service used by major companies
- Very reliable delivery with detailed tracking
- Costs about 3/4 of a penny per text message

**Setup:**
1. Create account at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number ($1/month)
4. In the app: Choose "Twilio" as provider
5. Enter your Twilio credentials
6. Add family member phone numbers

**Monthly Cost Examples:**
- 50 texts/month: ~$1.40 (plus $1 phone number)
- 100 texts/month: ~$1.75 (plus $1 phone number)
- 200 texts/month: ~$2.50 (plus $1 phone number)

**Pros:** Very reliable, fast delivery, detailed tracking
**Cons:** Costs money, requires account setup

### Option 3: Custom Webhook (ADVANCED)
**Best for:** Developers who want to integrate with existing systems

**How it works:**
- App sends SMS data to your custom API endpoint
- You handle the actual SMS delivery using your preferred service
- Full control over SMS provider and routing

## 📲 Setting Up Family Phone Numbers

### Individual Settings:
- **Phone Number:** Format: (555) 123-4567
- **SMS Enabled:** Toggle on/off per person
- **Mobile Carrier:** Required for email-to-SMS method
- **Emergency Contact:** Mark for urgent-only notifications
- **Preferred Reminders:** Custom timing per person

### Family Group Features:
- **Send to All:** Notify entire family about events
- **Emergency Only:** Send urgent messages to marked emergency contacts
- **Individual Choice:** Let each person choose their reminder preferences

## 🔔 How Reminders Are Sent

### Automatic Event Reminders:
1. **15 minutes before:** "📅 Reminder: 'Soccer Practice' starts in 15 minutes. Location: Sports Complex. Family Calendar"
2. **Event starting:** "🔔 'Soccer Practice' is starting now! Don't forget. - Family Calendar"

### Daily Summary (Optional):
"🌅 Good morning John! You have 3 events today: • Soccer Practice at 3:00 PM • Dinner at 6:30 PM • Movie Night at 8:00 PM. Have a great day!"

### Family Updates:
"👨‍👩‍👧‍👦 Family Update: Mom added 'Dentist Appointment' for March 15. Check the family calendar for details."

### Emergency Alerts:
"🚨 URGENT: 'Emergency School Pickup' requires immediate attention. Sarah needs to be picked up from school NOW. Please respond ASAP."

## ⚙️ Message Customization

### Pre-built Templates:
- **Event Reminder:** Standard reminder with time/location
- **Event Starting:** Immediate notification when event begins
- **Daily Summary:** Morning overview of the day's events
- **Family Update:** When someone adds/changes events
- **Emergency Alert:** For urgent, high-priority events

### Variables Automatically Filled:
- `{eventTitle}` → "Soccer Practice"
- `{memberName}` → "John"
- `{timeUntil}` → "15 minutes"
- `{location}` → "Sports Complex"
- `{date}` → "March 15, 2024"
- `{time}` → "3:00 PM"

## 🚨 Emergency Contact System

### How It Works:
1. Mark certain family members as "Emergency Contacts"
2. For urgent/high priority events, SMS goes only to emergency contacts
3. Regular events go to all enabled family members
4. Emergency contacts get special "🚨 URGENT:" prefix

### Use Cases:
- Parent gets urgent school notification
- Babysitter needs to contact parents immediately
- Medical appointments that require parent presence
- Last-minute schedule changes that affect everyone

## 📱 iPhone Integration

### Browser Notifications:
- Work when Safari/app is open
- Appear as standard iOS notifications
- Can be dismissed or tapped to open app

### SMS Text Messages:
- Appear as regular text messages in Messages app
- Work even when Family Calendar app is closed
- Can be received even when phone is locked
- Integrate with iOS notification system

### PWA (Add to Home Screen):
- Install app on iPhone home screen
- Receive notifications like native app
- Works offline with cached data
- Full-screen experience

## 💡 Best Practice Setup Recommendations

### For Most Families (Recommended):
1. **Start with Email-to-SMS** (free) to test the system
2. **Add all family member phone numbers**
3. **Set parents as emergency contacts**
4. **Use 15-minute default reminders**
5. **Upgrade to Twilio if you need more reliability**

### For Power Users:
1. **Use Twilio for reliability**
2. **Set up custom reminder times per person**
3. **Enable daily summaries for parents**
4. **Use emergency contacts for urgent events**
5. **Customize message templates**

### For Occasional Users:
1. **Email-to-SMS only**
2. **Enable SMS just for important events**
3. **Mark only critical family members**
4. **Use longer reminder times (1 hour+)**

## 🔍 Testing Your Setup

### Test Process:
1. Go to SMS Settings → Setup tab
2. Enter your phone number in "Test Configuration"
3. Click "Test SMS"
4. You should receive: "Test message from Family Calendar app. SMS notifications are working! 📱"

### If Test Fails:
- **Email-to-SMS:** Check carrier selection and phone number format
- **Twilio:** Verify Account SID, Auth Token, and From Number
- **General:** Check phone number format (555) 123-4567

## 📊 Usage Examples

### Scenario 1: Soccer Mom Managing Kids' Schedule
- **Setup:** Email-to-SMS for budget-friendliness
- **Family:** Mom, Dad (emergency contact), 3 kids with phones
- **Usage:** 50+ reminders per month for practices, games, appointments
- **Cost:** Free with email-to-SMS

### Scenario 2: Busy Professional Family
- **Setup:** Twilio for reliability
- **Family:** Both parents, 2 teens, 1 grandparent
- **Usage:** Business meetings, school events, family gatherings
- **Cost:** ~$3/month total including phone number

### Scenario 3: Extended Family Coordination
- **Setup:** Mixed - Twilio for parents, email-to-SMS for extended family
- **Family:** Parents, kids, grandparents, aunts/uncles
- **Usage:** Holiday planning, birthday reminders, family events
- **Benefits:** Ensures everyone stays informed

## 🛠️ Technical Implementation (For Developers)

### Backend APIs Created:
- `/api/send-email-sms` - Email-to-SMS gateway endpoint
- `/api/send-twilio-sms` - Twilio SMS service endpoint

### Required Environment Variables:
```bash
# For Email-to-SMS (if using SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# For Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

### Dependencies to Install:
```bash
# For email-to-SMS
npm install nodemailer

# For Twilio
npm install twilio
```

---

## 📱 **Updated Live App:** https://sb-3av18jsiwovs.vercel.run

The SMS button is now available in the app header - click it to configure your family's text message reminders!