# Mailchimp Setup Guide - FREE TIER
**Get Your Email Marketing Running in 30 Minutes**

---

## 🎯 Quick Start Checklist

- [ ] Mailchimp account created (Free tier)
- [ ] API key generated
- [ ] List (Audience) created
- [ ] Secrets configured in Encore
- [ ] Welcome automation set up
- [ ] First subscribers synced

**Expected Revenue Impact:** +£500-1,500/month from email alone

---

## Step 1: Get Your Mailchimp Credentials (5 minutes)

### 1.1 Get API Key

1. Log into Mailchimp: https://mailchimp.com
2. Click your profile icon → **Account & Billing**
3. Navigate to **Extras** → **API keys**
4. Click **Create A Key**
5. Copy the API key (starts with something like `abc123xyz-us1`)

**Save this - you'll need it in Step 3**

### 1.2 Find Your Server Prefix

Your API key ends with something like `-us1`, `-us2`, `-us19`, etc.
The part after the dash is your **server prefix**.

Example:
- API Key: `abc123xyz456-us19`
- Server Prefix: `us19`

### 1.3 Get Your List/Audience ID

1. In Mailchimp, go to **Audience** → **All contacts**
2. Click **Settings** → **Audience name and defaults**
3. Look for **Audience ID** (10-character code like `a1b2c3d4e5`)

**Save this too!**

---

## Step 2: Configure Encore Secrets (2 minutes)

Run these commands in your terminal:

```bash
# Set Mailchimp API Key
encore secret set --type dev MailchimpAPIKey
# Paste your API key when prompted

encore secret set --type prod MailchimpAPIKey
# Paste the same API key

# Set Server Prefix
encore secret set --type dev MailchimpServerPrefix
# Type your server prefix (e.g., us19)

encore secret set --type prod MailchimpServerPrefix
# Same server prefix

# Set List ID
encore secret set --type dev MailchimpListID
# Paste your audience ID

encore secret set --type prod MailchimpListID
# Same audience ID
```

---

## Step 3: Test the Connection (1 minute)

Once the backend is running, test the connection:

```bash
# Start backend
encore run

# In another terminal, test:
curl http://localhost:4000/email/test-connection
```

You should see:
```json
{
  "success": true,
  "message": "Successfully connected to Mailchimp!"
}
```

✅ **If successful, you're connected!**

---

## Step 4: Sync Existing Subscribers (2 minutes)

Sync your existing newsletter subscribers to Mailchimp:

```bash
curl -X POST http://localhost:4000/email/sync-subscribers
```

This will:
- Upload all your existing subscribers
- Tag them as 'website-signup'
- Prepare them for automation

---

## Step 5: Create Welcome Email Automation in Mailchimp (15 minutes)

### Email 1: Welcome + Free Guide (Immediate)

**In Mailchimp:**
1. Go to **Automations** → **Create** → **Custom**
2. Choose trigger: **When someone joins your audience**
3. Add filter: **Tag is: new-subscriber**

**Email 1 Content:**

**Subject:** Welcome to the Wellness Circle! 🌿 Here's your free guide

**Preview:** Your journey to natural wellness starts here + exclusive gift inside

**Body:**
```
Hi {{FNAME|there}}!

Welcome to the Pure Living Pro community! I'm thrilled to have you here.

You've just joined thousands of people who are transforming their health naturally - without confusion, overwhelm, or expensive supplements that don't work.

🎁 YOUR WELCOME GIFT

As promised, here's your free guide: "10 Simple Habits for Natural Wellness"
[Download Your Free Guide →]

This guide will show you:
✅ The #1 morning routine that boosts energy naturally
✅ 5 affordable superfoods hiding in your grocery store
✅ The surprising link between gut health and mood
✅ Simple detox practices (no juice cleanses required!)

📚 WHAT TO EXPECT

Every week, I'll send you:
- Evidence-based wellness tips
- Product reviews (honest, no BS)
- Exclusive discounts on products we actually use
- Success stories from our community

🌟 START HERE

New to natural wellness? Check out these popular articles:
- [The Beginner's Guide to Clean Living]
- [5 Supplements Everyone Should Consider]
- [How to Read Supplement Labels Like a Pro]

Got questions? Just hit reply - I read every email!

To your health,
[Your Name]
Pure Living Pro

P.S. Make sure to add hello@purelivingpro.com to your contacts so our emails don't end up in spam!

---
You're receiving this because you subscribed at PureLivingPro.com
[Unsubscribe] | [Update Preferences]
```

**Timing:** Immediate (0 minutes after signup)

---

### Email 2: Top Articles + Community (2 days later)

**Subject:** The 5 articles our community loves most ⭐

**Body:**
```
Hey {{FNAME|friend}},

Hope you enjoyed the free guide!

I wanted to share our 5 most popular articles - these are the ones our community keeps coming back to:

1️⃣ [Article Title 1] - [Brief description]
   👉 [Read Article →]

2️⃣ [Article Title 2] - [Brief description]
   👉 [Read Article →]

3️⃣ [Article Title 3] - [Brief description]
   👉 [Read Article →]

4️⃣ [Article Title 4] - [Brief description]
   👉 [Read Article →]

5️⃣ [Article Title 5] - [Brief description]
   👉 [Read Article →]

💬 JOIN THE CONVERSATION

Our community shares wins, asks questions, and supports each other on our journey to better health.

[Join the Facebook Group →]
[Follow us on Instagram →]

What topic should I cover next? Hit reply and let me know!

Cheers,
[Your Name]

P.S. Check your inbox this Friday for our Weekly Wellness Digest with fresh content!
```

**Timing:** 2 days after Email 1

---

### Email 3: Personalized Product Recommendations (4 days later)

**Subject:** Based on what you're reading... {{FNAME|these}} might help 🎯

**Body:**
```
Hi {{FNAME}},

I've noticed you've been interested in [category based on clicks].

Here are 3 products that have helped hundreds of people in our community with similar goals:

---

🥇 PRODUCT #1: [Product Name]
⭐ Rating: [4.8/5 stars]
💰 Price: [~£30]

What it does: [Brief description]
Why we recommend it: [Unique benefit]

[Check Current Price →]

---

🥈 PRODUCT #2: [Product Name]
⭐ Rating: [4.7/5 stars]
💰 Price: [~£45]

What it does: [Brief description]
Real user review: "[Quote from customer]"

[Check Current Price →]

---

🥉 PRODUCT #3: [Product Name]
⭐ Rating: [4.9/5 stars]
💰 Price: [~£25]

What it does: [Brief description]
Best for: [Specific use case]

[Check Current Price →]

---

📊 HOW WE CHOOSE PRODUCTS

We test everything ourselves and only recommend products that:
✅ Have scientific backing
✅ Get real results from our community
✅ Offer honest value for money

Want personalized recommendations? [Take our 2-minute quiz →]

Questions? Just reply to this email!

To your health,
[Your Name]

P.S. These products have affiliate links, which means we might earn a small commission at no extra cost to you. This helps us keep creating free content!

---
[Unsubscribe] | [Update Preferences]
```

**Timing:** 4 days after Email 1

---

### Email 4: Success Stories + Social Proof (6 days later)

**Subject:** "I didn't believe it would work..." - Real transformation stories 💚

**Body:**
```
{{FNAME}},

Today, I want to share real stories from people just like you who transformed their health naturally.

📖 STORY #1: SARAH'S ENERGY TRANSFORMATION

"I was drinking 3 coffees a day just to function. Now I wake up energized without caffeine!"

What she did:
- Focused on gut health
- Added [specific supplement]
- Changed one morning habit

[Read Sarah's Full Story →]

---

📖 STORY #2: MIKE'S CHRONIC PAIN RELIEF

"Doctors told me to just take painkillers. These natural approaches changed everything."

What worked:
- Anti-inflammatory diet
- [Specific supplement stack]
- Daily movement routine

[Read Mike's Full Story →]

---

📖 STORY #3: EMMA'S MENTAL CLARITY

"Brain fog was ruining my work. 90 days later, I feel sharp and focused."

Her protocol:
- [Nootropic supplement]
- Gut-brain axis support
- Sleep optimization

[Read Emma's Full Story →]

---

🌟 YOUR TURN

What's YOUR wellness goal?
Reply to this email and tell me - I read every message and might feature your story next!

Common goals we help with:
• More energy
• Better sleep
• Clearer skin
• Gut health
• Mental clarity
• Weight management
• Stress relief

[Tell Me Your Goal →]

Rooting for you,
[Your Name]

P.S. Next email: I'm sharing my personal supplement stack (including the ones I've stopped taking and why).
```

**Timing:** 6 days after Email 1

---

### Email 5: Exclusive Offer + CTA (7 days later)

**Subject:** {{FNAME}}, here's 15% off our top recommendations 🎁

**Body:**
```
Hey {{FNAME}},

You've been with us for a week now, and I wanted to say thanks for being part of this community!

🎁 EXCLUSIVE SUBSCRIBER DISCOUNT

Use code: WELLNESS15
For 15% off our top 10 recommended products

Valid for: 48 hours only

[Shop Top 10 Products →]

---

💎 OUR TOP 3 BEST-SELLERS

1. [Product Name] - £[Price] (Save £[Amount])
   "This changed my life" - 487 reviews
   [Get 15% Off →]

2. [Product Name] - £[Price] (Save £[Amount])
   "Results in just 2 weeks" - 392 reviews
   [Get 15% Off →]

3. [Product Name] - £[Price] (Save £[Amount])
   "Finally something that works!" - 621 reviews
   [Get 15% Off →]

---

🔥 BONUS: FREE SHIPPING

Spend over £50 and get free shipping automatically applied!

---

💬 QUESTIONS?

Not sure which product is right for you?
- [Take our quiz →]
- [Browse by health goal →]
- [Read product comparison guides →]

Or just reply to this email - I'm here to help!

This discount expires in 48 hours, so don't wait!

To your health,
[Your Name]
Pure Living Pro

P.S. Can't decide? Start with our #1 best-seller: [Product Name] - it's perfect for beginners and has a 90-day money-back guarantee.

---
[Unsubscribe] | [Update Preferences]
```

**Timing:** 7 days after Email 1

---

## Step 6: Set Up Weekly Digest (Recurring Email)

### Create a Regular Campaign (Sent Weekly)

**When to send:** Every Friday at 9 AM

**Subject Lines (Rotate These):**
- "This week's wellness discoveries ✨"
- "5 articles you might have missed 📚"
- "Your Friday wellness roundup is here 🌿"
- "New research + top products this week 🔬"

**Template:**
```
Happy Friday, {{FNAME}}!

Here's your weekly dose of wellness wisdom:

📰 NEW THIS WEEK

[Article 1 Title]
[1-sentence description]
[Read more →]

[Article 2 Title]
[1-sentence description]
[Read more →]

[Article 3 Title]
[1-sentence description]
[Read more →]

---

🔥 TRENDING NOW

[Popular article title] - 2,483 readers this week
[Why it's popular + link]

---

🏆 PRODUCT SPOTLIGHT

[Featured Product Name]
[Brief review + why we love it]
[Current discount/offer if any]
[Check it out →]

---

💡 WELLNESS TIP OF THE WEEK

[Quick, actionable tip in 2-3 sentences]

---

📊 QUICK POLL

What content do you want more of?
• Supplement reviews
• Healthy recipes
• Fitness tips
• Mental wellness
[Vote now →]

---

Have a rejuvenating weekend!

[Your Name]
Pure Living Pro

P.S. [Interesting fact or upcoming announcement]
```

---

## Step 7: Track Performance (Ongoing)

### Metrics to Watch in Mailchimp:

**Good Benchmarks for Wellness Niche:**
- Open Rate: 20-30% (goal: 25%+)
- Click Rate: 2-5% (goal: 3%+)
- Unsubscribe Rate: <0.5%

**Check these weekly:**
1. Go to **Reports** in Mailchimp
2. View each campaign performance
3. See which subject lines work best
4. Track which links get most clicks

---

## Step 8: Optimize Based on Data (Monthly)

### After 30 Days, Analyze:

**Subject Line Testing:**
- Which subject lines have highest open rates?
- Does personalization (using {{FNAME}}) help?
- Do emojis increase or decrease opens?

**Content Testing:**
- Which types of content get most clicks?
- What products generate most interest?
- Which email in the sequence performs best?

**Timing Testing:**
- Best day of week (try Tuesday, Thursday, Friday)
- Best time of day (try 9 AM, 12 PM, 6 PM)

**Improvements to Make:**
1. Remove underperforming emails
2. Add more of what works
3. Update product recommendations
4. Refresh stale content

---

## 💰 Revenue Tracking

### Calculate Email Attribution:

**In your analytics dashboard, track:**
1. Email opens/clicks (from Mailchimp)
2. Traffic from email (Google Analytics)
3. Affiliate clicks from email traffic
4. Conversions and revenue

**Expected Results:**
- Month 1: £200-500
- Month 2: £400-800
- Month 3: £600-1,200
- Month 4+: £800-1,500+

**As list grows:**
- 500 subscribers → £300-600/month
- 1,000 subscribers → £600-1,200/month
- 2,500 subscribers → £1,500-3,000/month
- 5,000 subscribers → £3,000-6,000/month

---

## 🚀 Advanced Automation (After 1 Month)

### Once you have data, add:

**1. Re-engagement Campaign**
- Target: Subscribers who haven't opened in 30 days
- Subject: "We miss you, {{FNAME}}! Here's what's new 💚"
- Offer: Special discount or free guide

**2. Product Launch Sequence**
- Announce new product reviews
- Build anticipation
- Limited-time offers

**3. Segmentation**
- Tag by interests (supplements, fitness, nutrition, etc.)
- Send targeted content
- Higher engagement = more revenue

**4. Birthday/Anniversary Emails**
- Special discount on subscriber anniversary
- Personal touch builds loyalty

---

## 📧 Email Best Practices

### Do's:
✅ Personalize with {{FNAME}}
✅ Keep emails concise (300-500 words)
✅ One clear CTA per email
✅ Mobile-friendly formatting
✅ Use story telling
✅ Include social proof
✅ Test subject lines
✅ Send consistently

### Don'ts:
❌ Send more than 2x per week
❌ All-caps subject lines
❌ Too many links
❌ Generic content
❌ Forgetting unsubscribe link
❌ Buying email lists
❌ Spammy language
❌ Image-only emails

---

## 🆘 Troubleshooting

### "My subscribers aren't syncing"
- Check API key is correct
- Verify server prefix matches
- Check list ID is correct
- Look at mailchimp_sync_log table for errors

### "Emails going to spam"
- Add clear unsubscribe link
- Don't use spam trigger words
- Verify domain authentication in Mailchimp
- Ask subscribers to whitelist your email
- Maintain good sending reputation (low bounces/unsubscribes)

### "Low open rates"
- Test different subject lines
- Try different send times
- Check if emails look good on mobile
- Clean your list (remove inactive subscribers)

### "Low click rates"
- Make CTAs more prominent
- Use buttons instead of text links
- Ensure content is relevant
- Test different content types

---

## 📊 Success Metrics (First 90 Days)

**Month 1:**
- List growth: +50-100 subscribers
- Open rate: 20-25%
- Click rate: 2-3%
- Revenue: £200-500

**Month 2:**
- List growth: +100-200 subscribers
- Open rate: 25-30%
- Click rate: 3-4%
- Revenue: £400-800

**Month 3:**
- List growth: +150-300 subscribers
- Open rate: 30%+
- Click rate: 4-5%
- Revenue: £600-1,200

---

## 🎯 Next Steps

Once email marketing is working:

1. **Reinvest Revenue:**
   - Upgrade to paid Mailchimp ($13/month) for automation features
   - Hire copywriter for better emails (£300-500)
   - Create lead magnets (e-books, guides)

2. **Scale Up:**
   - Run Facebook ads to grow list
   - Create content upgrades
   - Add exit-intent popups
   - Partner with other wellness brands

3. **Advanced Features:**
   - A/B test everything
   - Predictive segments
   - Product recommendation blocks
   - Dynamic content

---

## ✅ Quick Setup Checklist

Before you launch, verify:

- [ ] Mailchimp account active
- [ ] API credentials set in Encore
- [ ] Test connection successful
- [ ] Existing subscribers synced
- [ ] Welcome series created (5 emails)
- [ ] Weekly digest template ready
- [ ] Tracking links working
- [ ] Unsubscribe link present
- [ ] Mobile formatting tested
- [ ] Analytics connected

---

**🎉 You're Ready to Launch!**

Email marketing will be your highest-ROI channel. With just the free Mailchimp tier, you can generate an extra £500-1,500/month.

As your list grows and you reinvest, this can scale to £3,000-6,000/month or more.

**Questions?** Check the backend logs or test the API endpoints!

Good luck! 🚀
