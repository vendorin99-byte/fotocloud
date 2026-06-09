'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';

export default function DownloadsPage() {
  const [email, setEmail] = useState('');
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/purchases?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (res.ok) {
        setDownloads(
          data.purchases.filter((p: any) => p.status === 'paid')
        );
      }
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/marketplace" className="text-gray-900 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Download Foto</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        {!searched ? (
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cari Pesanan Anda</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Mencari...' : 'Cari'}
              </button>
            </form>
          </div>
        ) : downloads.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Foto Anda ({downloads.length})
              </h2>
              <button
                onClick={() => setSearched(false)}
                className="text-gray-900 hover:text-gray-700"
              >
                Cari Pesanan Lain
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {downloads.map((download) => (
                <div key={download.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {download.mediaItem.displayName || download.mediaItem.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order: {download.midtransOrderId}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      Lunas
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Harga:</p>
                      <p className="font-bold text-gray-900">
                        Rp {download.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <a
                      href={download.mediaItem.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Tidak ada pesanan ditemukan</p>
            <button
              onClick={() => setSearched(false)}
              className="text-gray-900 hover:text-gray-700"
            >
              Coba Email Lain
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
