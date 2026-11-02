import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Item } from '../../types';
import { X } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { addItem, updateItem, company, showToast } = useInvoice();
  const isEdit = Boolean(itemToEdit);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(company.defaultTaxRate);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setSku(itemToEdit.sku);
      setDescription(itemToEdit.description);
      setUnit(itemToEdit.unit);
      setPrice(itemToEdit.price);
      setTaxRate(itemToEdit.taxRate);
    } else {
      setName('');
      setSku('SKU-' + Math.floor(1000 + Math.random() * 9000));
      setDescription('');
      setUnit('paket');
      setPrice(0);
      setTaxRate(company.defaultTaxRate);
    }
  }, [itemToEdit, isOpen, company.defaultTaxRate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      showToast('Form Belum Lengkap', 'Nama item dan SKU wajib diisi.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim(),
      unit: unit.trim() || 'pcs',
      price: Number(price) || 0,
      taxRate: Number(taxRate) || 0,
    };

    if (isEdit && itemToEdit) {
      updateItem(itemToEdit.id, payload);
      showToast('Item Diperbarui', `Produk/jasa ${payload.name} berhasil disimpan.`, 'success');
    } else {
      addItem(payload);
      showToast('Item Ditambahkan', `Produk/jasa ${payload.name} berhasil masuk katalog.`, 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {isEdit ? 'Edit Produk / Jasa' : 'Tambah Produk / Jasa Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nama Produk atau Layanan *</label>
            <input
              type="text"
              placeholder="Contoh: Pembuatan Website E-Commerce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kode SKU / Part No. *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Satuan (Unit)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              >
                <option value="pcs">pcs (buah)</option>
                <option value="paket">paket (project)</option>
                <option value="bulan">bulan (month)</option>
                <option value="tahun">tahun (year)</option>
                <option value="jam">jam (hours)</option>
                <option value="hari">hari (days)</option>
                <option value="unit">unit</option>
                <option value="set">set</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Harga Satuan (Rp) *</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tarif Pajak PPN (%)</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
              >
                <option value="11">11% (PPN Standar)</option>
                <option value="12">12%</option>
                <option value="0">0% (Bebas PPN)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Deskripsi / Spesifikasi</label>
            <textarea
              rows={2}
              placeholder="Keterangan cakupan pekerjaan atau spesifikasi barang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              {isEdit ? 'Simpan Perubahan' : 'Tambahkan Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
