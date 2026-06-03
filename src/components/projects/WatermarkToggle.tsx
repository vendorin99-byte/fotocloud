"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function WatermarkToggle({
  projectId,
  initialValue,
}: {
  projectId: string;
  initialValue: boolean;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toggle() {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watermarkEnabled: !enabled }),
    });
    setSaving(false);

    if (res.ok) {
      setEnabled(!enabled);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-gray-900" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
      <span className="text-sm text-gray-700">
        {enabled ? "Watermark ON" : "Watermark OFF"}
      </span>
    </div>
  );
}
