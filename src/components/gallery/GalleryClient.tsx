"use client";
import { useState, useEffect } from "react";
import type { GalleryData } from "@/lib/gallery/token";

type MediaItem = GalleryData["mediaItems"][number];
type Filter = "all" | "photo" | "video" | "pending";

// ── Entry Gate ────────────────────────────────────────────────────────────────

function EntryGate({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Private Gallery</h2>
        <p className="text-sm text-gray-400 mb-6">
          Please enter your name to access the feedback and approval tools.
        </p>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 text-left">YOUR NAME</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onEnter(name.trim())}
            placeholder="e.g. Alice Smith"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
          />
        </div>
        <button
          onClick={() => name.trim() && onEnter(name.trim())}
          disabled={!name.trim()}
          className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          Access Gallery
        </button>
        <p className="text-[10px] text-gray-600 mt-4">
          PROTECTED BY FOTOCLOUD SAAS PLATFORM
        </p>
      </div>
    </div>
  );
}

// ── Main Gallery ──────────────────────────────────────────────────────────────

export function GalleryClient({ gallery, token }: { gallery: GalleryData; token: string }) {
  const [items, setItems] = useState(gallery.mediaItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`fotocloud_author_${token}`);
    if (stored) { setAuthorName(stored); setEntered(true); }
  }, [token]);

  function handleEnter(name: string) {
    setAuthorName(name);
    localStorage.setItem(`fotocloud_author_${token}`, name);
    setEntered(true);
  }

  async function submitReview(mediaItemId: string, status: "approved" | "revision_requested", revisionNote?: string) {
    const res = await fetch(`/api/gallery/${token}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaItemId, status, revisionNote }),
    });
    if (res.ok) {
      const update = (item: MediaItem) =>
        item.id === mediaItemId ? { ...item, review: { status, revisionNote: revisionNote ?? null } } : item;
      setItems((prev) => prev.map(update));
      setSelected((s) => s?.id === mediaItemId ? update(s) : s);
    }
  }

  async function submitComment(mediaItemId: string, body: string) {
    const res = await fetch(`/api/gallery/${token}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaItemId, authorName, body }),
    });
    if (res.ok) {
      const newComment = await res.json();
      const update = (item: MediaItem) =>
        item.id === mediaItemId ? { ...item, comments: [...item.comments, newComment] } : item;
      setItems((prev) => prev.map(update));
      setSelected((s) => s?.id === mediaItemId ? update(s) : s);
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
      {/* Entry gate */}
      {!entered && <EntryGate onEnter={handleEnter} />}

      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{gallery.project.name}</h1>
            {gallery.project.clientName && (
              <p className="text-xs text-gray-400">{gallery.project.clientName}</p>
            )}
          </div>
          {authorName && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                {authorName[0].toUpperCase()}
              </div>
              <span className="hidden md:block">{authorName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {(["all", "photo", "video", "pending"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                filter === f ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              {f === "all" && `Semua (${counts.all})`}
              {f === "photo" && `Foto (${counts.photo})`}
              {f === "video" && `Video (${counts.video})`}
              {f === "pending" && `Belum Review (${counts.pending})`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">Tidak ada media untuk filter ini</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filtered.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)}
                className={`relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:opacity-90 transition-opacity ${
                  item.review?.status === "approved" ? "ring-2 ring-green-500" :
                  item.review?.status === "revision_requested" ? "ring-2 ring-amber-500" : ""
                }`}>
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    {item.type === "video" ? "VIDEO" : "FOTO"}
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-linear-to-t from-black/60 to-transparent flex items-center gap-1">
                  {item.review?.status === "approved" && (
                    <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">✓</span>
                  )}
                  {item.review?.status === "revision_requested" && (
                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold">✎</span>
                  )}
                  {item.comments.length > 0 && (
                    <span className="text-[10px] text-white/70">💬 {item.comments.length}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <Lightbox
          item={selected} token={token}
          canDownload={gallery.token.canDownload}
          canComment={gallery.token.canComment}
          onClose={() => setSelected(null)}
          onReview={(status, note) => submitReview(selected.id, status, note)}
          onComment={(body) => submitComment(selected.id, body)}
        />
      )}
    </div>
  );
}

// Extract Drive file ID from any Drive URL and build a direct image URL
function getFullImageUrl(item: MediaItem): string {
  // Try to extract file ID from thumbnailUrl: .../thumbnail?id=FILE_ID&...
  const thumbMatch = item.thumbnailUrl?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (thumbMatch) {
    return `https://drive.google.com/thumbnail?id=${thumbMatch[1]}&sz=w1920`;
  }
  // Try webViewUrl: lh3.googleusercontent.com/d/FILE_ID or drive.google.com/file/d/FILE_ID/view
  const lh3Match = item.webViewUrl?.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) {
    return `https://drive.google.com/thumbnail?id=${lh3Match[1]}&sz=w1920`;
  }
  return item.thumbnailUrl ?? "";
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ item, token, canDownload, canComment, onClose, onReview, onComment }: {
  item: MediaItem; token: string; canDownload: boolean; canComment: boolean;
  onClose: () => void;
  onReview: (status: "approved" | "revision_requested", note?: string) => void;
  onComment: (body: string) => void;
}) {
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const [commentText, setCommentText] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl z-10 w-8 h-8 flex items-center justify-center">×</button>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center p-6 min-w-0">
        {item.type === "video" ? (
          <video src={item.webViewUrl ?? undefined} controls className="max-w-full max-h-[85vh] rounded-xl" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getFullImageUrl(item)}
            alt={item.name}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onError={(e) => {
              // fallback ke thumbnail ukuran besar
              const t = item.thumbnailUrl?.replace("sz=w800", "sz=w1920");
              if (t) (e.target as HTMLImageElement).src = t;
            }}
          />
        )}
      </div>

      {/* Panel */}
      <div className="w-72 border-l border-white/10 flex flex-col bg-[#0f1117] shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          {item.type === "video" && <span className="text-xs text-gray-500">Video</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Review */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Review</p>
            {item.review?.status === "approved" && (
              <div className="bg-green-500/15 border border-green-500/20 text-green-400 text-xs px-3 py-2 rounded-lg mb-3">✓ Disetujui</div>
            )}
            {item.review?.status === "revision_requested" && (
              <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded-lg mb-3">
                ✎ Revisi diminta
                {item.review.revisionNote && <p className="mt-1 text-amber-300/70">{item.review.revisionNote}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onReview("approved")}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  item.review?.status === "approved" ? "bg-green-600 text-white" : "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                }`}>
                ✓ Setujui
              </button>
              <button onClick={() => setShowRevision((v) => !v)}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  item.review?.status === "revision_requested" ? "bg-amber-600 text-white" : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                }`}>
                ✎ Revisi
              </button>
            </div>
            {showRevision && (
              <div className="mt-2 space-y-2">
                <textarea rows={2} value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Catatan revisi..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-white/20" />
                <button onClick={() => { onReview("revision_requested", revisionNote); setRevisionNote(""); setShowRevision(false); }}
                  disabled={!revisionNote.trim()}
                  className="w-full bg-amber-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-amber-700 disabled:opacity-40">
                  Kirim Revisi
                </button>
              </div>
            )}
          </div>

          {/* Comments */}
          {canComment && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Komentar ({item.comments.length})</p>
              <div className="space-y-2 mb-3">
                {item.comments.map((c) => (
                  <div key={c.id} className="bg-white/5 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-gray-300">{c.authorName}</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{c.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commentText.trim() && (onComment(commentText), setCommentText(""))}
                  placeholder="Tulis komentar..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20" />
                <button onClick={() => { onComment(commentText); setCommentText(""); }} disabled={!commentText.trim()}
                  className="bg-white text-gray-900 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 disabled:opacity-40 shrink-0">
                  ↑
                </button>
              </div>
            </div>
          )}
        </div>

        {canDownload && (
          <div className="p-4 border-t border-white/10">
            <a href={`/api/gallery/${token}/download/${item.id}`}
              className="block w-full text-center bg-white text-gray-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
