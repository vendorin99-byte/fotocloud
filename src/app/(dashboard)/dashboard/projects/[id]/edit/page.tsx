"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { isValidDriveFolderUrl } from "@/lib/utils/drive-url";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    description: "",
    driveFolderUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setForm({
          name: p.name ?? "",
          clientName: p.clientName ?? "",
          description: p.description ?? "",
          driveFolderUrl: p.driveFolderUrl ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

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
    setSaving(true);

    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal menyimpan");
      return;
    }

    router.push(`/dashboard/projects/${id}`);
  }

  async function handleDelete() {
    if (!confirm("Hapus project ini beserta semua media dan link klien?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  const urlErr = driveUrlError();

  if (loading) return <div className="text-sm text-gray-500">Memuat...</div>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-gray-500 hover:text-gray-900 text-sm"
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
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
              Nama project
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama klien
            </label>
            <input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
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
              Link folder Google Drive
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
          </div>

          <button
            type="submit"
            disabled={saving || !!urlErr}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      <div className="mt-6 border border-red-200 rounded-xl p-4">
        <p className="text-sm font-medium text-red-700 mb-2">Zona Berbahaya</p>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Hapus project ini
        </button>
      </div>
    </div>
  );
}
