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
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

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

  function openWhatsAppShare(t: Token) {
    setShareWhatsAppId(t.id);
    setWhatsappNumber("");
    setWhatsappModalOpen(true);
  }

  function sendWhatsAppShare() {
    if (!whatsappNumber.trim()) {
      alert("Masukkan nomor WhatsApp");
      return;
    }

    const token = tokens.find((t) => t.id === shareWhatsAppId);
    if (!token) return;

    const url = galleryUrl(token);
    const durationText = token.expiresAt
      ? `Akses: ${new Date(token.expiresAt).toLocaleDateString("id-ID")}`
      : "Akses: Selamanya";
    const message = `Halo! 👋\n\nGaleri foto Anda siap di:\n${url}\n\n${durationText}\n💬 Silakan review, comment, dan approve foto favorit.\n\nTerima kasih! 📷`;

    // Format nomor (remove special chars, ensure international format)
    let phoneNumber = whatsappNumber.replace(/\D/g, "");
    if (!phoneNumber.startsWith("62")) {
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "62" + phoneNumber.slice(1);
      } else {
        phoneNumber = "62" + phoneNumber;
      }
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Close modal
    setWhatsappModalOpen(false);
    setWhatsappNumber("");
    setShareWhatsAppId(null);
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
                    onClick={() => openWhatsAppShare(t)}
                    title="Kirim ke WhatsApp"
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

      {/* WhatsApp Modal */}
      {whatsappModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.016-5.044 5.09-5.044 8.221 0 1.584.292 3.149.843 4.651l-1.493 5.460 5.656-1.466c1.486.823 3.12 1.23 4.869 1.23h.004c8.25 0 8.285-8.221 8.285-8.221 0-2.928-1.391-5.771-3.802-7.793-2.414-2.023-5.625-3.135-9.027-3.135" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Kirim via WhatsApp</h3>
              <button onClick={() => setWhatsappModalOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp Client
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+62 812 xxxx xxxx"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: +62812xxxx atau 08xx</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendWhatsAppShare}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Buka WhatsApp
                </button>
                <button
                  onClick={() => setWhatsappModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
