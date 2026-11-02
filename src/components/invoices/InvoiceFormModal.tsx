import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Invoice, InvoiceItem, Customer, Item } from '../../types';
import { formatCurrency, angkaTerbilang } from '../../utils/formatters';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  preselectedCustomerId?: string;
  onOpenNewCustomerModal: () => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
  preselectedCustomerId,
  onOpenNewCustomerModal,
}) => {
  const { customers, items: catalogItems, company, addInvoice, updateInvoice, invoices, showToast } = useInvoice();

  const isEdit = Boolean(invoiceToEdit);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('DRAFT');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Initialize Form
  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerId(invoiceToEdit.customerId);
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setIssueDate(invoiceToEdit.issueDate);
      setDueDate(invoiceToEdit.dueDate);
      setStatus(invoiceToEdit.status);
      setDiscountType(invoiceToEdit.discountType);
      setDiscountValue(invoiceToEdit.discountValue);
      setNotes(invoiceToEdit.notes);
      setTerms(invoiceToEdit.terms);
      setItems(invoiceToEdit.items || []);
    } else {
      // New Invoice Defaults
      const today = new Date().toISOString().split('T')[0];
      const defaultDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextSeq = invoices.length + 1;
      const nextInvNum = company.invoicePrefix + String(nextSeq).padStart(4, '0');

      setCustomerId(preselectedCustomerId || customers[0]?.id || '');
      setInvoiceNumber(nextInvNum);
      setIssueDate(today);
      setDueDate(defaultDue);
      setStatus('DRAFT');
      setDiscountType('fixed');
      setDiscountValue(0);
      setNotes(`Terima kasih atas kerja samanya. Mohon transfer pembayaran ke rekening ${company.bankName} ${company.bankAccount} a.n. ${company.bankHolder}.`);
      setTerms('1. Faktur ini berlaku sebagai dokumen penagihan sah.\n2. Pembayaran jatuh tempo 30 hari kalender sejak faktur diterbitkan.\n3. Harap konfirmasi bukti transfer.');

      // Default one item row
      if (catalogItems.length > 0) {
        const first = catalogItems[0];
        const sub = first.price * 1;
        const tax = (sub * first.taxRate) / 100;
        setItems([{
          id: 'item-' + Date.now(),
          itemId: first.id,
          name: first.name,
          description: first.description,
          quantity: 1,
          unit: first.unit,
          price: first.price,
          taxRate: first.taxRate,
          subtotal: sub,
          taxAmount: tax,
          total: sub + tax,
        }]);
      } else {
        setItems([{
          id: 'item-' + Date.now(),
          name: 'Jasa Konsultasi IT',
          description: 'Implementasi dan analisis sistem',
          quantity: 1,
          unit: 'paket',
          price: 5000000,
          taxRate: company.defaultTaxRate,
          subtotal: 5000000,
          taxAmount: (5000000 * company.defaultTaxRate) / 100,
          total: 5000000 + (5000000 * company.defaultTaxRate) / 100,
        }]);
      }
    }
  }, [invoiceToEdit, isOpen, company, customers, catalogItems, invoices.length]);

  if (!isOpen) return null;

  // Calculation Math
  const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  
  const discountAmount = discountType === 'percent'
    ? (subtotal * (discountValue || 0)) / 100
    : (discountValue || 0);

  const taxableBase = Math.max(0, subtotal - discountAmount);
  // Calculate tax proportionally from items or standard
  const taxTotal = items.reduce((acc, it) => acc + (it.taxAmount || 0), 0);
  const total = Math.max(0, taxableBase + taxTotal);

  // Preset Due Date Helpers
  const setPresetDueDate = (days: number) => {
    const start = issueDate ? new Date(issueDate) : new Date();
    const target = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setDueDate(target.toISOString().split('T')[0]);
  };

  // Row Manipulation Handlers
  const handleAddItemRow = () => {
    const newItem: InvoiceItem = {
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
    };
    setItems(prev => [...prev, newItem]);
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

  const handleUpdateItemRow = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };

      const qty = parseFloat(cur.quantity as any) || 0;
      const price = parseFloat(cur.price as any) || 0;
      const taxRate = parseFloat(cur.taxRate as any) || 0;

      const rowSub = qty * price;
      const rowTax = (rowSub * taxRate) / 100;
      const rowTot = rowSub + rowTax;

      cur.subtotal = rowSub;
      cur.taxAmount = rowTax;
      cur.total = rowTot;

      updated[index] = cur;
      return updated;
    });
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Form Belum Lengkap', 'Pilih Klien / Pelanggan terlebih dahulu.', 'error');
      return;
    }
    if (!invoiceNumber.trim()) {
      showToast('Form Belum Lengkap', 'Nomor faktur tidak boleh kosong.', 'error');
      return;
    }
    if (items.length === 0 || !items.some(i => i.name.trim())) {
      showToast('Form Belum Lengkap', 'Minimal masukkan satu baris rincian barang atau jasa.', 'error');
      return;
    }

    const payload = {
      invoiceNumber: invoiceNumber.trim(),
      customerId,
      issueDate,
      dueDate,
      items,
      subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount,
      taxTotal,
      total,
      amountPaid: isEdit && invoiceToEdit ? invoiceToEdit.amountPaid : 0,
      balance: isEdit && invoiceToEdit ? Math.max(0, total - invoiceToEdit.amountPaid) : total,
      status,
      notes,
      terms,
    };

    if (isEdit && invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, payload);
      showToast('Faktur Diperbarui', `Faktur ${payload.invoiceNumber} berhasil disimpan.`, 'success');
    } else {
      addInvoice(payload);
      showToast('Faktur Dibuat', `Faktur ${payload.invoiceNumber} berhasil diterbitkan.`, 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? `Edit Faktur: ${invoiceToEdit?.invoiceNumber}` : 'Buat Faktur Penjualan Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar format komersil dengan kalkulasi otomatis PPN dan diskon
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

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Customer & Invoice Meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Customer Selector */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Klien / Pelanggan <span className="text-rose-500">*</span>
                </label>
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

            {/* Invoice Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Nomor Faktur <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Status Faktur
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Invoice['status'])}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="DRAFT">DRAFT (Konsep)</option>
                <option value="SENT">SENT (Terkirim)</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID (Sebagian)</option>
                <option value="PAID">PAID (Lunas)</option>
                <option value="OVERDUE">OVERDUE (Jatuh Tempo)</option>
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Tanggal Penerbitan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Due Date & Presets */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-400">Termin:</span>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(14)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    14 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(30)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    30 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(45)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    45 Hari
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rincian Barang & Layanan
              </h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4 space-y-3 transition-colors hover:border-slate-300"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    {/* Item Name / Catalog Quick Select */}
                    <div className="sm:col-span-6 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Nama Barang / Layanan #{idx + 1}
                        </label>
                        {catalogItems.length > 0 && (
                          <select
                            onChange={(e) => handleSelectCatalogItem(idx, e.target.value)}
                            value=""
                            className="text-[10px] text-indigo-600 font-medium bg-transparent border-0 cursor-pointer focus:ring-0 p-0"
                          >
                            <option value="">+ Pilih dari Katalog</option>
                            {catalogItems.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: Pembuatan Website Enterprise"
                        value={item.name}
                        onChange={(e) => handleUpdateItemRow(idx, 'name', e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Kuantitas
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Satuan
                      </label>
                      <input
                        type="text"
                        placeholder="pcs"
                        value={item.unit}
                        onChange={(e) => handleUpdateItemRow(idx, 'unit', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                      />
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Harga Satuan (Rp)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.price}
                          onChange={(e) => handleUpdateItemRow(idx, 'price', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            title="Hapus Baris"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description & Row Subtotal */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        placeholder="Deskripsi spesifikasi / rincian pekerjaan (opsional)"
                        value={item.description}
                        onChange={(e) => handleUpdateItemRow(idx, 'description', e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-slate-500">PPN:</span>
                        <select
                          value={item.taxRate}
                          onChange={(e) => handleUpdateItemRow(idx, 'taxRate', e.target.value)}
                          className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-mono"
                        >
                          <option value="11">11%</option>
                          <option value="12">12%</option>
                          <option value="0">0% (Bebas)</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2 text-right">
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

          {/* Section 3: Summary Math & Global Discount */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Discount Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Potongan Diskon Global
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="fixed">Nominal (Rp)</option>
                    <option value="percent">Persentase (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-32 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono font-medium"
                    placeholder="0"
                  />
                </div>

                {/* Terbilang Live Preview */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Terbilang:</div>
                  <div className="text-xs italic text-slate-700 font-medium">
                    "{angkaTerbilang(total)}"
                  </div>
                </div>
              </div>

              {/* Total Calculation Strip */}
              <div className="space-y-1.5 text-xs font-medium text-slate-600 sm:text-right">
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span>Subtotal Kotor:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatCurrency(subtotal, company.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between sm:justify-end sm:gap-6 text-rose-600">
                    <span>Potongan Diskon:</span>
                    <span className="font-mono tabular-nums">- {formatCurrency(discountAmount, company.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span>Total PPN:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatCurrency(taxTotal, company.currency)}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between sm:justify-end sm:gap-6 text-sm font-bold text-slate-900">
                  <span>TOTAL AKHIR:</span>
                  <span className="font-mono tabular-nums text-indigo-700">{formatCurrency(total, company.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Notes and Terms */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Catatan Penagihan / Rekening Bank
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Syarat & Ketentuan Pembayaran
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              {isEdit ? 'Simpan Perubahan Faktur' : 'Terbitkan Faktur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
