"use client";
import Link from "next/link";
import { useState } from "react";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

const FREE_FEATURES = [
  { ok: true,  text: "Penyimpanan 5GB" },
  { ok: true,  text: "Gallery Publik (1 album)" },
  { ok: true,  text: "Watermark FotoCloud" },
  { ok: false, text: "Custom Domain" },
];

const PRO_FEATURES = [
  { text: "Penyimpanan 100GB (SSD)" },
  { text: "Unlimited Public & Private Galleries" },
  { text: "No Watermark / Custom Logo" },
  { text: "Custom Domain (fotomu.com)" },
  { text: "Analytics Dashboard & Client Access" },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between max-w-6xl mx-auto sticky top-0 z-10">
        <Link href="/" className="font-bold text-gray-900">FotoCloud</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link href="/#fitur" className="hover:text-gray-900">Fitur</Link>
          <Link href="/pricing" className="text-gray-900 font-medium border-b-2 border-gray-900 pb-0.5">Harga</Link>
          <Link href="#" className="hover:text-gray-900">Testimonial</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Login</Link>
          <Link href="/register" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Mulai Gratis
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pilih Paket yang Sesuai</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Kelola portofolio fotografi Anda dengan sistem cloud yang elegan. Mulai dari yang sederhana hingga kebutuhan studio profesional berskala besar.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}>Bulanan</span>
          <button
            onClick={() => setYearly((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-gray-900" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${yearly ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-400"}`}>Tahunan</span>
          {yearly && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">HEMAT 20%</span>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Free */}
          <div className="bg-white border border-gray-200 rounded-2xl p-7">
            <p className="font-semibold text-gray-900 mb-1">Free</p>
            <p className="text-xs text-gray-400 mb-5">Untuk hobi dan eksplorasi</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">Rp 0</span>
              <span className="text-gray-400 text-sm ml-1">/bulan</span>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? "text-gray-700" : "text-gray-400"}`}>
                  {f.ok ? (
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
            <Link href="/register"
              className="block w-full text-center border border-gray-300 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Daftar Sekarang
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gray-900 text-white rounded-2xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
              PALING POPULER
            </div>
            <p className="font-semibold mb-1">Pro</p>
            <p className="text-xs text-gray-400 mb-5">Untuk fotografer profesional</p>
            <div className="mb-6">
              <span className="text-5xl font-bold">
                Rp {yearly ? "99.000" : "99.000"}
              </span>
              <span className="text-gray-400 text-sm ml-1">/bulan</span>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm text-gray-200">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>
            <UpgradeButton />
          </div>
        </div>

        {/* Payment trust */}
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Pembayaran Aman &amp; Instan</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Kami bekerja sama dengan Midtrans untuk menjamin keamanan transaksi Anda. Mendukung kartu kredit, transfer bank, dan e-wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>© 2024 FotoCloud SaaS. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-600">Privacy</Link>
            <Link href="#" className="hover:text-gray-600">Terms</Link>
            <Link href="#" className="hover:text-gray-600">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
