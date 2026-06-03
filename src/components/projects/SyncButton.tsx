"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  syncStatus: string;
}

export function SyncButton({ projectId, syncStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/projects/${projectId}/sync`, {
      method: "POST",
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setResult(`+${data.added} foto baru`);
      router.refresh();
    } else {
      const data = await res.json();
      setResult(`Error: ${data.error}`);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={handleSync}
        disabled={loading || syncStatus === "syncing"}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {loading || syncStatus === "syncing" ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Syncing...
          </>
        ) : (
          "Sync Drive"
        )}
      </button>
      {result && (
        <span className="text-xs text-gray-500">{result}</span>
      )}
    </div>
  );
}
