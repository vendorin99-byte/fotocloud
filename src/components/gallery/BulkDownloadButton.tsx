"use client";
import { useState } from "react";

export function BulkDownloadButton({ token, approvedCount }: { token: string; approvedCount: number }) {
  const [loading, setLoading] = useState(false);

  async function downloadAll() {
    if (approvedCount === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${token}/download-all`);
      if (!res.ok) return;

      const data = await res.json();

      // Open each file in new tab
      data.items.forEach((item: { url: string }) => {
        if (item.url) window.open(item.url, "_blank");
      });
    } finally {
      setLoading(false);
    }
  }

  if (approvedCount === 0) {
    return (
      <button disabled className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-400">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        No approved photos
      </button>
    );
  }

  return (
    <button
      onClick={downloadAll}
      disabled={loading}
      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {loading ? "Downloading..." : `Download All (${approvedCount})`}
    </button>
  );
}
