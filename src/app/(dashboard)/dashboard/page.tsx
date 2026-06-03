import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { FREE_PROJECT_LIMIT } from "@/app/api/projects/route";

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
    select: { plan: true, planExpiresAt: true },
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
  const isAtFreeLimit = !isPro && projects.length >= FREE_PROJECT_LIMIT;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {!isAtFreeLimit && (
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Project
          </Link>
        )}
      </div>

      {/* Upgrade Banner */}
      {isAtFreeLimit && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Tingkatkan Akun Anda</p>
            <p className="text-xs text-amber-700 mt-0.5">Anda saat ini menggunakan paket Gratis. Upgrade untuk penyimpanan tak terbatas dan fitur kolaborasi.</p>
          </div>
          <UpgradeButton variant="banner" />
        </div>
      )}

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
