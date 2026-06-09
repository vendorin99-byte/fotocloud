'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BalanceData {
  balance: number;
}

export default function PayoutPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
  });

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
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(form.amount),
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          accountHolder: form.accountHolder,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal membuat payout request');
        return;
      }

      setSuccess(true);
      setForm({ amount: '', bankName: '', bankAccount: '', accountHolder: '' });
      setTimeout(() => {
        window.location.href = '/dashboard/wallet/history';
      }, 2000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!balance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdraw Dana</h1>
          <p className="text-gray-600 mt-1">Ajukan pencairan saldo Anda</p>
        </div>
      </div>

      {/* Balance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-900">Saldo Tersedia</p>
        <p className="text-3xl font-bold text-blue-900 mt-1">
          Rp {balance.balance.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Payout request berhasil dibuat. Redirecting...
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah (Rp) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Minimum Rp 100.000"
            min="100000"
            max={balance.balance}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Saldo maksimal: Rp {balance.balance.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Bank <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            placeholder="e.g. BCA, Mandiri, BNI"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Bank Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Rekening <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.bankAccount}
            onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
            placeholder="Nomor rekening tujuan"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Account Holder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atas Nama <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.accountHolder}
            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
            placeholder="Nama pemilik rekening"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !form.amount}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Memproses...' : 'Ajukan Withdraw'}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-2">📋 Panduan Withdrawal:</p>
        <ul className="space-y-1 text-xs">
          <li>• Minimum penarikan: Rp 100.000</li>
          <li>• Waktu proses: 1-2 hari kerja setelah disetujui</li>
          <li>• Admin akan mereview dan memproses permintaan Anda</li>
          <li>• Dana akan ditransfer ke rekening yang Anda daftarkan</li>
        </ul>
      </div>
    </div>
  );
}
