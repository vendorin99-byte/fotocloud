import Link from "next/link";

interface ReviewData {
  tokenId: string;
  label: string | null;
  approvedCount: number;
  revisionCount: number;
  commentCount: number;
  totalReviews: number;
}

export function ReviewSummary({ projectId, tokens }: { projectId: string; tokens: ReviewData[] }) {
  if (tokens.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Review Status</h2>
        <p className="text-sm text-gray-500">Belum ada link klien. Buat link untuk mulai receive review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Review Status per Klien</h2>
      <div className="space-y-3">
        {tokens.map((t) => (
          <div key={t.tokenId} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{t.label || "Unnamed Link"}</p>
                <p className="text-xs text-gray-500">{t.totalReviews} photos reviewed</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-600">{t.approvedCount}</p>
                <p className="text-xs text-green-700">Approved</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-amber-600">{t.revisionCount}</p>
                <p className="text-xs text-amber-700">Revision</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-600">{t.commentCount}</p>
                <p className="text-xs text-blue-700">Comments</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        💡 Tip: Buka gallery link (klik "Share Gallery") untuk lihat detail mana foto yang di-approve/revisi.
      </p>
    </div>
  );
}
