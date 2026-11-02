import React from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { ActiveTab } from '../../types';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck2, 
  Users, 
  Package, 
  CreditCard, 
  Building2, 
  Code2, 
  Database,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSqlModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSqlModal }) => {
  const { activeTab, setActiveTab, invoices, estimates, customers } = useInvoice();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badgeCount?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'invoices',
      label: 'Faktur Penjualan',
      icon: <FileText className="h-4 w-4" />,
      badgeCount: invoices.length,
    },
    {
      id: 'estimates',
      label: 'Penawaran Harga',
      icon: <FileCheck2 className="h-4 w-4" />,
      badgeCount: estimates.length,
    },
    {
      id: 'customers',
      label: 'Klien & Pelanggan',
      icon: <Users className="h-4 w-4" />,
      badgeCount: customers.length,
    },
    {
      id: 'items',
      label: 'Produk & Jasa',
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: 'payments',
      label: 'Pembayaran Kas',
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      id: 'settings',
      label: 'Pengaturan Usaha',
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      id: 'laravel-code',
      label: 'Kode Laravel MVC',
      icon: <Code2 className="h-4 w-4" />,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-5 lg:hidden">
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 font-bold text-white text-xs">
              C
            </div>
            <span className="font-semibold text-white hover:text-indigo-300 transition-colors">Crater Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Menu"
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brand Kicker / Mode */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className="text-xs font-semibold tracking-wider uppercase text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
          >
            Enterprise Invoicing
          </button>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
            v11.0 MVC
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database & XAMPP Helper Box */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5 text-slate-200 text-xs font-semibold">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>Offline / XAMPP Ready</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Siap diimpor ke MySQL & phpMyAdmin dengan skema relasional lengkap.
            </p>
            <button
              type="button"
              onClick={onOpenSqlModal}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-1.5 transition-colors"
            >
              <span>Export Schema & Data</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
