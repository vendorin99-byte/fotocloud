import Link from "next/link";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/10 px-4 h-14 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-lg">FotoCloud</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white">Masuk</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Pilih Paket</h1>
        <p className="text-gray-400">Mulai gratis, upgrade kapan saja</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="mb-4">
              <span className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">Gratis</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">Rp 0</span>
              <span className="text-gray-400 text-sm ml-1">/ selamanya</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              {[
                "1 project / galeri klien",
                "Unlimited foto & video",
                "Komentar & review",
                "Download untuk klien",
                "Link unik untuk klien",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
              <li className="flex items-center gap-2 text-gray-500">
                <span>✗</span> Lebih dari 1 project
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <span>✗</span> Prioritas support
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full text-center border border-white/20 text-white py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Mulai Gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white border border-white rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full border border-white/20">
                Paling Populer
              </span>
            </div>
            <div className="mb-4">
              <span className="text-xs bg-gray-900 text-gray-300 px-2.5 py-1 rounded-full">Pro</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-gray-900">Rp 99.000</span>
              <span className="text-gray-500 text-sm ml-1">/ bulan</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">atau Rp 899.000 / tahun (hemat 25%)</p>
            <ul className="space-y-3 text-sm text-gray-700 mb-8">
              {[
                "Unlimited project",
                "Unlimited foto & video",
                "Komentar & review",
                "Download untuk klien",
                "Link unik untuk klien",
                "Prioritas support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Pembayaran aman via Midtrans · Transfer bank, GoPay, OVO, QRIS, dan kartu kredit
        </p>
      </section>
    </div>
  );
}
