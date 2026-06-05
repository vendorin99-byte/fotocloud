import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div className="p-4 text-red-600">Session invalid. Please login again.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planExpiresAt: true,
      trialEndsAt: true,
      subscriptions: {
        select: { id: true, status: true, amount: true, paidAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  const now = new Date();
  const isPro = user?.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > now);
  const isTrialing = user?.trialEndsAt && user.trialEndsAt > now;

  // Calculate trial days remaining
  let trialDaysRemaining = 0;
  if (isTrialing && user?.trialEndsAt) {
    trialDaysRemaining = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Subscription</h1>
      <p className="text-sm text-gray-500 mb-8">Kelola rencana berlangganan Anda.</p>

      {/* Current Plan */}
      <div className={`border-2 rounded-2xl p-6 mb-6 ${isTrialing ? "bg-blue-50 border-blue-200" : isPro ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Paket Saat Ini</p>
            <p className="text-2xl font-bold text-gray-900">
              {isTrialing ? `Trial Pro (${trialDaysRemaining} hari)` : isPro ? "Pro" : "Free"}
            </p>
          </div>
          {(isPro || isTrialing) && (user.planExpiresAt || user.trialEndsAt) && (
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Berakhir pada:</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user.planExpiresAt || user.trialEndsAt!).toLocaleDateString("id-ID", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {isTrialing
            ? `Anda sedang dalam periode trial Pro selama ${trialDaysRemaining} hari. Nikmati semua fitur premium tanpa batasan.`
            : isPro
              ? "Anda memiliki akses penuh ke semua fitur FotoCloud. Unlimited projects, downloads, dan tidak ada watermark."
              : "Upgrade ke Pro untuk unlock unlimited projects dan fitur premium lainnya."}
        </p>

        {!isPro && !isTrialing && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Upgrade Sekarang
          </Link>
        )}
        {isTrialing && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Pilih Paket Pro
          </Link>
        )}
      </div>

      {/* Transaction History */}
      {user?.subscriptions && user.subscriptions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Riwayat Transaksi</h2>
          <div className="space-y-3">
            {user.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sub.status === "paid" ? "✓ Pembayaran Berhasil" : "⏳ Menunggu Pembayaran"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Rp {(sub.amount ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
