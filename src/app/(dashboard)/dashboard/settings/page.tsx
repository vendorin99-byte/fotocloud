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
    select: { name: true, email: true, businessName: true, googleEmail: true },
  });

  const messages: Record<string, string> = {
    google_connected: "Google Drive berhasil terhubung!",
  };
  const errors: Record<string, string> = {
    google_denied: "Akses Google Drive ditolak",
    google_failed: "Gagal menghubungkan Google Drive",
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
      </div>

      {sp.success && messages[sp.success] && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
          {messages[sp.success]}
        </div>
      )}
      {sp.error && errors[sp.error] && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
          {errors[sp.error]}
        </div>
      )}

      {/* Profil */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Profil</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nama</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          {user?.businessName && (
            <div className="flex justify-between">
              <span className="text-gray-500">Studio / Bisnis</span>
              <span className="font-medium">{user.businessName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Google Drive */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Google Drive</h2>
        <p className="text-sm text-gray-500 mb-4">
          Hubungkan Google Drive Anda agar FotoCloud bisa membaca folder foto/video.
        </p>

        {user?.googleEmail ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Terhubung</p>
              <p className="text-xs text-gray-500">{user.googleEmail}</p>
            </div>
            <a
              href="/api/auth/google"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Ganti akun
            </a>
          </div>
        ) : (
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Hubungkan Google Drive
          </a>
        )}
      </div>

      {/* Cara pakai */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
        <h3 className="font-medium mb-2">Cara menghubungkan folder Drive</h3>
        <ol className="space-y-1 list-decimal list-inside text-blue-700">
          <li>Hubungkan Google Drive di atas</li>
          <li>Buka Google Drive, masuk ke folder foto/video klien</li>
          <li>Klik kanan folder → Bagikan → Salin link</li>
          <li>Paste link tersebut di halaman detail project</li>
          <li>Klik "Sync Drive" untuk memuat media</li>
        </ol>
      </div>
    </div>
  );
}
