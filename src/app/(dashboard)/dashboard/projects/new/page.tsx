"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidDriveFolderUrl } from "@/lib/utils/drive-url";

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", clientName: "", description: "", driveFolderUrl: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const urlError = form.driveFolderUrl && !isValidDriveFolderUrl(form.driveFolderUrl)
    ? "URL bukan link folder Google Drive yang valid" : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (urlError) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Gagal membuat project"); return; }
    router.push(`/dashboard/projects/${(await res.json()).id}`);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard" className="hover:text-gray-600">Gallery</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Project</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Project</h1>
      <p className="text-sm text-gray-500 mb-8">Define a new photography collection for your client delivery.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. The Smiths Wedding"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
              <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
                placeholder="e.g. John & Sarah Smith"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Brief notes about the shoot style or requirements..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Drive URL</label>
              <input type="url" value={form.driveFolderUrl} onChange={(e) => set("driveFolderUrl", e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all ${urlError ? "border-red-400" : "border-gray-300"}`} />
              {urlError && <p className="mt-1 text-xs text-red-500">{urlError}</p>}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Back
              </Link>
              <button type="submit" disabled={loading || !!urlError}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-gray-900 text-white rounded-2xl p-5 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-linear-to-br from-gray-600 to-gray-900" />
            </div>
            <div className="relative">
              <svg className="w-8 h-8 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h3 className="font-semibold mb-1">Cloud Integration</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Connect your Google Drive folder to automatically sync all photos and videos to this project.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Pro Tips
            </h3>
            <ul className="space-y-2 text-xs text-blue-800">
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Ensure the Google Drive folder link is set to "Anyone with the link can view".</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Large RAW files will be automatically processed into high-quality JPEGs for the gallery.</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> You can customize the look and feel of the gallery after the project is created.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
