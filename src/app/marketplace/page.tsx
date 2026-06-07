'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';

interface Photo {
  id: string;
  name: string;
  displayName: string | null;
  price: number | null;
  thumbnailUrl: string | null;
  category: string | null;
  averageRating: number | null;
  reviewCount: number;
  project: {
    name: string;
    photographer: {
      id: string;
      name: string | null;
      businessName: string | null;
    };
  };
}

interface PaginatedResponse {
  photos: Photo[];
  total: number;
  page: number;
  totalPages: number;
}

const categories = [
  { value: '', label: 'Semua Kategori' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'product', label: 'Product' },
  { value: 'event', label: 'Event' },
];

export default function MarketplacePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cart, setCart] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [category, page]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('page', page.toString());

      const res = await fetch(`/api/marketplace/photos?${params}`);
      if (!res.ok) {
        console.error('API error:', res.status);
        setPhotos([]);
        setTotalPages(1);
        return;
      }
      const data: PaginatedResponse = await res.json();

      setPhotos(data.photos || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Fetch error:', err);
      setPhotos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const toggleCart = (photoId: string) => {
    setCart((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const totalPrice = photos
    .filter((p) => cart.includes(p.id))
    .reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">FotoCloud Marketplace</h1>
          <p className="text-gray-600 mt-1">Temukan dan beli foto berkualitas tinggi</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filter */}
            <div className="mb-8 flex gap-4 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 aspect-square rounded-lg animate-pulse" />
                ))}
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    {/* Photo */}
                    <div
                      className="aspect-square bg-gray-200 overflow-hidden relative"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      {photo.thumbnailUrl ? (
                        <Image
                          src={photo.thumbnailUrl}
                          alt={photo.displayName || photo.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}

                      {/* Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCart(photo.id);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${
                          cart.includes(photo.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {photo.displayName || photo.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {photo.project.photographer.businessName || photo.project.photographer.name}
                      </p>

                      {/* Rating */}
                      {photo.averageRating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {photo.averageRating.toFixed(1)} ({photo.reviewCount})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        Rp {(photo.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada foto ditemukan</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  ← Sebelumnya
                </button>
                <span className="px-4 py-2">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Keranjang Belanja</h2>

              {cart.length > 0 ? (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {photos
                      .filter((p) => cart.includes(p.id))
                      .map((photo) => (
                        <div key={photo.id} className="flex items-start justify-between pb-3 border-b">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {photo.displayName || photo.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {photo.project.photographer.businessName ||
                                photo.project.photographer.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              Rp {(photo.price || 0).toLocaleString('id-ID')}
                            </p>
                            <button
                              onClick={() => toggleCart(photo.id)}
                              className="text-xs text-red-600 hover:text-red-700 mt-1"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total ({cart.length} foto):</span>
                      <span className="font-bold text-lg text-gray-900">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <Link
                      href={`/marketplace/checkout?photos=${cart.join(',')}`}
                      className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
                    >
                      Lanjut Checkout
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-6 p-6">
              {selectedPhoto.thumbnailUrl && (
                <div className="flex-1 relative">
                  <Image
                    src={selectedPhoto.thumbnailUrl}
                    alt={selectedPhoto.displayName || selectedPhoto.name}
                    width={400}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedPhoto.displayName || selectedPhoto.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Oleh{' '}
                  <Link
                    href={`/marketplace?photographerId=${selectedPhoto.project.photographer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedPhoto.project.photographer.businessName ||
                      selectedPhoto.project.photographer.name}
                  </Link>
                </p>

                {selectedPhoto.category && (
                  <p className="text-sm text-gray-500 mb-4">Kategori: {selectedPhoto.category}</p>
                )}

                {selectedPhoto.averageRating && (
                  <div className="flex items-center gap-1 mb-4">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-600">
                      {selectedPhoto.averageRating.toFixed(1)} ({selectedPhoto.reviewCount} review)
                    </span>
                  </div>
                )}

                <p className="text-3xl font-bold text-gray-900 mb-6">
                  Rp {(selectedPhoto.price || 0).toLocaleString('id-ID')}
                </p>

                <button
                  onClick={() => {
                    toggleCart(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    cart.includes(selectedPhoto.id)
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {cart.includes(selectedPhoto.id) ? 'Hapus dari Keranjang' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
