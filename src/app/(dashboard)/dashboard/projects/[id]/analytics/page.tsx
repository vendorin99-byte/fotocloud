import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectAnalyticsPage({
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
        orderBy: { sortOrder: "asc" },
        include: {
          reviews: {
            include: {
              accessToken: { select: { label: true } },
            },
          },
          comments: {
            include: {
              accessToken: { select: { label: true } },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-blue-600 hover:underline mb-4 block">
          ← Back to Project
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.name} — Per-Foto Analytics</h1>
        <p className="text-sm text-gray-500">Detail komentar, approval, dan review per foto</p>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        {project.mediaItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada foto</div>
        ) : (
          project.mediaItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Thumbnail */}
                <div className="md:col-span-1">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      {item.type === "video" ? "VIDEO" : "FOTO"}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="md:col-span-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.type === "video" ? "Video" : "Foto"} • {item.width && item.height ? `${item.width}x${item.height}` : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.reviews.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {item.reviews.filter((r) => r.status === "approved").length} Approved
                        </span>
                      )}
                      {item.comments.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {item.comments.length} Comments
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reviews */}
                  {item.reviews.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Review Status:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.reviews.map((review) => (
                          <span
                            key={review.id}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              review.status === "approved"
                                ? "bg-green-50 text-green-700"
                                : review.status === "revision_requested"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {review.accessToken.label || "Unnamed"}: {review.status === "approved" ? "✓ Approved" : "✎ Revision"}
                            {review.revisionNote && ` - ${review.revisionNote}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {item.comments.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Comments:</p>
                      <div className="space-y-2">
                        {item.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-2.5 border-l-2 border-blue-300">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-semibold text-gray-900">{comment.authorName}</span>
                              <span className="text-[10px] text-gray-500">
                                {comment.accessToken.label && `(${comment.accessToken.label})`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.body}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No data */}
                  {item.reviews.length === 0 && item.comments.length === 0 && (
                    <p className="text-xs text-gray-400">Belum ada review atau komentar</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
