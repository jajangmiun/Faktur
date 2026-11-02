import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Estimate, InvoiceItem } from '../../types';
import { formatCurrency, angkaTerbilang } from '../../utils/formatters';
import { Plus, Trash2, X } from 'lucide-react';

interface EstimateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateToEdit?: Estimate | null;
  onOpenNewCustomerModal: () => void;
}

export const EstimateFormModal: React.FC<EstimateFormModalProps> = ({
  isOpen,
  onClose,
  estimateToEdit,
  onOpenNewCustomerModal,
}) => {
  const { customers, items: catalogItems, company, addEstimate, updateEstimate, estimates, showToast } = useInvoice();

  const isEdit = Boolean(estimateToEdit);

  const [customerId, setCustomerId] = useState('');
  const [estimateNumber, setEstimateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<Estimate['status']>('DRAFT');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (estimateToEdit) {
      setCustomerId(estimateToEdit.customerId);
      setEstimateNumber(estimateToEdit.estimateNumber);
      setIssueDate(estimateToEdit.issueDate);
      setExpiryDate(estimateToEdit.expiryDate);
      setStatus(estimateToEdit.status);
      setDiscountType(estimateToEdit.discountType);
      setDiscountValue(estimateToEdit.discountValue);
      setNotes(estimateToEdit.notes);
      setTerms(estimateToEdit.terms);
      setItems(estimateToEdit.items || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextSeq = estimates.length + 1;
      const nextNum = company.estimatePrefix + String(nextSeq).padStart(4, '0');

      setCustomerId(customers[0]?.id || '');
      setEstimateNumber(nextNum);
      setIssueDate(today);
      setExpiryDate(expiry);
      setStatus('DRAFT');
      setDiscountType('fixed');
      setDiscountValue(0);
      setNotes('Penawaran harga ini bersifat mengikat selama jangka waktu masa berlaku yang tertera.');
      setTerms('1. Harga belum termasuk biaya operasional di luar lingkup kerja.\n2. Pembayaran termin sesuai kesepakatan kontrak.');

      if (catalogItems.length > 0) {
        const item = catalogItems[0];
        const sub = item.price * 1;
        const tax = (sub * item.taxRate) / 100;
        setItems([{
          id: 'item-' + Date.now(),
          itemId: item.id,
          name: item.name,
          description: item.description,
          quantity: 1,
          unit: item.unit,
          price: item.price,
          taxRate: item.taxRate,
          subtotal: sub,
          taxAmount: tax,
          total: sub + tax,
        }]);
      }
    }
  }, [estimateToEdit, isOpen, company, customers, catalogItems, estimates.length]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const discountAmount = discountType === 'percent'
    ? (subtotal * (discountValue || 0)) / 100
    : (discountValue || 0);

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxTotal = items.reduce((acc, it) => acc + (it.taxAmount || 0), 0);
  const total = Math.max(0, taxableBase + taxTotal);

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now(),
        name: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        price: 0,
        taxRate: company.defaultTaxRate,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      },
    ]);
  };

  const handleUpdateItemRow = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };
      const qty = parseFloat(cur.quantity as any) || 0;
      const price = parseFloat(cur.price as any) || 0;
      const taxRate = parseFloat(cur.taxRate as any) || 0;

      const rowSub = qty * price;
      const rowTax = (rowSub * taxRate) / 100;

      cur.subtotal = rowSub;
      cur.taxAmount = rowTax;
      cur.total = rowSub + rowTax;

      updated[index] = cur;
      return updated;
    });
  };

  const handleSelectCatalogItem = (index: number, itemId: string) => {
    const cat = catalogItems.find(c => c.id === itemId);
    if (!cat) return;

    setItems(prev => {
      const updated = [...prev];
      const qty = updated[index].quantity || 1;
      const sub = qty * cat.price;
      const tax = (sub * cat.taxRate) / 100;

      updated[index] = {
        ...updated[index],
        itemId: cat.id,
        name: cat.name,
        description: cat.description,
        unit: cat.unit,
        price: cat.price,
        taxRate: cat.taxRate,
        subtotal: sub,
        taxAmount: tax,
        total: sub + tax,
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      showToast('Form Belum Lengkap', 'Pilih Klien / Pelanggan terlebih dahulu.', 'error');
      return;
    }
    if (!estimateNumber.trim()) {
      showToast('Form Belum Lengkap', 'Nomor penawaran tidak boleh kosong.', 'error');
      return;
    }
    if (items.length === 0 || !items.some(i => i.name.trim())) {
      showToast('Form Belum Lengkap', 'Minimal masukkan satu baris rincian barang/jasa.', 'error');
      return;
    }

    const payload = {
      estimateNumber: estimateNumber.trim(),
      customerId,
      issueDate,
      expiryDate,
      items,
      subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount,
      taxTotal,
      total,
      status,
      notes,
      terms,
    };

    if (isEdit && estimateToEdit) {
      updateEstimate(estimateToEdit.id, payload);
      showToast('Penawaran Diperbarui', `Penawaran ${payload.estimateNumber} berhasil disimpan.`, 'success');
    } else {
      addEstimate(payload);
      showToast('Penawaran Diterbitkan', `Penawaran ${payload.estimateNumber} berhasil dibuat.`, 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? `Edit Penawaran: ${estimateToEdit?.estimateNumber}` : 'Buat Surat Penawaran Harga Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen komersil penawaran yang dapat disetujui dan dikonversi ke faktur penjualan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Klien / Pelanggan *</label>
                <button
                  type="button"
                  onClick={onOpenNewCustomerModal}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Klien Baru
                </button>
              </div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Klien --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor Penawaran *</label>
              <input
                type="text"
                value={estimateNumber}
                onChange={(e) => setEstimateNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Status Penawaran</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT (Terkirim)</option>
                <option value="ACCEPTED">ACCEPTED (Disetujui)</option>
                <option value="REJECTED">REJECTED (Ditolak)</option>
                <option value="CONVERTED">CONVERTED (Dikonversi)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tanggal Penawaran *</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Masa Berlaku Harga Penawaran *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rincian Barang & Layanan
              </h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-6 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">Nama Item #{idx + 1}</label>
                        {catalogItems.length > 0 && (
                          <select
                            onChange={(e) => handleSelectCatalogItem(idx, e.target.value)}
                            value=""
                            className="text-[10px] text-indigo-600 font-medium bg-transparent border-0 cursor-pointer p-0"
                          >
                            <option value="">+ Pilih Katalog</option>
                            {catalogItems.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItemRow(idx, 'name', e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Kuantitas</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Satuan</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItemRow(idx, 'unit', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-center"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Harga Satuan (Rp)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleUpdateItemRow(idx, 'price', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        placeholder="Deskripsi spesifikasi teknis penawaran"
                        value={item.description}
                        onChange={(e) => handleUpdateItemRow(idx, 'description', e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                      />
                    </div>
                    <div className="sm:col-span-4 text-right">
                      <span className="text-[10px] text-slate-400 mr-1">Subtotal:</span>
                      <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                        {formatCurrency(item.subtotal, company.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Math Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Diskon Penawaran</label>
                <div className="flex items-center gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="fixed">Nominal (Rp)</option>
                    <option value="percent">Persen (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-32 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div className="pt-2 text-xs italic text-slate-700">
                  "{angkaTerbilang(total)}"
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-medium text-slate-600 sm:text-right">
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatCurrency(subtotal, company.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between sm:justify-end sm:gap-6 text-rose-600">
                    <span>Diskon:</span>
                    <span className="font-mono tabular-nums">- {formatCurrency(discountAmount, company.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span>Total PPN:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatCurrency(taxTotal, company.currency)}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between sm:justify-end sm:gap-6 text-sm font-bold text-slate-900">
                  <span>TOTAL ESTIMASI:</span>
                  <span className="font-mono tabular-nums text-indigo-700">{formatCurrency(total, company.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Proposal</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Syarat & Ketentuan Penawaran</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              {isEdit ? 'Simpan Perubahan' : 'Terbitkan Penawaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
