'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Photo {
  id: string;
  name: string;
  displayName: string | null;
  price: number;
  thumbnailUrl: string | null;
  project: {
    photographer: {
      name: string | null;
      businessName: string | null;
    };
  };
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const photoIds = (searchParams.get('photos') || '').split(',').filter(Boolean);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (photoIds.length === 0) {
      router.push('/marketplace');
      return;
    }
    fetchPhotos();
  }, [photoIds, router]);

  const fetchPhotos = async () => {
    try {
      // Get purchase details to get photo info
      const res = await fetch(`/api/marketplace/photos?page=1`);
      const data = await res.json();
      const allPhotos = data.photos;
      const selectedPhotos = allPhotos.filter((p: Photo) => photoIds.includes(p.id));
      setPhotos(selectedPhotos);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal memuat foto');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = photos.reduce((sum, p) => sum + (p.price || 0), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Create purchase
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaItemIds: photoIds,
          buyerEmail: email,
          buyerName: name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal membuat pesanan');
        return;
      }

      // Redirect to Midtrans
      if (window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            router.push(`/marketplace/success?orderId=${data.orderId}`);
          },
          onPending: () => {
            router.push(`/marketplace/pending?orderId=${data.orderId}`);
          },
          onError: () => {
            setError('Pembayaran gagal');
          },
          onClose: () => {
            setError('Pembayaran dibatalkan');
          },
        });
      } else {
        setError('Payment gateway tidak siap');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Foto tidak ditemukan</p>
        <Link href="/marketplace" className="text-blue-600 hover:underline">
          Kembali ke Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/marketplace" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleCheckout} className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Pembeli</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Email */}
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

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nama Anda"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Memproses...' : 'Lanjut Pembayaran'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                {photos.map((photo) => (
                  <div key={photo.id} className="text-sm">
                    <p className="font-medium text-gray-900 truncate">
                      {photo.displayName || photo.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {photo.project.photographer.businessName ||
                        photo.project.photographer.name}
                    </p>
                    <p className="text-gray-900 font-bold mt-1">
                      Rp {(photo.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({photos.length} foto)</span>
                  <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya layanan</span>
                  <span>Rp 0</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Midtrans Snap */}
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
