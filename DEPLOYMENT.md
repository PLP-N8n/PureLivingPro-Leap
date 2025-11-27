# Deployment Guide: PureLivingPro-Leap

This guide walks you through deploying the PureLivingPro application using **Netlify** (frontend) and **Encore Cloud** (backend).

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (React + Vite)                       │
│  ↓                                              │
│  Netlify (FREE)                                │
│  https://your-site.netlify.app                 │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  Backend (Encore.ts Microservices)             │
│  ↓                                              │
│  Encore Cloud (FREE TIER)                      │
│  https://staging-pure-living-pro-4mhi.encr.app │
│                                                 │
│  • PostgreSQL databases (7 services)           │
│  • Cron jobs (7 scheduled tasks)               │
│  • Secrets management                          │
│  • API endpoints (67+)                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Total Monthly Cost: $0** (using free tiers)

---

## 📋 Prerequisites

Before you start, make sure you have:

- [ ] GitHub account (for code hosting)
- [ ] Netlify account (sign up at https://netlify.com - FREE)
- [ ] Encore account (sign up at https://encore.dev - FREE tier available)
- [ ] Git installed locally
- [ ] Bun installed locally (https://bun.sh)

---

## Part 1: Deploy Backend to Encore Cloud

### Step 1: Install Encore CLI

```bash
# macOS/Linux
curl -L https://encore.dev/install.sh | bash

# Windows
iwr https://encore.dev/install.ps1 | iex
```

Verify installation:
```bash
encore version
```

### Step 2: Authenticate with Encore

```bash
encore auth login
```

This will open a browser for authentication.

### Step 3: Link Your Local Project to Encore Cloud

Navigate to your project root:
```bash
cd /home/user/PureLivingPro-Leap
```

Check if already linked:
```bash
encore app list
```

If not linked, create/link the app:
```bash
# Link existing app (if already created on Encore dashboard)
encore app link pure-living-pro-4mhi

# OR create new app
encore app create pure-living-pro
```

### Step 4: Configure Secrets

Set up all required API keys and credentials:

```bash
# OpenAI API Key (for AI features)
encore secret set --type dev OpenAIKey
encore secret set --type prod OpenAIKey

# Google Sheets Integration
encore secret set --type dev GoogleSheetsId
encore secret set --type prod GoogleSheetsId
encore secret set --type dev GoogleClientEmail
encore secret set --type prod GoogleClientEmail
encore secret set --type dev GooglePrivateKey
encore secret set --type prod GooglePrivateKey

# Amazon Affiliate API
encore secret set --type dev AmazonAccessKey
encore secret set --type prod AmazonAccessKey
encore secret set --type dev AmazonSecretKey
encore secret set --type prod AmazonSecretKey
encore secret set --type dev AmazonStoreId
encore secret set --type prod AmazonStoreId

# WordPress Integration
encore secret set --type dev WordPressUrl
encore secret set --type prod WordPressUrl
encore secret set --type dev WordPressUsername
encore secret set --type prod WordPressUsername
encore secret set --type dev WordPressPassword
encore secret set --type prod WordPressPassword

# Medium Integration
encore secret set --type dev MediumToken
encore secret set --type prod MediumToken
```

**Note:** You'll be prompted to enter each secret value. For development, you can use test values if you don't have production keys yet.

### Step 5: Deploy Backend

```bash
# Deploy to staging environment
git push encore main:staging

# Deploy to production environment
git push encore main:production
```

**Alternative: Deploy from current branch**
```bash
encore app push
```

### Step 6: Get Your Backend URLs

After deployment, Encore will provide URLs:
- **Staging:** `https://staging-pure-living-pro-4mhi.encr.app`
- **Production:** `https://production-pure-living-pro-4mhi.encr.app`

Copy these URLs - you'll need them for the frontend configuration.

### Step 7: Verify Backend Deployment

Test the health endpoint:
```bash
curl https://staging-pure-living-pro-4mhi.encr.app/health/status
```

You should see a JSON response with service health status.

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "feat: Configure Netlify deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/PureLivingPro-Leap.git

# Push to GitHub
git push -u origin claude/analyze-git-repo-01PRxgDetSVKHwDoZP29veJg
```

### Step 2: Create Netlify Site

1. **Go to Netlify Dashboard:** https://app.netlify.com
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub:**
   - Authorize Netlify to access your GitHub repos
   - Select the `PureLivingPro-Leap` repository
   - Choose the branch: `main` (or your production branch)

### Step 3: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

**Build settings:**
- **Base directory:** (leave empty or set to `.`)
- **Build command:** `bun install && cd frontend && bun run build`
- **Publish directory:** `frontend/dist`

### Step 4: Set Environment Variables

**CRITICAL:** Update the backend URL in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add the following variable:

```
Variable: VITE_CLIENT_TARGET
Value: https://staging-pure-living-pro-4mhi.encr.app
```

**For production deployment:**
```
Variable: VITE_CLIENT_TARGET
Value: https://production-pure-living-pro-4mhi.encr.app
```

3. **Set deploy contexts** (optional):
   - Production context: Use production backend URL
   - Branch deploys: Use staging backend URL

### Step 5: Deploy

Click **"Deploy site"**

Netlify will:
1. Clone your repo
2. Install dependencies with Bun
3. Build the frontend
4. Publish to CDN

**Build time:** ~2-5 minutes

### Step 6: Get Your Site URL

Netlify will assign a URL like:
```
https://unique-name-12345.netlify.app
```

You can customize this:
1. Go to **Site settings** → **Domain management**
2. Click **"Change site name"**
3. Choose: `purelivingpro` → `https://purelivingpro.netlify.app`

### Step 7: (Optional) Add Custom Domain

If you own a domain:
1. **Site settings** → **Domain management**
2. **Add custom domain**
3. Follow DNS configuration instructions
4. Netlify provides **FREE SSL/TLS** certificates automatically

---

## 🔄 Continuous Deployment

### Automatic Deployments

**Frontend (Netlify):**
- Every push to `main` branch → Auto-deploys to production
- Pull requests → Deploy previews automatically created
- Branch deploys → Can be enabled for specific branches

**Backend (Encore):**
- Push to Encore remote: `git push encore main:production`
- Or use Encore dashboard to deploy from GitHub commits

### Deploy Workflow

**Recommended Git workflow:**

```bash
# 1. Make changes on feature branch
git checkout -b feature/new-feature

# 2. Commit changes
git add .
git commit -m "feat: Add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Create Pull Request on GitHub
# - Netlify will create a deploy preview automatically
# - Test the preview URL before merging

# 5. Merge to main
# - Netlify auto-deploys to production

# 6. Deploy backend (if backend changes)
git push encore main:production
```

---

## 🧪 Testing Your Deployment

### Frontend Tests

1. **Visit your Netlify URL:** https://your-site.netlify.app
2. **Check homepage loads** with hero image and navigation
3. **Test navigation:** Click through pages (Blog, Products, Admin)
4. **Check API connectivity:** Open browser console, should see API calls to Encore backend
5. **Test responsiveness:** Resize browser, check mobile view

### Backend Tests

1. **Health check:**
   ```bash
   curl https://staging-pure-living-pro-4mhi.encr.app/health/status
   ```

2. **Test API endpoints:**
   ```bash
   # Get articles
   curl https://staging-pure-living-pro-4mhi.encr.app/content/articles

   # Get categories
   curl https://staging-pure-living-pro-4mhi.encr.app/content/categories
   ```

3. **Check cron jobs in Encore dashboard:**
   - Navigate to: https://app.encore.dev
   - Go to your app → **Cron Jobs**
   - Verify jobs are scheduled and running

### End-to-End Tests

1. Visit the admin dashboard: `https://your-site.netlify.app/admin`
2. Try creating a test article
3. Check if it appears in the blog section
4. Test affiliate link tracking (if configured)

---

## 📊 Monitoring & Logs

### Netlify Monitoring

**Access logs:**
1. Netlify Dashboard → Your site → **Deploys**
2. Click on any deploy → **Deploy log**
3. Check for build errors or warnings

**Analytics (optional):**
- Netlify Analytics: $9/month (not required)
- Use Google Analytics (free) instead

### Encore Monitoring

**Access logs and traces:**
1. Go to: https://app.encore.dev
2. Select your app: `pure-living-pro-4mhi`
3. **Traces:** See all API requests in real-time
4. **Service Mesh:** View service health and dependencies
5. **Logs:** Filter by service, endpoint, or time range
6. **Metrics:** Request rates, error rates, latencies

**Cron Job Monitoring:**
- **Cron Jobs** tab shows execution history
- Click on any job to see logs and errors

---

## 💰 Cost Breakdown

### Current Setup (FREE Tier)

| Service | Plan | Monthly Cost | Limits |
|---------|------|--------------|--------|
| **Netlify** | Free | $0 | 100GB bandwidth, 300 build minutes |
| **Encore Cloud** | Free | $0 | 2 environments, basic monitoring |
| **Total** | — | **$0/month** | — |

### When You Might Need to Upgrade

**Netlify:**
- Exceed 100GB bandwidth/month
- Need more than 300 build minutes
- Want advanced features (split testing, etc.)
- **Paid plan:** $19/month (Pro)

**Encore:**
- Need more than 2 environments
- Require advanced monitoring/tracing
- High traffic volume
- **Paid plan:** Contact Encore for pricing

### Budget Alternative (if you outgrow free tiers)

If Encore becomes expensive:

**Option: Migrate backend to Render + Neon**
- Frontend: Netlify (still free)
- Backend: Render Web Service ($7/month)
- Database: Neon Serverless PostgreSQL ($0-19/month)
- **Total:** $7-26/month

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend build fails on Netlify

**Error:** `Command failed with exit code 1`

**Solution:**
1. Check build logs in Netlify dashboard
2. Verify `netlify.toml` is in repo root
3. Ensure `frontend/package.json` has `build` script
4. Try building locally: `cd frontend && bun run build`

#### Backend API calls fail (CORS errors)

**Error:** `Access-Control-Allow-Origin error`

**Solution:**
- Encore handles CORS automatically
- Check that `VITE_CLIENT_TARGET` environment variable is set correctly in Netlify
- Verify backend is deployed and running: `curl <backend-url>/health/status`

#### Environment variables not working

**Issue:** Frontend shows "undefined" for config values

**Solution:**
1. Netlify: **Site settings** → **Environment variables**
2. Ensure variable starts with `VITE_` prefix
3. Re-deploy site after adding variables
4. Clear build cache: **Site settings** → **Build & deploy** → **Clear cache and deploy**

#### Database migrations not running

**Issue:** API returns database errors

**Solution:**
- Encore runs migrations automatically on deploy
- Check Encore dashboard → **Deployments** → View logs
- Manually trigger migration: `encore db migrate` (requires Encore CLI)

---

## 🚀 Performance Optimization

### Frontend Optimizations

The `vite.config.ts` is already configured with:
- ✅ Code splitting (vendor chunks)
- ✅ Minification (esbuild)
- ✅ Tree shaking

**Additional improvements:**

1. **Enable Netlify image optimization** (paid feature)
2. **Lazy load routes:**
   ```typescript
   const BlogPage = lazy(() => import('./pages/BlogPage'))
   ```
3. **Compress images** before committing to repo

### Backend Optimizations

1. **Database indexing:** Already configured in migrations
2. **Caching:** Consider adding Redis for frequently accessed data
3. **Connection pooling:** Encore handles automatically

---

## 📝 Next Steps

After successful deployment:

- [ ] **Set up custom domain** (optional)
- [ ] **Configure SSL/TLS** (Netlify does this automatically)
- [ ] **Set up monitoring alerts** (Encore dashboard)
- [ ] **Configure backup strategy** for database (Encore provides automatic backups)
- [ ] **Set up error tracking** (Sentry, LogRocket, etc.)
- [ ] **Add Google Analytics** for traffic monitoring
- [ ] **Test all features** thoroughly in production
- [ ] **Monitor costs** and usage for first 30 days

---

## 🆘 Support & Resources

### Documentation
- **Netlify Docs:** https://docs.netlify.com
- **Encore Docs:** https://encore.dev/docs
- **Vite Docs:** https://vitejs.dev

### Community Support
- **Encore Discord:** https://encore.dev/discord
- **Netlify Community:** https://answers.netlify.com

### Encore Cloud Dashboard
- **App URL:** https://app.encore.dev/pure-living-pro-4mhi

---

## ✅ Deployment Checklist

Use this checklist to track your deployment progress:

### Backend (Encore)
- [ ] Encore CLI installed
- [ ] Authenticated with Encore account
- [ ] App linked to Encore Cloud
- [ ] All secrets configured (dev & prod)
- [ ] Backend deployed to staging
- [ ] Backend deployed to production
- [ ] Health check endpoint verified
- [ ] Cron jobs running in Encore dashboard

### Frontend (Netlify)
- [ ] Code pushed to GitHub
- [ ] Netlify account created
- [ ] Site created and linked to GitHub repo
- [ ] Build settings verified
- [ ] Environment variables set (`VITE_CLIENT_TARGET`)
- [ ] Initial deployment successful
- [ ] Site URL verified and working
- [ ] Custom domain configured (optional)

### Testing
- [ ] Frontend loads without errors
- [ ] API calls reach backend successfully
- [ ] Database queries working
- [ ] Admin dashboard accessible
- [ ] Mobile responsive design verified
- [ ] Browser console shows no errors

### Monitoring
- [ ] Encore dashboard access verified
- [ ] Netlify deploy logs reviewed
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

---

## 🎉 Congratulations!

Your PureLivingPro application is now live on Netlify and Encore Cloud!

**Frontend:** https://your-site.netlify.app
**Backend:** https://staging-pure-living-pro-4mhi.encr.app

Monitor your deployments and enjoy your **$0/month** hosting costs! 🚀
