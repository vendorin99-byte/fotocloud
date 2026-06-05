"use client";
import Link from "next/link";
import { useState } from "react";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

const FREE_FEATURES = [
  { ok: true, text: "1 Project" },
  { ok: true, text: "Google Drive Sync" },
  { ok: true, text: "Comments & Reviews" },
  { ok: false, text: "Per-Photo Analytics" },
  { ok: false, text: "Bulk Download" },
];

const PRO_FEATURES = [
  "Unlimited Projects",
  "Google Drive Sync",
  "No Watermark",
  "Comments & Reviews",
  "Per-Photo Analytics",
  "Bulk Download (Approved Photos)",
  "Unlimited Access Tokens",
  "Advanced Dashboard",
];

type Period = "1month" | "3month" | "12month";

export default function PricingPage() {
  const [period, setPeriod] = useState<Period>("1month");

  const pricing: Record<Period, { price: number; pricePerMonth: number; label: string }> = {
    "1month": { price: 15000, pricePerMonth: 15000, label: "1 Bulan" },
    "3month": { price: 39000, pricePerMonth: 13000, label: "3 Bulan" },
    "12month": { price: 149000, pricePerMonth: 12417, label: "1 Tahun" },
  };

  const current = pricing[period];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            FotoCloud
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/#fitur" className="text-gray-600 hover:text-gray-900">Fitur</Link>
            <Link href="/pricing" className="text-gray-900 font-medium">Harga</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Masuk</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Harga Terjangkau, Fitur Lengkap</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Mulai dengan trial 7 hari gratis. Akses semua fitur Pro tanpa watermark, tidak ada kartu kredit diperlukan.
          </p>
        </div>

        {/* Trial Badge */}
        <div className="mb-8 text-center">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
            ✨ 7 Hari Trial Gratis — Akses Penuh Pro
          </span>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          {(["1month", "3month", "12month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                period === p
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pricing[p].label}
              {p === "12month" && <span className="ml-2 text-xs bg-amber-300 text-amber-900 px-2 py-1 rounded-full">Hemat 17%</span>}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <p className="text-sm text-gray-600">Untuk pemula</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">Rp 0</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Selamanya gratis</p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className={`flex items-center gap-3 text-sm ${f.ok ? "text-gray-900" : "text-gray-400"}`}>
                  {f.ok ? (
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center border-2 border-gray-300 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Mulai Gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
              POPULER
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Pro</h2>
              <p className="text-sm text-gray-300">Untuk profesional</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">Rp {(current.price / 1000).toFixed(0)}K</span>
                <span className="text-sm text-gray-400">/{
                  period === "1month" ? "bulan" :
                  period === "3month" ? "3 bulan" :
                  "tahun"
                }</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Rp {(current.pricePerMonth / 1000).toFixed(0)}K per bulan
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-200">
                  <svg className="w-5 h-5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <button className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                Coba 7 Hari Gratis
              </button>
              <p className="text-xs text-gray-400 text-center">
                Akses penuh tanpa kartu kredit. Batalkan kapan saja.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-6 text-center">
          <p className="text-sm text-blue-900">
            💳 <strong>Pembayaran aman</strong> via Midtrans. Mendukung semua metode pembayaran populer di Indonesia.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4 sm:px-6 mt-12 sm:mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© 2024 FotoCloud. Semua hak dilindungi.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-700">Privasi</Link>
            <Link href="#" className="hover:text-gray-700">Syarat</Link>
            <Link href="#" className="hover:text-gray-700">Dukungan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
