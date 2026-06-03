import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-4 h-14 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg">FotoCloud</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white">
            Masuk
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Bagikan galeri foto &amp; video
          <br />
          <span className="text-gray-400">ke klien dengan profesional</span>
        </h1>
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Hubungkan Google Drive Anda, buat link unik untuk setiap klien. Klien bisa
          lihat, komentar, setujui, atau minta revisi — tanpa perlu login.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-100 transition-colors"
        >
          Mulai Gratis
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📁",
              title: "Hubungkan Google Drive",
              desc: "Paste link folder Drive, sistem langsung baca foto & video Anda secara otomatis.",
            },
            {
              icon: "🔗",
              title: "Link Unik per Klien",
              desc: "Buat link berbeda untuk pengantin, orang tua, wedding planner — semuanya terpisah.",
            },
            {
              icon: "✅",
              title: "Review & Komentar",
              desc: "Klien bisa setujui, minta revisi, dan tambahkan komentar langsung di foto/video.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-16 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Siap untuk memulai?</h2>
        <p className="text-gray-400 mb-8">Gratis untuk dicoba. Tidak perlu kartu kredit.</p>
        <Link
          href="/register"
          className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Buat Akun Fotografer
        </Link>
      </section>
    </main>
  );
}
