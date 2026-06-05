# FotoCloud Deployment Checklist

**Last Updated:** 2026-06-05  
**Status:** Ready for Launch  
**Target:** Production Deployment

---

## Prerequisites Checklist

### Services & Accounts
- [ ] Supabase account created
- [ ] Supabase PostgreSQL database provisioned
- [ ] Google Cloud project created & Drive API enabled
- [ ] Google Drive API key generated (not service account)
- [ ] Midtrans merchant account active
- [ ] Resend account created (for email, optional)
- [ ] Vercel account connected to GitHub repo
- [ ] Domain registered (or use Vercel default `*.vercel.app`)

---

## Step 1: Database Setup (Supabase)

### 1.1 Run SQL Migrations

Open **Supabase SQL Editor** and execute:

```sql
-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP;

-- Seed AppSettings with new pricing columns
DELETE FROM "AppSettings";
INSERT INTO "AppSettings" 
  (id, "pro1MonthPrice", "pro3MonthPrice", "pro12MonthPrice", "trialDays", "freeProjectLimit", "updatedAt")
VALUES 
  ('default', 15000, 39000, 149000, 7, 1, NOW());
```

### 1.2 Verify Tables & Columns

```sql
-- Verify User table
\d "User"

-- Verify AppSettings
SELECT * FROM "AppSettings";
```

---

## Step 2: Environment Configuration

### 2.1 Create `.env.production` (Vercel)

In **Vercel Dashboard → Settings → Environment Variables**, add:

```
# NextAuth
NEXTAUTH_SECRET=<generate: openssl rand -hex 32>
NEXTAUTH_URL=https://fotocloud-iota.vercel.app

# Database (Supabase Transaction Pooler)
DATABASE_URL=postgresql://[user]:[password]@db.[region].supabase.co:6543/postgres?schema=public

# Google Drive
GOOGLE_API_KEY=AIzaSyD... (from Google Cloud console)
NEXT_PUBLIC_APP_URL=https://fotocloud-iota.vercel.app

# Midtrans
MIDTRANS_SERVER_KEY=Mid-server-... (from Midtrans dashboard)
MIDTRANS_CLIENT_KEY=Mid-client-... (from Midtrans dashboard)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-...

# Email (Optional - for future email service)
RESEND_API_KEY=re_xxxx (optional, from Resend dashboard)
```

### 2.2 Local Development `.env.local`

```
# Same as above but with local database URL if testing locally
DATABASE_URL=postgresql://[user]:[password]@127.0.0.1:5432/fotocloud
```

---

## Step 3: Code Preparation

### 3.1 Generate Prisma Client

```bash
cd fotocloud
npx prisma generate
```

### 3.2 Verify TypeScript

```bash
npx tsc --noEmit
# Should show: 0 errors
```

### 3.3 Build & Test

```bash
npm run build
npm run start
# Should start on http://localhost:3000
```

### 3.4 Test Locally

Visit `http://localhost:3000`:
- [ ] Landing page loads
- [ ] Register new account → verify UI
- [ ] Login with test account
- [ ] Dashboard shows trial countdown
- [ ] Create project → verify unlimited (trial)
- [ ] Create access token → select duration
- [ ] Click WhatsApp share button
- [ ] View gallery link (public)
- [ ] Pricing page shows 3 periods

---

## Step 4: Deployment (Vercel)

### 4.1 Push to GitHub

```bash
git add -A
git commit -m "production: ready for deploy"
git push origin main
```

### 4.2 Deploy via Vercel

Option A (Manual):
```bash
vercel --prod
```

Option B (Automatic):
- Go to Vercel dashboard
- Select repo → production branch (`main`)
- Auto-deploys on push

### 4.3 Verify Production

```bash
https://fotocloud-iota.vercel.app/
- [ ] Site loads
- [ ] Database connection works (register test)
- [ ] Google Drive API works (create project)
- [ ] Midtrans integration works (pricing page)
```

---

## Step 5: Testing Flows

### Flow 1: New User Registration & Trial
- [ ] Visit `/register`
- [ ] Fill form → submit
- [ ] User created with `trialEndsAt = now + 7 days`
- [ ] Redirected to `/login`
- [ ] Login with new credentials
- [ ] Dashboard shows "Trial Pro — 7 days remaining" banner
- [ ] Can create unlimited projects (no limit during trial)

### Flow 2: Password Reset
- [ ] Visit `/login` → click "Lupa password?"
- [ ] Enter email → click "Kirim Reset Link"
- [ ] Message: "Email terkirim" ✓
- [ ] Check email (or check database for reset token)
- [ ] Click reset link → `/reset-password?token=xxx`
- [ ] Enter new password → submit
- [ ] Success message → redirect to login
- [ ] Login with new password ✓

### Flow 3: Project Creation During Trial
- [ ] Dashboard → "Buat Project" button enabled
- [ ] Create project → should succeed (unlimited during trial)
- [ ] Create 2nd project → should succeed
- [ ] Create 3rd project → should succeed
- [ ] Verify in dashboard

### Flow 4: Pricing & Upgrade
- [ ] Visit `/pricing`
- [ ] See Free (Rp 0) vs Pro (Rp 15k, 39k, 149k)
- [ ] Select period → click "Coba 7 Hari Gratis" or "Subscribe"
- [ ] Redirect to Midtrans payment page ✓
- [ ] Complete payment (can use test card)
- [ ] Midtrans webhook updates database
- [ ] Dashboard shows "Pro tier active until [date]"
- [ ] Trial banner removed

### Flow 5: Access Token & Client Gallery
- [ ] Create project → sync media
- [ ] Create access token:
  - [ ] Set label "Wedding Photos"
  - [ ] Select duration "7 hari"
  - [ ] Toggle download ON, comment ON
  - [ ] Create token
- [ ] Token shows: "Berakhir: 12 Juni 2026"
- [ ] Click "WhatsApp" → opens WhatsApp with pre-filled message
- [ ] Copy URL → share in incognito browser
- [ ] Gallery loads (dark theme)
- [ ] Enter name modal → browse photos
- [ ] Post comment, approve photo
- [ ] Download works
- [ ] After 7 days: token expires → 404 error ✓

---

## Step 6: Post-Launch

### 6.1 Monitoring

- Monitor error logs (Vercel > Projects > Logs)
- Monitor database usage (Supabase dashboard)
- Monitor API performance
- Check payment transactions (Midtrans dashboard)

### 6.2 Backup

- [ ] Enable automatic Supabase backups
- [ ] Setup GitHub branch protection
- [ ] Document admin credentials

### 6.3 Admin Setup

1. Make yourself admin in database:
```sql
-- Add admin role column if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user';

-- Set your user as admin
UPDATE "User" SET role = 'admin' WHERE email = 'alqordowi97@gmail.com';
```

2. Access admin panel at `/dashboard/admin` (if implemented)

### 6.4 Email Service (Optional)

To send actual emails (register verification, password reset, subscription):

1. Get Resend API key from resend.com
2. Add to env vars
3. Implement email functions in `src/lib/email.ts`
4. Call email functions from API routes

---

## Step 7: Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] NEXTAUTH_SECRET set (min 32 chars)
- [ ] Database password strong
- [ ] Google API key restricted (IP whitelist or referer)
- [ ] Midtrans keys stored in env (not in code)
- [ ] Supabase RLS policies enabled
- [ ] No secrets in git (check `.gitignore`)
- [ ] Rate limiting considered
- [ ] CORS configured if needed
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention (using React/Next.js)

---

## Step 8: Documentation & Handoff

- [ ] Update README.md with production URLs
- [ ] Document admin procedures
- [ ] Create user onboarding guide
- [ ] Setup Slack/email alerts for errors
- [ ] Document backup procedures
- [ ] Create disaster recovery plan

---

## Common Issues & Solutions

### "Column does not exist" Error
**Fix:** Run SQL migrations again, verify Prisma generated

### WhatsApp Share Not Opening
**Fix:** Check browser permissions, try on mobile, use WhatsApp Web

### Google Drive Sync Failing
**Fix:** 
- Verify API key in Google Cloud console
- Verify folder is "public" (shared with "Anyone with link")
- Check folder URL format is valid
- Check API quota not exceeded

### Midtrans Payment Not Processing
**Fix:**
- Verify server key & client key
- Check Midtrans webhook IP whitelisted
- Use Midtrans Snap development/staging for testing
- Verify transaction amount matches pricing

### Database Connection Timeout
**Fix:**
- Use Transaction Pooler (port 6543) not direct connection
- Check connection string format
- Verify network access whitelisted in Supabase
- Check DATABASE_URL env var correct

---

## Feature Readiness Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| **Auth** | ✅ Ready | Login/Register/Password Reset |
| **Trial** | ✅ Ready | 7-day auto-set, countdown UI |
| **Projects** | ✅ Ready | CRUD + limit check |
| **Drive Sync** | ✅ Ready | API key approach |
| **Gallery** | ✅ Ready | Dark theme + lightbox |
| **Tokens** | ✅ Ready | Duration + WhatsApp share |
| **Reviews** | ✅ Ready | Approve/revise/comments |
| **Analytics** | ✅ Ready | Per-photo + client breakdown |
| **Pricing** | ✅ Ready | 3 periods + Midtrans |
| **Subscription** | ✅ Ready | Plan expiry + upgrade |
| **Watermark** | ✅ Ready | Toggle per project |
| **Email** | 🔄 TODO | Template ready, needs Resend |
| **Admin Panel** | 🔄 PARTIAL | Settings done, users/payments TODO |
| **Mobile UI** | ✅ Ready | Responsive design |

---

## Post-Launch Roadmap

### Week 1-2
- Monitor production stability
- Collect user feedback
- Fix critical bugs

### Week 3-4  
- Integrate Resend for email notifications
- Implement admin user management
- Add payment analytics

### Month 2
- Team members feature
- Custom branding/domains
- Advanced analytics

### Month 3+
- Per-photo pricing (v2.0)
- Mobile app
- API for integrations

---

## Support & Escalation

**Issue Type** | **Action**
---|---
Database down | Check Supabase status, restore backup
API errors | Check Vercel logs, restart function
Payment issues | Contact Midtrans support
Security concern | Immediately disable affected features

---

## Sign-Off

**Deployed By:** ________________  
**Date:** ________________  
**Verified By:** ________________  
**Date:** ________________

---

**Project Link:** https://github.com/vendorin99-byte/fotocloud  
**Demo:** https://fotocloud-iota.vercel.app  
**Docs:** `/FOTOCLOUD_DOCUMENTATION.md`
