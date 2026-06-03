"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  isVisible: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", content: "", rating: 5 });

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then(setTestimonials)
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const t = await res.json();
      setTestimonials((prev) => [t, ...prev]);
      setForm({ name: "", role: "", content: "", rating: 5 });
      setShowForm(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Testimonials</h1>
      <p className="text-sm text-gray-500 mb-6">Manage client testimonials displayed on landing page.</p>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6"
      >
        + Add Testimonial
      </button>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-lg p-4 mb-6 space-y-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Role (optional)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Testimonial content"
            rows={3}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
            <option value={4}>⭐⭐⭐⭐ (4)</option>
            <option value={3}>⭐⭐⭐ (3)</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium flex-1"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
              </div>
              <span className="text-sm">
                {"⭐".repeat(t.rating)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{t.content}</p>
            <p className="text-xs text-gray-400">
              {new Date(t.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
