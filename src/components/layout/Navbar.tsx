import React from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Menu, Plus, Database, FileText } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNewInvoice: () => void;
  onOpenSqlModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNewInvoice,
  onOpenSqlModal,
}) => {
  const { company, activeTab, setActiveTab } = useInvoice();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Penjualan';
      case 'invoices': return 'Faktur Penjualan (Invoices)';
      case 'estimates': return 'Surat Penawaran Harga (Estimates)';
      case 'customers': return 'Data Klien & Pelanggan';
      case 'items': return 'Katalog Produk & Jasa';
      case 'payments': return 'Buku Kas & Pembayaran';
      case 'settings': return 'Profil Perusahaan & Pajak';
      case 'laravel-code': return 'Studio Kode Laravel MVC & XAMPP';
      default: return 'Crater Enterprise';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      {/* Zone 1: Brand / Drawer Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title="Kembali ke Dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap group-hover:text-indigo-600 transition-colors">
              Crater Invoice
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline truncate max-w-[200px]">
              {company.name}
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Context Title & Quick Tabs (Desktop) */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <span className="text-slate-400 font-normal">/</span>
        <span className="text-slate-900 font-semibold">{getPageTitle()}</span>
        <button
          onClick={() => setActiveTab('laravel-code')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'laravel-code' 
              ? 'bg-amber-100 text-amber-900' 
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Panduan Laravel MVC</span>
        </button>
      </div>

      {/* Zone 3: Primary Action & Quick SQL */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenSqlModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
          title="Buka Generator SQL untuk XAMPP"
        >
          <Database className="h-3.5 w-3.5 text-indigo-600" />
          <span>Export SQL XAMPP</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewInvoice}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Faktur Baru</span>
          <span className="xs:hidden">Faktur</span>
        </button>
      </div>
    </header>
  );
};
