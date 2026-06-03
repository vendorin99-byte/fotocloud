"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidDriveFolderUrl } from "@/lib/utils/drive-url";

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    description: "",
    driveFolderUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function driveUrlError() {
    if (!form.driveFolderUrl) return null;
    return isValidDriveFolderUrl(form.driveFolderUrl)
      ? null
      : "URL bukan link folder Google Drive yang valid";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (driveUrlError()) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal membuat project");
      return;
    }

    const project = await res.json();
    router.push(`/dashboard/projects/${project.id}`);
  }

  const urlErr = driveUrlError();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Buat Project Baru</h1>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama project <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="cth: Prewedding - Budi & Sari"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama klien <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              placeholder="cth: Budi & Sari"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link folder Google Drive <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              type="url"
              value={form.driveFolderUrl}
              onChange={(e) => set("driveFolderUrl", e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                urlErr ? "border-red-400" : "border-gray-300"
              }`}
            />
            {urlErr && <p className="mt-1 text-xs text-red-600">{urlErr}</p>}
            <p className="mt-1 text-xs text-gray-400">
              Hubungkan Google Drive di{" "}
              <Link href="/dashboard/settings" className="underline">
                Pengaturan
              </Link>{" "}
              sebelum sync media
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !!urlErr}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Membuat..." : "Buat Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
