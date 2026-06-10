'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DollarSign, Save } from 'lucide-react';

interface Photo {
  id: string;
  name: string;
  displayName: string | null;
  price: number | null;
  isForSale: boolean;
  category: string | null;
  thumbnailUrl: string | null;
  projectName: string;
  driveFileId: string | null;
}

interface PhotoPricingClientProps {
  photos: Photo[];
}

export default function PhotoPricingClient({ photos: initialPhotos }: PhotoPricingClientProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all | forsale | notsale

  const filteredPhotos = photos.filter((p) => {
    if (filter === 'forsale') return p.isForSale;
    if (filter === 'notsale') return !p.isForSale;
    return true;
  });

  const handlePriceChange = (photoId: string, price: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, price: price === '' ? null : parseInt(price) || 0 } : p
      )
    );
  };

  const handleCategoryChange = (photoId: string, category: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, category: category || null } : p))
    );
  };

  const handleDisplayNameChange = (photoId: string, displayName: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, displayName: displayName || null } : p
      )
    );
  };

  const handleSave = async (photo: Photo) => {
    setSaving(photo.id);
    setSuccess(null);

    try {
      const res = await fetch(`/api/photos/Rp {photo.id}/update-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: photo.price,
          isForSale: photo.price !== null && photo.price > 0,
          category: photo.category,
          displayName: photo.displayName,
        }),
      });

      if (res.ok) {
        setSuccess(photo.id);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        alert('Gagal menyimpan');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(null);
    }
  };

  const toggleForSale = async (photo: Photo) => {
    const newIsForSale = !photo.isForSale;
    const newPhoto = { ...photo, isForSale: newIsForSale };

    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? newPhoto : p))
    );

    setSaving(photo.id);
    try {
      const res = await fetch(`/api/photos/Rp {photo.id}/update-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isForSale: newIsForSale,
          price: photo.price,
          category: photo.category,
          displayName: photo.displayName,
        }),
      });

      if (!res.ok) {
        alert('Gagal update');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors Rp {
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          Semua ({photos.length})
        </button>
        <button
          onClick={() => setFilter('forsale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors Rp {
            filter === 'forsale'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          Dijual ({photos.filter((p) => p.isForSale).length})
        </button>
        <button
          onClick={() => setFilter('notsale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors Rp {
            filter === 'notsale'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          Tidak Dijual ({photos.filter((p) => !p.isForSale).length})
        </button>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-200 relative">
                {photo.thumbnailUrl ? (
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.displayName || photo.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                {/* For Sale Badge */}
                {photo.isForSale && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Dijual
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-4">
                {/* Project Name - only show if from Drive */}
                {photo.driveFileId && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Proyek</p>
                    <p className="font-medium text-gray-900">{photo.projectName}</p>
                  </div>
                )}

                {/* Display Name - Main editable field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Foto
                  </label>
                  <input
                    type="text"
                    value={photo.displayName || ''}
                    onChange={(e) => handleDisplayNameChange(photo.id, e.target.value)}
                    placeholder="Kosong - isi nama foto Anda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">File asli: {photo.name}</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={photo.category || ''}
                    onChange={(e) => handleCategoryChange(photo.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="wedding">Wedding</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="product">Product</option>
                    <option value="event">Event</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga (Rp)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">Rp</span>
                      <input
                        type="number"
                        value={photo.price || ''}
                        onChange={(e) => handlePriceChange(photo.id, e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      onClick={() => toggleForSale(photo)}
                      disabled={saving === photo.id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors Rp {
                        photo.isForSale
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {photo.isForSale ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => handleSave(photo)}
                  disabled={saving === photo.id}
                  className={`w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 Rp {
                    success === photo.id
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  <Save size={16} />
                  {success === photo.id ? 'Tersimpan!' : saving === photo.id ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">Tidak ada foto untuk ditampilkan</p>
        </div>
      )}
    </div>
  );
}
