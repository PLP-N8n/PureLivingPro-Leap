# Encore Backend Setup Guide

Quick reference for managing your Encore backend deployment.

---

## 🔑 Required Secrets

Your application requires the following secrets to be configured in Encore:

### AI Services
- `OpenAIKey` - OpenAI API key for content generation and chat features

### Content Ingestion
- `GoogleSheetsId` - Google Sheet ID for content pipeline
- `GoogleClientEmail` - Service account email for Google Sheets API
- `GooglePrivateKey` - Service account private key (JSON)

### Affiliate Marketing
- `AmazonAccessKey` - Amazon Product Advertising API access key
- `AmazonSecretKey` - Amazon Product Advertising API secret key
- `AmazonStoreId` - Your Amazon affiliate store/tag ID

### Content Publishing
- `WordPressUrl` - Your WordPress site URL (e.g., https://yourblog.com)
- `WordPressUsername` - WordPress admin username or application password
- `WordPressPassword` - WordPress application password
- `MediumToken` - Medium integration token for cross-posting

---

## 🚀 Quick Commands

### Local Development

```bash
# Run backend locally (starts all services + databases)
encore run

# View API documentation
# After running, visit: http://localhost:9400

# Run tests
encore test ./...

# Check service status
encore daemon
```

### Deployment

```bash
# Deploy to staging
git push encore main:staging

# Deploy to production
git push encore main:production

# Deploy from current branch
encore app push

# Check deployment status
encore app list
```

### Managing Secrets

```bash
# Set a secret for development environment
encore secret set --type dev SecretName

# Set a secret for production environment
encore secret set --type prod SecretName

# List all secrets
encore secret list

# Delete a secret
encore secret delete SecretName --type dev
```

### Database Management

```bash
# View database schemas
encore db schema

# Create a new migration
encore db migrate

# Connect to database (dev environment)
encore db shell

# Export database connection string
encore db conn-uri
```

---

## 📊 Encore Dashboard

Access your application dashboard at:
**https://app.encore.dev/pure-living-pro-4mhi**

### What you can monitor:

1. **Service Map** - Visual representation of all microservices
2. **Traces** - Real-time request tracing and debugging
3. **Logs** - Centralized logging across all services
4. **Metrics** - Performance metrics, latency, error rates
5. **Cron Jobs** - Scheduled task execution history
6. **Deployments** - Deployment history and status
7. **Databases** - Database usage and connections

---

## 🗄️ Database Architecture

Your application uses **7 PostgreSQL databases** (one per service):

| Database | Service | Purpose |
|----------|---------|---------|
| `content` | Content Service | Articles, categories, tags |
| `affiliate` | Affiliate Service | Products, programs, link tracking |
| `analytics` | Analytics Service | Page views, search queries |
| `ai` | AI Service | Chat sessions, recommendations |
| `automation` | Automation Service | Pipelines, schedules, tasks |
| `newsletter` | Newsletter Service | Email subscriptions |
| `health` | Health Service | Service health logs |

---

## ⏰ Cron Jobs

Your application has **7 scheduled jobs**:

| Job Name | Schedule | Purpose |
|----------|----------|---------|
| `ingest-from-sheets` | Every hour at :15 | Import content from Google Sheets |
| `process-publish-queue` | Every 5 minutes | Publish scheduled articles |
| `check-affiliate-links` | Daily at 2 AM | Validate affiliate links |
| `rollup-analytics` | Every 6 hours | Aggregate analytics data |
| `send-weekly-digest` | Sundays at 9 AM | Send newsletter digest |
| `social-media-automation` | Hourly | Post to social media |
| `performance-optimizer` | Daily at 3 AM | Optimize performance metrics |

**Monitor cron execution:**
- Dashboard → **Cron Jobs** tab
- View logs, success rate, and errors

---

## 🌐 Environment URLs

### Development (Local)
```
http://localhost:4000
```

### Staging
```
https://staging-pure-living-pro-4mhi.encr.app
```

### Production
```
https://production-pure-living-pro-4mhi.encr.app
```

---

## 🔧 Configuration Files

### Backend Structure
```
backend/
├── encore.app              # App configuration (App ID)
├── content/                # Content service
│   ├── encore.service.ts   # Service definition
│   ├── db.ts               # Database connection
│   ├── migrations/         # SQL migrations
│   └── *.ts                # API endpoints
├── affiliate/              # Affiliate service
├── analytics/              # Analytics service
├── ai/                     # AI service
├── automation/             # Automation service (cron jobs)
├── newsletter/             # Newsletter service
├── health/                 # Health check service
├── integrations/           # External API integrations
└── config/
    └── secrets.ts          # Secret declarations
```

### Important Files
- `backend/encore.app` - Contains app ID: `pure-living-pro-4mhi`
- `backend/config/secrets.ts` - All secret declarations
- `backend/automation/cron.ts` - Cron job definitions
- `backend/*/migrations/*.up.sql` - Database schemas

---

## 🆘 Troubleshooting

### Backend won't start locally

```bash
# Check Encore daemon status
encore daemon

# Restart daemon
encore daemon restart

# Check for port conflicts
lsof -i :4000
```

### Database migration errors

```bash
# Check migration status
encore db schema

# Reset development database (WARNING: deletes data)
encore db reset

# View database logs
encore logs --service=content
```

### Secrets not loading

```bash
# Verify secrets are set
encore secret list

# Re-set the secret
encore secret set --type dev SecretName

# Check logs for secret errors
encore logs | grep "secret"
```

### API returns 404

- Ensure service is running: `encore run`
- Check endpoint path matches API decorator
- View API documentation: http://localhost:9400
- Check traces in Encore dashboard

---

## 📈 Monitoring Production

### Key Metrics to Watch

1. **Error Rate** - Should be < 1%
2. **Latency (p95)** - Should be < 500ms
3. **Database Connections** - Monitor for connection pool exhaustion
4. **Cron Job Success Rate** - Should be > 95%
5. **Memory Usage** - Watch for memory leaks

### Setting Up Alerts

1. Go to Encore Dashboard
2. Navigate to **Settings** → **Alerts**
3. Configure alerts for:
   - Error rate > 5%
   - Latency p95 > 1000ms
   - Cron job failures

---

## 💡 Best Practices

### Development Workflow

1. **Always test locally first**
   ```bash
   encore run
   # Test endpoints at http://localhost:4000
   ```

2. **Run tests before deploying**
   ```bash
   encore test ./...
   ```

3. **Deploy to staging first**
   ```bash
   git push encore main:staging
   # Test staging environment
   # Then deploy to production
   git push encore main:production
   ```

### Database Migrations

1. **Never edit existing migrations** - Always create new ones
2. **Test migrations locally** - Encore runs them automatically
3. **Backup production data** - Before major schema changes

### Secrets Management

1. **Never commit secrets** - Always use `encore secret set`
2. **Rotate secrets regularly** - Especially API keys
3. **Use different secrets** - For dev vs. production

---

## 🔐 Security

### Encore Security Features (Built-in)

- ✅ **HTTPS/TLS** - Automatic SSL certificates
- ✅ **Secrets encryption** - Secrets encrypted at rest
- ✅ **Service isolation** - Services run in isolated containers
- ✅ **Database encryption** - Data encrypted at rest
- ✅ **API authentication** - Built-in auth middleware support

### Additional Security Steps

1. **Enable 2FA** on your Encore account
2. **Restrict API access** - Use authentication on public endpoints
3. **Monitor logs** - Watch for suspicious activity
4. **Regular updates** - Keep Encore CLI updated: `encore version update`

---

## 📚 Additional Resources

- **Encore Documentation:** https://encore.dev/docs
- **API Reference:** https://encore.dev/docs/develop/api-reference
- **Discord Community:** https://encore.dev/discord
- **GitHub Examples:** https://github.com/encoredev/examples

---

## ✅ Quick Verification Checklist

After setting up Encore, verify:

- [ ] Encore CLI installed and authenticated
- [ ] All 10 secrets configured (dev + prod)
- [ ] Backend runs locally without errors
- [ ] All 7 services start successfully
- [ ] Database migrations applied
- [ ] API endpoints respond correctly
- [ ] Cron jobs visible in dashboard
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Health check endpoint returns 200 OK

---

## 🎯 Need Help?

**Encore-specific issues:**
- Discord: https://encore.dev/discord
- Docs: https://encore.dev/docs
- Status: https://status.encore.dev

**Application-specific issues:**
- Check `ARCHITECTURE.md` for system design
- Check `DEVELOPMENT.md` for development guide
- Check backend service logs in Encore dashboard
