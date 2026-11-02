/**
 * Tipe Data Aplikasi Crater Invoicing Enterprise
 * Standar Perusahaan & Kompatibel dengan Skema Database Relasional SQL / Laravel Eloquent
 */

export type CurrencyCode = 'IDR' | 'USD';

export interface BankAccount {
  id: string;
  bankName: string; // Contoh: 'Bank Central Asia (BCA)', 'Bank Mandiri', 'Bank Rakyat Indonesia (BRI)'
  bankBranch?: string; // Contoh: 'KCU Kuningan Jakarta'
  bankAccount: string; // Contoh: '527-189-9920'
  bankHolder: string; // Contoh: 'PT NUSANTARA SOLUSI PRIMA'
  isDefault?: boolean; // Rekening Utama (ditampilkan prioritas pada faktur)
  notes?: string; // Catatan tambahan (misal: 'Mata uang IDR - Swift Code: CENAIDJA')
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
  taxNumber: string; // NPWP (Nomor Pokok Wajib Pajak)
  bankAccounts: BankAccount[]; // Daftar Rekening Bank Perusahaan (Bisa lebih dari satu)
  // Backward compatibility fields
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  bankHolder: string;
  currency: CurrencyCode;
  defaultTaxRate: number; // e.g. 11 for PPN 11%
  invoicePrefix: string; // e.g. 'INV-2026-'
  estimatePrefix: string; // e.g. 'EST-2026-'
  signatureName: string;
  signatureRole: string;
  signatureDateNote: string;
  stampNote: string;
  logoUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxNumber?: string; // NPWP Pelanggan
  currency: CurrencyCode;
  notes?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit: string; // 'pcs' | 'jam' | 'hari' | 'bulan' | 'paket' | 'set' | 'unit'
  price: number;
  taxRate: number; // default tax e.g. 11
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number; // Persentase pajak per baris
  subtotal: number; // quantity * price
  taxAmount: number; // (subtotal * taxRate) / 100
  total: number; // subtotal + taxAmount
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. 'INV-2026-0001'
  customerId: string;
  customer?: Customer;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balance: number; // total - amountPaid
  status: InvoiceStatus;
  selectedBankAccountId?: string; // Pilihan rekening pembayaran khusus (opsional)
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export type EstimateStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export interface Estimate {
  id: string;
  estimateNumber: string; // e.g. 'EST-2026-0001'
  customerId: string;
  customer?: Customer;
  issueDate: string;
  expiryDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  status: EstimateStatus;
  convertedInvoiceId?: string;
  selectedBankAccountId?: string;
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Tunai / Cash' | 'Midtrans / QRIS' | 'Cek / Bilyet Giro' | 'Kartu Kredit';

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. 'PAY-2026-0001'
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  bankAccountId?: string; // Rekening tujuan transfer
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'invoices' 
  | 'estimates' 
  | 'customers' 
  | 'items' 
  | 'payments' 
  | 'settings' 
  | 'laravel-code';
