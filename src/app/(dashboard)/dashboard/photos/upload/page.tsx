'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Link2 } from 'lucide-react';

type UploadMode = 'file' | 'drive' | null;

export default function PhotoUploadPage() {
  const [mode, setMode] = useState<UploadMode>(null);
  const [file, setFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [syncing, setSyncing] = useState(false);
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
      setTimeout(() => {
        window.location.href = '/dashboard/photos';
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
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

    setSyncing(true);
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
      setTimeout(() => {
        window.location.href = '/dashboard/photos';
      }, 1500);
    } catch (err) {
      console.error('Sync error:', err);
      setError('Terjadi kesalahan');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/photos" className="text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Foto Marketplace</h1>
          <p className="text-gray-600 mt-1">Pilih salah satu cara untuk tambah foto</p>
        </div>
      </div>

      {/* Mode Selector */}
      {mode === null ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload File Option */}
          <button
            onClick={() => setMode('file')}
            className="p-8 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload File</h3>
            <p className="text-gray-600 text-sm">Upload foto langsung dari komputer Anda</p>
            <div className="text-xs text-gray-500 mt-3">JPG, PNG (Max 10MB)</div>
          </button>

          {/* Google Drive Option */}
          <button
            onClick={() => setMode('drive')}
            className="p-8 border-2 border-gray-300 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Google Drive</h3>
            <p className="text-gray-600 text-sm">Sync foto dari Google Drive Anda</p>
            <div className="text-xs text-gray-500 mt-3">Automatic sync dari folder Drive</div>
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✓ {success}
            </div>
          )}

          {/* Upload File Form */}
          {mode === 'file' && (
            <form onSubmit={handleFileUpload} className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Foto <span className="text-red-600">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                    required
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drag & drop atau klik untuk pilih</p>
                    {file && <p className="text-sm text-blue-600 mt-2">✓ {file.name}</p>}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Foto <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sunset di Pantai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (Rp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50000"
                    min="10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Foto'}
                </button>
              </div>
            </form>
          )}

          {/* Google Drive Form */}
          {mode === 'drive' && (
            <form onSubmit={handleDriveSync} className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Google Drive <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Paste link file foto dari Google Drive</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Foto <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sunset di Pantai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (Rp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50000"
                    min="10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {syncing ? 'Syncing...' : 'Sync dari Drive'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
