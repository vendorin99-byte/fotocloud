import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, businessName: true, googleEmail: true, plan: true, planExpiresAt: true },
  });

  const isPro = user?.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > new Date());

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan Akun</h1>
      <p className="text-sm text-gray-500 mb-8">Kelola profil studio dan integrasi penyimpanan cloud Anda.</p>

      {sp.success === "google_connected" && (
        <div className="mb-6 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">
          Google Drive berhasil terhubung!
        </div>
      )}
      {sp.error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {sp.error === "google_denied" ? "Akses Google Drive ditolak" : "Gagal menghubungkan Google Drive"}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main settings */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil Studio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nama Lengkap</label>
                <input
                  defaultValue={user?.name ?? ""}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email Bisnis</label>
                  <input
                    defaultValue={user?.email ?? ""}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Nama Studio</label>
                  <input
                    defaultValue={user?.businessName ?? ""}
                    placeholder="Nama studio Anda"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    readOnly
                  />
                </div>
              </div>
              <button className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                Simpan Perubahan
              </button>
            </div>
          </div>

          {/* Google Drive */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Integrasi Penyimpanan
              </h2>
              {user?.googleEmail && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  ● TERHUBUNG
                </span>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M4.433 22l4.267-7.4H22l-4.267 7.4H4.433zm3.567-9L2 4h8.567l6 9H8zm5.567-9h8.566L16 13H7.433L13.567 4z" fill="#4285F4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Google Drive</p>
                  <p className="text-xs text-gray-500">{user?.googleEmail ?? "Belum terhubung"}</p>
                </div>
              </div>
              <a href="/api/auth/google"
                className="text-sm font-medium text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                {user?.googleEmail ? "Ubah Akun" : "Hubungkan"}
              </a>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Penyimpanan ini digunakan untuk backup otomatis semua sesi foto klien Anda secara real-time.
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Help */}
          <div className="bg-gray-900 text-white rounded-2xl p-5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Butuh Bantuan?</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Pelajari cara mengoptimalkan alur kerja studio Anda dengan panduan lengkap kami.
            </p>
            <Link href="#" className="text-sm font-medium text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              Buka Pusat Bantuan →
            </Link>
          </div>

          {/* Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Paket Saat Ini</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-gray-900">{isPro ? "Pro" : "Gratis"}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {isPro ? "Akses penuh ke semua fitur" : "1 project · Fitur dasar"}
            </p>
            {!isPro && (
              <Link href="/pricing"
                className="block w-full text-center text-sm font-medium border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
