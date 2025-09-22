# 📱 Telus SMS Setup Guide

Perfect! Since your family uses **Telus**, here's exactly how to set up FREE SMS notifications for your Family Calendar app.

## 🎯 Quick Telus SMS Setup

### **Telus Email-to-SMS Gateway:**
- **Format**: `YOUR_PHONE_NUMBER@msg.telus.com`
- **Example**: If your number is `(604) 555-1234`, use `6045551234@msg.telus.com`
- **Cost**: Completely FREE! ✨

## 🚀 Step-by-Step Setup

### **Step 1: Deploy Your App**
1. Upload to GitHub following the deployment guide
2. Deploy to Vercel (gets you a live URL)
3. Your app will be live at `https://your-app.vercel.app`

### **Step 2: Configure SMS in Your App**
1. Open your live Family Calendar app
2. Click the **"SMS"** button in the header
3. Go to **"General"** tab
4. Enable **"SMS Notifications"**
5. Select **"Email-to-SMS (Free) - Recommended"**

### **Step 3: Add Family Phone Numbers**
1. Go to **"Family Numbers"** tab
2. For each family member:
   - Enable **"SMS for [Name]"**
   - Enter their **phone number** (e.g., 6045551234)
   - Select **"🇨🇦 Telus"** as carrier
   - Mark **emergency contacts** if desired

### **Step 4: Set Up Email Service (5 minutes)**

#### **Option A: Gmail (Easiest)**
1. Use your existing Gmail account
2. Enable 2-factor authentication
3. Generate an app password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Add to Vercel environment variables:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

#### **Option B: SendGrid (Recommended for families)**
1. Sign up at https://sendgrid.com (free)
2. Verify a sender email
3. Get API key from Settings → API Keys
4. Add to Vercel:
   ```
   EMAIL_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

### **Step 5: Test Your Setup**
1. In SMS settings, enter your Telus phone number
2. Click **"Test SMS"**
3. You should receive: *"Test message from Family Calendar app. SMS notifications are working! 📱"*

## 📱 How Telus SMS Works

### **Behind the Scenes:**
1. App creates calendar reminder
2. Sends email to `6045551234@msg.telus.com`
3. Telus receives email and converts to SMS
4. You get text message on your phone
5. **Completely free** - no SMS charges!

### **Message Examples:**

**Event Reminder:**
```
📅 Reminder: "Soccer Practice" starts in 15 minutes. 
Location: Community Center. - Family Calendar
```

**Daily Summary:**
```
🌅 Good morning Sarah! You have 3 events today: 
• Doctor appointment at 10:00 AM
• Soccer practice at 3:00 PM  
• Family dinner at 6:00 PM
Have a great day!
```

**Family Update:**
```
👨‍👩‍👧‍👦 Family Update: Dad added "Movie Night" for Friday 7:00 PM. 
Check the family calendar for details.
```

## 🇨🇦 Canadian Carriers Supported

Your app now supports all major Canadian carriers:

- **🇨🇦 Telus** → `number@msg.telus.com`
- **🇨🇦 Rogers** → `number@pcs.rogers.com`
- **🇨🇦 Bell** → `number@txt.bell.ca`
- **🇨🇦 Fido** → `number@fido.ca`
- **🇨🇦 Koodo** → `number@msg.koodomobile.com`
- **🇨🇦 Chatr** → `number@pcs.rogers.com`
- **🇨🇦 Freedom Mobile** → `number@txt.freedommobile.ca`
- **🇨🇦 Virgin Plus** → `number@vmobile.ca`
- **🇨🇦 Lucky Mobile** → `number@txt.bell.ca`

## ⚡ Quick Family Setup

For a family of 4 on Telus:

```
Dad: 6041234567@msg.telus.com
Mom: 6041234568@msg.telus.com  
Teen 1: 6041234569@msg.telus.com
Teen 2: 6041234570@msg.telus.com
```

## 🔧 Troubleshooting

### **SMS Not Working?**
1. **Double-check phone number format**: Use digits only (no spaces, dashes)
2. **Verify carrier selection**: Make sure "Telus" is selected
3. **Check email service**: Ensure your email service is configured correctly
4. **Test email-to-SMS manually**: Send an email to your `number@msg.telus.com` directly

### **Email Service Issues:**
- **Gmail**: Make sure you're using app password, not regular password
- **SendGrid**: Verify your sender email address
- **General**: Check Vercel environment variables are set correctly

### **Message Delays:**
- Email-to-SMS typically delivers in **1-5 minutes**
- Telus SMS gateway may have slight delays during peak times
- For instant delivery, consider upgrading to Twilio ($0.0075/SMS)

## 🎉 You're All Set!

Once configured, your family can:

✅ **Get text reminders** for all calendar events  
✅ **Receive daily summaries** of upcoming activities  
✅ **Get emergency notifications** for urgent events  
✅ **See family updates** when events are added/changed  
✅ **Use completely FREE** - no SMS charges from Telus!  

## 📱 iPad Kitchen Setup

For the perfect kitchen calendar experience:

1. **Open your app** in Safari on iPad
2. **Add to Home Screen** (Share → Add to Home Screen)
3. **Enable notifications** in Safari settings
4. **Mount iPad** in kitchen for always-on display
5. **Set family reminders** to ensure everyone gets notified

Your Telus phones will receive all the SMS notifications while your iPad shows the beautiful calendar interface! 

---

**Need help?** Check the main README.md or create an issue in your GitHub repository.

**Ready to deploy?** Follow DEPLOYMENT.md for complete step-by-step instructions!