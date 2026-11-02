import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Invoice, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvoice?: Invoice | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  targetInvoice,
}) => {
  const { invoices, recordPayment, company, showToast } = useInvoice();

  const unpaidInvoices = invoices.filter(i => (i.balance || 0) > 0 || i.id === targetInvoice?.id);

  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const selectedInvoice = invoices.find(i => i.id === invoiceId) || targetInvoice;

  useEffect(() => {
    if (targetInvoice) {
      setInvoiceId(targetInvoice.id);
      setAmount(targetInvoice.balance || targetInvoice.total);
    } else if (unpaidInvoices.length > 0) {
      setInvoiceId(unpaidInvoices[0].id);
      setAmount(unpaidInvoices[0].balance || unpaidInvoices[0].total);
    }
  }, [targetInvoice, isOpen]);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setAmount(inv.balance || inv.total);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      showToast('Form Belum Lengkap', 'Pilih faktur yang akan dibayarkan.', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Nominal Tidak Valid', 'Jumlah pembayaran harus lebih besar dari Rp 0.', 'error');
      return;
    }

    const payment = recordPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customer?.company || selectedInvoice.customer?.name || 'Pelanggan',
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      receiptNumber: receiptNumber.trim(),
      notes: notes.trim(),
    });

    showToast('Pembayaran Dicatat', `Kuitansi ${payment.paymentNumber} sebesar ${formatCurrency(amount, company.currency)} berhasil dibukukan.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Catat Penerimaan Pembayaran</h2>
            <p className="text-xs text-slate-500 mt-0.5">Input bukti transfer kas/bank pelunasan faktur</p>
          </div>
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
            <label className="text-xs font-semibold text-slate-700">Pilih Faktur Tagihan *</label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {unpaidInvoices.length === 0 ? (
                <option value="">Semua faktur telah lunas</option>
              ) : (
                unpaidInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.customer?.company || inv.customer?.name} (Sisa: {formatCurrency(inv.balance, company.currency)})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedInvoice && (
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Total Faktur:</span>
                <div className="font-mono font-medium">{formatCurrency(selectedInvoice.total, company.currency)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Telah Dibayar:</span>
                <div className="font-mono text-emerald-600 font-medium">{formatCurrency(selectedInvoice.amountPaid, company.currency)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Sisa Saldo:</span>
                <div className="font-mono text-rose-600 font-bold">{formatCurrency(selectedInvoice.balance, company.currency)}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Jumlah Pembayaran (Rp) *</label>
              <input
                type="number"
                min="1"
                max={selectedInvoice?.balance || undefined}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tanggal Pembayaran *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="Bank Transfer">Bank Transfer (BCA / Mandiri / dll)</option>
                <option value="Tunai / Cash">Tunai / Cash</option>
                <option value="Midtrans / QRIS">Midtrans / QRIS</option>
                <option value="Cek / Bilyet Giro">Cek / Bilyet Giro</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">No. Referensi / Ref Slip</label>
              <input
                type="text"
                placeholder="BCA-TRF-XXXXX"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Catatan Kas Masuk</label>
            <input
              type="text"
              placeholder="Pelunasan termin 1 via m-banking..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
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
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Pembayaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
