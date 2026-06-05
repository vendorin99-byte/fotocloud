import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            FotoCloud
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Syarat & Ketentuan</h1>
        <p className="text-gray-600 mb-8">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan FotoCloud, Anda menerima semua syarat dan ketentuan yang berlaku.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Akun Pengguna</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Anda bertanggung jawab untuk menjaga kerahasiaan password</li>
              <li>Anda harus berusia minimal 18 tahun</li>
              <li>Informasi yang diberikan harus akurat dan lengkap</li>
              <li>Anda bertanggung jawab atas semua aktivitas di akun Anda</li>
              <li>FotoCloud berhak menangguhkan akun yang melanggar syarat</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Trial Period</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Akun baru mendapat akses trial Pro selama 7 hari</li>
              <li>Selama trial, akses semua fitur Pro tanpa biaya</li>
              <li>Setelah trial berakhir, pembayaran diperlukan untuk melanjutkan</li>
              <li>Tidak ada biaya otomatis - pembayaran manual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pembayaran & Langganan</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Pembayaran diproses melalui Midtrans dengan QRIS</li>
              <li>Harga dapat berubah dengan pemberitahuan sebelumnya</li>
              <li>Langganan non-refundable kecuali ditetapkan lain oleh hukum</li>
              <li>Pembayaran gagal akan membatasi akses sampai berhasil</li>
              <li>Kami tidak menyimpan data kartu - semua diproses Midtrans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Konten & Google Drive</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Anda tetap pemilik semua foto/video di Google Drive</li>
              <li>FotoCloud hanya menyediakan akses menampilkan ke klien</li>
              <li>Anda bertanggung jawab memiliki hak atas konten</li>
              <li>Konten tidak boleh melanggar hak cipta atau privasi</li>
              <li>FotoCloud berhak menghapus konten yang melanggar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Token Akses & Galeri</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Token akses hanya untuk klien yang ditentukan</li>
              <li>Jangan bagikan token tanpa persetujuan klien</li>
              <li>Token dapat di-revoke kapan saja</li>
              <li>Token dapat memiliki masa berlaku terbatas atau tidak terbatas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Batasan Tanggung Jawab</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>FotoCloud disediakan "sebagaimana adanya" tanpa jaminan</li>
              <li>Tidak bertanggung jawab atas kehilangan data</li>
              <li>Tidak bertanggung jawab atas downtime atau gangguan</li>
              <li>Tidak bertanggung jawab atas klaim pihak ketiga</li>
              <li>Tanggung jawab maksimal terbatas pada pembayaran 30 hari terakhir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privasi Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Data minimal diperlukan untuk layanan</li>
              <li>Data tidak dijual ke pihak ketiga</li>
              <li>Data dienkripsi dan disimpan aman di Supabase</li>
              <li>Token Google Drive dienkripsi</li>
              <li>Lihat Kebijakan Privasi untuk detail lengkap</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Penggunaan Dilarang</h2>
            <p className="mb-3">Jangan gunakan FotoCloud untuk:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Konten melanggar hak cipta</li>
              <li>Konten dengan malware atau virus</li>
              <li>Aktivitas ilegal</li>
              <li>Harassment atau intimidasi</li>
              <li>Spam atau phishing</li>
              <li>Reverse engineering</li>
              <li>Penyalahgunaan infrastruktur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifikasi Layanan</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>FotoCloud dapat memodifikasi layanan kapan saja</li>
              <li>Pemberitahuan minimal 30 hari untuk perubahan material</li>
              <li>Penggunaan berkelanjutan berarti menerima perubahan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Penghentian Akun</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Hapus akun kapan saja dari pengaturan</li>
              <li>FotoCloud dapat menghapus akun yang melanggar syarat</li>
              <li>Penghapusan akan menghapus semua data (tidak dapat di-recover)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Hubungi Kami</h2>
            <p>Untuk pertanyaan tentang Syarat & Ketentuan:</p>
            <p className="font-medium text-gray-900 mt-2">
              Email: support@fotocloud.app<br />
              Atau gunakan tombol Support di dashboard
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600">
              Dengan menggunakan FotoCloud, Anda menyetujui seluruh syarat ini.
            </p>
          </section>
        </div>

        <div className="flex gap-4 mt-12 pb-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
