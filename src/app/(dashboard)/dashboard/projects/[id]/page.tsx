import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SyncButton } from "@/components/projects/SyncButton";
import { TokenManager } from "@/components/tokens/TokenManager";
import { MediaGrid } from "@/components/media/MediaGrid";
import { CopyLinkButton } from "@/components/projects/CopyLinkButton";
import { WatermarkToggle } from "@/components/projects/WatermarkToggle";
import { DeleteButton } from "@/components/projects/DeleteButton";
import { ReviewSummary } from "@/components/projects/ReviewSummary";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, photographerId: session!.user.id },
    include: {
      mediaItems: {
        where: { isHidden: false },
        orderBy: [{ sortOrder: "asc" }, { takenAt: "asc" }],
        include: {
          reviews: { select: { status: true, accessToken: { select: { label: true, token: true } } } },
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard" className="hover:text-gray-600">Wedding Session</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">PRO</span>
          </div>
          {project.clientName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Client: {project.clientName}
              {project.lastSyncedAt && ` · Created ${new Date(project.lastSyncedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/dashboard/projects/${id}/edit`}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Project
          </Link>
          {project.accessTokens[0] && (
            <a href={`${appUrl}/gallery/${project.accessTokens[0].token}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Share Gallery
            </a>
          )}
          <DeleteButton projectId={id} />
          <Link href={`/dashboard/projects/${id}/analytics`}
            className="flex items-center gap-1.5 text-sm text-purple-600 border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Google Drive */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.433 22l4.267-7.4H22l-4.267 7.4H4.433zm3.567-9L2 4h8.567l6 9H8zm5.567-9h8.566L16 13H7.433L13.567 4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Google Drive Sync</p>
                <p className="text-xs text-gray-400">
                  {project.lastSyncedAt
                    ? `Synced on ${new Date(project.lastSyncedAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
                    : "Not synced yet"}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              project.syncStatus === "synced" ? "bg-green-100 text-green-600" :
              project.syncStatus === "syncing" ? "bg-blue-100 text-blue-600" :
              project.syncStatus === "error" ? "bg-red-100 text-red-600" :
              "bg-gray-100 text-gray-500"
            }`}>
              {project.syncStatus === "synced" ? "● Connected" : project.syncStatus === "syncing" ? "● Syncing" : project.syncStatus === "error" ? "● Error" : "● Pending"}
            </span>
          </div>
          {project.driveFolderUrl ? (
            <>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-gray-600 truncate flex-1">Google Drive URL:</p>
                <a href={project.driveFolderUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 truncate max-w-40 hover:underline">
                  {project.driveFolderUrl.replace("https://drive.google.com/drive/folders/", "drive.google.com/.../")}
                </a>
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <SyncButton projectId={id} syncStatus={project.syncStatus} />
            </>
          ) : (
            <Link href={`/dashboard/projects/${id}/edit`}
              className="text-sm text-blue-600 hover:underline">
              + Hubungkan folder Google Drive
            </Link>
          )}
        </div>

        {/* Client Access */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Client Access Portal</p>
                <p className="text-xs text-gray-400">Share link for client review</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors ${project.accessTokens.length > 0 ? "bg-green-500" : "bg-gray-300"} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${project.accessTokens.length > 0 ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
          {project.accessTokens[0] ? (
            <>
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-gray-500 mb-0.5">Public Access Link:</p>
                <p className="text-xs text-gray-700 truncate">
                  {appUrl}/gallery/{project.accessTokens[0].token.slice(0, 20)}...
                </p>
              </div>
              <CopyLinkButton
                url={`${appUrl}/${project.accessTokens[0].slug ?? `gallery/${project.accessTokens[0].token}`}`}
              />
            </>
          ) : (
            <p className="text-sm text-gray-400">Belum ada link klien</p>
          )}
        </div>

        {/* Watermark */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Preview Watermark</p>
                <p className="text-xs text-gray-400">Protect preview photos</p>
              </div>
            </div>
          </div>
          <WatermarkToggle projectId={id} initialValue={project.watermarkEnabled} />
          <p className="text-xs text-gray-400 mt-3">
            When enabled, "FOTOCLOUD" watermark appears on preview photos. Download/approved photos are never watermarked.
          </p>
        </div>
      </div>

      {/* Review Status */}
      <ReviewSummary
        projectId={id}
        tokens={project.accessTokens.map((t: typeof project.accessTokens[number]) => ({
          tokenId: t.id,
          label: t.label,
          approvedCount: t.reviews.filter((r: { status: string }) => r.status === "approved").length,
          revisionCount: t.reviews.filter((r: { status: string }) => r.status === "revision_requested").length,
          commentCount: t._count.comments,
          totalReviews: t._count.reviews,
        }))}
      />

      {/* Media */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Media Assets ({project.mediaItems.length})
          </h2>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
        <MediaGrid items={project.mediaItems} />
      </div>

      {/* Tokens */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Link Klien</h2>
        <TokenManager
          projectId={id}
          initialTokens={project.accessTokens.map((t: typeof project.accessTokens[number]) => ({
            id: t.id,
            token: t.token,
            slug: t.slug,
            label: t.label,
            isActive: t.isActive,
            canDownload: t.canDownload,
            canComment: t.canComment,
            expiresAt: t.expiresAt ? t.expiresAt.toISOString() : null,
            createdAt: t.createdAt.toISOString(),
            reviewCount: t._count.reviews,
            commentCount: t._count.comments,
            approvedCount: t.reviews.filter((r: { status: string }) => r.status === "approved").length,
            revisionCount: t.reviews.filter((r: { status: string }) => r.status === "revision_requested").length,
          }))}
        />
      </div>
    </div>
  );
}
