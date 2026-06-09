'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  status: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  createdAt: string;
  approvedAt?: string;
  photographer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'completed'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, [status]);

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`/api/admin/payouts?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payoutId: string) => {
    setProcessing(payoutId);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.ok) {
        setPayouts(payouts.filter((p) => p.id !== payoutId));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    setProcessing(payoutId);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectReason[payoutId] || '',
        }),
      });

      if (res.ok) {
        setPayouts(payouts.filter((p) => p.id !== payoutId));
        setShowRejectModal(null);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin - Kelola Penarikan</h1>
        <p className="text-gray-600 mt-1">Review dan proses permintaan penarikan fotografer</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['pending', 'approved', 'completed', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s === 'pending'
              ? 'Menunggu'
              : s === 'approved'
              ? 'Disetujui'
              : s === 'completed'
              ? 'Selesai'
              : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fotografer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumlah</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tgl Request</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{payout.photographer.name}</p>
                        <p className="text-sm text-gray-500">{payout.photographer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">Rp {payout.amount.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{payout.bankName}</p>
                        <p className="text-gray-500">{payout.bankAccount}</p>
                        <p className="text-gray-500">{payout.accountHolder}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payout.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payout.id)}
                              disabled={processing === payout.id}
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(payout.id)}
                              disabled={processing === payout.id}
                              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              <X size={16} /> Reject
                            </button>
                          </>
                        )}
                        {(status === 'approved' || status === 'completed') && (
                          <span className="text-sm text-blue-600 font-medium">Sudah diproses</span>
                        )}
                        {status === 'rejected' && (
                          <span className="text-sm text-red-600 font-medium">Ditolak</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Alasan Penolakan</h2>
            <textarea
              value={rejectReason[showRejectModal] || ''}
              onChange={(e) =>
                setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })
              }
              placeholder="Masukkan alasan penolakan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processing === showRejectModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
