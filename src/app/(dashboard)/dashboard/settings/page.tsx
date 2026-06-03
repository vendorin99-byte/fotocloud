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
    select: { name: true, email: true, businessName: true, plan: true, planExpiresAt: true },
  });

  const isPro = user?.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > new Date());

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan Akun</h1>
      <p className="text-sm text-gray-500 mb-8">Kelola profil studio dan integrasi penyimpanan cloud Anda.</p>

      {sp.success && (
        <div className="mb-6 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">
          Perubahan berhasil disimpan.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
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
                <input defaultValue={user?.name ?? ""} readOnly
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                  <input defaultValue={user?.email ?? ""} readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Nama Studio</label>
                  <input defaultValue={user?.businessName ?? ""} placeholder="Nama studio" readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Google Drive cara pakai */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M4.433 22l4.267-7.4H22l-4.267 7.4H4.433zm3.567-9L2 4h8.567l6 9H8zm5.567-9h8.566L16 13H7.433L13.567 4z" fill="#4285F4" />
              </svg>
              Google Drive Integration
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              FotoCloud membaca foto dari folder Google Drive yang Anda bagikan. Tidak perlu login Google.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">Cara menghubungkan folder Drive:</p>
              <ol className="space-y-2.5">
                {[
                  { n: "1", text: 'Buka Google Drive → masuk ke folder foto klien' },
                  { n: "2", text: 'Klik kanan folder → "Share" → "Anyone with the link" → pilih "Viewer"' },
                  { n: "3", text: 'Klik "Copy link" — URL akan berisi /folders/...' },
                  { n: "4", text: 'Paste URL tersebut di halaman detail project' },
                  { n: "5", text: 'Klik tombol "Sync Drive" — semua foto otomatis tampil di galeri' },
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-3 text-sm text-blue-800">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    {s.text}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-700">
                Pastikan folder di-set <strong>"Anyone with the link"</strong> agar foto bisa tampil. Folder private tidak akan bisa dibaca.
              </p>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
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
            <Link href="#" className="text-sm font-medium text-white flex items-center gap-1 hover:text-gray-300">
              Buka Pusat Bantuan →
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Paket Saat Ini</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{isPro ? "Pro" : "Gratis"}</p>
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
