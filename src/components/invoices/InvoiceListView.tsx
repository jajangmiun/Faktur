import React, { useState, useMemo } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDateIndo, getInvoiceStatusMeta } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Eye, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface InvoiceListViewProps {
  onOpenNewInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
}

type SortField = 'invoiceNumber' | 'customer' | 'issueDate' | 'dueDate' | 'total' | 'balance' | 'status';
type SortOrder = 'asc' | 'desc';

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  onOpenNewInvoice,
  onEditInvoice,
  onViewInvoice,
  onRecordPaymentForInvoice,
}) => {
  const { invoices, deleteInvoice, company, showToast } = useInvoice();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Deletion Confirmation State
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const filterTabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'SENT', label: 'Terkirim' },
    { id: 'PARTIALLY_PAID', label: 'Sebagian' },
    { id: 'PAID', label: 'Lunas' },
    { id: 'OVERDUE', label: 'Jatuh Tempo' },
  ];

  // Unique customers for the header dropdown
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach(inv => {
      if (inv.customerId && inv.customer) {
        map.set(inv.customerId, inv.customer.company || inv.customer.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'total' || field === 'balance' || field === 'issueDate' ? 'desc' : 'asc');
    }
  };

  // Filter & Sort Logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return invoices
      .filter((inv) => {
        // Status Filter
        if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;

        // Customer Dropdown Filter
        if (selectedCustomerId !== 'ALL' && inv.customerId !== selectedCustomerId) return false;

        // Balance Filter
        if (balanceFilter === 'UNPAID' && (inv.balance || 0) <= 0) return false;
        if (balanceFilter === 'PAID' && (inv.balance || 0) > 0) return false;

        // Date Range Filter
        if (dateRangeFilter !== 'ALL') {
          const invDate = new Date(inv.issueDate);
          if (dateRangeFilter === 'THIS_MONTH') {
            if (invDate.getMonth() !== currentMonth || invDate.getFullYear() !== currentYear) return false;
          } else if (dateRangeFilter === 'LAST_30') {
            if (invDate < thirtyDaysAgo) return false;
          } else if (dateRangeFilter === 'THIS_YEAR') {
            if (invDate.getFullYear() !== currentYear) return false;
          }
        }

        // Live Search Input
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          (inv.customer?.name || '').toLowerCase().includes(searchLower) ||
          (inv.customer?.company || '').toLowerCase().includes(searchLower) ||
          inv.issueDate.includes(searchLower) ||
          String(inv.total).includes(searchLower);

        return matchesSearch;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'invoiceNumber':
            valA = a.invoiceNumber;
            valB = b.invoiceNumber;
            break;
          case 'customer':
            valA = (a.customer?.company || a.customer?.name || '').toLowerCase();
            valB = (b.customer?.company || b.customer?.name || '').toLowerCase();
            break;
          case 'issueDate':
            valA = new Date(a.issueDate).getTime();
            valB = new Date(b.issueDate).getTime();
            break;
          case 'dueDate':
            valA = new Date(a.dueDate).getTime();
            valB = new Date(b.dueDate).getTime();
            break;
          case 'total':
            valA = a.total || 0;
            valB = b.total || 0;
            break;
          case 'balance':
            valA = a.balance || 0;
            valB = b.balance || 0;
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
  }, [invoices, statusFilter, selectedCustomerId, balanceFilter, dateRangeFilter, searchTerm, sortField, sortOrder]);

  const hasActiveFilters = 
    statusFilter !== 'ALL' || 
    selectedCustomerId !== 'ALL' || 
    balanceFilter !== 'ALL' || 
    dateRangeFilter !== 'ALL' || 
    searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setSelectedCustomerId('ALL');
    setBalanceFilter('ALL');
    setDateRangeFilter('ALL');
    setSearchTerm('');
    setSortField('issueDate');
    setSortOrder('desc');
    showToast('Filter Direset', 'Semua filter tabel faktur dikembalikan ke default.');
  };

  const handleDelete = (inv: Invoice) => {
    setInvoiceToDelete(inv);
  };

  const handleConfirmDelete = () => {
    if (!invoiceToDelete) return;
    deleteInvoice(invoiceToDelete.id);
    showToast('Faktur Dihapus', `Faktur ${invoiceToDelete.invoiceNumber} berhasil dihapus.`, 'info');
    setInvoiceToDelete(null);
  };

  const handleExportCsv = () => {
    const headers = ['Nomor Faktur', 'Klien', 'Perusahaan', 'Tanggal Faktur', 'Jatuh Tempo', 'Subtotal', 'Diskon', 'PPN', 'Total', 'Sudah Dibayar', 'Sisa Saldo', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      `"${(inv.customer?.name || '').replace(/"/g, '""')}"`,
      `"${(inv.customer?.company || '').replace(/"/g, '""')}"`,
      inv.issueDate,
      inv.dueDate,
      inv.subtotal,
      inv.discountAmount,
      inv.taxTotal,
      inv.total,
      inv.amountPaid,
      inv.balance,
      inv.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daftar_faktur_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Ekspor Berhasil', `File daftar faktur (${filteredInvoices.length} baris) berhasil diunduh.`, 'success');
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
      {/* Page Title & Main Action Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>Faktur Penjualan (Invoices)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredInvoices.length} Faktur
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pembuatan tagihan komersil, status piutang, dan pencetakan faktur resmi perusahaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Unduh Rekap Faktur ke Format Spreadsheet CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Faktur Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            const count = tab.id === 'ALL' 
              ? invoices.length 
              : invoices.filter(i => i.status === tab.id).length;

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

        {/* Live Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. faktur, klien, total..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Interactive Table Header Filters Bar */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Filter Kolom Header Tabel</span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Hapus Semua Filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filter 1: Dropdown Klien */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                <span>Filter Klien / Perusahaan:</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Klien ({uniqueCustomers.length})</option>
                {uniqueCustomers.map(cust => (
                  <option key={cust.id} value={cust.id}>{cust.name}</option>
                ))}
              </select>
            </div>

            {/* Filter 2: Sisa Saldo / Pembayaran */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-slate-400" />
                <span>Status Pelunasan Saldo:</span>
              </label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Kondisi Saldo</option>
                <option value="UNPAID">Belum Lunas (Sisa Saldo &gt; 0)</option>
                <option value="PAID">Sudah Lunas (Sisa Saldo = 0)</option>
              </select>
            </div>

            {/* Filter 3: Rentang Waktu */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Rentang Tanggal Penerbitan:</span>
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Waktu Penerbitan</option>
                <option value="THIS_MONTH">Bulan Ini</option>
                <option value="LAST_30">30 Hari Terakhir</option>
                <option value="THIS_YEAR">Tahun Ini</option>
              </select>
            </div>

            {/* Filter 4: Urutan Default */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                <span>Urutkan Berdasarkan:</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="issueDate">Tgl Penerbitan</option>
                  <option value="dueDate">Jatuh Tempo</option>
                  <option value="invoiceNumber">Nomor Faktur</option>
                  <option value="customer">Klien</option>
                  <option value="total">Total Tagihan</option>
                  <option value="balance">Sisa Saldo</option>
                  <option value="status">Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  title={sortOrder === 'asc' ? 'Urutan Menaik (A-Z / Terkecil)' : 'Urutan Menurun (Z-A / Terbesar)'}
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Invoices Table (Desktop/Tablet) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold select-none">
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('invoiceNumber')}
                title="Klik untuk mengurutkan berdasarkan nomor faktur"
              >
                <span className="flex items-center">
                  Nomor Faktur {renderSortIndicator('invoiceNumber')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('customer')}
                title="Klik untuk mengurutkan berdasarkan nama klien"
              >
                <span className="flex items-center">
                  Klien / Perusahaan {renderSortIndicator('customer')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('issueDate')}
                title="Klik untuk mengurutkan berdasarkan tanggal penerbitan"
              >
                <span className="flex items-center">
                  Tgl Penerbitan {renderSortIndicator('issueDate')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('dueDate')}
                title="Klik untuk mengurutkan berdasarkan tanggal jatuh tempo"
              >
                <span className="flex items-center">
                  Jatuh Tempo {renderSortIndicator('dueDate')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('total')}
                title="Klik untuk mengurutkan berdasarkan total nilai tagihan"
              >
                <span className="flex items-center justify-end">
                  Total Tagihan {renderSortIndicator('total')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('balance')}
                title="Klik untuk mengurutkan berdasarkan sisa piutang"
              >
                <span className="flex items-center justify-end">
                  Sisa Saldo {renderSortIndicator('balance')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('status')}
                title="Klik untuk mengurutkan berdasarkan status faktur"
              >
                <span className="flex items-center justify-center">
                  Status {renderSortIndicator('status')}
                </span>
              </th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-6 w-6 text-slate-300" />
                    <span>Tidak ada faktur yang cocok dengan filter yang dipilih.</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-indigo-600 font-semibold hover:underline mt-1"
                      >
                        Reset Semua Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const meta = getInvoiceStatusMeta(inv.status);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-left cursor-pointer"
                        title="Klik untuk Pratinjau / Cetak Faktur"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {inv.customer?.company || inv.customer?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Attn: {inv.customer?.name}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDateIndo(inv.issueDate)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDateIndo(inv.dueDate)}
                    </td>

                    {/* Total Tagihan */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatCurrency(inv.total, company.currency)}
                    </td>

                    {/* Sisa Saldo */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      {inv.balance > 0 ? (
                        <span className="text-rose-600">
                          {formatCurrency(inv.balance, company.currency)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Lunas
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                        {meta.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                          title="Pratinjau / Cetak PDF Faktur"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {inv.status !== 'PAID' && (
                          <button
                            type="button"
                            onClick={() => onRecordPaymentForInvoice(inv)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100 transition-colors"
                            title="Catat Pembayaran"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Edit Faktur"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Hapus Faktur"
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

      {/* Mobile Card View (Gadgets / Smart Phones) */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 rounded-xl border border-slate-200 bg-white">
            Tidak ada faktur ditemukan.
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const meta = getInvoiceStatusMeta(inv.status);
            return (
              <div key={inv.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-700">
                    {inv.invoiceNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                    {meta.label}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-xs text-slate-900">
                    {inv.customer?.company || inv.customer?.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Attn: {inv.customer?.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Tagihan:</span>
                    <div className="font-mono font-bold tabular-nums text-slate-900">
                      {formatCurrency(inv.total, company.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Jatuh Tempo:</span>
                    <div className="font-mono text-slate-700 text-[11px]">
                      {formatDateIndo(inv.dueDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onViewInvoice(inv)}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Pratinjau / PDF</span>
                  </button>

                  {inv.status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => onRecordPaymentForInvoice(inv)}
                      className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Bayar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditInvoice(inv)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(inv)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Hapus Faktur Penjualan"
        message={`Apakah Anda yakin ingin menghapus faktur ${invoiceToDelete?.invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Faktur"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setInvoiceToDelete(null)}
      />
    </div>
  );
};
