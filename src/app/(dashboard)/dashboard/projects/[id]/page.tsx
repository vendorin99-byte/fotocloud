import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SyncButton } from "@/components/projects/SyncButton";
import { TokenManager } from "@/components/tokens/TokenManager";
import { MediaGrid } from "@/components/media/MediaGrid";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, photographerId: session!.user.id },
    include: {
      mediaItems: {
        where: { isHidden: false },
        orderBy: [{ sortOrder: "asc" }, { takenAt: "asc" }],
        include: {
          reviews: {
            select: { status: true, accessToken: { select: { label: true, token: true } } },
          },
          _count: { select: { comments: true } },
        },
      },
      accessTokens: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { reviews: true, comments: true } },
          reviews: { select: { status: true }, take: 100 },
        },
      },
    },
  });

  if (!project) notFound();

  const syncStatusLabel: Record<string, string> = {
    pending: "Belum disync",
    syncing: "Syncing...",
    synced: "Tersync",
    error: "Error sync",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard" className="mt-1 text-gray-500 hover:text-gray-900 text-sm">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{project.name}</h1>
          {project.clientName && (
            <p className="text-gray-500 mt-0.5">{project.clientName}</p>
          )}
        </div>
        <Link
          href={`/dashboard/projects/${id}/edit`}
          className="text-sm text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg"
        >
          Edit
        </Link>
      </div>

      {/* Drive + Sync */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700">Google Drive</p>
            {project.driveFolderUrl ? (
              <a
                href={project.driveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block max-w-sm"
              >
                {project.driveFolderUrl}
              </a>
            ) : (
              <p className="text-sm text-gray-400">
                Belum ada folder Drive —{" "}
                <Link href={`/dashboard/projects/${id}/edit`} className="underline">
                  Hubungkan
                </Link>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Status: {syncStatusLabel[project.syncStatus] ?? "-"}
              {project.lastSyncedAt &&
                ` · Terakhir: ${new Date(project.lastSyncedAt).toLocaleString("id-ID")}`}
            </p>
          </div>
          {project.driveFolderUrl && (
            <SyncButton projectId={id} syncStatus={project.syncStatus} />
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Media ({project.mediaItems.length})
        </h2>
        <MediaGrid items={project.mediaItems} />
      </div>

      {/* Client Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Klien</h2>
        <TokenManager
          projectId={id}
          initialTokens={project.accessTokens.map((t) => ({
            id: t.id,
            token: t.token,
            label: t.label,
            isActive: t.isActive,
            canDownload: t.canDownload,
            canComment: t.canComment,
            expiresAt: t.expiresAt ? t.expiresAt.toISOString() : null,
            createdAt: t.createdAt.toISOString(),
            reviewCount: t._count.reviews,
            commentCount: t._count.comments,
            approvedCount: t.reviews.filter((r) => r.status === "approved").length,
            revisionCount: t.reviews.filter((r) => r.status === "revision_requested").length,
          }))}
        />
      </div>
    </div>
  );
}
