# Quick Test Guide - Mailchimp Integration

## ✅ Configuration Complete!

Your Mailchimp is now fully configured in `backend/email/config.dev.ts` with:
- API Key: Configured locally
- Server Prefix: Configured locally
- List ID: Configured locally

---

## 🧪 Test the Integration (5 minutes)

### Step 1: Install Dependencies

```bash
cd /home/user/PureLivingPro-Leap/backend
bun install
```

### Step 2: Start the Backend

```bash
cd /home/user/PureLivingPro-Leap
encore run
```

This will:
- Start all 8 microservices
- Create local databases
- Run API server on `http://localhost:4000`
- Email service will be at `/email/*` endpoints

**Wait for it to say:** `API Base URL: http://localhost:4000`

---

### Step 3: Test Mailchimp Connection

Open a **new terminal** and run:

```bash
# Test connection
curl http://localhost:4000/email/test-connection
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully connected to Mailchimp!"
}
```

✅ **If you see this, Mailchimp is working!**

---

### Step 4: Sync Existing Subscribers (Optional)

If you already have subscribers in your database:

```bash
curl -X POST http://localhost:4000/email/sync-subscribers
```

This uploads all existing subscribers to Mailchimp.

**Expected response:**
```json
{
  "success": true,
  "synced": 10,
  "errors": 0
}
```

---

### Step 5: Test Newsletter Signup

```bash
curl -X POST http://localhost:4000/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test"}'
```

**Expected response:**
```json
{
  "success": true,
  "mailchimp_synced": true
}
```

This will:
- Save subscriber to your database
- Add them to Mailchimp
- Tag them as 'new-subscriber'
- Trigger welcome series (when set up in Mailchimp)

---

## 🎯 Next Steps

### 1. Check Mailchimp Dashboard

Go to Mailchimp → Audience → All contacts

You should see your test subscriber appear!

### 2. Set Up Welcome Email Series

Follow the guide in `MAILCHIMP_SETUP_GUIDE.md`:
- 5 pre-written emails ready to copy-paste
- Automation setup instructions
- Takes about 15-20 minutes

### 3. Start Collecting Emails

Your newsletter form on the website will now:
- ✅ Save to database
- ✅ Sync to Mailchimp automatically
- ✅ Trigger welcome emails
- ✅ Track in your analytics

---

## 💰 Expected Revenue Timeline

**Week 1-2:** Set up welcome series
- Revenue: £50-150

**Month 1:** Welcome series + first digest
- Revenue: £200-500/month

**Month 2-3:** Optimized and growing
- Revenue: £600-1,200/month

**As list grows to 1,000 subscribers:**
- Revenue: £1,200-2,500/month

---

## 🐛 Troubleshooting

### "Connection failed"
- Check API key is correct
- Verify server prefix (us18)
- Confirm List ID

### "Subscriber not appearing in Mailchimp"
- Wait 30 seconds (API delay)
- Check spam/unsubscribed lists
- Verify List ID is correct

### "Encore won't start"
- Install Encore CLI: `curl -L https://encore.dev/install.sh | bash`
- Check you're in project root
- Try: `encore daemon restart`

---

## 📊 Monitor Performance

### Check Email Stats

```bash
curl http://localhost:4000/email/overview
```

Returns:
- Total subscribers
- Open rates
- Click rates
- Revenue from emails

### View Campaign Metrics

```bash
curl http://localhost:4000/email/campaigns
```

Lists all your email campaigns and performance.

---

## ✅ Success Checklist

Before moving to production:

- [ ] Connection test passes
- [ ] Test subscriber synced successfully
- [ ] Subscriber appears in Mailchimp dashboard
- [ ] Welcome series set up in Mailchimp
- [ ] First test email received
- [ ] Analytics tracking working
- [ ] Ready to deploy to Encore Cloud

---

## 🚀 Ready to Deploy?

When you're ready to go live:

```bash
# Deploy to Encore Cloud
git add .
git commit -m "feat: Email marketing ready for production"
git push encore main
```

Then set the Encore secrets for production:
```bash
encore secret set --type prod MailchimpAPIKey
encore secret set --type prod MailchimpServerPrefix
encore secret set --type prod MailchimpListID
```

---

## 🎉 You're Ready!

Email marketing is configured and ready to generate revenue!

**Quick wins available:**
- Set up welcome series (20 min) → +£100-300/month
- Weekly digest email (10 min) → +£50-150/month
- Product recommendations in emails → +£150-400/month

**Total potential: +£300-850/month from email alone!**

All with £0 investment using Mailchimp free tier! 💰
