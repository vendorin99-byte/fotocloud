"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Pendaftaran gagal"); return; }
    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gray-900 rounded-2xl mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FotoCloud</h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Akun Baru</h2>
            <p className="text-sm text-gray-500 mb-6">Mulai kelola galeri foto Anda secara profesional.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nama Studio <span className="normal-case font-normal text-gray-400">(opsional)</span>
                </label>
                <input value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Studio Foto ABC"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength={8}
                    value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors mt-1">
                {loading ? "Membuat akun..." : "Buat Akun Gratis"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-gray-900 hover:underline">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-6">
        <span>© 2024 FotoCloud SaaS</span>
        <Link href="#" className="hover:text-gray-600">Privasi</Link>
        <Link href="#" className="hover:text-gray-600">Bantuan</Link>
      </footer>
    </div>
  );
}
