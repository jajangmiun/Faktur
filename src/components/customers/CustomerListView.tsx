import React, { useState, useMemo } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Customer, Invoice } from '../../types';
import { formatCurrency, formatDateIndo, getInvoiceStatusMeta } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  FileText, 
  Eye, 
  CreditCard, 
  X,
  ArrowRight,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface CustomerListViewProps {
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
  onCreateInvoiceForCustomer: (customer: Customer) => void;
}

type SortField = 'name' | 'company' | 'city' | 'due' | 'invoicesCount';
type SortOrder = 'asc' | 'desc';

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  onOpenNewCustomer,
  onEditCustomer,
  onViewInvoice,
  onRecordPaymentForInvoice,
  onCreateInvoiceForCustomer,
}) => {
  const { customers, deleteCustomer, invoices, company, showToast } = useInvoice();

  // Search, Filters & View Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'HAS_DEBT' | 'NO_DEBT'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('due');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Transaction history modal
  const [selectedCustomerForInvoices, setSelectedCustomerForInvoices] = useState<Customer | null>(null);

  // Deletion Confirmation State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Unique cities for filter
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'due' || field === 'invoicesCount' ? 'desc' : 'asc');
    }
  };

  const customersWithStats = useMemo(() => {
    return customers.map(c => {
      const linkedInvoices = invoices.filter(i => i.customerId === c.id);
      const totalDue = linkedInvoices.reduce((acc, i) => acc + (i.balance || 0), 0);
      const totalBilled = linkedInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
      return {
        ...c,
        invoicesCount: linkedInvoices.length,
        totalDue,
        totalBilled,
      };
    });
  }, [customers, invoices]);

  const filteredCustomers = useMemo(() => {
    return customersWithStats
      .filter(c => {
        // City Filter
        if (cityFilter !== 'ALL' && c.city !== cityFilter) return false;

        // Debt Filter
        if (debtFilter === 'HAS_DEBT' && c.totalDue <= 0) return false;
        if (debtFilter === 'NO_DEBT' && c.totalDue > 0) return false;

        // Search
        const searchLower = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(searchLower) ||
          c.company.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.toLowerCase().includes(searchLower) ||
          c.city.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'company':
            valA = a.company.toLowerCase();
            valB = b.company.toLowerCase();
            break;
          case 'city':
            valA = a.city.toLowerCase();
            valB = b.city.toLowerCase();
            break;
          case 'due':
            valA = a.totalDue;
            valB = b.totalDue;
            break;
          case 'invoicesCount':
            valA = a.invoicesCount;
            valB = b.invoicesCount;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [customersWithStats, cityFilter, debtFilter, searchTerm, sortField, sortOrder]);

  const hasActiveFilters = cityFilter !== 'ALL' || debtFilter !== 'ALL' || searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setCityFilter('ALL');
    setDebtFilter('ALL');
    setSearchTerm('');
    setSortField('due');
    setSortOrder('desc');
    showToast('Filter Klien Direset', 'Semua filter data pelanggan telah dikembalikan.');
  };

  const handleDelete = (c: Customer) => {
    setCustomerToDelete(c);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    const success = deleteCustomer(customerToDelete.id);
    if (success) {
      showToast('Klien Dihapus', `Data pelanggan ${customerToDelete.name} berhasil dihapus.`, 'info');
    } else {
      showToast('Tidak Dapat Dihapus', `Klien masih memiliki transaksi faktur aktif. Hapus fakturnya terlebih dahulu.`, 'error');
    }
    setCustomerToDelete(null);
  };

  const customerInvoices = selectedCustomerForInvoices
    ? invoices.filter(i => i.customerId === selectedCustomerForInvoices.id)
    : [];

  const customerTotalDue = customerInvoices.reduce((acc, i) => acc + (i.balance || 0), 0);
  const customerTotalBilled = customerInvoices.reduce((acc, i) => acc + (i.total || 0), 0);

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
      {/* Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>Klien & Pelanggan</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredCustomers.length} Klien
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buku kontak rekanan, NPWP, alamat penagihan resmi, dan monitoring saldo piutang aktif.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

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
            onClick={onOpenNewCustomer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Klien Baru</span>
          </button>
        </div>
      </div>

      {/* Header Search & Quick Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, perusahaan, kontak, kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Advanced Header Filter Toolbar */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Filter Kolom Header Tabel Klien</span>
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
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>Filter Kota / Wilayah:</span>
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Kota ({uniqueCities.length})</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-slate-400" />
                <span>Status Piutang / Tunggakan:</span>
              </label>
              <select
                value={debtFilter}
                onChange={(e) => setDebtFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Klien</option>
                <option value="HAS_DEBT">Ada Piutang Belum Lunas (&gt; 0)</option>
                <option value="NO_DEBT">Tanpa Piutang (Lunas / Rp 0)</option>
              </select>
            </div>

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
                  <option value="due">Total Piutang</option>
                  <option value="company">Perusahaan</option>
                  <option value="name">Nama Kontak</option>
                  <option value="city">Kota</option>
                  <option value="invoicesCount">Jumlah Faktur</option>
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

      {/* TABLE VIEW (Standard Crater Enterprise) */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold select-none">
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort('company')}
                  title="Klik untuk mengurutkan perusahaan"
                >
                  <span className="flex items-center">
                    Perusahaan / Brand {renderSortIndicator('company')}
                  </span>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort('name')}
                  title="Klik untuk mengurutkan nama kontak"
                >
                  <span className="flex items-center">
                    Kontak PIC {renderSortIndicator('name')}
                  </span>
                </th>
                <th className="py-3 px-4">Kontak & Email</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort('city')}
                  title="Klik untuk mengurutkan kota"
                >
                  <span className="flex items-center">
                    Kota {renderSortIndicator('city')}
                  </span>
                </th>
                <th 
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort('invoicesCount')}
                  title="Klik untuk mengurutkan jumlah faktur"
                >
                  <span className="flex items-center justify-center">
                    Faktur {renderSortIndicator('invoicesCount')}
                  </span>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort('due')}
                  title="Klik untuk mengurutkan sisa piutang"
                >
                  <span className="flex items-center justify-end">
                    Sisa Piutang {renderSortIndicator('due')}
                  </span>
                </th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-6 w-6 text-slate-300" />
                      <span>Tidak ada data klien yang cocok dengan filter yang dipilih.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerForInvoices(c)}
                        className="text-left hover:text-indigo-600 transition-colors"
                        title="Lihat Riwayat Transaksi Klien"
                      >
                        {c.company || c.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="text-[11px] font-mono">{c.email}</div>
                      <div className="text-[11px] text-slate-400">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.city}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerForInvoices(c)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-mono font-medium transition-colors"
                        title="Klik untuk rincian faktur"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{c.invoicesCount} Faktur</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {c.totalDue > 0 ? (
                        <span className="text-rose-600">
                          {formatCurrency(c.totalDue, company.currency)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Rp 0 (Lunas)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onCreateInvoiceForCustomer(c)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="+ Buat Faktur untuk Klien Ini"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForInvoices(c)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Riwayat Transaksi"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCustomer(c)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Edit Klien"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Hapus Klien"
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
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              Tidak ada data klien yang cocok.
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div 
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.company || c.name}</h3>
                      <div className="text-xs font-medium text-slate-600 mt-0.5">PIC: {c.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCustomer(c)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit Data Klien"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Hapus Klien"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.address}, {c.city}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Piutang:</span>
                    <div className={`font-mono text-xs font-bold ${c.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(c.totalDue, company.currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerForInvoices(c)}
                      className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Lihat riwayat faktur klien"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span>{c.invoicesCount} Faktur</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCreateInvoiceForCustomer(c)}
                      className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                      title="Buat Faktur Baru untuk Klien Ini"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Faktur</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RIWAYAT FAKTUR KLIEN MODAL */}
      {selectedCustomerForInvoices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Riwayat Transaksi: {selectedCustomerForInvoices.company || selectedCustomerForInvoices.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    PIC: {selectedCustomerForInvoices.name} • {selectedCustomerForInvoices.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForInvoices(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-xs text-slate-500">Total Nilai Transaksi:</span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {formatCurrency(customerTotalBilled, company.currency)}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3.5">
                  <span className="text-xs text-rose-700 font-semibold">Sisa Tagihan Belum Lunas:</span>
                  <div className="text-lg font-bold font-mono text-rose-600 mt-1">
                    {formatCurrency(customerTotalDue, company.currency)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Faktur yang Pernah Diterbitkan ({customerInvoices.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onCreateInvoiceForCustomer(selectedCustomerForInvoices);
                    setSelectedCustomerForInvoices(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Buat Faktur untuk Klien Ini</span>
                </button>
              </div>

              {customerInvoices.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                  Belum ada faktur yang diterbitkan untuk klien ini.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">No. Faktur</th>
                        <th className="py-2.5 px-3">Tgl Terbit</th>
                        <th className="py-2.5 px-3">Jatuh Tempo</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-right">Sisa Saldo</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerInvoices.map(inv => {
                        const meta = getInvoiceStatusMeta(inv.status);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {formatDateIndo(inv.issueDate)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {formatDateIndo(inv.dueDate)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(inv.total, company.currency)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              {inv.balance > 0 ? (
                                <span className="text-rose-600">{formatCurrency(inv.balance, company.currency)}</span>
                              ) : (
                                <span className="text-emerald-600">Lunas</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onViewInvoice(inv);
                                    setSelectedCustomerForInvoices(null);
                                  }}
                                  className="p-1 text-slate-500 hover:text-indigo-600 rounded"
                                  title="Pratinjau / Cetak"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                {inv.status !== 'PAID' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRecordPaymentForInvoice(inv);
                                      setSelectedCustomerForInvoices(null);
                                    }}
                                    className="p-1 text-emerald-600 hover:text-emerald-800 rounded"
                                    title="Catat Pelunasan"
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Hapus Data Pelanggan"
        message={`Apakah Anda yakin ingin menghapus data pelanggan ${customerToDelete?.name} (${customerToDelete?.company})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pelanggan"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
