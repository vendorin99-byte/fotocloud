"use client";

interface MediaItem {
  id: string;
  name: string;
  type: string;
  thumbnailUrl: string | null;
  webViewUrl: string | null;
  reviews: Array<{
    status: string;
    accessToken: { label: string | null; token: string };
  }>;
  _count: { comments: number };
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  approved: { label: "Disetujui", cls: "bg-green-100 text-green-700" },
  revision_requested: { label: "Revisi", cls: "bg-amber-100 text-amber-700" },
  pending: { label: "Menunggu", cls: "bg-gray-100 text-gray-500" },
};

export function MediaGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
        <p>Belum ada media. Klik "Sync Drive" untuk memuat foto dan video.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const approved = item.reviews.filter((r) => r.status === "approved").length;
        const revision = item.reviews.filter((r) => r.status === "revision_requested").length;

        return (
          <div key={item.id} className="group relative">
            <a
              href={item.webViewUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
            >
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  {item.type === "video" ? "VIDEO" : "FOTO"}
                </div>
              )}
              {item.type === "video" && (
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  ▶
                </div>
              )}
            </a>

            <div className="mt-1 flex items-center gap-1 flex-wrap">
              {approved > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusBadge.approved.cls}`}>
                  {approved} ✓
                </span>
              )}
              {revision > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusBadge.revision_requested.cls}`}>
                  {revision} revisi
                </span>
              )}
              {item._count.comments > 0 && (
                <span className="text-xs text-gray-400">
                  {item._count.comments} komentar
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 truncate mt-0.5">{item.name}</p>
          </div>
        );
      })}
    </div>
  );
}
