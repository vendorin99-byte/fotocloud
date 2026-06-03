# FotoCloud — Setup Guide

## Prasyarat

- Node.js 18+
- PostgreSQL (lokal atau cloud)

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Database Lokal

### Opsi A — Docker (paling mudah):
```bash
docker run --name fotocloud-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fotocloud \
  -p 5432:5432 -d postgres
```

### Opsi B — PostgreSQL sudah terinstall:
```sql
CREATE DATABASE fotocloud;
```

## 3. Environment Variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fotocloud"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Google Drive (bisa diisi nanti)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
TOKEN_ENCRYPTION_KEY="$(openssl rand -hex 32)"

# Midtrans (bisa diisi nanti, pakai sandbox dulu)
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Jalankan Database Migration

```bash
npx prisma migrate dev --name init
```

## 5. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

---

## Setup Google Drive (opsional untuk dev)

1. Buka https://console.cloud.google.com
2. Enable **Google Drive API**
3. Buat **OAuth 2.0 Client ID** (Web application)
4. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID + Secret ke `.env.local`

---

## Setup Midtrans (untuk subscription)

1. Daftar di https://dashboard.midtrans.com
2. Gunakan environment **Sandbox** untuk testing
3. Pergi ke **Settings → Access Keys**
4. Copy **Server Key** → `MIDTRANS_SERVER_KEY`
5. Copy **Client Key** → `MIDTRANS_CLIENT_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
6. Setup **Payment Notification URL** (webhook): `https://yourdomain.com/api/subscription/webhook`

---

## Deploy ke Render

Render adalah platform yang bisa host **app Next.js + PostgreSQL sekaligus** dalam satu tempat.

### Database di Render atau Supabase?

| | Render PostgreSQL | Supabase |
|---|---|---|
| Free tier | Gratis 90 hari, lalu $7/bln | Gratis selamanya (500MB) |
| Cocok untuk | Deploy full di Render | Database saja, app di Render/Vercel |
| Setup | Otomatis via render.yaml | Manual ganti DATABASE_URL |

**Rekomendasi**: Pakai **Supabase** untuk database (gratis selamanya) + **Render** untuk app.

### Deploy App ke Render

1. Push kode ke GitHub
2. Buka https://render.com → **New Web Service**
3. Connect repo GitHub
4. Render akan otomatis detect `render.yaml`
5. Isi environment variables yang ditandai `sync: false`:
   - `NEXTAUTH_URL` = `https://nama-app.onrender.com`
   - `NEXT_PUBLIC_APP_URL` = `https://nama-app.onrender.com`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://nama-app.onrender.com/api/auth/google/callback`
   - `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`

### Pakai Supabase sebagai Database

1. Buat project di https://supabase.com
2. Settings → Database → Connection string (URI)
3. Set env var di Render: `DATABASE_URL = postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
4. Hapus bagian `databases:` di `render.yaml` (tidak perlu Render DB)

### Catatan Render Free Tier

- Web service **tidur** setelah 15 menit tidak ada traffic
- Request pertama setelah tidur lambat (~30 detik)
- Untuk produksi: upgrade ke plan **Starter** ($7/bln) agar tidak tidur

---

## Subscription & Paket

| Paket | Harga | Batas |
|---|---|---|
| Free | Rp 0 | 1 project |
| Pro Bulanan | Rp 99.000/bln | Unlimited project |
| Pro Tahunan | Rp 899.000/thn | Unlimited project |

Pembayaran via Midtrans (Transfer bank, GoPay, OVO, QRIS, kartu kredit).

---

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/login, register          # Auth fotografer
│   ├── (dashboard)/dashboard/          # Dashboard (protected)
│   ├── gallery/[token]/                # Galeri publik klien
│   ├── pricing/                        # Halaman harga
│   └── api/
│       ├── auth/                       # NextAuth + register + Google OAuth
│       ├── projects/                   # CRUD project + sync Drive
│       ├── gallery/[token]/            # Review, komentar, download
│       └── subscription/               # Checkout + webhook Midtrans
├── components/
│   ├── gallery/GalleryClient.tsx       # Grid + lightbox + review + komentar
│   ├── subscription/UpgradeButton.tsx  # Tombol upgrade + Midtrans Snap
│   ├── tokens/TokenManager.tsx         # Kelola link klien
│   └── media/MediaGrid.tsx             # Grid foto di dashboard
└── lib/
    ├── auth.ts                         # NextAuth config
    ├── prisma.ts                       # Prisma client (adapter-pg)
    ├── midtrans.ts                     # Midtrans helper
    ├── google/drive.ts                 # Sync Drive folder
    └── gallery/token.ts                # Validasi token galeri
```
