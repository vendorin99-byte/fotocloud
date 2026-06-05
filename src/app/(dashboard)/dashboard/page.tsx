import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

const syncBadge: Record<string, { label: string; cls: string }> = {
  pending:  { label: "PENDING",  cls: "bg-gray-100 text-gray-500" },
  syncing:  { label: "SYNCING",  cls: "bg-blue-100 text-blue-600" },
  synced:   { label: "SYNCED",   cls: "bg-green-100 text-green-600" },
  error:    { label: "ERROR",    cls: "bg-red-100 text-red-600" },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { plan: true, planExpiresAt: true, trialEndsAt: true },
  });

  const projects = await prisma.project.findMany({
    where: { photographerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { mediaItems: true, accessTokens: true } },
      mediaItems: { take: 1, orderBy: { createdAt: "asc" }, select: { thumbnailUrl: true, type: true } },
    },
  });

  const isPro = user?.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > new Date());
  const isTrialing = user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();

  // Calculate days remaining in trial
  let trialDaysRemaining = 0;
  if (isTrialing && user?.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Project
          </Link>
      </div>

      {/* Trial Countdown Banner */}
      {isTrialing && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414L9 9.414V6z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              ✨ Trial Pro — {trialDaysRemaining} hari tersisa
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Selamat! Anda sedang menikmati akses penuh ke fitur Pro. Upgrade untuk akses permanent setelah trial berakhir.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Upgrade Sekarang
          </Link>
        </div>
      )}

      {/* Upgrade Banner */}

      {/* Project Grid */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Daftar Proyek</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Urutkan:</span>
          <span className="font-medium text-gray-900">Terbaru</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 mb-1">Belum ada proyek lain</p>
          <p className="text-sm text-gray-500 mb-5">Mulai organisir sesi foto Anda ke dalam project untuk mempermudah sinkronisasi dan pengiriman ke klien.</p>
          <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Pelajari Cara Kerja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: typeof projects[number]) => {
            const badge = syncBadge[project.syncStatus] ?? syncBadge.pending;
            const cover = project.mediaItems[0]?.thumbnailUrl;
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover */}
                <div className="relative h-44 bg-gray-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={project.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                  {project.clientName && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">Client: {project.clientName}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                      {project._count.mediaItems} Media
                    </span>
                    <span>
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
