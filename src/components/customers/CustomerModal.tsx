import React, { useState, useEffect } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { Customer } from '../../types';
import { X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer, showToast } = useInvoice();
  const isEdit = Boolean(customerToEdit);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setCompany(customerToEdit.company);
      setEmail(customerToEdit.email);
      setPhone(customerToEdit.phone);
      setAddress(customerToEdit.address);
      setCity(customerToEdit.city);
      setTaxNumber(customerToEdit.taxNumber || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('Jakarta, Indonesia');
      setTaxNumber('');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      showToast('Form Belum Lengkap', 'Nama kontak PIC dan Perusahaan harus diisi.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      taxNumber: taxNumber.trim(),
      currency: 'IDR' as const,
      notes: notes.trim(),
    };

    if (isEdit && customerToEdit) {
      updateCustomer(customerToEdit.id, payload);
      showToast('Data Klien Diperbarui', `Data pelanggan ${payload.name} (${payload.company}) berhasil disimpan.`, 'success');
    } else {
      addCustomer(payload);
      showToast('Klien Baru Ditambahkan', `Pelanggan ${payload.name} (${payload.company}) berhasil didaftarkan.`, 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {isEdit ? 'Edit Data Klien' : 'Tambah Klien / Pelanggan Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Kontak (PIC) *</label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Perusahaan / Usaha *</label>
              <input
                type="text"
                placeholder="Contoh: PT Sumber Rezeki"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Tagihan *</label>
              <input
                type="email"
                placeholder="finance@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">No. Telepon / WhatsApp</label>
              <input
                type="text"
                placeholder="+62 812 3456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Alamat Kantor / Penagihan</label>
            <textarea
              rows={2}
              placeholder="Jalan, Gedung, Nomor Unit, Kelurahan, Kecamatan"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kota & Kode Pos</label>
              <input
                type="text"
                placeholder="Jakarta Selatan 12950"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NPWP Pelanggan</label>
              <input
                type="text"
                placeholder="01.234.567.8-012.000"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Catatan Khusus Klien</label>
            <input
              type="text"
              placeholder="Catatan termin pembayaran, kontak darurat, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              {isEdit ? 'Simpan Perubahan' : 'Tambahkan Klien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
