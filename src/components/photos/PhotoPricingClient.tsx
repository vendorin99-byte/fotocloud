'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Save, RefreshCw, Link2, ChevronDown } from 'lucide-react';

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

  // Upload form state
  const [uploadExpanded, setUploadExpanded] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [projectName, setProjectName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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
      const res = await fetch(`/api/photos/${photo.id}/update-price`, {
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
      const res = await fetch(`/api/photos/${photo.id}/update-price`, {
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

  const handleSyncDrive = async () => {
    if (!filteredPhotos.length) return;
    const confirmed = confirm('Sync foto dari Google Drive?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/photos/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });
      if (res.ok) {
        alert('Sync berhasil!');
        window.location.reload();
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Gagal sync');
    }
  };

  const handleDriveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink || !price) {
      setUploadError('Link Drive dan harga harus diisi');
      return;
    }

    setSyncing(true);
    setUploadError('');

    try {
      const res = await fetch('/api/photos/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveLink,
          displayName: displayName || undefined,
          projectName: projectName || undefined,
          category: category || undefined,
          price: parseInt(price),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error || 'Gagal sync dari Drive');
        return;
      }

      setUploadSuccess('✓ Foto berhasil ditambahkan!');
      setDriveLink('');
      setProjectName('');
      setDisplayName('');
      setCategory('');
      setPrice('');
      setUploadExpanded(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUploadError('Terjadi kesalahan');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Sync Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Kelola Harga Foto</h2>
        <button
          onClick={handleSyncDrive}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors"
        >
          <RefreshCw size={16} />
          Sync Drive
        </button>
      </div>

      {/* Upload Form */}
      <div className="border border-blue-200 rounded-lg bg-blue-50">
        {/* Expand Header */}
        <button
          onClick={() => setUploadExpanded(!uploadExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">+ Tambah Foto Baru</h3>
              <p className="text-sm text-gray-600">Dari Google Drive</p>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${uploadExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Form Content */}
        {uploadExpanded && (
          <form onSubmit={handleDriveUpload} className="border-t border-blue-200 p-4 space-y-3 bg-white rounded-b-lg">
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {uploadSuccess}
              </div>
            )}

            {/* Drive Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Google Drive <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Proyek
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Wedding 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Tampilan (untuk marketplace)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama foto yang ditampilkan"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Pilih kategori</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="product">Product</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadExpanded(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={syncing}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {syncing ? 'Syncing...' : 'Tambah Foto'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          Semua ({photos.length})
        </button>
        <button
          onClick={() => setFilter('forsale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'forsale'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          Dijual ({photos.filter((p) => p.isForSale).length})
        </button>
        <button
          onClick={() => setFilter('notsale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
                </div>

                {/* Drive File Preview */}
                {photo.driveFileId && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <Link2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium mb-1">File dari Google Drive</p>
                        <p className="text-sm text-gray-900">{photo.name}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
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
