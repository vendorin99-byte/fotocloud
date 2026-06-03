"use client";
import { useState, useEffect } from "react";
import type { GalleryData } from "@/lib/gallery/token";

type MediaItem = GalleryData["mediaItems"][number];
type Filter = "all" | "photo" | "video" | "pending";

export function GalleryClient({
  gallery,
  token,
}: {
  gallery: GalleryData;
  token: string;
}) {
  const [items, setItems] = useState(gallery.mediaItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [showAuthorPrompt, setShowAuthorPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`fotocloud_author_${token}`);
    if (stored) setAuthorName(stored);
  }, [token]);

  function ensureAuthor(action: () => void) {
    if (authorName) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthorPrompt(true);
    }
  }

  function saveAuthorName(name: string) {
    setAuthorName(name);
    localStorage.setItem(`fotocloud_author_${token}`, name);
    setShowAuthorPrompt(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }

  async function submitReview(
    mediaItemId: string,
    status: "approved" | "revision_requested",
    revisionNote?: string
  ) {
    const res = await fetch(`/api/gallery/${token}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaItemId, status, revisionNote }),
    });

    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === mediaItemId
            ? { ...item, review: { status, revisionNote: revisionNote ?? null } }
            : item
        )
      );
      if (selected?.id === mediaItemId) {
        setSelected((s) =>
          s ? { ...s, review: { status, revisionNote: revisionNote ?? null } } : s
        );
      }
    }
  }

  async function submitComment(mediaItemId: string, body: string, timestampSecs?: number) {
    const res = await fetch(`/api/gallery/${token}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaItemId, authorName, body, timestampSecs }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === mediaItemId
            ? { ...item, comments: [...item.comments, newComment] }
            : item
        )
      );
      if (selected?.id === mediaItemId) {
        setSelected((s) =>
          s ? { ...s, comments: [...s.comments, newComment] } : s
        );
      }
    }
  }

  const filtered = items.filter((item) => {
    if (filter === "photo") return item.type === "photo";
    if (filter === "video") return item.type === "video";
    if (filter === "pending") return !item.review || item.review.status === "pending";
    return true;
  });

  const counts = {
    all: items.length,
    photo: items.filter((i) => i.type === "photo").length,
    video: items.filter((i) => i.type === "video").length,
    pending: items.filter((i) => !i.review || i.review.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">{gallery.project.name}</h1>
          {gallery.project.clientName && (
            <p className="text-sm text-gray-400">{gallery.project.clientName}</p>
          )}
          {gallery.token.label && (
            <p className="text-xs text-gray-500 mt-0.5">{gallery.token.label}</p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-white/10 px-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {(["all", "photo", "video", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                filter === f
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" && `Semua (${counts.all})`}
              {f === "photo" && `Foto (${counts.photo})`}
              {f === "video" && `Video (${counts.video})`}
              {f === "pending" && `Belum Review (${counts.pending})`}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Tidak ada media untuk filter ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filtered.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <Lightbox
          item={selected}
          token={token}
          canDownload={gallery.token.canDownload}
          canComment={gallery.token.canComment}
          onClose={() => setSelected(null)}
          onReview={(status, note) =>
            ensureAuthor(() => submitReview(selected.id, status, note))
          }
          onComment={(body) => ensureAuthor(() => submitComment(selected.id, body))}
        />
      )}

      {/* Author Name Prompt */}
      {showAuthorPrompt && (
        <AuthorNamePrompt onSave={saveAuthorName} onCancel={() => setShowAuthorPrompt(false)} />
      )}
    </div>
  );
}

// ── Gallery Card ─────────────────────────────────────────────────────────────

const reviewStyle: Record<string, string> = {
  approved: "ring-2 ring-green-500",
  revision_requested: "ring-2 ring-amber-500",
};

function GalleryCard({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-lg overflow-hidden bg-gray-800 hover:opacity-90 transition-opacity text-left ${
        item.review ? reviewStyle[item.review.status] ?? "" : ""
      }`}
    >
      {item.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
          {item.type === "video" ? "VIDEO" : "FOTO"}
        </div>
      )}

      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white text-lg ml-0.5">▶</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-1">
        {item.review?.status === "approved" && (
          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">✓</span>
        )}
        {item.review?.status === "revision_requested" && (
          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">✎</span>
        )}
        {item.comments.length > 0 && (
          <span className="text-xs text-white/80">💬 {item.comments.length}</span>
        )}
      </div>
    </button>
  );
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  token,
  canDownload,
  canComment,
  onClose,
  onReview,
  onComment,
}: {
  item: MediaItem;
  token: string;
  canDownload: boolean;
  canComment: boolean;
  onClose: () => void;
  onReview: (status: "approved" | "revision_requested", note?: string) => void;
  onComment: (body: string) => void;
}) {
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  function handleApprove() {
    onReview("approved");
    setShowRevisionInput(false);
  }

  function handleRevision() {
    if (!revisionNote.trim()) {
      setShowRevisionInput(true);
      return;
    }
    onReview("revision_requested", revisionNote);
    setRevisionNote("");
    setShowRevisionInput(false);
  }

  function handleComment() {
    if (!commentText.trim()) return;
    onComment(commentText);
    setCommentText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl z-10"
      >
        ×
      </button>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center p-4 min-w-0">
        {item.type === "video" ? (
          <video
            src={item.webViewUrl ?? undefined}
            controls
            className="max-w-full max-h-[85vh] rounded-lg"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.webViewUrl ?? item.thumbnailUrl ?? ""}
            alt={item.name}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        )}
      </div>

      {/* Side Panel */}
      <div className="w-80 border-l border-white/10 flex flex-col bg-gray-900 overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="font-medium text-sm truncate">{item.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Review */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Review
            </p>

            {item.review?.status === "approved" && (
              <div className="bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg mb-3">
                Disetujui
              </div>
            )}
            {item.review?.status === "revision_requested" && (
              <div className="bg-amber-500/20 text-amber-400 text-sm px-3 py-2 rounded-lg mb-3">
                Revisi diminta
                {item.review.revisionNote && (
                  <p className="text-xs mt-1 text-amber-300">{item.review.revisionNote}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.review?.status === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-green-600/20 text-green-400 hover:bg-green-600/40"
                }`}
              >
                ✓ Setujui
              </button>
              <button
                onClick={() => setShowRevisionInput((v) => !v)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.review?.status === "revision_requested"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-600/20 text-amber-400 hover:bg-amber-600/40"
                }`}
              >
                ✎ Revisi
              </button>
            </div>

            {showRevisionInput && (
              <div className="mt-2 space-y-2">
                <textarea
                  rows={2}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Tuliskan catatan revisi..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleRevision}
                  disabled={!revisionNote.trim()}
                  className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  Kirim Revisi
                </button>
              </div>
            )}
          </div>

          {/* Comments */}
          {canComment && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Komentar ({item.comments.length})
              </p>

              <div className="space-y-3 mb-3">
                {item.comments.map((c) => (
                  <div key={c.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-300">{c.authorName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200">{c.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                  placeholder="Tulis komentar..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 shrink-0"
                >
                  Kirim
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Download */}
        {canDownload && (
          <div className="p-4 border-t border-white/10">
            <a
              href={`/api/gallery/${token}/download/${item.id}`}
              className="block w-full text-center bg-white text-gray-900 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Author Name Prompt ────────────────────────────────────────────────────────

function AuthorNamePrompt({
  onSave,
  onCancel,
}: {
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="font-bold text-gray-900 text-lg mb-2">Siapa nama Anda?</h2>
        <p className="text-sm text-gray-500 mb-4">
          Nama Anda akan muncul di komentar dan review.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim())}
          placeholder="cth: Budi (Pengantin Pria)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            Lanjutkan
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
