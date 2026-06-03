import Link from "next/link";
import { Testimonials } from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            FotoCloud
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <Link href="#fitur" className="hover:text-gray-900 transition-colors">Fitur</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Harga</Link>
            <Link href="#testimonial" className="hover:text-gray-900 transition-colors">Testimonial</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/register" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
          Bagikan Hasil Karya Anda<br />
          <span className="text-gray-400">dengan Elegan</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Platform galeri foto profesional untuk fotografer modern. Sinkronisasi otomatis dari Google Drive dengan antarmuka visual yang memukau klien.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register" className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
            Mulai Gratis
          </Link>
          <Link href="/pricing" className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            Lihat Demo
          </Link>
        </div>
      </section>

      {/* Hero Images */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-3 h-72">
          <div className="bg-gray-200 rounded-2xl overflow-hidden col-span-1 row-span-1">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl overflow-hidden col-span-1">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
          </div>
          <div className="bg-gray-300 rounded-2xl overflow-hidden col-span-1">
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Keunggulan FotoCloud</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "☁️",
                title: "Penyimpanan Cloud",
                desc: "Simpan dan akses semua foto Anda dari mana saja. Sinkronisasi otomatis dengan Google Drive Anda.",
              },
              {
                icon: "👥",
                title: "Review Klien Mudah",
                desc: "Bagikan galeri dengan link unik. Klien bisa approve, minta revisi, dan beri komentar langsung.",
              },
              {
                icon: "🔒",
                title: "Keamanan Terjamin",
                desc: "Setiap galeri dilindungi dengan link privat. Anda kontrol siapa yang bisa akses dan download.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Bagaimana Cara Kerjanya?</h2>
            <div className="space-y-6">
              {[
                { n: "1", title: "Hubungkan Drive", desc: "Sambungkan Google Drive Anda. Paste link folder yang berisi foto klien." },
                { n: "2", title: "Buat Project", desc: "Buat project untuk setiap klien. Sistem otomatis sinkronisasi media dari Drive." },
                { n: "3", title: "Bagikan Link", desc: "Kirim link galeri unik ke klien. Mereka bisa review dan approve tanpa perlu login." },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl h-72 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Pilih Paket Anda</h2>
          <p className="text-center text-gray-500 mb-10">Harga terjangkau, cocok untuk fotografer dari semua skala.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Gratis</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">Rp 0</p>
              <p className="text-sm text-gray-400 mb-5">/bulan</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {["1 project", "Unlimited foto & video", "Link unik per klien", "Review & komentar"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center border border-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Pilih Gratis
              </Link>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                PALING POPULER
              </span>
              <p className="text-sm font-medium text-gray-400 mb-1">Pro</p>
              <p className="text-4xl font-bold mb-1">Rp 149k</p>
              <p className="text-sm text-gray-400 mb-5">/bulan</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                {["Unlimited project", "Semua fitur Gratis", "Tanpa Watermark", "Download & Sharing"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center bg-white text-gray-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                Langganan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Siap Memulai Perjalanan Visual Anda?</h2>
        <p className="text-gray-500 mb-8">Bergabunglah dengan ribuan fotografer yang telah mempercayakan karyanya pada FotoCloud.</p>
        <Link href="/register" className="inline-block bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors">
          Daftar Sekarang
        </Link>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>© 2024 FotoCloud SaaS. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-gray-600">Privacy</Link>
            <Link href="#" className="hover:text-gray-600">Terms</Link>
            <Link href="#" className="hover:text-gray-600">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
