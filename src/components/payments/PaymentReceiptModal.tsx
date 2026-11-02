import React, { useEffect } from 'react';
import { Payment, CompanyProfile } from '../../types';
import { formatCurrency, formatDateIndo, angkaTerbilang } from '../../utils/formatters';
import { printDocument } from '../../utils/printHelper';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  payment: Payment | null;
  company: CompanyProfile;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  company,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (payment && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [payment, onClose]);

  if (!payment) return null;

  const handlePrint = () => {
    printDocument('printable-receipt-content', `KUITANSI_${payment.paymentNumber}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header Actions (No print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">
              Kuitansi Tanda Terima Kas Masuk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Kuitansi</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt-content" className="printable-document p-6 sm:p-10 overflow-y-auto text-slate-800 bg-white space-y-6">
          {/* Header Kop */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="text-base font-extrabold text-slate-900">{company.name}</div>
              <div className="text-xs text-slate-500">{company.address}, {company.city}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">NPWP: {company.taxNumber || '-'} | Telp: {company.phone}</div>
            </div>

            <div className="text-right">
              <div className="text-xl font-extrabold text-emerald-700 tracking-wider uppercase">
                KUITANSI PEMBAYARAN
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                NO: {payment.paymentNumber}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Tanggal: {formatDateIndo(payment.paymentDate, false)}
              </div>
            </div>
          </div>

          {/* Receipt Body Table */}
          <div className="border border-slate-200 rounded-lg p-5 space-y-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-baseline border-b border-slate-200 pb-3">
              <span className="sm:col-span-3 text-slate-500 font-medium">Telah Diterima Dari:</span>
              <span className="sm:col-span-9 font-bold text-slate-900 text-sm">
                {payment.customerName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-baseline border-b border-slate-200 pb-3">
              <span className="sm:col-span-3 text-slate-500 font-medium">Uang Sejumlah:</span>
              <span className="sm:col-span-9 font-mono font-bold text-emerald-700 text-base tabular-nums">
                {formatCurrency(payment.amount, company.currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-baseline border-b border-slate-200 pb-3">
              <span className="sm:col-span-3 text-slate-500 font-medium">Terbilang:</span>
              <span className="sm:col-span-9 italic font-semibold text-slate-800">
                "{angkaTerbilang(payment.amount)}"
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-baseline border-b border-slate-200 pb-3">
              <span className="sm:col-span-3 text-slate-500 font-medium">Untuk Pembayaran:</span>
              <div className="sm:col-span-9 space-y-0.5">
                <span className="font-semibold text-slate-900">
                  Pelunasan Faktur Nomor: <span className="font-mono text-indigo-700">{payment.invoiceNumber}</span>
                </span>
                {payment.notes && (
                  <div className="text-[11px] text-slate-500">{payment.notes}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-baseline">
              <span className="sm:col-span-3 text-slate-500 font-medium">Metode / Referensi:</span>
              <span className="sm:col-span-9 text-slate-700 font-medium">
                {payment.paymentMethod} {payment.receiptNumber ? `(Ref: ${payment.receiptNumber})` : ''}
              </span>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 flex justify-between items-end text-xs">
            <div className="text-[11px] text-slate-400">
              * Kuitansi ini sah jika dicetak dengan stempel perusahaan atau nomor referensi bank valid.
            </div>

            <div className="text-center w-52">
              <div className="text-slate-500">{company.city}, {formatDateIndo(payment.paymentDate, false)}</div>
              <div className="font-bold text-slate-900 mt-0.5">Bagian Keuangan & Kasir</div>
              
              <div className="my-3 flex h-16 items-center justify-center">
                <div className="rounded-full border border-dashed border-emerald-300 px-3 py-1 text-[9px] font-bold text-emerald-600 rotate-[-5deg]">
                  LUNAS / DITERIMA
                </div>
              </div>

              <div className="font-bold text-slate-900 underline">{company.signatureName}</div>
              <div className="text-[10px] text-slate-500">{company.signatureRole}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
