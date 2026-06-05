"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    // Get latest subscription from history
    const subscriptions = await fetch("/api/projects")
      .then(() => fetch("/api/subscription/status"))
      .catch(() => null);

    // Actually, let's get the latest subscription ID from the page
    // For now, refresh the page to reload data
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
      title="Refresh payment status"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}
