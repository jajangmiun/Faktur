import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { CompanyProfile, BankAccount } from '../../types';
import { 
  Save, 
  RotateCcw, 
  Database, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Check, 
  X,
  Landmark,
  FileCheck
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface SettingsViewProps {
  onOpenSqlModal: () => void;
}

const INDONESIAN_BANK_PRESETS = [
  'Bank Central Asia (BCA)',
  'Bank Mandiri',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Negara Indonesia (BNI)',
  'Bank Syariah Indonesia (BSI)',
  'Bank CIMB Niaga',
  'Bank Permata',
  'Bank Tabungan Negara (BTN)',
  'Bank Danamon',
  'Bank Mega',
  'Bank OCBC NISP',
  'Bank Panin',
  'Lainnya (Ketik Manual)',
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenSqlModal }) => {
  const { 
    company, 
    updateCompanyProfile, 
    resetToSampleData, 
    addBankAccount, 
    updateBankAccount, 
    deleteBankAccount, 
    setDefaultBankAccount,
    showToast
  } = useInvoice();

  const [form, setForm] = useState<CompanyProfile>(company);

  // Sync state if company changes
  useEffect(() => {
    setForm(company);
  }, [company]);

  // Bank Modal / Form State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankPreset, setBankPreset] = useState(INDONESIAN_BANK_PRESETS[0]);
  const [customBankName, setCustomBankName] = useState('');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [isDefaultBank, setIsDefaultBank] = useState(false);

  // Confirm Modal States
  const [bankToDelete, setBankToDelete] = useState<BankAccount | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleOpenAddBank = () => {
    setEditingBankId(null);
    setBankPreset(INDONESIAN_BANK_PRESETS[0]);
    setCustomBankName('');
    setBankAccountNum('');
    setBankHolder(company.legalName || company.name);
    setBankBranch('');
    setBankNotes('');
    setIsDefaultBank(company.bankAccounts?.length === 0);
    setIsBankModalOpen(true);
  };

  const handleOpenEditBank = (b: BankAccount) => {
    setEditingBankId(b.id);
    if (INDONESIAN_BANK_PRESETS.includes(b.bankName)) {
      setBankPreset(b.bankName);
      setCustomBankName('');
    } else {
      setBankPreset('Lainnya (Ketik Manual)');
      setCustomBankName(b.bankName);
    }
    setBankAccountNum(b.bankAccount);
    setBankHolder(b.bankHolder);
    setBankBranch(b.bankBranch || '');
    setBankNotes(b.notes || '');
    setIsDefaultBank(Boolean(b.isDefault));
    setIsBankModalOpen(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankName = bankPreset === 'Lainnya (Ketik Manual)'
      ? (customBankName.trim() || 'Bank Lainnya')
      : bankPreset;

    if (!bankAccountNum.trim() || !bankHolder.trim()) {
      showToast('Form Belum Lengkap', 'Nomor rekening dan Nama pemilik rekening wajib diisi.', 'error');
      return;
    }

    if (editingBankId) {
      updateBankAccount(editingBankId, {
        bankName: finalBankName,
        bankAccount: bankAccountNum.trim(),
        bankHolder: bankHolder.trim(),
        bankBranch: bankBranch.trim(),
        notes: bankNotes.trim(),
        isDefault: isDefaultBank,
      });
      showToast('Rekening Diperbarui', `Rekening ${finalBankName} (${bankAccountNum.trim()}) berhasil disimpan.`, 'success');
    } else {
      addBankAccount({
        bankName: finalBankName,
        bankAccount: bankAccountNum.trim(),
        bankHolder: bankHolder.trim(),
        bankBranch: bankBranch.trim(),
        notes: bankNotes.trim(),
        isDefault: isDefaultBank,
      });
      showToast('Rekening Ditambahkan', `Rekening ${finalBankName} (${bankAccountNum.trim()}) berhasil ditambahkan.`, 'success');
    }

    setIsBankModalOpen(false);
  };

  const handleDeleteBank = (b: BankAccount) => {
    setBankToDelete(b);
  };

  const handleConfirmDeleteBank = () => {
    if (!bankToDelete) return;
    deleteBankAccount(bankToDelete.id);
    showToast('Rekening Dihapus', `Rekening ${bankToDelete.bankName} telah dihapus.`, 'info');
    setBankToDelete(null);
  };

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(form);
    showToast('Pengaturan Disimpan', 'Profil perusahaan dan informasi pajak berhasil diperbarui.', 'success');
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    resetToSampleData();
    setIsResetConfirmOpen(false);
  };

  const bankAccounts = company.bankAccounts || [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Pengaturan Usaha & Profil Perusahaan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informasi kop surat, daftar multi-rekening bank, tarif pajak, dan identitas penandatangan faktur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSqlModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span>Ekspor SQL</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Legal Perusahaan */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span>Identitas Perusahaan & NPWP</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Brand / Usaha *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Badan Hukum Resmi (PT / CV) *</label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NPWP Perusahaan</label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Tagihan Resmi</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Telepon / WhatsApp</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Alamat Kantor Lengkap</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kota & Kode Pos</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION MULTI-REKENING BANK (DIPERBAIKI DAPAT DITAMBAHKAN BEBERAPA) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-sm font-bold text-slate-900">
                  Daftar Rekening Bank Perusahaan ({bankAccounts.length})
                </span>
                <span className="block text-[11px] text-slate-500">
                  Tambahkan beberapa rekening bank untuk memberikan opsi transfer pembayaran kepada pelanggan.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddBank}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Rekening Bank</span>
            </button>
          </div>

          {/* List of Bank Accounts */}
          <div className="space-y-3">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Belum ada rekening bank yang terdaftar. Klik "Tambah Rekening Bank" di atas.
              </div>
            ) : (
              bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    b.isDefault 
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2.5 shrink-0 ${b.isDefault ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{b.bankName}</span>
                        {b.isDefault ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                            <span>Rekening Utama</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDefaultBankAccount(b.id)}
                            className="text-[10px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline"
                          >
                            Set Sebagai Utama
                          </button>
                        )}
                      </div>

                      <div className="mt-1 font-mono text-sm font-bold text-indigo-700 tracking-wide">
                        {b.bankAccount}
                      </div>

                      <div className="text-xs text-slate-600 mt-0.5">
                        A/N: <span className="font-semibold">{b.bankHolder}</span>
                        {b.bankBranch && <span> · Cabang: {b.bankBranch}</span>}
                      </div>

                      {b.notes && (
                        <div className="text-[11px] text-slate-500 mt-1 italic">
                          {b.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {!b.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultBankAccount(b.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        title="Jadikan Rekening Utama"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Pilih Utama</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditBank(b)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit Rekening"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBank(b)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Standarisasi Penomoran & Tanda Tangan */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Format Penomoran, Pajak & Tanda Tangan Resmi</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Awalan Nomor Faktur</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Awalan Nomor Penawaran</label>
              <input
                type="text"
                value={form.estimatePrefix}
                onChange={(e) => handleChange('estimatePrefix', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tarif Pajak PPN Default (%)</label>
              <input
                type="number"
                value={form.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Penandatangan Resmi</label>
              <input
                type="text"
                value={form.signatureName}
                onChange={(e) => handleChange('signatureName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Jabatan Penandatangan</label>
              <input
                type="text"
                value={form.signatureRole}
                onChange={(e) => handleChange('signatureRole', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kota Lokasi Tanda Tangan</label>
              <input
                type="text"
                value={form.signatureDateNote}
                onChange={(e) => handleChange('signatureDateNote', e.target.value)}
                placeholder="Contoh: Jakarta, Indonesia"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Teks Cap Stempel Digital</label>
              <input
                type="text"
                value={form.stampNote}
                onChange={(e) => handleChange('stampNote', e.target.value)}
                placeholder="DOKUMEN RESMI DISAHKAN SECARA ELEKTRONIK"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Data ke Contoh Standar</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Pengaturan Usaha</span>
          </button>
        </div>
      </form>

      {/* MODAL TAMBAH / EDIT REKENING BANK */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingBankId ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Pilih Bank Pembayaran *</label>
                <select
                  value={bankPreset}
                  onChange={(e) => setBankPreset(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {INDONESIAN_BANK_PRESETS.map((bp) => (
                    <option key={bp} value={bp}>{bp}</option>
                  ))}
                </select>
              </div>

              {bankPreset === 'Lainnya (Ketik Manual)' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Bank Manual *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bank BJB / Bank Jateng"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: 527-189-9920"
                  value={bankAccountNum}
                  onChange={(e) => setBankAccountNum(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Atas Nama Rekening (Pemilik) *</label>
                <input
                  type="text"
                  placeholder="Contoh: PT NUSANTARA SOLUSI PRIMA"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kantor Cabang (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: KCU Kuningan Jakarta"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Khusus (Swift Code / Kliring)</label>
                <input
                  type="text"
                  placeholder="Contoh: Swift Code: CENAIDJA (Mata uang IDR)"
                  value={bankNotes}
                  onChange={(e) => setBankNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isDefaultBank}
                    onChange={(e) => setIsDefaultBank(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Jadikan Rekening Utama untuk Faktur Penjualan</span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6 mt-0.5">
                  Rekening utama akan ditampilkan paling atas pada instruksi pembayaran faktur.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  {editingBankId ? 'Simpan Perubahan' : 'Tambahkan Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bank Deletion */}
      <ConfirmModal
        isOpen={!!bankToDelete}
        title="Hapus Rekening Bank"
        message={`Apakah Anda yakin ingin menghapus rekening ${bankToDelete?.bankName} (${bankToDelete?.bankAccount})?`}
        confirmText="Hapus Rekening"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteBank}
        onClose={() => setBankToDelete(null)}
      />

      {/* Confirmation Modal for Resetting to Sample Data */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Seluruh Data ke Contoh Awal"
        message="Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh perusahaan standar? Tindakan ini akan mengembalikan semua faktur, klien, produk, dan rekening bank ke kondisi awal."
        confirmText="Reset Semua Data"
        cancelText="Batal"
        confirmVariant="warning"
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
