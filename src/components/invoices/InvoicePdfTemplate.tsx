import React, { useState } from 'react';
import { Invoice, CompanyProfile } from '../../types';
import { formatCurrency, formatDateIndo, angkaTerbilang, getInvoiceStatusMeta } from '../../utils/formatters';
import { printDocument, downloadA4Document } from '../../utils/printHelper';
import { generatePdfFromElement, downloadPdfBlob } from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { useInvoice } from '../../context/InvoiceContext';
import { Printer, Download, ArrowLeft, CreditCard, Share2, Copy, Check, MessageSquare, X, FileText } from 'lucide-react';

interface InvoicePdfTemplateProps {
  invoice: Invoice;
  company: CompanyProfile;
  onClose?: () => void;
  onRecordPayment?: (invoice: Invoice) => void;
}

export const InvoicePdfTemplate: React.FC<InvoicePdfTemplateProps> = ({
  invoice,
  company,
  onClose,
  onRecordPayment,
}) => {
  const { showToast } = useInvoice();
  const meta = getInvoiceStatusMeta(invoice.status);
  const [copiedText, setCopiedText] = useState(false);

  // Real PDF Preview & Download States
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleOpenPdfViewer = async () => {
    setIsPdfModalOpen(true);
    setIsGeneratingPdf(true);
    showToast('Memproses PDF...', 'Menyusun dokumen PDF A4 resolusi tinggi...', 'info');

    try {
      const result = await generatePdfFromElement(
        'printable-invoice-content',
        `FAKTUR_${invoice.invoiceNumber}.pdf`
      );

      if (result) {
        setPdfUrl(result.url);
        setPdfBlob(result.blob);
        showToast('PDF Siap!', `Dokumen FAKTUR_${invoice.invoiceNumber}.pdf berhasil dimunculkan.`, 'success');
      } else {
        showToast('Info', 'Membuka dialog cetak langsung...', 'info');
        printDocument('printable-invoice-content', `FAKTUR_${invoice.invoiceNumber}`);
      }
    } catch (err) {
      console.error('PDF error:', err);
      printDocument('printable-invoice-content', `FAKTUR_${invoice.invoiceNumber}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfBlob) {
      downloadPdfBlob(pdfBlob, `FAKTUR_${invoice.invoiceNumber}.pdf`);
      showToast('Unduhan Berhasil', `File FAKTUR_${invoice.invoiceNumber}.pdf telah disimpan.`, 'success');
      return;
    }

    showToast('Menyiapkan Unduhan...', 'Menghasilkan file PDF...', 'info');
    const result = await generatePdfFromElement(
      'printable-invoice-content',
      `FAKTUR_${invoice.invoiceNumber}.pdf`
    );
    if (result) {
      setPdfUrl(result.url);
      setPdfBlob(result.blob);
      downloadPdfBlob(result.blob, result.filename);
      showToast('Unduhan Selesai', `File ${result.filename} berhasil diunduh.`, 'success');
    }
  };

  const handleDownloadHtml = () => {
    downloadA4Document('printable-invoice-content', `FAKTUR_${invoice.invoiceNumber}`);
    showToast('File Diunduh', `FAKTUR_${invoice.invoiceNumber}.html siap dibuka offline atau dicetak.`, 'success');
  };

  const generateInvoiceTextSummary = () => {
    const bankList = (company.bankAccounts && company.bankAccounts.length > 0)
      ? company.bankAccounts.map(b => `- ${b.bankName}: ${b.bankAccount} (a.n. ${b.bankHolder})`).join('\n')
      : `- ${company.bankName}: ${company.bankAccount} (a.n. ${company.bankHolder})`;

    return `*FAKTUR PENJUALAN - ${company.name}*
Nomor Faktur: ${invoice.invoiceNumber}
Kepada: ${invoice.customer?.company || invoice.customer?.name}
Tanggal Terbit: ${formatDateIndo(invoice.issueDate)}
Jatuh Tempo: ${formatDateIndo(invoice.dueDate)}

Total Tagihan: ${formatCurrency(invoice.total, company.currency)}
${invoice.amountPaid > 0 ? `Sudah Dibayar: ${formatCurrency(invoice.amountPaid, company.currency)}\nSisa Saldo: ${formatCurrency(invoice.balance, company.currency)}\n` : ''}
*Pilihan Rekening Pembayaran Resmi:*
${bankList}

Mohon konfirmasi setelah melakukan transfer. Terima kasih.`;
  };

  const handleCopyText = () => {
    const summary = generateInvoiceTextSummary();
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getWhatsAppUrl = () => {
    const summary = generateInvoiceTextSummary();
    const encoded = encodeURIComponent(summary);
    const rawPhone = invoice.customer?.phone?.replace(/[^0-9]/g, '') || '';
    let targetPhone = rawPhone;
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }
    return targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  const bankAccounts = company.bankAccounts && company.bankAccounts.length > 0
    ? company.bankAccounts
    : [{
        id: 'default',
        bankName: company.bankName,
        bankBranch: company.bankBranch,
        bankAccount: company.bankAccount,
        bankHolder: company.bankHolder,
        isDefault: true,
      }];

  return (
    <div className="w-full">
      {/* Top Action Toolbar (Sticky & prominent, Hidden during printing) */}
      <div className="no-print sticky top-2 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-md">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
              title="Tutup pratinjau dan kembali"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
              <span>Kembali</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">
            Pratinjau Faktur
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
            {meta.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRecordPayment && invoice.status !== 'PAID' && (
            <button
              type="button"
              onClick={() => onRecordPayment(invoice)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Catat Bayar</span>
            </button>
          )}

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Kirim Ringkasan Faktur via WhatsApp"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Salin Rincian Faktur"
          >
            {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedText ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Unduh File PDF (.pdf)"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Unduh PDF</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPdfViewer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            title="Munculkan File PDF dan Cetak"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
              title="Tutup Pratinjau (Esc)"
              aria-label="Tutup Pratinjau"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* A4 Printable Invoice Sheet */}
      <div 
        id="printable-invoice-content"
        className="printable-document mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-slate-800"
      >
        {/* KOP SURAT PERUSAHAAN & HEADER FAKTUR */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b-2 border-slate-900 pb-6">
          {/* Company Info */}
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white font-bold text-sm">
                C
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                {company.name}
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-700">{company.legalName}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {company.address}, {company.city}
            </p>
            <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
              <div>NPWP Perusahaan: <span className="font-mono font-medium">{company.taxNumber || '-'}</span></div>
              <div>Telp: {company.phone} | Email: {company.email}</div>
              <div>Website: {company.website}</div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="text-left sm:text-right flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-700">
                FAKTUR PENJUALAN
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                NOMOR: {invoice.invoiceNumber}
              </div>
            </div>

            <div className="mt-4 text-xs space-y-1">
              <div className="flex sm:justify-end gap-2">
                <span className="text-slate-500">Tanggal Faktur:</span>
                <span className="font-medium font-mono">{formatDateIndo(invoice.issueDate, false)}</span>
              </div>
              <div className="flex sm:justify-end gap-2">
                <span className="text-slate-500">Jatuh Tempo:</span>
                <span className="font-medium font-mono text-rose-600">{formatDateIndo(invoice.dueDate, false)}</span>
              </div>
              <div className="flex sm:justify-end gap-2 items-center">
                <span className="text-slate-500">Status Pembayaran:</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TUJUAN PENAGIHAN (BILL TO) & MULTI-REKENING TRANSFER */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-lg border border-slate-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DITUJUKAN KEPADA (PELANGGAN):
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {invoice.customer?.company || invoice.customer?.name}
            </div>
            <div className="text-xs font-medium text-slate-700 mt-0.5">
              Attn: {invoice.customer?.name}
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              {invoice.customer?.address}<br />
              {invoice.customer?.city}
            </div>
            <div className="mt-1.5 text-[11px] text-slate-600">
              Telp: {invoice.customer?.phone} | Email: {invoice.customer?.email}
            </div>
            {invoice.customer?.taxNumber && (
              <div className="text-[11px] text-slate-600 font-mono">
                NPWP Klien: {invoice.customer.taxNumber}
              </div>
            )}
          </div>

          {/* OPSI MULTI-REKENING TRANSFER BANK */}
          <div className="flex flex-col justify-start text-xs sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              REKENING TUJUAN TRANSFER ({bankAccounts.length} Rekening):
            </div>
            <div className="space-y-2 mt-0.5">
              {bankAccounts.map((b) => (
                <div key={b.id} className="border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                  <div className="font-bold text-slate-900 flex items-center sm:justify-end gap-1.5">
                    <span>{b.bankName}</span>
                    {b.isDefault && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-indigo-700">
                    {b.bankAccount}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    A/N: {b.bankHolder}
                    {b.bankBranch && <span className="text-slate-400"> ({b.bankBranch})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABEL BARIS RINCIAN BARANG / JASA */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100/80 text-slate-700 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Deskripsi Barang / Layanan</th>
                <th className="py-2.5 px-3 text-right w-20">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right w-20">PPN</th>
                <th className="py-2.5 px-3 text-right w-32">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrency(item.price, company.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    {item.taxRate > 0 ? `${item.taxRate}%` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatCurrency(item.subtotal, company.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* KALKULASI & TOTAL BOX */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-200 pt-4">
          {/* Terbilang & Catatan */}
          <div className="sm:max-w-md space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TERBILANG:
              </div>
              <div className="mt-1 text-xs font-semibold italic text-slate-800 leading-relaxed">
                "{angkaTerbilang(invoice.total)}"
              </div>
            </div>

            {invoice.notes && (
              <div className="text-xs">
                <div className="font-semibold text-slate-700">Catatan Khusus:</div>
                <div className="text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed text-[11px]">
                  {invoice.notes}
                </div>
              </div>
            )}

            {invoice.terms && (
              <div className="text-xs">
                <div className="font-semibold text-slate-700">Syarat & Ketentuan:</div>
                <div className="text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed text-[11px]">
                  {invoice.terms}
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Table */}
          <div className="w-full sm:w-72 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatCurrency(invoice.subtotal, company.currency)}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between py-1 text-rose-600">
                <span>Diskon ({invoice.discountType === 'percent' ? `${invoice.discountValue}%` : 'Potongan'}):</span>
                <span className="font-mono tabular-nums font-medium">
                  - {formatCurrency(invoice.discountAmount, company.currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1 text-slate-600">
              <span>PPN (Pajak Pertambahan Nilai):</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatCurrency(invoice.taxTotal, company.currency)}
              </span>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 pb-1 flex justify-between text-sm font-bold text-slate-900">
              <span>TOTAL TAGIHAN:</span>
              <span className="font-mono tabular-nums text-indigo-700">
                {formatCurrency(invoice.total, company.currency)}
              </span>
            </div>

            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between py-1 text-emerald-700">
                  <span>Sudah Dibayar:</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {formatCurrency(invoice.amountPaid, company.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-slate-200 text-xs font-bold text-rose-600">
                  <span>SISA SALDO JATUH TEMPO:</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(invoice.balance, company.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TANDA TANGAN RESMI & STEMPEL */}
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Verifikasi Keaslian Dokumen:</p>
            <p className="text-[11px] leading-relaxed">
              Faktur ini diterbitkan secara sah menggunakan sistem Crater Invoicing Enterprise dan berlaku sebagai bukti penagihan resmi.
            </p>
            <div className="mt-3 inline-block rounded border border-slate-300 p-2 text-center text-[10px] font-mono text-slate-400">
              [ SECURE QR VALIDATION HASH: {invoice.id.substring(0, 12)} ]
            </div>
          </div>

          <div className="text-center text-xs ml-auto w-56">
            <div className="text-slate-600">
              {company.signatureDateNote}, {formatDateIndo(invoice.issueDate, false)}
            </div>
            <div className="font-bold text-slate-900 mt-1">
              {company.name}
            </div>

            {/* Stamp Space */}
            <div className="my-3 flex h-20 items-center justify-center">
              <div className="rounded-full border-2 border-dashed border-indigo-200 px-4 py-2 text-[10px] font-bold text-indigo-400 rotate-[-8deg]">
                {company.stampNote || 'STEMPEL & TANDA TANGAN ELEKTRONIK'}
              </div>
            </div>

            <div className="font-bold text-slate-900 underline">
              {company.signatureName}
            </div>
            <div className="text-[11px] text-slate-500">
              {company.signatureRole}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer (Hidden during printing) */}
      <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Unduh File .PDF</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPdfViewer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Real PDF Preview & Print Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        pdfUrl={pdfUrl}
        filename={`FAKTUR_${invoice.invoiceNumber}.pdf`}
        isGenerating={isGeneratingPdf}
        onClose={() => setIsPdfModalOpen(false)}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
};
