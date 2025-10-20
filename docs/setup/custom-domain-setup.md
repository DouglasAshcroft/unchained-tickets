# Custom Domain Setup Guide

Complete guide for configuring a custom domain for your Unchained Tickets deployment.

## Overview

**Time**: 30 minutes
**Prerequisites**:
- Vercel project deployed
- Domain name purchased (or access to DNS settings)
- Access to domain registrar

**Recommended Domains:**
- tickets.unchained.xyz
- unchained.tickets
- yourname.tickets
- tickets.yourname.com

---

## Step 1: Purchase Domain (if needed)

### Recommended Registrars

**Namecheap** (Recommended - Best value)
- Price: $8-15/year
- Free privacy protection
- Easy DNS management
- URL: [namecheap.com](https://www.namecheap.com)

**Google Domains / Squarespace Domains**
- Price: $12-20/year
- Clean interface
- Google integration
- URL: [domains.google](https://domains.google.com)

**Vercel Domains** (Easiest)
- Price: $15-20/year
- Auto-configured
- No DNS setup needed
- Buy directly in Vercel dashboard

### Domain Selection Tips

✅ **Good choices:**
- `tickets.yourcompany.com` - Professional
- `unchained.tickets` - Short and memorable
- `yourname.xyz` - Modern TLD

❌ **Avoid:**
- Long domains (> 20 characters)
- Numbers and hyphens
- Misspellings
- Trademarked terms

---

## Step 2: Add Domain to Vercel

### 2.1 Navigate to Domain Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **unchained-tickets**
3. Click **Settings** → **Domains**

### 2.2 Add Domain

1. Click **Add** button
2. Enter your domain:
   - For root: `tickets.unchained.xyz`
   - For subdomain: `www.tickets.unchained.xyz`
   - For both: Add root first, then www

3. Click **Add**

Vercel will show DNS configuration instructions.

---

## Step 3: Configure DNS

Vercel will provide DNS records. Configuration depends on your domain type:

### Option A: Root Domain (Recommended)

**Example**: `tickets.unchained.xyz`

**DNS Records to add:**

```
Type: A
Name: @ (or leave empty)
Value: 76.76.21.21
TTL: Auto or 3600
```

**For www subdomain (optional):**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

### Option B: Subdomain Only

**Example**: `tickets.yourcompany.com`

**DNS Record:**

```
Type: CNAME
Name: tickets
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

---

## Step 4: DNS Configuration by Provider

### Namecheap

1. Login to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** → Click **Manage** next to your domain
3. Select **Advanced DNS** tab
4. Click **Add New Record**

**For root domain:**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**For www:**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

5. Click **Save All Changes**

### Google Domains / Squarespace

1. Login to [Google Domains](https://domains.google.com)
2. Click on your domain
3. Go to **DNS** section
4. Scroll to **Custom records**

**Add A record:**
```
Host name: @
Type: A
TTL: 3600
Data: 76.76.21.21
```

**Add CNAME (www):**
```
Host name: www
Type: CNAME
TTL: 3600
Data: cname.vercel-dns.com
```

5. Click **Save**

### Cloudflare

1. Login to [Cloudflare](https://cloudflare.com)
2. Select your domain
3. Go to **DNS** → **Records**

**Add A record:**
```
Type: A
Name: @
Content: 76.76.21.21
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Important**: Disable Cloudflare proxy for Vercel domains!

**Add CNAME:**
```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy status: DNS only
TTL: Auto
```

4. Save

### GoDaddy

1. Login to [GoDaddy](https://godaddy.com)
2. Go to **My Products** → Find your domain
3. Click **DNS** button

**Add A record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600 seconds (default)
```

**Add CNAME:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

4. Save

---

## Step 5: Verify DNS Configuration

### 5.1 Check DNS Propagation

DNS changes can take 5 minutes to 48 hours. Usually 5-30 minutes.

**Check status:**

```bash
# Check A record
dig tickets.unchained.xyz A +short
# Should return: 76.76.21.21

# Check CNAME
dig www.tickets.unchained.xyz CNAME +short
# Should return: cname.vercel-dns.com

# Or use online tool
# https://dnschecker.org
```

### 5.2 Monitor in Vercel

1. Go back to Vercel → Settings → Domains
2. Status will show:
   - **Pending**: Waiting for DNS
   - **Verifying**: Checking DNS records
   - **Valid**: DNS configured correctly ✅

### 5.3 SSL Certificate

Vercel automatically provisions SSL certificate (HTTPS) using Let's Encrypt.

**Timeline:**
- DNS verified: Immediate
- SSL issued: 5-30 minutes
- Full HTTPS: Ready when status shows ✅

---

## Step 6: Update Environment Variables

Once domain is active, update your environment variables:

### 6.1 In Vercel Dashboard

Settings → Environment Variables → Edit:

```
NEXT_PUBLIC_APP_URL
Old: https://unchained-tickets.vercel.app
New: https://tickets.unchained.xyz

NEXT_PUBLIC_API_BASE_URL
Old: https://unchained-tickets.vercel.app
New: https://tickets.unchained.xyz
```

### 6.2 Redeploy

Changes to environment variables require redeployment:

```bash
# Via CLI
vercel --prod

# Or in Vercel dashboard
Deployments → Latest → Redeploy
```

---

## Step 7: Update External Services

### 7.1 Coinbase Commerce Webhook

1. Login to [Coinbase Commerce](https://commerce.coinbase.com/)
2. Settings → **Webhook subscriptions**
3. Update URL:
   ```
   Old: https://unchained-tickets.vercel.app/api/webhooks/coinbase
   New: https://tickets.unchained.xyz/api/webhooks/coinbase
   ```
4. Save

### 7.2 Smart Contract Metadata URI

If your contract is already deployed, you may need to update the base URI.

**Check current URI:**

```bash
cast call $NFT_CONTRACT_ADDRESS \
  "uri(uint256)(string)" 1 \
  --rpc-url https://mainnet.base.org
```

**If it needs updating:**
- Only contract owner can update
- Requires calling `setURI()` function (if implemented)
- Or deploy new contract with correct URI

**Note**: Our metadata API handles this dynamically, so usually no update needed!

### 7.3 OAuth/Auth Providers (if used)

If you add Google/GitHub login later, update redirect URLs:

- Google Cloud Console
- GitHub OAuth Apps
- Auth0 / Clerk / NextAuth

---

## Step 8: Test Custom Domain

### 8.1 Basic Connectivity

```bash
# Test HTTP → HTTPS redirect
curl -I http://tickets.unchained.xyz

# Should see:
# HTTP/2 301
# Location: https://tickets.unchained.xyz

# Test HTTPS
curl -I https://tickets.unchained.xyz

# Should see:
# HTTP/2 200
```

### 8.2 SSL Certificate

```bash
# Check SSL details
openssl s_client -connect tickets.unchained.xyz:443 -servername tickets.unchained.xyz < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Should show:
# notBefore: [date]
# notAfter: [date 3 months from now]
```

### 8.3 Full Application Test

Open in browser:

- [ ] https://tickets.unchained.xyz → Homepage loads
- [ ] https://tickets.unchained.xyz/events → Events page
- [ ] https://tickets.unchained.xyz/api/health → Returns {"status":"ok"}
- [ ] No SSL warnings
- [ ] Lock icon in browser shows secure

### 8.4 Redirects

Test that www redirects to root (if configured):

```bash
curl -I https://www.tickets.unchained.xyz

# Should redirect to:
# Location: https://tickets.unchained.xyz
```

---

## Troubleshooting

### DNS Not Propagating

**Symptoms:**
- Domain still shows old site
- "DNS_PROBE_FINISHED_NXDOMAIN" error
- Can't reach site

**Solutions:**

1. **Wait longer**: Can take up to 48 hours
2. **Check DNS records**: Verify values are correct
3. **Clear DNS cache**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. **Check with different DNS**: Use 8.8.8.8 (Google DNS)

### SSL Certificate Issues

**Symptoms:**
- "Your connection is not private" warning
- "NET::ERR_CERT_COMMON_NAME_INVALID"

**Solutions:**

1. **Wait for provisioning**: SSL can take 30 minutes
2. **Check Vercel status**: Settings → Domains → Should show ✅
3. **Force refresh**: Vercel Dashboard → Domains → Click refresh icon
4. **Contact Vercel support** if stuck after 2 hours

### Wrong Content Showing

**Symptoms:**
- Old Vercel subdomain content
- Cached pages

**Solutions:**

1. **Hard refresh browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**
3. **Redeploy** in Vercel
4. **Check environment variables** are updated

### Vercel Shows "Invalid Configuration"

**Solutions:**

1. **Remove AAAA records** (IPv6) - Vercel doesn't use them yet
2. **Disable Cloudflare proxy** if using Cloudflare
3. **Check TTL values** - Should be 3600 or Auto
4. **Try removing and re-adding domain** in Vercel

---

## Advanced Configuration

### Subdomain for Staging

Want a staging environment?

1. Add subdomain: `staging.tickets.unchained.xyz`
2. Create separate Vercel project or use Preview deployments
3. DNS record:
   ```
   Type: CNAME
   Name: staging
   Value: cname.vercel-dns.com
   ```

### Multiple Domains

Want multiple domains pointing to same app?

1. Add all domains in Vercel: Settings → Domains
2. Vercel will set up redirects automatically
3. Choose primary domain

**Example:**
- Primary: tickets.unchained.xyz
- Aliases: www.tickets.unchained.xyz, unchained.tickets

### Email DNS Records

If you want email @ your domain:

**Google Workspace:**
```
Type: MX
Priority: 1
Value: aspmx.l.google.com
```

**Doesn't affect web hosting!** Add alongside A/CNAME records.

---

## Domain Best Practices

### Security

✅ Enable DNSSEC (if registrar supports)
✅ Enable domain lock / transfer lock
✅ Use strong registrar password
✅ Enable 2FA on registrar account
✅ Keep domain auto-renew enabled

### Performance

✅ Use Vercel's recommended DNS values
✅ Don't use Cloudflare proxy with Vercel
✅ Set appropriate TTL values (3600 recommended)

### Maintenance

✅ Set domain to auto-renew
✅ Keep registrar email up to date
✅ Monitor expiration date
✅ Keep DNS records documented

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Domain (.com) | $12-15 | Annual |
| Domain (.xyz) | $10-12 | Annual |
| Domain (.tickets) | $40-50 | Annual |
| SSL Certificate | Free | Auto-renewed |
| Vercel Domain | $15-20 | Annual |
| DNS Hosting | Free | Included |

**Total**: $10-50/year depending on TLD

---

## Custom Domain Checklist

- [ ] Domain purchased or available
- [ ] Domain added in Vercel dashboard
- [ ] A record configured (76.76.21.21)
- [ ] CNAME configured (www)
- [ ] DNS propagation verified
- [ ] SSL certificate issued
- [ ] Environment variables updated
- [ ] Application redeployed
- [ ] Webhook URLs updated (Coinbase)
- [ ] Domain tested (HTTP, HTTPS, redirects)
- [ ] No SSL warnings in browser
- [ ] All pages loading correctly

---

## Next Steps

After custom domain setup:

1. ✅ Update marketing materials with new URL
2. ✅ Set up email @ your domain (optional)
3. ✅ Configure analytics (Google Analytics, Plausible, etc.)
4. ✅ Submit to search engines
5. ✅ Set up Open Graph meta tags for social sharing

---

**Custom domain setup complete!** 🎉

Your application is now accessible at: `https://tickets.unchained.xyz`
