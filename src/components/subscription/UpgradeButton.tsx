"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snap: any;
  }
}

export function UpgradeButton({ variant = "pricing" }: { variant?: "pricing" | "banner" }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal membuat transaksi");
        return;
      }

      const { snapToken } = await res.json();

      // Load Midtrans Snap script if not loaded
      if (!window.snap) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          const isProduction = process.env.NODE_ENV === "production";
          script.src = isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute(
            "data-client-key",
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""
          );
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      window.snap.pay(snapToken, {
        onSuccess: () => {
          router.push("/dashboard?upgraded=1");
          router.refresh();
        },
        onPending: () => {
          router.push("/dashboard?payment=pending");
        },
        onError: () => {
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          // user closed the popup without paying
        },
      });
    } finally {
      setLoading(false);
    }
  }

  if (variant === "banner") {
    return (
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
      >
        {loading ? "Memproses..." : "Upgrade ke Pro"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setPlan("monthly")}
          className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
            plan === "monthly"
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 border-gray-300 hover:border-gray-500"
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => setPlan("yearly")}
          className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
            plan === "yearly"
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 border-gray-300 hover:border-gray-500"
          }`}
        >
          Tahunan <span className="text-xs text-green-600 font-medium">-25%</span>
        </button>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading
          ? "Memproses..."
          : `Upgrade ${plan === "monthly" ? "Rp 99.000/bln" : "Rp 899.000/thn"}`}
      </button>
    </div>
  );
}
