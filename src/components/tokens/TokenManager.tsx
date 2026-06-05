"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Token {
  id: string;
  token: string;
  slug: string | null;
  label: string | null;
  isActive: boolean;
  canDownload: boolean;
  canComment: boolean;
  expiresAt: string | null;
  createdAt: string;
  reviewCount: number;
  commentCount: number;
  approvedCount: number;
  revisionCount: number;
}

const DURATION_OPTIONS = [
  { label: "Selamanya", days: null },
  { label: "7 hari", days: 7 },
  { label: "30 hari", days: 30 },
  { label: "90 hari", days: 90 },
];

export function TokenManager({
  projectId,
  initialTokens,
}: {
  projectId: string;
  initialTokens: Token[];
}) {
  const router = useRouter();
  const [tokens, setTokens] = useState(initialTokens);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDurationDays, setNewDurationDays] = useState<number | null>(null);
  const [newCanDownload, setNewCanDownload] = useState(true);
  const [newCanComment, setNewCanComment] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareWhatsAppId, setShareWhatsAppId] = useState<string | null>(null);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  function galleryUrl(t: Token) {
    return t.slug ? `${appUrl}/${t.slug}` : `${appUrl}/gallery/${t.token}`;
  }

  async function copyUrl(t: Token) {
    await navigator.clipboard.writeText(galleryUrl(t));
    setCopiedId(t.token);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function createToken() {
    setCreating(true);
    const res = await fetch(`/api/projects/${projectId}/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel || undefined,
        durationDays: newDurationDays,
        canDownload: newCanDownload,
        canComment: newCanComment,
      }),
    });
    setCreating(false);

    if (res.ok) {
      const t = await res.json();
      setTokens((prev) => [
        { ...t, reviewCount: 0, commentCount: 0, approvedCount: 0, revisionCount: 0 },
        ...prev,
      ]);
      setNewLabel("");
      setNewDurationDays(null);
      setNewCanDownload(true);
      setNewCanComment(true);
      setShowForm(false);
    }
  }

  function shareWhatsApp(t: Token) {
    const url = galleryUrl(t);
    const durationText = t.expiresAt
      ? `Akses: ${new Date(t.expiresAt).toLocaleDateString("id-ID")}`
      : "Akses: Selamanya";
    const message = `Halo! 👋\n\nGaleri foto Anda siap di:\n${url}\n\n${durationText}\n💬 Silakan review, comment, dan approve foto favorit.\n\nTerima kasih! 📷`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  async function patchToken(tokenId: string, data: Partial<Token>) {
    const res = await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, ...data } : t)));
    }
  }

  async function deleteToken(tokenId: string) {
    if (!confirm("Hapus link ini? Klien tidak bisa mengaksesnya lagi.")) return;
    const res = await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, { method: "DELETE" });
    if (res.ok) {
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{tokens.length} link klien</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Buat Link Baru
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Label <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="cth: Link Pengantin, Link Orang Tua"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              onKeyDown={(e) => e.key === "Enter" && createToken()}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Durasi akses klien</label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setNewDurationDays(opt.days)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    newDurationDays === opt.days
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Izin klien</p>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewCanDownload((v) => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${newCanDownload ? "bg-gray-900" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newCanDownload ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-gray-700">Download foto</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewCanComment((v) => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${newCanComment ? "bg-gray-900" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newCanComment ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-gray-700">Komentar</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createToken}
              disabled={creating}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {creating ? "Membuat..." : "Buat Link"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl text-sm">
          Belum ada link. Buat link untuk bagikan galeri ke klien.
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div key={t.id} className={`bg-white border border-gray-200 rounded-xl p-4 ${!t.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {t.label || "Link tanpa label"}
                    </span>
                    {!t.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Nonaktif</span>
                    )}
                    {/* Permission badges */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.canDownload ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400 line-through"}`}>
                      Download
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.canComment ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400 line-through"}`}>
                      Komentar
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{galleryUrl(t)}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                    {t.expiresAt && (
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                        Berakhir: {new Date(t.expiresAt).toLocaleDateString("id-ID")}
                      </span>
                    )}
                    <span>{t.approvedCount} disetujui</span>
                    <span>{t.revisionCount} revisi</span>
                    <span>{t.commentCount} komentar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => shareWhatsApp(t)}
                    title="Share ke WhatsApp"
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => copyUrl(t)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedId === t.token ? "Tersalin!" : "Salin URL"}
                  </button>
                </div>
              </div>

              {/* Controls row */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                {/* Toggle download */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => patchToken(t.id, { canDownload: !t.canDownload })}
                    className={`w-8 h-4 rounded-full transition-colors relative ${t.canDownload ? "bg-gray-800" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${t.canDownload ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-xs text-gray-600">Download</span>
                </label>

                {/* Toggle comment */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => patchToken(t.id, { canComment: !t.canComment })}
                    className={`w-8 h-4 rounded-full transition-colors relative ${t.canComment ? "bg-gray-800" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${t.canComment ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-xs text-gray-600">Komentar</span>
                </label>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => patchToken(t.id, { isActive: !t.isActive })}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    {t.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => deleteToken(t.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
