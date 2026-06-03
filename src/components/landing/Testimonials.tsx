"use client";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((items) => setTestimonials(items.filter((t: Testimonial & { isVisible: boolean }) => t.isVisible)))
      .catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Trusted by Photographers</h2>
        <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
          See what photographers are saying about FotoCloud
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t) => (
            <div key={t.id} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">{t.content}</p>
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
