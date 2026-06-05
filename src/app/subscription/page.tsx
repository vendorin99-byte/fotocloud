"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubscriptionStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  useEffect(() => {
    // Redirect ke dashboard subscription page setelah 2 detik
    const timer = setTimeout(() => {
      router.push("/dashboard/subscription");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil! ✓</h1>
            <p className="text-gray-600 mb-6">Upgrade Pro Anda sudah aktif. Akses semua fitur tanpa batas.</p>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Sedang Diproses</h1>
            <p className="text-gray-600 mb-6">Mohon tunggu, kami sedang memverifikasi pembayaran Anda.</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
            <p className="text-gray-600 mb-6">Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.</p>
          </>
        )}

        <p className="text-sm text-gray-500">Mengalihkan ke dashboard dalam beberapa detik...</p>
      </div>
    </div>
  );
}
