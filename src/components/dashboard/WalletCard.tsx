'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

interface BalanceData {
  balance: number;
  totalEarned: number;
  totalPaidOut: number;
  pendingPayoutAmount: number;
}

export function WalletCard() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/photographer/balance');
      if (res.ok) {
        setBalance(await res.json());
      }
    } catch (err) {
      console.error('Fetch balance error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />;
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Saya</h3>
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Balance Display */}
      <div className="space-y-4 mb-6">
        {/* Available Balance */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Saldo Tersedia</p>
          <p className="text-3xl font-bold text-gray-900">
            Rp {balance.balance.toLocaleString('id-ID')}
          </p>
          {balance.pendingPayoutAmount > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              Rp {balance.pendingPayoutAmount.toLocaleString('id-ID')} dalam proses
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Earned */}
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Total Earning</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {balance.totalEarned.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Total Paid Out */}
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Sudah Dicairkan</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              Rp {balance.totalPaidOut.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href="/dashboard/wallet/history"
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm"
        >
          Lihat Riwayat
        </Link>
        <Link
          href="/dashboard/wallet/payout"
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors text-center ${
            balance.balance > 0
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Withdraw
        </Link>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Komisi: 80% untuk Anda, 20% untuk platform
      </p>
    </div>
  );
}
