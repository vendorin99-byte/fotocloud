# FotoCloud — Platform SaaS Galeri Fotografer

## Daftar Isi
1. [Ringkasan Produk](#ringkasan-produk)
2. [Fitur Utama](#fitur-utama)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [User Flows](#user-flows)
7. [Setup & Deployment](#setup--deployment)
8. [Environment Variables](#environment-variables)
9. [Pricing Model](#pricing-model)
10. [Admin Features](#admin-features)

---

## Ringkasan Produk

**FotoCloud** adalah platform SaaS untuk fotografer profesional yang memudahkan:
- 📸 Menghubungkan Google Drive folder hasil pemotretan
- 🔗 Membuat link galeri unik per klien (tanpa login diperlukan)
- 💬 Klien memberikan komentar, approve foto, request revisi
- 📥 Klien download foto yang sudah diapprove
- 📊 Fotografer melihat analytics per foto (siapa approve, komentar apa)

**Target Market:** Studio foto, fotografer freelance, video production di Indonesia  
**Pricing:** Freemium (1 project) + Pro tier (unlimited projects, Rp 15k-149k/bulan)

---

## Fitur Utama

### Untuk Fotografer
- ✅ Register/Login dengan email verification
- ✅ Password reset via email
- ✅ **7-day trial** — akses Pro features gratis tanpa kartu kredit
- ✅ Google Drive integration (API key, folder public)
- ✅ Create multiple projects
- ✅ Sync media dari Google Drive
- ✅ Create unique access tokens per client (set durasi 7d/30d/90d/forever)
- ✅ Share link via WhatsApp dengan durasi info
- ✅ Per-photo analytics (comments, approvals, revisions)
- ✅ Watermark toggle per project
- ✅ Download all approved photos as ZIP
- ✅ Delete projects
- ✅ Subscription management (view plans, transaction history)
- ✅ Settings (profile, Google Drive status)

### Untuk Klien (Public Gallery)
- ✅ Access gallery dengan unique URL (no login)
- ✅ Dark theme gallery dengan entry gate modal
- ✅ View photos/videos dengan lightbox
- ✅ Post komentar (input nama once)
- ✅ Approve foto atau request revisi
- ✅ Download individual/bulk approved photos
- ✅ Auto-expire setelah durasi habis (404 error)

### Admin Panel
- ✅ Manage pricing (1 month, 3 months, 12 months)
- ✅ Manage trial duration (default 7 days)
- ✅ View/edit testimonials
- ✅ (Future) User analytics, payment management

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| **Backend** | Next.js API Routes, NextAuth v4 |
| **Database** | Supabase PostgreSQL (Transaction Pooler 6543) |
| **ORM** | Prisma 7 + @prisma/adapter-pg |
| **Auth** | NextAuth v4 (credentials provider, JWT) |
| **File Storage** | Google Drive API (API key) |
| **Payment** | Midtrans Snap |
| **Email** | Resend (template ready, not yet integrated) |
| **Deployment** | Vercel |

---

## Database Schema

### User
```
id: UUID (PK)
name: string
email: string (UNIQUE)
emailVerified: DateTime?
password: string (hashed)
businessName: string?
image: string?
plan: "free" | "pro" (default: "free")
planExpiresAt: DateTime?
trialEndsAt: DateTime?  # 7-day trial expiry
createdAt: DateTime
updatedAt: DateTime
```

### Project
```
id: UUID (PK)
photographerId: UUID (FK → User)
name: string
clientName: string?
description: string?
driveFolderId: string?
driveFolderUrl: string?
watermarkEnabled: boolean (default: false)
syncStatus: "idle" | "syncing" | "error"
lastSyncedAt: DateTime?
createdAt: DateTime
updatedAt: DateTime
```

### AccessToken
```
id: UUID (PK)
projectId: UUID (FK → Project)
token: string (UNIQUE, auto-generated)
slug: string (UNIQUE, auto-generated from project name)
label: string?  # "Link Pengantin", "Link Orang Tua"
isActive: boolean (default: true)
canDownload: boolean (default: true)
canComment: boolean (default: true)
expiresAt: DateTime?  # Calculated from durationDays
createdAt: DateTime
updatedAt: DateTime
```

### MediaItem
```
id: UUID (PK)
projectId: UUID (FK → Project)
driveFileId: string
name: string
mimeType: string
type: "photo" | "video"
thumbnailUrl: string?
webViewUrl: string?
downloadUrl: string?
width: int?
height: int?
durationSecs: int?  # For videos
fileSize: int?
sortOrder: int
isHidden: boolean (default: false)
takenAt: DateTime?
createdAt: DateTime
updatedAt: DateTime
```

### Review (MediaReview)
```
id: UUID (PK)
mediaItemId: UUID (FK → MediaItem)
accessTokenId: UUID (FK → AccessToken)
status: "pending" | "approved" | "revision_requested"
revisionNote: string?
createdAt: DateTime
updatedAt: DateTime
```

### Comment
```
id: UUID (PK)
mediaItemId: UUID (FK → MediaItem)
accessTokenId: UUID (FK → AccessToken)
authorName: string
body: string
timestampSecs: int?  # For video comments
createdAt: DateTime
```

### Subscription
```
id: UUID (PK)
userId: UUID (FK → User)
status: "pending" | "completed" | "failed"
orderId: string (Midtrans)
amount: int (in IDR)
period: "1month" | "3months" | "12months"
transactionUrl: string?
createdAt: DateTime
updatedAt: DateTime
```

### Testimonial
```
id: UUID (PK)
name: string
role: string
content: string
rating: int (1-5)
createdAt: DateTime
```

### AppSettings (singleton)
```
id: "default" (UNIQUE)
pro1MonthPrice: int (default: 15000)
pro3MonthPrice: int (default: 39000)
pro12MonthPrice: int (default: 149000)
trialDays: int (default: 7)
freeProjectLimit: int (default: 1)
updatedAt: DateTime
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register           # Register + auto-set trialEndsAt
POST   /api/auth/login              # Login
POST   /api/auth/verify-email       # Verify email token [NEW]
POST   /api/auth/forgot-password    # Request reset token [NEW]
POST   /api/auth/reset-password     # Reset password [NEW]
POST   /api/auth/logout             # Logout
GET    /api/auth/session            # Get current session
```

### Projects
```
GET    /api/projects                # List user projects
POST   /api/projects                # Create project (check trial/pro limit)
GET    /api/projects/[id]           # Project detail
PATCH  /api/projects/[id]           # Update project
DELETE /api/projects/[id]           # Delete project
POST   /api/projects/[id]/sync      # Trigger Drive sync
```

### Access Tokens
```
GET    /api/projects/[id]/tokens                # List tokens
POST   /api/projects/[id]/tokens                # Create token (with durationDays)
PATCH  /api/projects/[id]/tokens/[tokenId]     # Update permissions/status
DELETE /api/projects/[id]/tokens/[tokenId]     # Revoke token
```

### Gallery (Public)
```
GET    /api/gallery/[token]                     # Get gallery data (validate expiry)
POST   /api/gallery/[token]/reviews             # Approve/revise
POST   /api/gallery/[token]/comments            # Post comment
GET    /api/gallery/[token]/download/[mediaId]  # Download file
POST   /api/gallery/[token]/track               # Analytics tracking
GET    /api/gallery/[token]/download-all        # Bulk download ZIP
```

### Subscriptions
```
GET    /api/subscription/plans         # Get pricing (including trial info)
POST   /api/subscription/checkout      # Create Midtrans transaction
POST   /api/subscription/webhook       # Midtrans payment notification
GET    /api/subscription/history       # User transaction history
POST   /api/subscription/cancel        # Cancel subscription
```

### Admin
```
GET    /api/admin/settings                 # Get AppSettings
PATCH  /api/admin/settings                 # Update pricing/trial
GET    /api/admin/testimonials             # List testimonials
POST   /api/admin/testimonials             # Create testimonial
PATCH  /api/admin/testimonials/[id]        # Update testimonial
DELETE /api/admin/testimonials/[id]        # Delete testimonial
```

---

## User Flows

### Flow 1: Fotografer Register → Create Project → Share Link
```
1. Visit /register
   - Input: name, email, password, business name
   - API: POST /api/auth/register
   - Result: User created, trialEndsAt = now + 7 days, send verification email
   
2. Verify email
   - User clicks link di email
   - API: POST /api/auth/verify-email?token=xxx
   - Result: emailVerified set
   
3. Login
   - Visit /login
   - Input: email, password
   - API: NextAuth credentials provider
   - Result: JWT session set
   
4. Dashboard
   - Redirect to /dashboard
   - Show: Trial countdown "5 days remaining", Upgrade CTA
   - Show: Projects list (unlimited during trial)
   
5. Create project
   - Click "New Project"
   - Input: project name, client name, Drive folder URL
   - API: POST /api/projects
   - Result: Project created + auto-sync triggered
   
6. Create token + share
   - In project detail, "Create Access Token"
   - Select: durasi (7d/30d/90d/forever), permissions (download/comment)
   - Click: "WhatsApp" button
   - Result: WhatsApp opens dengan pre-filled message + link + durasi
```

### Flow 2: Klien Access Gallery (No Login)
```
1. Klien terima WhatsApp link dari fotografer
   - Link: https://fotocloud.com/wedding-budi-sari (atau /gallery/[token])
   
2. Buka link di browser
   - Gallery loads (validate token not expired)
   - Dark theme, entry gate modal: "Masukkan nama Anda"
   
3. Browse & review
   - Lihat foto/video dengan lightbox
   - Post komentar: nama auto-filled dari step 2
   - Click approve atau "request revisi"
   - Download individual/bulk
   
4. Token expires
   - After 7/30/90 days: token.expiresAt < now
   - Gallery returns 404 error
```

### Flow 3: Fotografer Upgrade dari Free/Trial ke Pro
```
1. Click "Upgrade" button
   
2. /pricing page
   - Show: 3 period options (1 month, 3 months, 12 months)
   - Show: Free tier vs Pro comparison
   - Free banner: "Trial berakhir dalam X hari"
   
3. Select period + pay
   - Click "Subscribe" → redirect to Midtrans Snap
   - Pay dengan e-wallet/transfer bank
   
4. Payment success
   - Midtrans webhook: POST /api/subscription/webhook
   - Update user: plan = "pro", planExpiresAt = now + period
   - Email: confirmation + receipt
   
5. Dashboard updated
   - Remove "Trial countdown"
   - Show: "Pro tier active until [date]"
   - Unlimited projects unlocked
```

### Flow 4: Password Reset
```
1. /login page → "Lupa password?"
   
2. /forgot-password
   - Input: email
   - API: POST /api/auth/forgot-password
   - Result: Send reset token email
   
3. User klik link di email
   - Redirect: /reset-password?token=xxx
   
4. /reset-password
   - Input: new password
   - API: POST /api/auth/reset-password
   - Result: Password updated, redirect to login
```

---

## Setup & Deployment

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account (PostgreSQL + Auth)
- Google Cloud account (Drive API key)
- Midtrans merchant account
- Vercel account (for deployment)

### Local Setup
```bash
# Clone repo
git clone https://github.com/vendorin99-byte/fotocloud.git
cd fotocloud

# Install deps
npm install

# Setup env (see below)
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Start dev server
npm run dev
```

### Deployment (Vercel)
```bash
git push origin main
# Vercel auto-deploys

# Env vars in Vercel dashboard:
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- DATABASE_URL
- GOOGLE_API_KEY
- MIDTRANS_SERVER_KEY
- MIDTRANS_CLIENT_KEY
- RESEND_API_KEY (optional)
```

---

## Environment Variables

```env
# NextAuth
NEXTAUTH_SECRET=your-random-secret-here (min 32 char)
NEXTAUTH_URL=https://fotocloud-iota.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://[user]:[password]@db.[region].supabase.co:6543/postgres?schema=public

# Google Drive
GOOGLE_API_KEY=xxx (Drive API, NOT service account)
NEXT_PUBLIC_APP_URL=https://fotocloud-iota.vercel.app

# Payment (Midtrans)
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key

# Email (Resend)
RESEND_API_KEY=your-resend-key (optional, for future email feature)
```

---

## Pricing Model

### Free Tier
- **Price:** Rp 0 (selamanya)
- **Limit:** 1 project
- **Features:**
  - Google Drive sync
  - Comments & reviews
  - Watermark enabled
  - No bulk download
  - No analytics

### Pro Tier
- **Duration options:**
  - 1 month: Rp 15.000
  - 3 months: Rp 39.000 (Rp 13k/month)
  - 12 months: Rp 149.000 (Rp 12.4k/month) ← best deal
  
- **Trial:** 7 days free Pro access (auto-on register)

- **Features:**
  - Unlimited projects
  - Google Drive sync
  - **No watermark**
  - Comments & reviews
  - **Per-photo analytics**
  - **Bulk download**
  - Unlimited access tokens
  - Advanced dashboard

- **Payment method:** Midtrans (all Indonesia payment methods supported)

---

## Admin Features

### Admin Panel (@/dashboard/admin)
**Access:** Only users with role "admin" (set in database)

#### 1. Settings
- View current pricing
- Update: pro1MonthPrice, pro3MonthPrice, pro12MonthPrice
- Update: trialDays (default 7)
- Update: freeProjectLimit (default 1)

#### 2. Testimonials
- List all testimonials
- Create new: name, role, content, rating (1-5)
- Edit testimonial
- Delete testimonial

#### 3. Users (Future)
- List all users
- View: name, email, plan, planExpiresAt, trialEndsAt
- Manual upgrade/downgrade
- Ban/disable account

#### 4. Payments (Future)
- View all transactions
- Payment status: pending, completed, failed
- Refund management

---

## Key Implementation Details

### Email Verification
- On register: Generate unique token, send verification email
- Email contains: `/verify-email?token=xxx` link
- User clicks → emailVerified set to true
- Can't access dashboard until verified (or skip with warning)

### Reset Password
- POST /api/auth/forgot-password → generate reset token
- Email: `/reset-password?token=xxx` link (valid 24 hours)
- POST /api/auth/reset-password → validate token, hash new password
- Auto-logout after reset

### Trial Countdown
- Dashboard shows badge: "Trial ends in X days"
- Auto-remove badge when trialEndsAt < now
- CTA button: "Upgrade to Pro" (link to /pricing)

### Token Expiry
- On token create: if durationDays provided → expiresAt = now + days
- If durationDays = null → expiresAt = null (forever)
- Gallery validation: if token.expiresAt && token.expiresAt < now → 404

### Watermark Logic
- Free tier: watermark always ON (cannot disable)
- Pro tier: watermark toggle per project (default OFF)
- Gallery preview: adds CSS watermark overlay "FOTOCLOUD"

---

## Troubleshooting

### "Column does not exist" error
- Run Supabase migrations first
- Run: `npx prisma generate`

### WhatsApp share not working
- Check: window.open() not blocked by browser
- Mobile: Should auto-open WhatsApp app
- Desktop: Opens WhatsApp Web

### Google Drive sync failing
- Check: API key active (Google Cloud console)
- Check: Folder is "public" with "Anyone with link" access
- Check: Folder ID extracted correctly

### Payment not processing
- Check: Midtrans keys in .env
- Check: Midtrans webhook IP whitelisted
- Check: Transaction amount = pricing amount

---

## Future Roadmap

### v1.3
- [ ] Team members (add colleagues to project)
- [ ] Custom domain per project
- [ ] Advanced analytics (view counts, download stats)
- [ ] Email notifications (on approval, comments)
- [ ] Batch operations (bulk delete, bulk download)

### v2.0
- [ ] Per-photo pricing (sell individual photos)
- [ ] Watermark customization (logo, text)
- [ ] API for third-party integrations
- [ ] Mobile app (iOS/Android)
- [ ] Live preview (while uploading to Drive)

---

## Support & Contact

**Documentation:** This file + code comments  
**Email:** alqordowi97@gmail.com  
**GitHub:** https://github.com/vendorin99-byte/fotocloud  
**Demo:** https://fotocloud-iota.vercel.app
