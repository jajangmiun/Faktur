import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Download, Copy, Check, X, Database, Terminal, CheckCircle2 } from 'lucide-react';

interface SqlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlExportModal: React.FC<SqlExportModalProps> = ({ isOpen, onClose }) => {
  const { downloadSqlDump, getSqlDumpString, showToast } = useInvoice();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlContent = getSqlDumpString();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    showToast('Query SQL Disalin', 'Seluruh query pembuatan database dan data awal telah disalin.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ekspor Database SQL untuk XAMPP / MySQL
              </h2>
              <p className="text-xs text-slate-500">
                Skema tabel relasional lengkap dan seeder data awal yang siap diimpor ke phpMyAdmin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions Box */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span>Cara Menggunakan di XAMPP (Offline):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Nyalakan <strong>Apache</strong> dan <strong>MySQL</strong> di control panel XAMPP Anda.</li>
              <li>Buka browser ke alamat <code>http://localhost/phpmyadmin</code></li>
              <li>Klik menu <strong>Import</strong> di bagian atas.</li>
              <li>Klik tombol <strong>Choose File</strong> dan pilih file <code>db_crater_invoice.sql</code> yang Anda unduh di bawah.</li>
              <li>Klik tombol <strong>Go / Kirim</strong> di bagian bawah halaman. Database <code>db_crater_invoice</code> beserta semua tabelnya langsung siap digunakan!</li>
            </ol>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Ukuran: ~{(sqlContent.length / 1024).toFixed(1)} KB (ANSI / MySQL 5.7+ / MariaDB)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>

              <button
                type="button"
                onClick={downloadSqlDump}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh File .sql</span>
              </button>
            </div>
          </div>

          {/* Code Preview */}
          <div className="relative rounded-xl bg-slate-900 p-4 text-slate-200 overflow-x-auto max-h-72 font-mono text-[11px] leading-relaxed selection:bg-indigo-500 selection:text-white">
            <pre><code>{sqlContent.substring(0, 3000)}...</code></pre>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
