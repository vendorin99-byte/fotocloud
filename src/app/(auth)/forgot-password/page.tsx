"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
      setEmail("");
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1">Lupa Password?</h1>
          <p className="text-sm text-gray-600">Masukkan email Anda untuk reset password</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <p className="text-green-700 font-medium">✓ Email terkirim!</p>
            <p className="text-sm text-green-600">
              Jika email terdaftar, Anda akan menerima link reset password dalam beberapa menit.
            </p>
            <p className="text-xs text-green-600">
              Periksa folder spam jika tidak menerima email dalam 5 menit.
            </p>
            <button
              onClick={() => setSent(false)}
              className="w-full text-center text-sm font-medium text-green-700 hover:text-green-800"
            >
              Coba email lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Memproses..." : "Kirim Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Ingat password?{" "}
          <Link href="/login" className="text-gray-900 font-medium hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
