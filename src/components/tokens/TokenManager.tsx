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
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      body: JSON.stringify({ label: newLabel || undefined }),
    });
    setCreating(false);

    if (res.ok) {
      const t = await res.json();
      setTokens((prev) => [
        {
          ...t,
          reviewCount: 0,
          commentCount: 0,
          approvedCount: 0,
          revisionCount: 0,
        },
        ...prev,
      ]);
      setNewLabel("");
      setShowForm(false);
    }
  }

  async function toggleActive(tokenId: string, isActive: boolean) {
    const res = await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, isActive: !isActive } : t))
      );
    }
  }

  async function deleteToken(tokenId: string) {
    if (!confirm("Hapus link ini? Klien tidak bisa mengaksesnya lagi.")) return;
    const res = await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{tokens.length} link aktif</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Buat Link Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border rounded-xl p-4 flex items-end gap-3">
          <div className="flex-1">
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
          <button
            onClick={createToken}
            disabled={creating}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 shrink-0"
          >
            {creating ? "Membuat..." : "Buat"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Batal
          </button>
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl text-sm">
          Belum ada link. Buat link untuk bagikan galeri ke klien.
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className={`bg-white border rounded-xl p-4 ${
                !t.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {t.label || "Link tanpa label"}
                    </span>
                    {!t.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {galleryUrl(t)}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>{t.approvedCount} disetujui</span>
                    <span>{t.revisionCount} revisi</span>
                    <span>{t.commentCount} komentar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyUrl(t)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedId === t.token ? "Tersalin!" : "Salin URL"}
                  </button>
                  <button
                    onClick={() => toggleActive(t.id, t.isActive)}
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
