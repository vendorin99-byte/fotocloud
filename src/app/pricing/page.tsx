"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    snap: any;
  }
}

const PRO_FEATURES = [
  "Unlimited projects",
  "Google Drive sync",
  "Per-photo analytics",
  "Bulk download",
  "No watermark",
  "Unlimited access tokens",
  "Comments & reviews",
  "Priority support",
];

type Period = "1month" | "3months" | "12months";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>("1month");
  const [loadingPeriod, setLoadingPeriod] = useState<Period | null>(null);

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleCheckout(selectedPeriod: Period) {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setLoadingPeriod(selectedPeriod);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: selectedPeriod }),
      });

      if (!res.ok) {
        alert("Gagal membuat transaksi. Coba lagi.");
        setLoadingPeriod(null);
        return;
      }

      const { snapToken } = await res.json();

      // Open Midtrans Snap
      window.snap.pay(snapToken, {
        onSuccess: function () {
          router.push("/subscription?status=success");
        },
        onPending: function () {
          router.push("/subscription?status=pending");
        },
        onError: function () {
          router.push("/subscription?status=error");
        },
        onClose: function () {
          setLoadingPeriod(null);
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error: Gagal proses checkout");
      setLoadingPeriod(null);
    }
  }

  const pricing: Record<Period, { price: number; pricePerMonth: number; label: string; badge?: string }> = {
    "1month": { price: 9900, pricePerMonth: 9900, label: "1 Bulan" },
    "3months": { price: 27000, pricePerMonth: 9000, label: "3 Bulan", badge: "Hemat 9%" },
    "12months": { price: 99000, pricePerMonth: 8250, label: "1 Tahun", badge: "Hemat 17% + Gratis 2 bulan" },
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-500 mb-2">PENAWARAN SPESIAL</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Upgrade ke FotoCloud Pro</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Nikmati fitur tanpa batas dan percepat workflow fotografi Anda.</p>
        </div>

        {/* Trial Banner */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-6 py-4 mb-12 text-center max-w-2xl mx-auto">
          <p className="text-yellow-900 font-semibold">⭐ Promo Spesial: Akun Trial Gratis!</p>
          <p className="text-sm text-yellow-800 mt-1">Dapatkan akun trial gratis! Nikmati fitur Pro selama 7 hari tanpa bayar.</p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setPeriod("1month")}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              period === "1month"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            1 Bulan
          </button>
          <button
            onClick={() => setPeriod("3months")}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              period === "3months"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            3 Bulan
          </button>
          <button
            onClick={() => setPeriod("12months")}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              period === "12months"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            1 Tahun
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 1 Month */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">1 Bulan</h3>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900">
                Rp {(pricing["1month"].price / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-gray-500 mt-1">/ bulan</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">Tidak auto-debit. Perpanjangan dilakukan manual.</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("1month")}
              disabled={loadingPeriod !== null}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {loadingPeriod === "1month" ? "Memproses..." : "Pilih Paket"}
            </button>
          </div>

          {/* 3 Months */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">3 Bulan</h3>
              {current.badge && period === "3months" && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {pricing["3months"].badge}
                </span>
              )}
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900">
                Rp {(pricing["3months"].price / 1000).toFixed(0)}
              </div>
              <p className="text-sm text-gray-500 mt-1">/ 3 bulan</p>
              <p className="text-xs text-gray-600 mt-2">Hanya Rp {(pricing["3months"].pricePerMonth / 1000).toFixed(0)}K per bulan</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">Tidak auto-debit. Perpanjangan dilakukan manual.</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("3months")}
              disabled={loadingPeriod !== null}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {loadingPeriod === "3months" ? "Memproses..." : "Pilih Paket"}
            </button>
          </div>

          {/* 1 Year - Popular */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 relative border-2 border-gray-800 shadow-xl">
            <div className="absolute -top-4 right-6 bg-gray-900 border-2 border-gray-700 text-yellow-400 text-sm font-bold px-4 py-1 rounded-full">
              Paling Populer
            </div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold">1 Tahun</h3>
              {current.badge && period === "12months" && (
                <span className="ml-auto text-xs bg-yellow-500 text-gray-900 px-2 py-1 rounded-full font-semibold">
                  {pricing["12months"].badge}
                </span>
              )}
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold">
                Rp {(pricing["12months"].price / 1000).toFixed(0)}
              </div>
              <p className="text-gray-300 mt-1">/ tahun</p>
              <p className="text-xs text-gray-400 mt-2">Hanya Rp {(pricing["12months"].pricePerMonth / 1000).toFixed(0)}K per bulan</p>
            </div>
            <p className="text-sm text-gray-300 mb-6">Tidak auto-debit. Perpanjangan dilakukan manual.</p>
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
            <button
              onClick={() => handleCheckout("12months")}
              disabled={loadingPeriod !== null}
              className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {loadingPeriod === "12months" ? "Memproses..." : "Pilih Paket"}
            </button>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-blue-900">
            💳 <strong>Pembayaran aman</strong> via Midtrans. Mendukung semua metode pembayaran populer di Indonesia.
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Hanya mendukung QRIS. Bisa untuk pembelian baru atau perpanjangan.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          <p>© 2024 FotoCloud. Semua hak dilindungi.</p>
          <div className="flex gap-6 justify-center mt-4 text-xs">
            <Link href="#" className="hover:text-gray-900">Privasi</Link>
            <Link href="#" className="hover:text-gray-900">Syarat</Link>
            <Link href="#" className="hover:text-gray-900">Dukungan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
