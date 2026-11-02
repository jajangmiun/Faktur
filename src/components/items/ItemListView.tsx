import React, { useState, useMemo } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Item } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface ItemListViewProps {
  onOpenNewItem: () => void;
  onEditItem: (item: Item) => void;
}

type SortField = 'sku' | 'name' | 'unit' | 'price' | 'taxRate';
type SortOrder = 'asc' | 'desc';

export const ItemListView: React.FC<ItemListViewProps> = ({
  onOpenNewItem,
  onEditItem,
}) => {
  const { items, deleteItem, company, showToast } = useInvoice();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'ALL' | 'UNDER_1M' | '1M_5M' | 'OVER_5M'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Deletion Confirmation State
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Unique units for dropdown
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.unit) set.add(i.unit);
    });
    return Array.from(set).sort();
  }, [items]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'price' ? 'desc' : 'asc');
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(i => {
        // Unit Filter
        if (unitFilter !== 'ALL' && i.unit !== unitFilter) return false;

        // Price Range Filter
        if (priceRangeFilter === 'UNDER_1M' && i.price >= 1000000) return false;
        if (priceRangeFilter === '1M_5M' && (i.price < 1000000 || i.price > 5000000)) return false;
        if (priceRangeFilter === 'OVER_5M' && i.price <= 5000000) return false;

        // Search
        const searchLower = searchTerm.toLowerCase();
        return (
          i.name.toLowerCase().includes(searchLower) ||
          i.sku.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower) ||
          String(i.price).includes(searchLower)
        );
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'sku':
            valA = a.sku.toLowerCase();
            valB = b.sku.toLowerCase();
            break;
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'unit':
            valA = a.unit.toLowerCase();
            valB = b.unit.toLowerCase();
            break;
          case 'price':
            valA = a.price || 0;
            valB = b.price || 0;
            break;
          case 'taxRate':
            valA = a.taxRate || 0;
            valB = b.taxRate || 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, unitFilter, priceRangeFilter, searchTerm, sortField, sortOrder]);

  const hasActiveFilters = unitFilter !== 'ALL' || priceRangeFilter !== 'ALL' || searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setUnitFilter('ALL');
    setPriceRangeFilter('ALL');
    setSearchTerm('');
    setSortField('name');
    setSortOrder('asc');
    showToast('Filter Item Direset', 'Semua filter katalog produk telah dikembalikan.');
  };

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const success = deleteItem(itemToDelete.id);
    if (success) {
      showToast('Item Dihapus', `Produk/jasa ${itemToDelete.name} berhasil dihapus.`, 'info');
    }
    setItemToDelete(null);
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
      {/* Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>Katalog Produk & Jasa</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredItems.length} Item
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tarif standar layanan dan barang untuk memudahkan pengisian baris faktur & penawaran.
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
            onClick={onOpenNewItem}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Item Baru</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari SKU, nama produk, deskripsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Advanced Header Filters Toolbar */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Filter Kolom Header Tabel Produk & Jasa</span>
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
                <Tag className="h-3 w-3 text-slate-400" />
                <span>Filter Satuan / Unit:</span>
              </label>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Satuan ({uniqueUnits.length})</option>
                {uniqueUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Package className="h-3 w-3 text-slate-400" />
                <span>Rentang Harga Satuan:</span>
              </label>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Harga</option>
                <option value="UNDER_1M">&lt; Rp 1.000.000</option>
                <option value="1M_5M">Rp 1.000.000 - Rp 5.000.000</option>
                <option value="OVER_5M">&gt; Rp 5.000.000</option>
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
                  <option value="name">Nama Item</option>
                  <option value="price">Harga Standar</option>
                  <option value="sku">Kode SKU</option>
                  <option value="unit">Satuan</option>
                  <option value="taxRate">Tarif Pajak</option>
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
                onClick={() => handleSort('sku')}
                title="Klik untuk mengurutkan kode SKU"
              >
                <span className="flex items-center">
                  Kode SKU {renderSortIndicator('sku')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('name')}
                title="Klik untuk mengurutkan nama produk/jasa"
              >
                <span className="flex items-center">
                  Nama Produk / Layanan {renderSortIndicator('name')}
                </span>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('unit')}
                title="Klik untuk mengurutkan satuan"
              >
                <span className="flex items-center">
                  Satuan {renderSortIndicator('unit')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('price')}
                title="Klik untuk mengurutkan harga"
              >
                <span className="flex items-center justify-end">
                  Harga Standar {renderSortIndicator('price')}
                </span>
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('taxRate')}
                title="Klik untuk mengurutkan tarif pajak"
              >
                <span className="flex items-center justify-center">
                  Tarif Pajak {renderSortIndicator('taxRate')}
                </span>
              </th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-6 w-6 text-slate-300" />
                    <span>Tidak ada item produk/jasa yang cocok dengan filter yang dipilih.</span>
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
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {item.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatCurrency(item.price, company.currency)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {item.taxRate}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Hapus Item"
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

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Hapus Produk / Jasa"
        message={`Apakah Anda yakin ingin menghapus produk/jasa "${itemToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Item"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
