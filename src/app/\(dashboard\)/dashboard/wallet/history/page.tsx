'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sale' | 'payout' | 'refund';
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export default function HistoryPage() {
  const [data, setData] = useState<{ recentTransactions: Transaction[]; pendingPayouts: PayoutRequest[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/photographer/balance');
      if (res.ok) {
        const result = await res.json();
        setData({
          recentTransactions: result.recentTransactions || [],
          pendingPayouts: result.pendingPayouts || [],
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600 mt-1">Lihat semua penjualan dan penarikan Anda</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
            activeTab === 'transactions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Transaksi ({data.recentTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
            activeTab === 'payouts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Penarikan ({data.pendingPayouts.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'transactions' && (
          <>
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Belum ada transaksi</p>
              </div>
            ) : (
              data.recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === 'sale'
                          ? 'bg-green-100'
                          : txn.type === 'payout'
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {txn.type === 'sale' ? (
                        <TrendingUp className={`w-5 h-5 text-green-600`} />
                      ) : txn.type === 'payout' ? (
                        <TrendingDown className={`w-5 h-5 text-blue-600`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-red-600`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(txn.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        txn.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.type === 'sale' ? '+' : '-'}Rp {Math.abs(txn.amount).toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        txn.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : txn.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {txn.status === 'completed' ? 'Selesai' : txn.status === 'pending' ? 'Pending' : 'Gagal'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'payouts' && (
          <>
            {data.pendingPayouts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Belum ada penarikan</p>
              </div>
            ) : (
              data.pendingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Withdrawal Request</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payout.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      Rp {payout.amount.toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        payout.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : payout.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : payout.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {payout.status === 'pending'
                        ? 'Menunggu'
                        : payout.status === 'approved'
                        ? 'Disetujui'
                        : payout.status === 'completed'
                        ? 'Selesai'
                        : 'Ditolak'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
