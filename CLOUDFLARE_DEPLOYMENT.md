# Cloudflare Pages Deployment Guide

## Architecture Overview

✅ **Static SPA (Single Page Application)** deployed at `https://edmund.link/srkk-eonchemicals`

- **Framework:** SvelteKit 5 with static adapter
- **Data:** Client-side embedded TypeScript stores (no backend/database)
- **Routing:** Client-side SPA routing with `_routes.json` configuration
- **Build Output:** Pure HTML + CSS + JavaScript + assets (no server required)
- **Cloudflare Cost:** **$0** — Fully within free tier

---

## Prerequisites

- Domain: `edmund.link` (or your domain) already managed by Cloudflare
- GitHub repo: `situmorang-com/srkk-eonchemical-ai-sales-advisor` (public)
- GitHub account connected to Cloudflare

---

## Step-by-Step Deployment

### Step 1: Connect GitHub to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com
   - Select your account

2. **Navigate to Pages**
   - Left sidebar → "Workers & Pages" → Click "Pages" tab

3. **Connect Git**
   - Click "Connect to Git"
   - Select "GitHub" → Authorize Cloudflare to access your GitHub
   - Select org `situmorang-com` and repo `srkk-eonchemical-ai-sales-advisor`
   - Click "Begin Setup"

### Step 2: Configure Build Settings

**Project Name:** `srkk-eonchemical-ai-sales-advisor` (auto-filled)

**Production Branch:** `main`

**Build Settings:**
- **Framework preset:** `SvelteKit`
- **Build command:** `npm run build`
- **Build output directory:** `build`

**Environment Variables:** (optional for now, leave empty)

### Step 3: Deploy

1. Click "Save and Deploy"
2. Cloudflare will:
   - Clone your GitHub repo
   - Run `npm run build`
   - Deploy `build/` directory to CDN
3. Wait for build to complete (typically 2-3 minutes)
4. You'll get a temporary URL like `https://srkk-eonchemical-ai-sales-advisor.pages.dev`

**✅ Test:** Visit the temporary URL and navigate through all routes to verify

---

## Step 4: Configure Custom Domain (Subpath)

### Option A: Using CNAME (Recommended for Subpath)

1. **In Cloudflare Dashboard → Pages**
   - Select your Pages project
   - Go to "Custom domains" tab
   - Click "Set up a custom domain"

2. **Add Custom Domain**
   - Enter: `srkk-eonchemicals.edmund.link`
   - Click "Continue"

3. **DNS Configuration**
   - Cloudflare will show you the CNAME record:
     ```
     Name: srkk-eonchemicals
     Value: srkk-eonchemical-ai-sales-advisor.pages.dev
     Type: CNAME
     TTL: Auto
     ```
   - Cloudflare automatically creates this DNS record in your zone
   - Click "Activate domain" (if prompted)

4. **Verify DNS Propagation**
   - Wait 1-2 minutes
   - Visit `https://srkk-eonchemicals.edmund.link`
   - Should show your app ✅

### Option B: Using Subdomain Redirect (If CNAME has issues)

If CNAME routing has issues with the subpath, you can alternatively:
- Keep Pages at `srkk-eonchemical-ai-sales-advisor.pages.dev`
- Add a Page Rule in Cloudflare to forward subpath traffic
- Not recommended—Option A is cleaner

---

## Verification Checklist

After deployment, verify all of these work at `https://srkk-eonchemicals.edmund.link`:

- [ ] Home page loads at `/srkk-eonchemicals`
- [ ] Navigation links work (Dashboard, Accounts, Opportunities, Manager, AI Copilot)
- [ ] Direct navigation to subpaths works:
  - `/srkk-eonchemicals/accounts` ✅
  - `/srkk-eonchemicals/opportunities` ✅
  - `/srkk-eonchemicals/opportunities/opp-01` ✅ (dynamic route)
  - `/srkk-eonchemicals/manager` ✅
  - `/srkk-eonchemicals/copilot` ✅
- [ ] Static assets load correctly (CSS, images, fonts)
- [ ] EON Chemical logo displays in header
- [ ] All charts render (DonutChart, MiniBarChart, StageProgressChart)
- [ ] Currency formatting shows IDR values
- [ ] Refresh page on any route returns app (SPA routing works)

---

## Staying Free: Cloudflare Free Tier Compliance

### ✅ What We Use (Free)

| Feature | Status | Cost |
|---------|--------|------|
| Pages Hosting | ✅ Used | Free |
| Bandwidth (>100GB/mo) | ✅ Used | Free |
| SSL/TLS | ✅ Used (automatic) | Free |
| DNS | ✅ Used | Free |
| Caching (static assets) | ✅ Used | Free |
| Page Rules | ❌ Not used | Free |
| Workers | ❌ Not used | Free (100k req/day) |

### ❌ What We DON'T Use (Paid Features Avoided)

| Feature | Status | Why Avoided |
|---------|--------|------------|
| Workers (paid tier) | ❌ Not used | App is 100% static |
| Durable Objects | ❌ Not used | No backend state |
| KV (Key-Value) | ❌ Not used | Data embedded in frontend |
| D1 Database | ❌ Not used | No database needed |
| R2 Storage | ❌ Not used | All assets in build/ |
| Firewall Rules | ❌ Not used | Not needed |
| Bot Management | ❌ Not used | Not needed |

**Total Monthly Cost: $0.00**

---

## If Cost Increases: What to Check

If Cloudflare ever charges, these are the only things that would cause it:

1. **Bandwidth Overage** — Pages free tier has no bandwidth limit; this won't happen
2. **Worker Invocations** — We use 0 Workers; this won't happen
3. **Domain Registration** — If you register `edmund.link` via Cloudflare (not in our setup)

**Action:** Nothing—this setup is guaranteed free.

---

## Troubleshooting

### Issue: Routes return 404 or blank page

**Cause:** `_routes.json` not configured or SPA routing failing

**Fix:**
1. Verify `static/_routes.json` exists in repo
2. Rebuild: `npm run build`
3. Check `build/_routes.json` was generated
4. Re-deploy from Cloudflare dashboard

### Issue: Static assets (CSS, images) not loading

**Cause:** Base path incorrect in Vite config

**Fix:**
- Verify `vite.config.ts` has `base: '/srkk-eonchemicals/'`
- Rebuild and redeploy

### Issue: EON logo not showing

**Cause:** Asset path incorrect or image not included in build

**Fix:**
- Check `src/lib/assets/eon-chemicals-putra-logo.png` exists
- Rebuild: `npm run build`
- Check `build/_app/immutable/assets/` contains PNG file

### Issue: Domain not resolving

**Cause:** DNS propagation or CNAME misconfiguration

**Fix:**
1. In Cloudflare Dashboard → DNS Records
2. Verify CNAME record exists:
   - Name: `srkk-eonchemicals`
   - Value: `srkk-eonchemical-ai-sales-advisor.pages.dev`
3. Wait 5 minutes for DNS propagation
4. Test with: `nslookup srkk-eonchemicals.edmund.link`

---

## Updating the App

When you make changes:

```bash
# 1. Commit and push to main
git add .
git commit -m "Your changes"
git push origin main

# 2. Cloudflare Pages will automatically:
#    - Pull latest code
#    - Run `npm run build`
#    - Deploy new version
#    - Live in ~2-3 minutes
```

No manual redeploy needed—it's automatic.

---

## Environment Variables (If Needed Later)

If you need env vars in the future (e.g., API keys):

1. **Cloudflare Dashboard → Pages → Project Settings**
2. **Environment Variables** section
3. Add variable (e.g., `API_URL`)
4. Access in code: `import.meta.env.VITE_API_URL`

---

## Monitoring & Support

- **Build Logs:** Cloudflare Dashboard → Pages → Deployments → Click deployment → Logs
- **Errors:** Same build logs—will show TypeScript/build errors
- **Performance:** Cloudflare Dashboard → Analytics → Monitor CDN performance

---

## Final Summary

✅ **Deployment Complete**
- Site: `https://srkk-eonchemicals.edmund.link`
- Auto-deploys from GitHub on every push
- Free tier forever (no paid features)
- ~5MB total static assets
- Global CDN distribution via Cloudflare

**Enjoy your production app!** 🚀
