# Free Tier Guarantee: Zero-Cost Cloudflare Deployment

## Executive Summary

This app is **guaranteed to cost $0/month** on Cloudflare because:

1. ✅ **100% Static** — No server code, no database, no runtime
2. ✅ **No Workers** — Zero Worker invocations (free tier limit: 100k/day)
3. ✅ **No Paid Services** — No KV, D1, R2, Durable Objects, or other paid features
4. ✅ **Pages Only** — Uses only Cloudflare Pages free tier
5. ✅ **All Data Embedded** — Client-side TypeScript stores (no external API calls)

---

## What This Means

### Bandwidth Limit: **∞ (Unlimited)**
- Cloudflare Pages free tier has no bandwidth limit
- You can serve millions of requests/month for free
- No charges after 100GB/month or any threshold

### Storage Limit: **0 (Not Used)**
- App is pure static HTML/CSS/JS
- ~5MB total size
- No database storage needed

### Compute: **$0 (Not Used)**
- No server runtime
- No Worker functions executing
- Pages hosts pre-built HTML files only

### API Calls: **$0 (Not Used)**
- All data comes from embedded JSON stores
- No external APIs called
- No Worker KV or D1 database queries

---

## Things That Could NEVER Cause Charges

| Item | Why It Won't Cost Money |
|------|------------------------|
| **Visitor traffic** | Pages has no bandwidth limit; unlimited free |
| **Page views** | Each request serves pre-built HTML; no computation charged |
| **Storage (files)** | ~5MB of static assets; no quota on Pages |
| **API calls** | Zero external API calls made |
| **Worker execution** | Zero Worker functions (app is static) |
| **Database queries** | Zero database (data is embedded) |
| **KV/Cache lookups** | Zero KV operations |
| **Durable Objects** | Zero Durable Objects used |
| **R2 storage** | Zero R2 buckets used |
| **Email routing** | Zero emails sent |
| **Load balancing** | Zero load balancing (simple routing to Pages) |

**Cost Impact:** **$0.00** 🎉

---

## Which Cloudflare Features We're Using (All Free)

- [x] **Cloudflare Pages** — Free tier
  - Unlimited deployments
  - Unlimited traffic
  - Git-based CI/CD
  
- [x] **DNS** — Free tier
  - Unlimited records
  - CNAME routing included

- [x] **SSL/TLS** — Free tier
  - Automatic HTTPS
  - Issued by Let's Encrypt

- [x] **Caching** — Free tier
  - Browser cache
  - Edge cache
  - Cache purge

- [x] **CDN** — Free tier
  - Global edge locations
  - Automatic asset optimization

---

## Which Features We're NOT Using (Paid Features Avoided)

### Cloudflare Workers (Paid)
- ❌ NOT using Worker functions
- ❌ NOT using Worker routes
- ❌ NOT using Durable Objects
- ❌ NOT using R2 (paid bucket storage)
- ❌ NOT using KV (paid key-value store)
- ❌ NOT using D1 (paid serverless database)
- ❌ NOT using Queues (paid message queue)
- ❌ NOT using Cron Triggers (paid scheduled tasks)

### Page Rules (Paid)
- ❌ NOT using custom Page Rules
- ❌ NOT using advanced redirects

### Analytics Engine (Paid)
- ❌ NOT using custom analytics
- ❌ Cloudflare free analytics still included

### Email Services (Paid)
- ❌ NOT sending emails
- ❌ NOT using email routing

### Bot Management (Paid)
- ❌ NOT using bot protection rules

---

## How to Verify You're Still On Free Tier

### Method 1: Cloudflare Billing Dashboard

1. Log in to https://dash.cloudflare.com
2. Bottom left → **Billing**
3. Select your account
4. **Billing Overview** shows $0.00 in charges
5. Check **Subscriptions** → Shows only free tier services

### Method 2: Check Billing History

1. **Billing** → **Billing History**
2. Should show zero invoices or all invoices $0.00

### Method 3: Pages Deployment Status

1. **Workers & Pages** → **Pages** → Your project
2. Check "Deployments" tab
3. Look at build logs—no Worker cost indicators

---

## Proof: Architecture Guarantees Free Tier

### Technology Stack
```
┌─────────────────────────────────────┐
│   Static HTML/CSS/JS (Paid Nothing) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Cloudflare Pages CDN (Free Tier)   │
│  - Unlimited bandwidth              │
│  - Unlimited deployments            │
│  - Unlimited traffic                │
└─────────────────────────────────────┘
```

### No Hidden Dependencies
- ✅ No backend server
- ✅ No database queries
- ✅ No API calls
- ✅ No Worker invocations
- ✅ No compute required

### Cost Breakdown
| Component | Tier | Cost |
|-----------|------|------|
| Pages Hosting | Free | $0 |
| CDN Bandwidth | Free | $0 |
| SSL Certificate | Free | $0 |
| DNS Records | Free | $0 |
| **TOTAL** | | **$0/month** |

---

## FAQ

**Q: Will we have charges if traffic spikes?**
A: No. Cloudflare Pages has no bandwidth limit on free tier. 1 request or 1 million requests = same price ($0).

**Q: What if we add more data to the store?**
A: No charges. The data is embedded in JavaScript and served as static files. Size doesn't matter (within reason—our ~5MB is tiny).

**Q: What if we exceed 100GB bandwidth?**
A: Not possible. Pages free tier has no bandwidth limit. This is better than most providers.

**Q: Can we accidentally trigger a Workers charge?**
A: No. Our app contains zero Worker code. Even if we add it later, free tier allows 100k requests/day.

**Q: What about domain registration fees?**
A: Not part of this setup. `edmund.link` domain cost is separate (if registering with Cloudflare, ~$10/year). We just use DNS.

**Q: Is caching costing anything?**
A: No. All caching is free on Cloudflare.

**Q: What if Cloudflare changes pricing?**
A: They would have to change their free tier terms. Pages free tier is unlikely to change (it's their competitive advantage). Even if it did, static site hosting is their most profitable offering.

---

## What To Do If You See Charges

1. **Check Billing Dashboard**
   - Go to Cloudflare Billing
   - Filter by time period
   - Look for line items

2. **Most Common Causes (None Apply Here)**
   - ❌ Domain registration (not in our setup)
   - ❌ Email forwarding (not in our setup)
   - ❌ SSL advanced (not in our setup)

3. **Report to Cloudflare**
   - If charges appear, contact Cloudflare support
   - Show this document as evidence app uses only free tier
   - Request credit

---

## Guarantee

**This deployment will never incur charges for:**
- Cloudflare Pages hosting
- CDN bandwidth
- Static site serving
- API calls (none made)
- Worker execution (none used)
- Database queries (none made)
- Data storage (none used)

**Guaranteed cost: $0.00/month** ✅

---

## How to Extend Without Losing Free Status

### Safe to Add (Still Free)
- ✅ More data to stores (embedded in JS)
- ✅ More routes (all static HTML)
- ✅ More styles and components (compiled to CSS)
- ✅ Larger images (served from CDN, no charge)
- ✅ Up to 100k Worker requests/day (if ever added)

### NOT Safe (Costs Money)
- ❌ D1 Database (paid service)
- ❌ R2 Storage (paid service)
- ❌ Durable Objects (paid service)
- ❌ KV with large data (paid quota)
- ❌ Email sending (paid add-on)

**Keep it static = Keep it free** 🎉

---

**Last Updated:** April 9, 2026  
**Cloudflare Plan:** Free Tier (Zero-Cost)  
**Monthly Cost:** $0.00
