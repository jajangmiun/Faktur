import React, { useState, useMemo } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Payment } from '../../types';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Trash2, 
  CreditCard, 
  ArrowDownLeft, 
  FileText, 
  Printer,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Wallet
} from 'lucide-react';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface PaymentListViewProps {
  onOpenNewPayment: () => void;
}

type SortField = 'paymentNumber' | 'invoiceNumber' | 'customerName' | 'paymentDate' | 'paymentMethod' | 'amount';
type SortOrder = 'asc' | 'desc';

export const PaymentListView: React.FC<PaymentListViewProps> = ({
  onOpenNewPayment,
}) => {
  const { payments, deletePayment, company, showToast } = useInvoice();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('paymentDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Receipt Modal
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);

  // Deletion Confirmation State
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Unique payment methods for dropdown
  const uniqueMethods = useMemo(() => {
    const set = new Set<string>();
    payments.forEach(p => {
      if (p.paymentMethod) set.add(p.paymentMethod);
    });
    return Array.from(set).sort();
  }, [payments]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'amount' || field === 'paymentDate' ? 'desc' : 'asc');
    }
  };

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return payments
      .filter((p) => {
        // Method Filter
        if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) return false;

        // Date Range Filter
        if (dateRangeFilter !== 'ALL') {
          const pDate = new Date(p.paymentDate);
          if (dateRangeFilter === 'THIS_MONTH') {
            if (pDate.getMonth() !== currentMonth || pDate.getFullYear() !== currentYear) return false;
          } else if (dateRangeFilter === 'LAST_30') {
            if (pDate < thirtyDaysAgo) return false;
          } else if (dateRangeFilter === 'THIS_YEAR') {
            if (pDate.getFullYear() !== currentYear) return false;
          }
        }

        // Search
        const searchLower = searchTerm.toLowerCase();
        return (
          p.paymentNumber.toLowerCase().includes(searchLower) ||
          p.invoiceNumber.toLowerCase().includes(searchLower) ||
          p.customerName.toLowerCase().includes(searchLower) ||
          p.paymentMethod.toLowerCase().includes(searchLower) ||
          (p.receiptNumber || '').toLowerCase().includes(searchLower) ||
          String(p.amount).includes(searchLower)
        );
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'paymentNumber':
            valA = a.paymentNumber;
            valB = b.paymentNumber;
            break;
          case 'invoiceNumber':
            valA = a.invoiceNumber;
            valB = b.invoiceNumber;
            break;
          case 'customerName':
            valA = a.customerName.toLowerCase();
            valB = b.customerName.toLowerCase();
            break;
          case 'paymentDate':
            valA = new Date(a.paymentDate).getTime();
            valB = new Date(b.paymentDate).getTime();
            break;
          case 'paymentMethod':
            valA = a.paymentMethod.toLowerCase();
            valB = b.paymentMethod.toLowerCase();
            break;
          case 'amount':
            valA = a.amount || 0;
            valB = b.amount || 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [payments, methodFilter, dateRangeFilter, searchTerm, sortField, sortOrder]);

  const totalCollectedFiltered = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalCollectedAll = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const hasActiveFilters = methodFilter !== 'ALL' || dateRangeFilter !== 'ALL' || searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setMethodFilter('ALL');
    setDateRangeFilter('ALL');
    setSearchTerm('');
    setSortField('paymentDate');
    setSortOrder('desc');
    showToast('Filter Pembayaran Direset', 'Semua filter buku kas telah dikembalikan.');
  };

  const handleDelete = (p: Payment) => {
    setPaymentToDelete(p);
  };

  const handleConfirmDelete = () => {
    if (!paymentToDelete) return;
    deletePayment(paymentToDelete.id);
    showToast('Pembayaran Dihapus', `Catatan pembayaran ${paymentToDelete.paymentNumber} berhasil dihapus.`, 'info');
    setPaymentToDelete(null);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-500 inline-block ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-indigo-600 inline-block ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-600 inline-block ml-1" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Title & Main Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>Buku Kas & Riwayat Pembayaran</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredPayments.length} Transaksi
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar mutasi penerimaan kas/bank dari pelunasan faktur pelanggan beserta pencetakan kuitansi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors shadow-xs ${
              showAdvancedFilters || hasActiveFilters
                ? 'border-indigo-300 bg-indigo-50/80 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Tampilkan / Sembunyikan Filter di Header Tabel"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter Header</span>
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNewPayment}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Pembayaran Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-600 p-2 text-white">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-emerald-800">
              {hasActiveFilters ? 'Kas Masuk Hasil Filter' : 'Total Kas Masuk Terkumpul'}
            </div>
            <div className="text-xl font-bold font-mono tracking-tight text-emerald-950 tabular-nums">
              {formatCurrency(totalCollectedFiltered, company.currency)}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-emerald-700 font-medium">
          {filteredPayments.length} transaksi pelunasan
          {hasActiveFilters && ` (dari total ${payments.length})`}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nomor kuitansi, faktur, klien, jumlah..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Advanced Header Filter Toolbar */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Filter Kolom Header Tabel Pembayaran</span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Hapus Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Wallet className="h-3 w-3 text-slate-400" />
                <span>Metode Pembayaran:</span>
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Metode ({uniqueMethods.length})</option>
                {uniqueMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Rentang Waktu Transaksi:</span>
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Waktu</option>
                <option value="THIS_MONTH">Bulan Ini</option>
                <option value="LAST_30">30 Hari Terakhir</option>
                <option value="THIS_YEAR">Tahun Ini</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                <span>Urutkan Data:</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="paymentDate">Tgl Pembayaran</option>
                  <option value="amount">Jumlah Uang</option>
                  <option value="paymentNumber">No. Kuitansi</option>
                  <option value="invoiceNumber">No. Faktur</option>
                  <option value="customerName">Klien</option>
                  <option value="paymentMethod">Metode</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold select-none">
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('paymentNumber')}
                title="Klik untuk mengurutkan no. kuitansi"
              >
                <span className="flex items-center">
                  No. Kuitansi {renderSortIndicator('paymentNumber')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('invoiceNumber')}
                title="Klik untuk mengurutkan no. faktur"
              >
                <span className="flex items-center">
                  No. Faktur {renderSortIndicator('invoiceNumber')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('customerName')}
                title="Klik untuk mengurutkan pembayar"
              >
                <span className="flex items-center">
                  Klien / Pembayar {renderSortIndicator('customerName')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('paymentDate')}
                title="Klik untuk mengurutkan tanggal bayar"
              >
                <span className="flex items-center">
                  Tgl Pembayaran {renderSortIndicator('paymentDate')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('paymentMethod')}
                title="Klik untuk mengurutkan metode"
              >
                <span className="flex items-center">
                  Metode Bayar {renderSortIndicator('paymentMethod')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('amount')}
                title="Klik untuk mengurutkan nominal"
              >
                <span className="flex items-center justify-end">
                  Jumlah Uang {renderSortIndicator('amount')}
                </span>
              </th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-6 w-6 text-slate-300" />
                    <span>Tidak ada catatan pembayaran yang cocok dengan filter.</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-indigo-600 font-semibold hover:underline mt-1"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentForReceipt(p)}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      title="Klik untuk membuka kuitansi"
                    >
                      {p.paymentNumber}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {p.customerName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                    {formatDateIndo(p.paymentDate)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {p.paymentMethod}
                    </span>
                    {p.receiptNumber && (
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                        Ref: {p.receiptNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-600">
                    + {formatCurrency(p.amount, company.currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentForReceipt(p)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                        title="Buka / Cetak Kuitansi Resmi"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Hapus Catatan Pembayaran"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 rounded-xl border border-slate-200 bg-white">
            Belum ada catatan pembayaran yang cocok.
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-700">
                  {p.paymentNumber}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {formatDateIndo(p.paymentDate)}
                </span>
              </div>

              <div>
                <div className="font-semibold text-xs text-slate-900">{p.customerName}</div>
                <div className="text-[11px] text-slate-500 font-mono">Faktur: {p.invoiceNumber}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400">Metode Bayar:</span>
                  <div className="text-xs font-medium text-slate-700">{p.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Jumlah:</span>
                  <div className="font-mono font-bold text-sm text-emerald-600">
                    + {formatCurrency(p.amount, company.currency)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForReceipt(p)}
                  className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Kuitansi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL KUITANSI RESMI INDONESIA */}
      {selectedPaymentForReceipt && (
        <PaymentReceiptModal
          payment={selectedPaymentForReceipt}
          company={company}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Hapus Catatan Pembayaran"
        message={`Apakah Anda yakin ingin menghapus catatan pembayaran ${paymentToDelete?.paymentNumber}? Saldo faktur ${paymentToDelete?.invoiceNumber} akan disesuaikan kembali.`}
        confirmText="Hapus Pembayaran"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
