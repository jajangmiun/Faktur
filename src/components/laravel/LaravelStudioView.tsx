import React, { useState } from 'react';
import { LARAVEL_PROJECT_FILES, LaravelFileItem } from '../../utils/laravelFiles';
import { useInvoice } from '../../context/InvoiceContext';
import JSZip from 'jszip';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  Sparkles, 
  Terminal,
  Server,
  Layers
} from 'lucide-react';

export const LaravelStudioView: React.FC = () => {
  const { showToast, getSqlDumpString } = useInvoice();
  const [selectedFile, setSelectedFile] = useState<LaravelFileItem>(LARAVEL_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    showToast('Kode Disalin', `File ${selectedFile.name} berhasil disalin ke clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File Diunduh', `File ${selectedFile.name} berhasil disimpan.`);
  };

  const handleDownloadFullZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files
      LARAVEL_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.code);
      });

      // Add database.sql
      const sqlDump = getSqlDumpString();
      zip.file('database/database.sql', sqlDump);

      // Add sample .env.example
      const envExample = `APP_NAME="Crater Invoice Enterprise"
APP_ENV=local
APP_KEY=base64:cGFzc3dvcmRmb3JsYXJhdmVsaW52b2ljZWFwcA==
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_crater_invoice
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
`;
      zip.file('.env.example', envExample);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'laravel_crater_invoice_mvc_project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Paket ZIP Siap!', 'Seluruh kode Laravel MVC dan database.sql berhasil diunduh.');
    } catch (e) {
      console.error(e);
      showToast('Gagal Membuat ZIP', 'Terjadi kesalahan saat memproses file ZIP.', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'controllers': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'models': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'views': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'routes': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'migrations': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Studio Kode Sumber Laravel 11 MVC & Panduan XAMPP
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 rounded border border-amber-200">
              UNTUK PEMULA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Arsitektur bersih Model-View-Controller (MVC) dengan Bootstrap responsif, ekspor PDF DomPDF, dan database MySQL siap pakai.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadFullZip}
          disabled={isZipping}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>{isZipping ? 'Mengompres ZIP...' : 'Unduh Proyek Laravel (.ZIP)'}</span>
        </button>
      </div>

      {/* Concept Architecture Infobox */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Layers className="h-4 w-4 text-emerald-600" />
            <span>M (Model - Eloquent ORM)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Menghubungkan tabel database (<code className="font-mono text-emerald-700">invoices</code>, <code className="font-mono text-emerald-700">customers</code>) dengan relasi <code className="font-mono">hasMany</code> & <code className="font-mono">belongsTo</code>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Server className="h-4 w-4 text-blue-600" />
            <span>C (Controller - Logika & PDF)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mengolah input form, validasi, kalkulasi diskon/PPN, dan render cetak PDF via <code className="font-mono text-blue-700">Barryvdh\DomPDF</code>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Terminal className="h-4 w-4 text-amber-600" />
            <span>V (View - Blade & Bootstrap)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tampilan antarmuka HTML menggunakan framework Bootstrap 5 yang responsif untuk berbagai ukuran gadget (HP/Tablet/PC).
          </p>
        </div>
      </div>

      {/* Main File Browser & Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Left Column (4 cols): File Tree Directory */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <FolderTree className="h-4 w-4 text-indigo-600" />
              <span>Struktur Direktori Laravel</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {LARAVEL_PROJECT_FILES.length} Files
            </span>
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {LARAVEL_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.id === file.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left rounded-lg p-2.5 transition-colors flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'hover:bg-slate-200/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <FileCode className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono truncate">
                        {file.name}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {file.path}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      isSelected
                        ? 'bg-indigo-700 text-white border-indigo-500'
                        : getCategoryBadge(file.category)
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Code Inspector */}
        <div className="lg:col-span-8 flex flex-col p-4 sm:p-5">
          {/* File Header Details */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-slate-900">
                  {selectedFile.path}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getCategoryBadge(selectedFile.category)}`}>
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSingleFile}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Unduh File Ini Saja"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh File</span>
              </button>
            </div>
          </div>

          {/* Syntax Code Box */}
          <div className="relative mt-4 flex-1 rounded-xl bg-slate-900 p-4 text-slate-200 overflow-x-auto max-h-[580px] font-mono text-xs leading-relaxed selection:bg-indigo-500 selection:text-white">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
