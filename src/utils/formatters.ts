/**
 * Utility Formatter untuk Invoice Standar Perusahaan Indonesia
 */
import { CurrencyCode } from '../types';

/**
 * Format angka ke mata uang Rupiah atau USD
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'IDR'): string {
  if (isNaN(amount)) amount = 0;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Standar Format Rupiah Indonesia (Rp 1.500.000)
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Format tanggal standar Indonesia (contoh: 26 Oktober 2026 atau 26 Okt 2026)
 */
export function formatDateIndo(dateString: string, shortMonth: boolean = true): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: shortMonth ? 'short' : 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Fungsi Konversi Angka ke Kata Terbilang Indonesia (standar lampiran faktur komersil)
 * Contoh: 15.250.000 -> "Lima Belas Juta Dua Ratus Lima Puluh Ribu Rupiah"
 */
export function angkaTerbilang(nilai: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function hitung(n: number): string {
    n = Math.floor(Math.abs(n));
    if (n < 12) {
      return bilangan[n];
    } else if (n < 20) {
      return hitung(n - 10) + ' Belas';
    } else if (n < 100) {
      return hitung(Math.floor(n / 10)) + ' Puluh' + (n % 10 !== 0 ? ' ' + hitung(n % 10) : '');
    } else if (n < 200) {
      return 'Seratus' + (n - 100 !== 0 ? ' ' + hitung(n - 100) : '');
    } else if (n < 1000) {
      return hitung(Math.floor(n / 100)) + ' Ratus' + (n % 100 !== 0 ? ' ' + hitung(n % 100) : '');
    } else if (n < 2000) {
      return 'Seribu' + (n - 1000 !== 0 ? ' ' + hitung(n - 1000) : '');
    } else if (n < 1000000) {
      return hitung(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 !== 0 ? ' ' + hitung(n % 1000) : '');
    } else if (n < 1000000000) {
      return hitung(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 !== 0 ? ' ' + hitung(n % 1000000) : '');
    } else if (n < 1000000000000) {
      return hitung(Math.floor(n / 1000000000)) + ' Miliar' + (n % 1000000000 !== 0 ? ' ' + hitung(n % 1000000000) : '');
    } else {
      return hitung(Math.floor(n / 1000000000000)) + ' Triliun' + (n % 1000000000000 !== 0 ? ' ' + hitung(n % 1000000000000) : '');
    }
  }

  if (nilai === 0) return 'Nol Rupiah';
  return hitung(nilai).trim() + ' Rupiah';
}

/**
 * Konfigurasi badge status invoice & penawaran dengan warna semantik yang kontras dan bersih
 */
export function getInvoiceStatusMeta(status: string): { label: string; bgClass: string; textClass: string; borderClass: string } {
  switch (status) {
    case 'PAID':
      return {
        label: 'LUNAS',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200'
      };
    case 'PARTIALLY_PAID':
      return {
        label: 'SEBAGIAN DIBAYAR',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200'
      };
    case 'SENT':
      return {
        label: 'TERKIRIM',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-700',
        borderClass: 'border-indigo-200'
      };
    case 'OVERDUE':
      return {
        label: 'JATUH TEMPO',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200'
      };
    case 'CANCELLED':
      return {
        label: 'DIBATALKAN',
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-600',
        borderClass: 'border-slate-300'
      };
    case 'DRAFT':
    default:
      return {
        label: 'DRAFT',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200'
      };
  }
}

export function getEstimateStatusMeta(status: string): { label: string; bgClass: string; textClass: string; borderClass: string } {
  switch (status) {
    case 'ACCEPTED':
      return {
        label: 'DISETUJUI',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200'
      };
    case 'CONVERTED':
      return {
        label: 'DIKONVERSI KE FAKTUR',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-700',
        borderClass: 'border-purple-200'
      };
    case 'SENT':
      return {
        label: 'TERKIRIM',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200'
      };
    case 'REJECTED':
      return {
        label: 'DITOLAK',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200'
      };
    case 'DRAFT':
    default:
      return {
        label: 'DRAFT',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200'
      };
  }
}
