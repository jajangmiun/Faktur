import React, { useState, useMemo } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Estimate } from '../../types';
import { formatCurrency, formatDateIndo, getEstimateStatusMeta } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Eye, 
  ArrowRightLeft, 
  Edit3, 
  Trash2,
  CheckCircle2,
  FileCheck2,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Calendar
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface EstimateListViewProps {
  onOpenNewEstimate: () => void;
  onEditEstimate: (estimate: Estimate) => void;
  onViewEstimate: (estimate: Estimate) => void;
}

type SortField = 'estimateNumber' | 'customer' | 'issueDate' | 'expiryDate' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';

export const EstimateListView: React.FC<EstimateListViewProps> = ({
  onOpenNewEstimate,
  onEditEstimate,
  onViewEstimate,
}) => {
  const { estimates, deleteEstimate, convertEstimateToInvoice, company, showToast } = useInvoice();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [valueFilter, setValueFilter] = useState<'ALL' | 'UNDER_10M' | '10M_50M' | 'OVER_50M'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Deletion Confirmation State
  const [estimateToDelete, setEstimateToDelete] = useState<Estimate | null>(null);

  const filterTabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'SENT', label: 'Terkirim' },
    { id: 'ACCEPTED', label: 'Disetujui' },
    { id: 'CONVERTED', label: 'Dikonversi' },
    { id: 'REJECTED', label: 'Ditolak' },
  ];

  // Unique customers for the header dropdown
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    estimates.forEach(est => {
      if (est.customerId && est.customer) {
        map.set(est.customerId, est.customer.company || est.customer.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [estimates]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'total' || field === 'issueDate' ? 'desc' : 'asc');
    }
  };

  const filteredEstimates = useMemo(() => {
    return estimates
      .filter((est) => {
        // Status Filter
        if (statusFilter !== 'ALL' && est.status !== statusFilter) return false;

        // Customer Filter
        if (selectedCustomerId !== 'ALL' && est.customerId !== selectedCustomerId) return false;

        // Value Range Filter
        if (valueFilter === 'UNDER_10M' && est.total >= 10000000) return false;
        if (valueFilter === '10M_50M' && (est.total < 10000000 || est.total > 50000000)) return false;
        if (valueFilter === 'OVER_50M' && est.total <= 50000000) return false;

        // Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          est.estimateNumber.toLowerCase().includes(searchLower) ||
          (est.customer?.name || '').toLowerCase().includes(searchLower) ||
          (est.customer?.company || '').toLowerCase().includes(searchLower) ||
          est.issueDate.includes(searchLower) ||
          String(est.total).includes(searchLower);

        return matchesSearch;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'estimateNumber':
            valA = a.estimateNumber;
            valB = b.estimateNumber;
            break;
          case 'customer':
            valA = (a.customer?.company || a.customer?.name || '').toLowerCase();
            valB = (b.customer?.company || b.customer?.name || '').toLowerCase();
            break;
          case 'issueDate':
            valA = new Date(a.issueDate).getTime();
            valB = new Date(b.issueDate).getTime();
            break;
          case 'expiryDate':
            valA = new Date(a.expiryDate).getTime();
            valB = new Date(b.expiryDate).getTime();
            break;
          case 'total':
            valA = a.total || 0;
            valB = b.total || 0;
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [estimates, statusFilter, selectedCustomerId, valueFilter, searchTerm, sortField, sortOrder]);

  const hasActiveFilters = 
    statusFilter !== 'ALL' || 
    selectedCustomerId !== 'ALL' || 
    valueFilter !== 'ALL' || 
    searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setSelectedCustomerId('ALL');
    setValueFilter('ALL');
    setSearchTerm('');
    setSortField('issueDate');
    setSortOrder('desc');
    showToast('Filter Direset', 'Semua filter penawaran telah dikembalikan.');
  };

  const handleDelete = (est: Estimate) => {
    setEstimateToDelete(est);
  };

  const handleConfirmDelete = () => {
    if (!estimateToDelete) return;
    deleteEstimate(estimateToDelete.id);
    showToast('Penawaran Dihapus', `Surat penawaran ${estimateToDelete.estimateNumber} berhasil dihapus.`, 'info');
    setEstimateToDelete(null);
  };

  const handleConvert = (est: Estimate) => {
    if (confirm(`Konversi surat penawaran ${est.estimateNumber} menjadi Faktur Penjualan resmi?`)) {
      const inv = convertEstimateToInvoice(est.id);
      if (inv) {
        showToast('Berhasil Dikonversi', `Penawaran berhasil diubah menjadi Faktur ${inv.invoiceNumber}.`, 'success');
      }
    }
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
      {/* Header & New Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>Surat Penawaran Harga (Estimates)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredEstimates.length} Penawaran
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buat proposal penawaran harga ke calon klien dan konversi ke faktur dengan 1-klik setelah disetujui.
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
            onClick={onOpenNewEstimate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Penawaran Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            const count = tab.id === 'ALL'
              ? estimates.length
              : estimates.filter(e => e.status === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`font-mono text-[10px] ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. penawaran, klien, total..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Advanced Header Filters */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Filter Kolom Header Tabel Penawaran</span>
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
                <User className="h-3 w-3 text-slate-400" />
                <span>Klien / Calon Pembeli:</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Klien ({uniqueCustomers.length})</option>
                {uniqueCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <FileCheck2 className="h-3 w-3 text-slate-400" />
                <span>Rentang Nilai Penawaran:</span>
              </label>
              <select
                value={valueFilter}
                onChange={(e) => setValueFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Nilai</option>
                <option value="UNDER_10M">&lt; Rp 10 Juta</option>
                <option value="10M_50M">Rp 10 Juta - Rp 50 Juta</option>
                <option value="OVER_50M">&gt; Rp 50 Juta</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                <span>Urutan Data:</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="issueDate">Tgl Penawaran</option>
                  <option value="expiryDate">Masa Berlaku</option>
                  <option value="estimateNumber">No. Penawaran</option>
                  <option value="customer">Klien</option>
                  <option value="total">Total Nilai</option>
                  <option value="status">Status</option>
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

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold select-none">
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('estimateNumber')}
                title="Klik untuk mengurutkan no. penawaran"
              >
                <span className="flex items-center">
                  Nomor Penawaran {renderSortIndicator('estimateNumber')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('customer')}
                title="Klik untuk mengurutkan nama klien"
              >
                <span className="flex items-center">
                  Klien / Perusahaan {renderSortIndicator('customer')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('issueDate')}
                title="Klik untuk mengurutkan tanggal penawaran"
              >
                <span className="flex items-center">
                  Tanggal Penawaran {renderSortIndicator('issueDate')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('expiryDate')}
                title="Klik untuk mengurutkan masa berlaku"
              >
                <span className="flex items-center">
                  Masa Berlaku {renderSortIndicator('expiryDate')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('total')}
                title="Klik untuk mengurutkan total nilai"
              >
                <span className="flex items-center justify-end">
                  Total Nilai {renderSortIndicator('total')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('status')}
                title="Klik untuk mengurutkan status"
              >
                <span className="flex items-center justify-center">
                  Status {renderSortIndicator('status')}
                </span>
              </th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEstimates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-6 w-6 text-slate-300" />
                    <span>Tidak ada surat penawaran ditemukan dengan kriteria filter saat ini.</span>
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
              filteredEstimates.map((est) => {
                const meta = getEstimateStatusMeta(est.status);
                return (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => onViewEstimate(est)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-left cursor-pointer"
                        title="Klik untuk Pratinjau Dokumen"
                      >
                        {est.estimateNumber}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {est.customer?.company || est.customer?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Attn: {est.customer?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDateIndo(est.issueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDateIndo(est.expiryDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatCurrency(est.total, company.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewEstimate(est)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                          title="Lihat Pratinjau Dokumen Penawaran"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {est.status !== 'CONVERTED' && (
                          <button
                            type="button"
                            onClick={() => handleConvert(est)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100 transition-colors"
                            title="Konversi ke Faktur Penjualan"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditEstimate(est)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Edit Penawaran"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(est)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Hapus Penawaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!estimateToDelete}
        title="Hapus Surat Penawaran"
        message={`Apakah Anda yakin ingin menghapus surat penawaran ${estimateToDelete?.estimateNumber}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Penawaran"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setEstimateToDelete(null)}
      />
    </div>
  );
};
