import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { formatCurrency, formatDateIndo, getInvoiceStatusMeta } from '../../utils/formatters';
import { Invoice } from '../../types';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  FileCheck2, 
  Plus, 
  ArrowUpRight, 
  Eye, 
  CreditCard,
  Building2,
  Download
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewInvoice: () => void;
  onOpenNewEstimate: () => void;
  onOpenNewCustomer: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
  onOpenSqlModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewInvoice,
  onOpenNewEstimate,
  onOpenNewCustomer,
  onViewInvoice,
  onRecordPaymentForInvoice,
  onOpenSqlModal,
}) => {
  const { invoices, estimates, customers, payments, company, setActiveTab } = useInvoice();

  // Metrics Calculations
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalBalance = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
  const totalOverdue = overdueInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const activeEstimates = estimates.filter(e => e.status === 'SENT' || e.status === 'ACCEPTED');
  const totalEstimates = activeEstimates.reduce((acc, e) => acc + e.total, 0);

  const [recentFilter, setRecentFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');

  const recentInvoices = invoices
    .filter(inv => {
      if (recentFilter === 'UNPAID') return (inv.balance || 0) > 0;
      if (recentFilter === 'PAID') return (inv.balance || 0) === 0;
      return true;
    })
    .slice(0, 5);

  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Ikhtisar Keuangan Perusahaan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas, status penagihan pelanggan, dan terbitkan faktur standar komersil.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewCustomer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>+ Klien</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewEstimate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />
            <span>+ Penawaran</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Faktur Baru</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Pendapatan Diterima */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all group"
          title="Klik untuk membuka riwayat pembayaran"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium group-hover:text-emerald-700 transition-colors">Total Pendapatan (Lunas)</span>
            <div className="rounded-md bg-emerald-50 p-1.5 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalPaid, company.currency)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Dari total</span>
            <span className="font-semibold text-slate-700">{payments.length} transaksi kas</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 ml-auto" />
          </div>
        </div>

        {/* Metric 2: Piutang / Belum Dibayar */}
        <div 
          onClick={() => setActiveTab('invoices')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all group"
          title="Klik untuk melihat faktur belum lunas"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium group-hover:text-blue-700 transition-colors">Piutang Berjalan (Unpaid)</span>
            <div className="rounded-md bg-blue-50 p-1.5 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalBalance, company.currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Menunggu pembayaran</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
          </div>
        </div>

        {/* Metric 3: Jatuh Tempo (Overdue) */}
        <div 
          onClick={() => setActiveTab('invoices')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-rose-300 hover:shadow-xs transition-all group"
          title="Klik untuk meninjau faktur jatuh tempo"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium group-hover:text-rose-700 transition-colors">Jatuh Tempo (Overdue)</span>
            <div className="rounded-md bg-rose-50 p-1.5 text-rose-600 group-hover:bg-rose-100 transition-colors">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-rose-600 tabular-nums">
            {formatCurrency(totalOverdue, company.currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-rose-600">
            <span>{overdueInvoices.length} faktur batas tempo</span>
            <ArrowUpRight className="h-3 w-3 text-rose-400" />
          </div>
        </div>

        {/* Metric 4: Penawaran Aktif */}
        <div 
          onClick={() => setActiveTab('estimates')}
          className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-purple-300 hover:shadow-xs transition-all group"
          title="Klik untuk melihat penawaran aktif"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium group-hover:text-purple-700 transition-colors">Penawaran Aktif (Estimates)</span>
            <div className="rounded-md bg-purple-50 p-1.5 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalEstimates, company.currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{activeEstimates.length} surat penawaran</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Invoices & Quick Cash Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans): Recent Invoices Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Faktur Penjualan Terbaru</h2>
              <p className="text-[11px] text-slate-500">Rangkuman transaksi faktur komersil terakhir</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setRecentFilter('ALL')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    recentFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter('UNPAID')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    recentFilter === 'UNPAID' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Lunas
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter('PAID')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    recentFilter === 'PAID' ? 'bg-white text-emerald-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lunas
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-2 font-medium">Nomor Faktur</th>
                  <th className="py-2.5 px-2 font-medium">Klien / Perusahaan</th>
                  <th className="py-2.5 px-2 font-medium">Jatuh Tempo</th>
                  <th className="py-2.5 px-2 font-medium text-right">Total Tagihan</th>
                  <th className="py-2.5 px-2 font-medium text-center">Status</th>
                  <th className="py-2.5 px-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => {
                  const meta = getInvoiceStatusMeta(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-900">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-medium text-slate-800">
                          {inv.customer?.company || inv.customer?.name || 'Klien'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Attn: {inv.customer?.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 font-mono text-[11px]">
                        {formatDateIndo(inv.dueDate)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {formatCurrency(inv.total, company.currency)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold border rounded ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewInvoice(inv)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Pratinjau & Cetak PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {inv.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => onRecordPaymentForInvoice(inv)}
                              className="p-1 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100"
                              title="Catat Pembayaran"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Payments & XAMPP Card */}
        <div className="space-y-4">
          {/* Recent Payments Ledger */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Penerimaan Kas Terbaru</h2>
                <p className="text-[11px] text-slate-500">Mutasi pembayaran pelanggan</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Lihat
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {recentPayments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Belum ada pembayaran dicatat.</p>
              ) : (
                recentPayments.map((p) => (
                  <div key={p.id} className="flex items-start justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        {p.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{p.invoiceNumber}</span>
                        <span>·</span>
                        <span>{p.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-emerald-600 tabular-nums">
                        + {formatCurrency(p.amount, company.currency)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {formatDateIndo(p.paymentDate)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* XAMPP Database Quick Banner */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 p-4">
            <h3 className="text-xs font-bold text-slate-900">
              Ekspor Database SQL untuk XAMPP
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Semua data faktur dan klien ini dapat diimpor langsung ke phpMyAdmin MySQL laptop Anda secara offline.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSqlModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh db_crater_invoice.sql</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
