"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      // Get latest subscription orderId
      const latestRes = await fetch("/api/subscription/latest");
      if (!latestRes.ok) {
        alert("Error getting subscription");
        setLoading(false);
        return;
      }

      const latest = await latestRes.json();
      if (!latest?.orderId) {
        alert("No subscription found");
        setLoading(false);
        return;
      }

      // Verify payment status
      const verifyRes = await fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: latest.orderId }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        alert(error.error || "Verification failed");
        setLoading(false);
        return;
      }

      const result = await verifyRes.json();
      if (result.status === "paid") {
        alert("✓ Pembayaran berhasil diverifikasi! Refreshing...");
        router.refresh();
        setTimeout(() => {
          setLoading(false);
          window.location.reload();
        }, 500);
      } else {
        alert("Status: " + result.status + ". Coba beberapa saat lagi.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Refresh error:", err);
      alert("Error: " + String(err));
      setLoading(false);
    }
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
