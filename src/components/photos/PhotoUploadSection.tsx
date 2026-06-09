'use client';

import { useState } from 'react';
import { Upload, Link2, ChevronDown } from 'lucide-react';

type UploadMode = 'file' | 'drive' | null;

export function PhotoUploadSection() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<UploadMode>(null);
  const [file, setFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !displayName || !price) {
      setError('Lengkapi semua field');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('displayName', displayName);
      formData.append('category', category);
      formData.append('price', price);

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal upload foto');
        return;
      }

      setSuccess('Foto berhasil diupload!');
      setFile(null);
      setDisplayName('');
      setCategory('');
      setPrice('');
      setMode(null);
      window.location.reload();
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  };

  const handleDriveSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink || !displayName || !price) {
      setError('Lengkapi semua field');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const res = await fetch('/api/photos/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveLink,
          displayName,
          category,
          price: parseInt(price),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal sync dari Drive');
        return;
      }

      setSuccess('Foto berhasil disync dari Drive!');
      setDriveLink('');
      setDisplayName('');
      setCategory('');
      setPrice('');
      setMode(null);
      window.location.reload();
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-8 border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Upload Foto Baru</h3>
            <p className="text-sm text-gray-600">Tambah foto langsung atau dari Google Drive</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ {success}
            </div>
          )}

          {mode === null ? (
            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() => setMode('file')}
                className="p-4 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left text-sm"
              >
                <Upload className="w-5 h-5 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Upload File</p>
                <p className="text-gray-600 text-xs">Dari komputer Anda</p>
              </button>

              <button
                onClick={() => setMode('drive')}
                className="p-4 border border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all text-left text-sm"
              >
                <Link2 className="w-5 h-5 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Google Drive</p>
                <p className="text-gray-600 text-xs">Dari folder Drive</p>
              </button>
            </div>
          ) : mode === 'file' ? (
            <form onSubmit={handleFileUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Foto <span className="text-red-600">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                    required
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Drag & drop atau klik</p>
                    {file && <p className="text-xs text-blue-600 mt-1">✓ {file.name}</p>}
                  </label>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama foto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Kategori</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="product">Product</option>
                  <option value="event">Event</option>
                </select>

                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga Rp"
                  min="10000"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDriveSync} className="space-y-3">
              <input
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama foto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Kategori</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="product">Product</option>
                  <option value="event">Event</option>
                </select>

                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga Rp"
                  min="10000"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
