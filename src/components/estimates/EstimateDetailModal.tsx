import React, { useState, useEffect } from 'react';
import { Estimate } from '../../types';
import { useInvoice } from '../../context/InvoiceContext';
import { formatCurrency, formatDateIndo, angkaTerbilang, getEstimateStatusMeta } from '../../utils/formatters';
import { printDocument, downloadA4Document } from '../../utils/printHelper';
import { generatePdfFromElement, downloadPdfBlob } from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { Printer, Download, ArrowLeft, ArrowRightLeft, MessageSquare, Copy, Check, X } from 'lucide-react';

interface EstimateDetailModalProps {
  isOpen?: boolean;
  estimate: Estimate | null;
  onClose: () => void;
  onConvertToInvoice: (estimate: Estimate) => void;
}

export const EstimateDetailModal: React.FC<EstimateDetailModalProps> = ({
  isOpen = true,
  estimate,
  onClose,
  onConvertToInvoice,
}) => {
  const { company, showToast } = useInvoice();
  const [copiedText, setCopiedText] = useState(false);

  // Real PDF Preview & Download States
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen && estimate) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, estimate, onClose]);

  if (!isOpen || !estimate) return null;

  const meta = getEstimateStatusMeta(estimate.status);

  const handleOpenPdfViewer = async () => {
    setIsPdfModalOpen(true);
    setIsGeneratingPdf(true);
    showToast('Memproses PDF...', 'Menyusun dokumen PDF Penawaran A4...', 'info');

    try {
      const result = await generatePdfFromElement(
        'printable-estimate-content',
        `PENAWARAN_${estimate.estimateNumber}.pdf`
      );

      if (result) {
        setPdfUrl(result.url);
        setPdfBlob(result.blob);
        showToast('PDF Siap!', `Dokumen PENAWARAN_${estimate.estimateNumber}.pdf berhasil dimunculkan.`, 'success');
      } else {
        showToast('Info', 'Membuka dialog cetak langsung...', 'info');
        printDocument('printable-estimate-content', `PENAWARAN_${estimate.estimateNumber}`);
      }
    } catch (err) {
      console.error('PDF error:', err);
      printDocument('printable-estimate-content', `PENAWARAN_${estimate.estimateNumber}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfBlob) {
      downloadPdfBlob(pdfBlob, `PENAWARAN_${estimate.estimateNumber}.pdf`);
      showToast('Unduhan Berhasil', `File PENAWARAN_${estimate.estimateNumber}.pdf telah disimpan.`, 'success');
      return;
    }

    showToast('Menyiapkan Unduhan...', 'Menghasilkan file PDF...', 'info');
    const result = await generatePdfFromElement(
      'printable-estimate-content',
      `PENAWARAN_${estimate.estimateNumber}.pdf`
    );
    if (result) {
      setPdfUrl(result.url);
      setPdfBlob(result.blob);
      downloadPdfBlob(result.blob, result.filename);
      showToast('Unduhan Selesai', `File ${result.filename} berhasil diunduh.`, 'success');
    }
  };

  const generateEstimateTextSummary = () => {
    return `*SURAT PENAWARAN HARGA (ESTIMATE) - ${company.name}*
Nomor: ${estimate.estimateNumber}
Kepada: ${estimate.customer?.company || estimate.customer?.name}
Tanggal Penawaran: ${formatDateIndo(estimate.issueDate)}
Masa Berlaku Hingga: ${formatDateIndo(estimate.expiryDate)}

Total Penawaran: *${formatCurrency(estimate.total, company.currency)}*

Proposal ini telah dikirim untuk ditinjau. Jika disetujui, kami dapat langsung menerbitkan faktur uang muka (DP). Terima kasih.`;
  };

  const getWhatsAppUrl = () => {
    const summary = generateEstimateTextSummary();
    const encoded = encodeURIComponent(summary);
    const rawPhone = estimate.customer?.phone?.replace(/[^0-9]/g, '') || '';
    let targetPhone = rawPhone;
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    }
    return targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  const handleCopyText = () => {
    const summary = generateEstimateTextSummary();
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadHtml = () => {
    downloadA4Document('printable-estimate-content', `PENAWARAN_${estimate.estimateNumber}`);
    showToast('File Diunduh', `PENAWARAN_${estimate.estimateNumber}.html siap dibuka offline atau dicetak.`, 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-auto py-4">
        {/* Action Toolbar (Sticky & prominent) */}
        <div className="no-print sticky top-2 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
              title="Tutup pratinjau dan kembali"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
              <span>Kembali</span>
            </button>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              Pratinjau Penawaran
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
              {meta.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {estimate.status !== 'CONVERTED' && (
              <button
                type="button"
                onClick={() => onConvertToInvoice(estimate)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Konversi ke Faktur</span>
                <span className="sm:hidden">Konversi</span>
              </button>
            )}

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Kirim via WhatsApp"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              title="Salin Teks Ringkasan"
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

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
              title="Tutup Pratinjau (Esc)"
              aria-label="Tutup Pratinjau"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div 
          id="printable-estimate-content"
          className="printable-document mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-slate-800"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{company.name}</h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {company.address}, {company.city}
              </p>
              <div className="text-[11px] text-slate-600 mt-1">
                Telp: {company.phone} | Email: {company.email}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-extrabold text-indigo-700">
                SURAT PENAWARAN HARGA
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                NOMOR: {estimate.estimateNumber}
              </div>
              <div className="mt-3 text-xs space-y-0.5">
                <div>Tanggal: <span className="font-mono font-medium">{formatDateIndo(estimate.issueDate, false)}</span></div>
                <div>Berlaku Hingga: <span className="font-mono font-medium text-rose-600">{formatDateIndo(estimate.expiryDate, false)}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div className="text-[10px] font-bold uppercase text-slate-400">DITUJUKAN KEPADA:</div>
            <div className="mt-1 text-sm font-bold text-slate-900">{estimate.customer?.company || estimate.customer?.name}</div>
            <div className="text-slate-600 mt-0.5">Attn: {estimate.customer?.name}</div>
            <div className="text-slate-500 mt-1">{estimate.customer?.address}, {estimate.customer?.city}</div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100/80 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Rincian Barang / Layanan</th>
                  <th className="py-2.5 px-3 text-right w-20">Volume</th>
                  <th className="py-2.5 px-3 text-right w-28">Harga Penawaran</th>
                  <th className="py-2.5 px-3 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {estimate.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{it.name}</div>
                      {it.description && <div className="text-[11px] text-slate-500 mt-0.5">{it.description}</div>}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{it.quantity} {it.unit}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(it.price, company.currency)}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {formatCurrency(it.subtotal, company.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-200 pt-4">
            <div className="max-w-md space-y-2 text-xs">
              <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Terbilang: </span>
                <span className="italic font-medium text-slate-800">"{angkaTerbilang(estimate.total)}"</span>
              </div>
              {estimate.notes && <p className="text-[11px] text-slate-500"><strong>Catatan:</strong> {estimate.notes}</p>}
              {estimate.terms && <p className="text-[11px] text-slate-500"><strong>Syarat:</strong> {estimate.terms}</p>}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(estimate.subtotal, company.currency)}</span>
              </div>
              {estimate.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span className="font-mono">- {formatCurrency(estimate.discountAmount, company.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">PPN:</span>
                <span className="font-mono">{formatCurrency(estimate.taxTotal, company.currency)}</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>TOTAL ESTIMASI:</span>
                <span className="font-mono text-indigo-700">{formatCurrency(estimate.total, company.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer (Hidden during printing) */}
        <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar</span>
            </button>
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
      </div>

      {/* Real PDF Preview & Print Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        pdfUrl={pdfUrl}
        filename={`PENAWARAN_${estimate.estimateNumber}.pdf`}
        isGenerating={isGeneratingPdf}
        onClose={() => setIsPdfModalOpen(false)}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
};
