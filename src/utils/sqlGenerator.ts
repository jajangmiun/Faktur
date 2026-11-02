/**
 * Generator File Database SQL untuk XAMPP (MySQL / MariaDB / phpMyAdmin)
 * Didesain dengan komentar instruksi detail bahasa Indonesia agar pemula mudah memahami.
 */
import { CompanyProfile, Customer, Item, Invoice, Estimate, Payment } from '../types';

export function generateFullSqlDump(
  company: CompanyProfile,
  customers: Customer[],
  items: Item[],
  invoices: Invoice[],
  estimates: Estimate[],
  payments: Payment[]
): string {
  const escapeSql = (str: string | undefined | null) => {
    if (!str) return "''";
    return "'" + str.replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "'";
  };

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  return `-- ==============================================================================
-- DATABASE SCHEMA & DUMP: CRATER INVOICE ENTERPRISE
-- Kompatibel: XAMPP, phpMyAdmin, MySQL 5.7+, MySQL 8.0+, MariaDB 10.4+
-- Tanggal Pembuatan: ${timestamp}
-- Framework Pasangan: Laravel 10 / 11 (Metode MVC)
-- ==============================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS \`db_crater_invoice\` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`db_crater_invoice\`;

-- Matikan foreign key check sementara agar proses pembuatan tabel berjalan mulus
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- Tabel: company_settings
-- Keterangan: Menyimpan profil dan konfigurasi perusahaan penerbit faktur
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`company_settings\`;
CREATE TABLE \`company_settings\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL COMMENT 'Nama brand / perusahaan',
  \`legal_name\` VARCHAR(255) NOT NULL COMMENT 'Nama badan hukum resmi (PT/CV)',
  \`tagline\` VARCHAR(255) NULL COMMENT 'Slogan perusahaan',
  \`email\` VARCHAR(100) NOT NULL COMMENT 'Email penagihan resmi',
  \`phone\` VARCHAR(50) NOT NULL COMMENT 'Nomor telepon kantor / WhatsApp',
  \`website\` VARCHAR(100) NULL COMMENT 'Alamat website perusahaan',
  \`address\` TEXT NOT NULL COMMENT 'Alamat kantor lengkap',
  \`city\` VARCHAR(100) NOT NULL COMMENT 'Kota dan kode pos',
  \`tax_number\` VARCHAR(50) NULL COMMENT 'Nomor Pokok Wajib Pajak (NPWP)',
  \`bank_name\` VARCHAR(100) NOT NULL COMMENT 'Nama bank pembayaran',
  \`bank_branch\` VARCHAR(100) NULL COMMENT 'Kantor cabang bank',
  \`bank_account\` VARCHAR(100) NOT NULL COMMENT 'Nomor rekening bank',
  \`bank_holder\` VARCHAR(150) NOT NULL COMMENT 'Nama pemilik rekening',
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'IDR' COMMENT 'Mata uang default (IDR / USD)',
  \`default_tax_rate\` DECIMAL(5,2) NOT NULL DEFAULT 11.00 COMMENT 'Tarif PPN default dalam persen (misal 11%)',
  \`invoice_prefix\` VARCHAR(20) NOT NULL DEFAULT 'INV-2026-' COMMENT 'Awalan nomor faktur otomatis',
  \`estimate_prefix\` VARCHAR(20) NOT NULL DEFAULT 'EST-2026-' COMMENT 'Awalan nomor surat penawaran',
  \`signature_name\` VARCHAR(150) NULL COMMENT 'Nama penandatangan dokumen',
  \`signature_role\` VARCHAR(100) NULL COMMENT 'Jabatan penandatangan',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil & Konfigurasi Perusahaan';

-- ------------------------------------------------------------------------------
-- Tabel: bank_accounts
-- Keterangan: Rekening bank penerimaan pembayaran perusahaan (multi-rekening)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`bank_accounts\`;
CREATE TABLE \`bank_accounts\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Unik Rekening (bank-1, dll)',
  \`bank_name\` VARCHAR(100) NOT NULL COMMENT 'Nama Bank (BCA, Mandiri, BRI, dll)',
  \`bank_branch\` VARCHAR(100) NULL COMMENT 'Kantor Cabang Bank',
  \`bank_account\` VARCHAR(100) NOT NULL COMMENT 'Nomor Rekening',
  \`bank_holder\` VARCHAR(150) NOT NULL COMMENT 'Nama Pemilik Rekening Sesuai Buku Tabungan',
  \`is_default\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 jika merupakan rekening utama',
  \`notes\` VARCHAR(255) NULL COMMENT 'Keterangan tambahan rekening',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daftar Rekening Bank Perusahaan';

-- ------------------------------------------------------------------------------
-- Tabel: customers
-- Keterangan: Master data klien dan pelanggan
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`customers\`;
CREATE TABLE \`customers\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Unik Klien (UUID / string)',
  \`name\` VARCHAR(150) NOT NULL COMMENT 'Nama kontak person (PIC)',
  \`company\` VARCHAR(200) NOT NULL COMMENT 'Nama perusahaan klien',
  \`email\` VARCHAR(100) NOT NULL COMMENT 'Alamat email klien',
  \`phone\` VARCHAR(50) NOT NULL COMMENT 'Nomor telepon klien',
  \`address\` TEXT NOT NULL COMMENT 'Alamat pengiriman / penagihan',
  \`city\` VARCHAR(100) NOT NULL COMMENT 'Kota dan provinsi klien',
  \`tax_number\` VARCHAR(50) NULL COMMENT 'NPWP Klien',
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'IDR' COMMENT 'Mata uang transaksi klien',
  \`notes\` TEXT NULL COMMENT 'Catatan khusus termin klien',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Data Klien/Pelanggan';

-- ------------------------------------------------------------------------------
-- Tabel: items
-- Keterangan: Master data produk dan layanan/jasa
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`items\`;
CREATE TABLE \`items\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Unik Produk/Jasa',
  \`name\` VARCHAR(255) NOT NULL COMMENT 'Nama produk atau layanan',
  \`sku\` VARCHAR(50) NOT NULL COMMENT 'Kode SKU / Part Number unik',
  \`description\` TEXT NULL COMMENT 'Spesifikasi atau deskripsi item',
  \`unit\` VARCHAR(30) NOT NULL DEFAULT 'pcs' COMMENT 'Satuan (pcs, jam, hari, bulan, paket)',
  \`price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Harga satuan standar (sebelum pajak)',
  \`tax_rate\` DECIMAL(5,2) NOT NULL DEFAULT 11.00 COMMENT 'Tarif pajak default (%)',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`items_sku_unique\` (\`sku\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Katalog Produk dan Layanan';

-- ------------------------------------------------------------------------------
-- Tabel: invoices
-- Keterangan: Header transaksi faktur tagihan penjualan
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`invoices\`;
CREATE TABLE \`invoices\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Unik Faktur',
  \`invoice_number\` VARCHAR(50) NOT NULL COMMENT 'Nomor Faktur Komersil (unik)',
  \`customer_id\` VARCHAR(50) NOT NULL COMMENT 'Relasi ke tabel customers.id',
  \`issue_date\` DATE NOT NULL COMMENT 'Tanggal penerbitan faktur',
  \`due_date\` DATE NOT NULL COMMENT 'Tanggal batas akhir pembayaran (jatuh tempo)',
  \`subtotal\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total harga kotor sebelum diskon & pajak',
  \`discount_type\` ENUM('percent', 'fixed') NOT NULL DEFAULT 'fixed' COMMENT 'Jenis potongan (persen atau nominal)',
  \`discount_value\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Nilai input diskon',
  \`discount_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total rupiah potongan diskon',
  \`tax_total\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total nilai PPN',
  \`total\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total tagihan bersih (subtotal - diskon + pajak)',
  \`amount_paid\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total uang yang telah diterima',
  \`balance\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Sisa tagihan yang belum dibayar',
  \`status\` ENUM('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT 'Status faktur',
  \`notes\` TEXT NULL COMMENT 'Catatan penagihan untuk klien',
  \`terms\` TEXT NULL COMMENT 'Syarat dan ketentuan pembayaran',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`invoices_invoice_number_unique\` (\`invoice_number\`),
  KEY \`invoices_customer_id_foreign\` (\`customer_id\`),
  CONSTRAINT \`fk_invoices_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header Faktur Penjualan';

-- ------------------------------------------------------------------------------
-- Tabel: invoice_items
-- Keterangan: Rincian item barang / jasa di dalam faktur
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`invoice_items\`;
CREATE TABLE \`invoice_items\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Unik Baris Faktur',
  \`invoice_id\` VARCHAR(50) NOT NULL COMMENT 'Relasi ke tabel invoices.id',
  \`item_id\` VARCHAR(50) NULL COMMENT 'Relasi ke master items (opsional)',
  \`name\` VARCHAR(255) NOT NULL COMMENT 'Nama item pada saat faktur dibuat',
  \`description\` TEXT NULL COMMENT 'Deskripsi detail pekerjaan/barang',
  \`quantity\` DECIMAL(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Kuantitas / volume',
  \`unit\` VARCHAR(30) NOT NULL DEFAULT 'pcs' COMMENT 'Satuan (jam, paket, unit, dll)',
  \`price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Harga satuan',
  \`tax_rate\` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Persentase pajak per item',
  \`subtotal\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Kuantitas * Harga',
  \`tax_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Pajak rupiah per item',
  \`total\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total baris (subtotal + tax)',
  KEY \`invoice_items_invoice_id_foreign\` (\`invoice_id\`),
  CONSTRAINT \`fk_invoice_items_invoice\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rincian Baris Faktur';

-- ------------------------------------------------------------------------------
-- Tabel: estimates (Surat Penawaran Harga / Quotations)
-- Keterangan: Dokumen penawaran harga yang dapat dikonversi ke faktur
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`estimates\`;
CREATE TABLE \`estimates\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`estimate_number\` VARCHAR(50) NOT NULL COMMENT 'Nomor Surat Penawaran',
  \`customer_id\` VARCHAR(50) NOT NULL COMMENT 'Relasi ke customer',
  \`issue_date\` DATE NOT NULL COMMENT 'Tanggal penawaran diterbitkan',
  \`expiry_date\` DATE NOT NULL COMMENT 'Batas waktu berlaku harga penawaran',
  \`subtotal\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`discount_type\` ENUM('percent', 'fixed') NOT NULL DEFAULT 'fixed',
  \`discount_value\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`discount_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`tax_total\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`total\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED') NOT NULL DEFAULT 'DRAFT',
  \`converted_invoice_id\` VARCHAR(50) NULL COMMENT 'ID Faktur hasil konversi',
  \`notes\` TEXT NULL,
  \`terms\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`estimates_estimate_number_unique\` (\`estimate_number\`),
  KEY \`estimates_customer_id_foreign\` (\`customer_id\`),
  CONSTRAINT \`fk_estimates_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header Surat Penawaran Harga';

-- ------------------------------------------------------------------------------
-- Tabel: payments
-- Keterangan: Buku besar penerimaan kas/bank pelunasan faktur
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`payments\`;
CREATE TABLE \`payments\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID Pembayaran',
  \`payment_number\` VARCHAR(50) NOT NULL COMMENT 'Nomor Bukti Kas Masuk / Kuitansi',
  \`invoice_id\` VARCHAR(50) NOT NULL COMMENT 'Relasi ke faktur yang dilunasi',
  \`invoice_number\` VARCHAR(50) NOT NULL,
  \`customer_id\` VARCHAR(50) NOT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Jumlah uang yang dibayarkan',
  \`payment_date\` DATE NOT NULL COMMENT 'Tanggal transfer / setoran diterima',
  \`payment_method\` VARCHAR(50) NOT NULL COMMENT 'Metode bayar (Bank Transfer, Tunai, Cek, dll)',
  \`receipt_number\` VARCHAR(100) NULL COMMENT 'Referensi nomor mutasi bank / slip setoran',
  \`notes\` TEXT NULL COMMENT 'Catatan tambahan akunting',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY \`payments_invoice_id_foreign\` (\`invoice_id\`),
  CONSTRAINT \`fk_payments_invoice\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Buku Penerimaan Pembayaran';

-- Hidupkan kembali foreign key check setelah seluruh struktur tabel siap
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 2. DUMP DATA AWAL (SEEDER SQL)
-- ==============================================================================

-- Masukkan Profil Perusahaan
INSERT INTO \`company_settings\` (
  \`id\`, \`name\`, \`legal_name\`, \`tagline\`, \`email\`, \`phone\`, \`website\`, 
  \`address\`, \`city\`, \`tax_number\`, \`bank_name\`, \`bank_branch\`, \`bank_account\`, 
  \`bank_holder\`, \`currency\`, \`default_tax_rate\`, \`invoice_prefix\`, \`estimate_prefix\`, 
  \`signature_name\`, \`signature_role\`
) VALUES (
  1,
  ${escapeSql(company.name)},
  ${escapeSql(company.legalName)},
  ${escapeSql(company.tagline)},
  ${escapeSql(company.email)},
  ${escapeSql(company.phone)},
  ${escapeSql(company.website)},
  ${escapeSql(company.address)},
  ${escapeSql(company.city)},
  ${escapeSql(company.taxNumber)},
  ${escapeSql(company.bankName)},
  ${escapeSql(company.bankBranch)},
  ${escapeSql(company.bankAccount)},
  ${escapeSql(company.bankHolder)},
  ${escapeSql(company.currency)},
  ${company.defaultTaxRate},
  ${escapeSql(company.invoicePrefix)},
  ${escapeSql(company.estimatePrefix)},
  ${escapeSql(company.signatureName)},
  ${escapeSql(company.signatureRole)}
);

-- Masukkan Daftar Rekening Bank Perusahaan
${(company.bankAccounts || []).map(b => `INSERT INTO \`bank_accounts\` (\`id\`, \`bank_name\`, \`bank_branch\`, \`bank_account\`, \`bank_holder\`, \`is_default\`, \`notes\`) VALUES (
  ${escapeSql(b.id)},
  ${escapeSql(b.bankName)},
  ${escapeSql(b.bankBranch)},
  ${escapeSql(b.bankAccount)},
  ${escapeSql(b.bankHolder)},
  ${b.isDefault ? 1 : 0},
  ${escapeSql(b.notes)}
);`).join('\n')}

-- Masukkan Data Master Klien
${customers.map(c => `INSERT INTO \`customers\` (\`id\`, \`name\`, \`company\`, \`email\`, \`phone\`, \`address\`, \`city\`, \`tax_number\`, \`currency\`, \`notes\`) VALUES (
  ${escapeSql(c.id)},
  ${escapeSql(c.name)},
  ${escapeSql(c.company)},
  ${escapeSql(c.email)},
  ${escapeSql(c.phone)},
  ${escapeSql(c.address)},
  ${escapeSql(c.city)},
  ${escapeSql(c.taxNumber)},
  ${escapeSql(c.currency)},
  ${escapeSql(c.notes)}
);`).join('\n')}

-- Masukkan Data Master Produk / Jasa
${items.map(i => `INSERT INTO \`items\` (\`id\`, \`name\`, \`sku\`, \`description\`, \`unit\`, \`price\`, \`tax_rate\`) VALUES (
  ${escapeSql(i.id)},
  ${escapeSql(i.name)},
  ${escapeSql(i.sku)},
  ${escapeSql(i.description)},
  ${escapeSql(i.unit)},
  ${i.price},
  ${i.taxRate}
);`).join('\n')}

-- Masukkan Data Faktur dan Baris Rincian
${invoices.map(inv => {
  const invInsert = `INSERT INTO \`invoices\` (
  \`id\`, \`invoice_number\`, \`customer_id\`, \`issue_date\`, \`due_date\`, 
  \`subtotal\`, \`discount_type\`, \`discount_value\`, \`discount_amount\`, 
  \`tax_total\`, \`total\`, \`amount_paid\`, \`balance\`, \`status\`, \`notes\`, \`terms\`
) VALUES (
  ${escapeSql(inv.id)},
  ${escapeSql(inv.invoiceNumber)},
  ${escapeSql(inv.customerId)},
  ${escapeSql(inv.issueDate)},
  ${escapeSql(inv.dueDate)},
  ${inv.subtotal},
  ${escapeSql(inv.discountType)},
  ${inv.discountValue},
  ${inv.discountAmount},
  ${inv.taxTotal},
  ${inv.total},
  ${inv.amountPaid},
  ${inv.balance},
  ${escapeSql(inv.status)},
  ${escapeSql(inv.notes)},
  ${escapeSql(inv.terms)}
);`;

  const itemInserts = inv.items.map(item => `INSERT INTO \`invoice_items\` (
  \`id\`, \`invoice_id\`, \`item_id\`, \`name\`, \`description\`, 
  \`quantity\`, \`unit\`, \`price\`, \`tax_rate\`, \`subtotal\`, \`tax_amount\`, \`total\`
) VALUES (
  ${escapeSql(item.id)},
  ${escapeSql(inv.id)},
  ${escapeSql(item.itemId)},
  ${escapeSql(item.name)},
  ${escapeSql(item.description)},
  ${item.quantity},
  ${escapeSql(item.unit)},
  ${item.price},
  ${item.taxRate},
  ${item.subtotal},
  ${item.taxAmount},
  ${item.total}
);`).join('\n');

  return invInsert + '\n' + itemInserts;
}).join('\n\n')}

-- Masukkan Data Surat Penawaran (Estimates)
${estimates.map(est => `INSERT INTO \`estimates\` (
  \`id\`, \`estimate_number\`, \`customer_id\`, \`issue_date\`, \`expiry_date\`, 
  \`subtotal\`, \`discount_type\`, \`discount_value\`, \`discount_amount\`, 
  \`tax_total\`, \`total\`, \`status\`, \`converted_invoice_id\`, \`notes\`, \`terms\`
) VALUES (
  ${escapeSql(est.id)},
  ${escapeSql(est.estimateNumber)},
  ${escapeSql(est.customerId)},
  ${escapeSql(est.issueDate)},
  ${escapeSql(est.expiryDate)},
  ${est.subtotal},
  ${escapeSql(est.discountType)},
  ${est.discountValue},
  ${est.discountAmount},
  ${est.taxTotal},
  ${est.total},
  ${escapeSql(est.status)},
  ${escapeSql(est.convertedInvoiceId)},
  ${escapeSql(est.notes)},
  ${escapeSql(est.terms)}
);`).join('\n')}

-- Masukkan Data Pembayaran / Pelunasan
${payments.map(p => `INSERT INTO \`payments\` (
  \`id\`, \`payment_number\`, \`invoice_id\`, \`invoice_number\`, 
  \`customer_id\`, \`customer_name\`, \`amount\`, \`payment_date\`, 
  \`payment_method\`, \`receipt_number\`, \`notes\`
) VALUES (
  ${escapeSql(p.id)},
  ${escapeSql(p.paymentNumber)},
  ${escapeSql(p.invoiceId)},
  ${escapeSql(p.invoiceNumber)},
  ${escapeSql(p.customerId)},
  ${escapeSql(p.customerName)},
  ${p.amount},
  ${escapeSql(p.paymentDate)},
  ${escapeSql(p.paymentMethod)},
  ${escapeSql(p.receiptNumber)},
  ${escapeSql(p.notes)}
);`).join('\n')}

-- ==============================================================================
-- SELESAI: Skema database dan data berhasil di-generate.
-- Silakan buka XAMPP -> Klik Admin pada MySQL (phpMyAdmin) -> Tab "Import" -> Pilih file ini.
-- ==============================================================================
`;
}
