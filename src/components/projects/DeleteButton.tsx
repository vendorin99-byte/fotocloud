"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ projectId }: { projectId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Hapus project ini? Tindakan ini tidak bisa dibatalkan.")) return;

    setDeleting(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    setDeleting(false);

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
