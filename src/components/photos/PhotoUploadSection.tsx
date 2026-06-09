'use client';

import { useState } from 'react';
import { Link2, ChevronDown } from 'lucide-react';

export function PhotoUploadSection() {
  const [expanded, setExpanded] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [projectName, setProjectName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDriveSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink || !price) {
      setError('Link Drive dan harga harus diisi');
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
          displayName: displayName || undefined,
          projectName: projectName || undefined,
          category: category || undefined,
          price: parseInt(price),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal sync dari Drive');
        return;
      }

      setSuccess('✓ Foto berhasil ditambahkan!');
      setDriveLink('');
      setProjectName('');
      setDisplayName('');
      setCategory('');
      setPrice('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mb-8 border border-blue-200 rounded-lg bg-blue-50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
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
          className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Form */}
      {expanded && (
        <form onSubmit={handleDriveSync} className="border-t border-blue-200 p-4 space-y-3 bg-white rounded-b-lg">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
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
              placeholder="Akan otomatis dari nama file Drive"
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
              onClick={() => setExpanded(false)}
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
  );
}
