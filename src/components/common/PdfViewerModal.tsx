import React, { useState } from 'react';
import { Download, Printer, ExternalLink, X, FileCheck, ArrowLeft, Loader2 } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  filename: string;
  isGenerating?: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  pdfUrl,
  filename,
  isGenerating = false,
  onClose,
  onDownload,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print():', err);
      }
    }
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-slate-300" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-2 truncate">
              <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {filename}
              </span>
              <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                Dokumen PDF A4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              disabled={isGenerating || !pdfUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              title="Unduh File PDF ke Komputer"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Unduh File .PDF</span>
              <span className="sm:hidden">Unduh</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isGenerating || !pdfUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              title="Cetak Dokumen PDF"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak PDF</span>
              <span className="sm:hidden">Cetak</span>
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download={filename}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Buka atau Unduh PDF di Tab Baru"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Buka PDF</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Tutup (Esc)"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-300">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              <p className="text-sm font-semibold">Sedang merender dokumen PDF beresolusi tinggi...</p>
              <p className="text-xs text-slate-400">Menyusun tata letak A4 persis seperti pratinjau faktur</p>
            </div>
          )}

          {!isGenerating && pdfUrl && (
            <object
              data={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              type="application/pdf"
              className="w-full h-full border-none bg-slate-900"
            >
              <iframe
                id="pdf-preview-iframe"
                src={`${pdfUrl}#toolbar=1`}
                title={filename}
                className="w-full h-full border-none bg-slate-900"
                onLoad={() => setIframeLoaded(true)}
              >
                <div className="flex flex-col items-center justify-center h-full text-slate-300 p-6 text-center gap-3">
                  <p className="text-sm">Browser Anda tidak mendukung preview PDF langsung.</p>
                  <button
                    type="button"
                    onClick={onDownload}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    Unduh File PDF ({filename})
                  </button>
                </div>
              </iframe>
            </object>
          )}

          {!isGenerating && !pdfUrl && (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
              <FileCheck className="h-12 w-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Dokumen PDF belum berhasil dirender.</p>
              <button
                type="button"
                onClick={onDownload}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
              >
                Coba Unduh Ulang
              </button>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-slate-800 bg-slate-900/95 text-[11px] text-slate-400 shrink-0">
          <div>
            Format: <span className="font-semibold text-slate-200">ISO A4 Portrait (210 x 297 mm)</span> | Sesuai Tampilan Pratinjau
          </div>
          <div className="flex items-center gap-3">
            <span>Gunakan tombol zoom & print di dalam penampil PDF atau tombol cetak di atas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
