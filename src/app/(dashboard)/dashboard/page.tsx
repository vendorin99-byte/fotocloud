import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";
import { FREE_PROJECT_LIMIT } from "@/app/api/projects/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { plan: true, planExpiresAt: true },
  });

  const projects = await prisma.project.findMany({
    where: { photographerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { mediaItems: true, accessTokens: true } } },
  });

  const isPro =
    user?.plan === "pro" &&
    (!user.planExpiresAt || user.planExpiresAt > new Date());
  const isAtFreeLimit = !isPro && projects.length >= FREE_PROJECT_LIMIT;

  const syncStatusLabel: Record<string, string> = {
    pending: "Belum disync",
    syncing: "Syncing...",
    synced: "Tersync",
    error: "Error sync",
  };

  const syncStatusColor: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    syncing: "bg-blue-100 text-blue-700",
    synced: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* Upgrade banner untuk free user yang sudah di limit */}
      {isAtFreeLimit && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-900">
              Akun Gratis — {FREE_PROJECT_LIMIT} project sudah dipakai
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Upgrade ke Pro untuk membuat unlimited project.{" "}
              <Link href="/pricing" className="underline">Lihat harga →</Link>
            </p>
          </div>
          <UpgradeButton variant="banner" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Project</h1>
          {isPro && (
            <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full">Pro</span>
          )}
        </div>
        {!isAtFreeLimit && (
          <Link
            href="/dashboard/projects/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            + Buat Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">Belum ada project</p>
          <p className="mt-1 text-sm">Buat project pertama Anda untuk memulai</p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Buat Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: typeof projects[number]) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{project.name}</h2>
                  {project.clientName && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {project.clientName}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    syncStatusColor[project.syncStatus] ?? syncStatusColor.pending
                  }`}
                >
                  {syncStatusLabel[project.syncStatus] ?? "Belum disync"}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>{project._count.mediaItems} media</span>
                <span>{project._count.accessTokens} link klien</span>
              </div>

              {project.lastSyncedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  Sync terakhir:{" "}
                  {new Date(project.lastSyncedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
