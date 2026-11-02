/**
 * Koleksi Kode Sumber Laravel MVC (Model-View-Controller) Lengkap & Komentar Edukatif Pemula
 * Digunakan untuk:
 * 1. Menampilkan source code interaktif di browser
 * 2. Fitur 1-Klik Copy kode per file
 * 3. Fitur 1-Klik Download Single File atau Download Seluruh Proyek (.ZIP)
 */

export interface LaravelFileItem {
  id: string;
  category: 'routes' | 'models' | 'controllers' | 'views' | 'migrations' | 'docs' | 'sql';
  name: string;
  path: string;
  language: 'php' | 'blade' | 'markdown' | 'sql';
  description: string;
  code: string;
}

export const LARAVEL_PROJECT_FILES: LaravelFileItem[] = [
  {
    id: 'f-readme',
    category: 'docs',
    name: 'PANDUAN_XAMPP.md',
    path: 'PANDUAN_XAMPP.md',
    language: 'markdown',
    description: 'Panduan langkah demi langkah menjalankan aplikasi ini di XAMPP secara offline / online untuk pemula.',
    code: `# PANDUAN LENGKAP MENJALANKAN DI XAMPP & LARAVEL (UNTUK PEMULA)

Selamat datang! Panduan ini dirancang untuk programmer pemula yang ingin menjalankan aplikasi invoice standar perusahaan ini di laptop/PC menggunakan XAMPP secara offline maupun online di hosting.

---

## 📋 DAFTAR KEBUTUHAN PERANGKAT LUNAK:
1. **XAMPP** (versi PHP 8.2 atau 8.3) -> download di apachefriends.org
2. **Composer** (Package manager PHP) -> download di getcomposer.org
3. **Web Browser** (Chrome / Edge / Firefox)
4. **Text Editor** (VS Code / Sublime Text)

---

## 🚀 LANGKAH 1: PERSIAPAN DATABASE DI XAMPP
1. Buka control panel **XAMPP**, lalu klik tombol **Start** pada modul **Apache** dan **MySQL** (pastikan keduanya berwarna hijau).
2. Buka browser, ketik alamat: \`http://localhost/phpmyadmin\`
3. Klik menu **Databases** (Basis data), masukkan nama: \`db_crater_invoice\`, lalu klik tombol **Create**.
4. Klik tab **Import**, klik **Choose File**, pilih file \`database.sql\` yang telah Anda unduh dari aplikasi ini, lalu klik tombol **Go / Kirim** di bagian bawah.
5. Selesai! Semua tabel (\`company_settings\`, \`customers\`, \`items\`, \`invoices\`, \`payments\`) beserta relasinya langsung tercipta.

---

## 💻 LANGKAH 2: MEMBUAT PROYEK LARAVEL
Buka terminal (Command Prompt / Git Bash) dan arahkan ke folder \`htdocs\` XAMPP:
\`\`\`bash
cd C:\\xampp\\htdocs
composer create-project laravel/laravel invoice-app
cd invoice-app
\`\`\`

---

## 📦 LANGKAH 3: INSTALL LIBRARY EKSPOR PDF (DOMPDF)
Aplikasi ini menggunakan package standar industri \`laravel-dompdf\` untuk mencetak faktur ke PDF:
\`\`\`bash
composer require barryvdh/laravel-dompdf
\`\`\`

---

## ⚙️ LANGKAH 4: KONFIGURASI FILE \`.env\`
Buka file \`.env\` di dalam folder \`invoice-app\`, lalu ubah pengaturan koneksi database menjadi:
\`\`\`env
APP_NAME="Crater Invoice Enterprise"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_crater_invoice
DB_USERNAME=root
DB_PASSWORD=
\`\`\`

---

## 📂 LANGKAH 5: MENYALIN FILE MODEL, CONTROLLER & VIEW
Salin file-file yang ada pada menu **Kode Laravel** aplikasi ini ke direktori proyek Anda:
1. \`app/Models/\` -> Salin \`Invoice.php\`, \`Customer.php\`, \`Item.php\`, dll.
2. \`app/Http/Controllers/\` -> Salin \`InvoiceController.php\`, \`CustomerController.php\`, dll.
3. \`routes/web.php\` -> Timpa file \`routes/web.php\` bawaan dengan route invoice.
4. \`resources/views/\` -> Buat folder \`layouts\`, \`invoices\`, dan salin file-file Blade template.

---

## ▶️ LANGKAH 6: JALANKAN SERVER
Jalankan perintah ini di Command Prompt:
\`\`\`bash
php artisan serve
\`\`\`
Buka browser dan buka:
👉 **\`http://127.0.0.1:8000\`**

Selamat! Aplikasi Invoice standar perusahaan mirip Crater berbasis Laravel MVC dan Bootstrap siap Anda kembangkan lebih lanjut!
`
  },
  {
    id: 'f-routes',
    category: 'routes',
    name: 'web.php',
    path: 'routes/web.php',
    language: 'php',
    description: 'Rute URL lengkap berbasis RESTful Resource dan ekspor PDF.',
    code: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\DashboardController;
use App\\Http\\Controllers\\InvoiceController;
use App\\Http\\Controllers\\CustomerController;
use App\\Http\\Controllers\\ItemController;
use App\\Http\\Controllers\\PaymentController;
use App\\Http\\Controllers\\EstimateController;
use App\\Http\\Controllers\\CompanySettingController;

/*
|--------------------------------------------------------------------------
| Web Routes - Aplikasi Crater Invoicing Enterprise
|--------------------------------------------------------------------------
| Di sini kita mendaftarkan semua alamat URL (endpoint) aplikasi.
| Menggunakan pendekatan Resource Controller agar rute rapi & sesuai standar RESTful.
*/

// Halaman Utama: Dashboard Ringkasan Keuangan
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Manajemen Faktur (Invoice)
Route::resource('invoices', InvoiceController::class);

// Fitur Khusus Faktur: Ekspor Dokumen ke Format PDF
Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'exportPdf'])->name('invoices.pdf');

// Fitur Khusus Faktur: Catat Pelunasan / Pembayaran Cepat
Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store');

// Manajemen Surat Penawaran (Estimates / Quotations)
Route::resource('estimates', EstimateController::class);

// Konversi 1-Klik dari Penawaran menjadi Faktur Penjualan
Route::post('estimates/{estimate}/convert', [EstimateController::class, 'convertToInvoice'])->name('estimates.convert');

// Master Data Klien / Pelanggan
Route::resource('customers', CustomerController::class);

// Master Data Katalog Produk & Jasa
Route::resource('items', ItemController::class);

// Riwayat Pembayaran & Kas Masuk
Route::resource('payments', PaymentController::class)->only(['index', 'show', 'destroy']);

// Pengaturan Perusahaan & Template Faktur
Route::get('settings', [CompanySettingController::class, 'edit'])->name('settings.edit');
Route::put('settings', [CompanySettingController::class, 'update'])->name('settings.update');
`
  },
  {
    id: 'f-model-invoice',
    category: 'models',
    name: 'Invoice.php',
    path: 'app/Models/Invoice.php',
    language: 'php',
    description: 'Model Eloquent untuk Faktur dengan relasi Klien, Rincian Item, dan Aksesor Format Rupiah.',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

/**
 * Model Invoice (Faktur Penjualan)
 * Berfungsi menghubungkan tabel 'invoices' dengan objek PHP melalui Eloquent ORM.
 */
class Invoice extends Model
{
    use HasFactory;

    // Nama tabel di database MySQL (opsional jika nama tabel bentuk jamak)
    protected $table = 'invoices';

    // Kolom-kolom yang diizinkan untuk diisi secara massal (Mass Assignment)
    protected $fillable = [
        'id',
        'invoice_number',
        'customer_id',
        'issue_date',
        'due_date',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'tax_total',
        'total',
        'amount_paid',
        'balance',
        'status',
        'notes',
        'terms',
    ];

    // Mengubah tipe data kolom database secara otomatis ke tipe data PHP
    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    /**
     * RELASI 1: Relasi ke tabel Customer (Many-to-One)
     * Satu faktur hanya dimiliki oleh satu pelanggan/klien.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    /**
     * RELASI 2: Relasi ke tabel InvoiceItem (One-to-Many)
     * Satu faktur memiliki banyak rincian baris barang/jasa.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class, 'invoice_id', 'id');
    }

    /**
     * RELASI 3: Relasi ke tabel Payment (One-to-Many)
     * Satu faktur bisa memiliki riwayat beberapa kali cicilan/pelunasan.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'invoice_id', 'id');
    }

    /**
     * AKSESOR: Format Angka ke Rupiah untuk mempermudah pemula di file Blade view
     * Contoh pemanggilan di Blade: $invoice->formatted_total
     */
    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total, 0, ',', '.');
    }

    public function getFormattedBalanceAttribute(): string
    {
        return 'Rp ' . number_format($this->balance, 0, ',', '.');
    }

    public function getFormattedAmountPaidAttribute(): string
    {
        return 'Rp ' . number_format($this->amount_paid, 0, ',', '.');
    }

    /**
     * SCOPE: Mempermudah query filter berdasarkan status
     * Contoh: Invoice::status('PAID')->get();
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
`
  },
  {
    id: 'f-model-invoice-item',
    category: 'models',
    name: 'InvoiceItem.php',
    path: 'app/Models/InvoiceItem.php',
    language: 'php',
    description: 'Model baris rincian barang/jasa di dalam faktur.',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $table = 'invoice_items';
    public $timestamps = false; // Baris rincian tidak membutuhkan created_at & updated_at

    protected $fillable = [
        'id',
        'invoice_id',
        'item_id',
        'name',
        'description',
        'quantity',
        'unit',
        'price',
        'tax_rate',
        'subtotal',
        'tax_amount',
        'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id', 'id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'id');
    }
}
`
  },
  {
    id: 'f-model-customer',
    category: 'models',
    name: 'Customer.php',
    path: 'app/Models/Customer.php',
    language: 'php',
    description: 'Model Eloquent untuk data Klien dengan relasi ke Invoices.',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'company',
        'email',
        'phone',
        'address',
        'city',
        'tax_number',
        'currency',
        'notes',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id', 'id');
    }

    public function estimates(): HasMany
    {
        return $this->hasMany(Estimate::class, 'customer_id', 'id');
    }
}
`
  },
  {
    id: 'f-model-bank-account',
    category: 'models',
    name: 'BankAccount.php',
    path: 'app/Models/BankAccount.php',
    language: 'php',
    description: 'Model Eloquent untuk data Multi-Rekening Bank resmi perusahaan.',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $table = 'bank_accounts';

    protected $fillable = [
        'id',
        'bank_name',
        'account_number',
        'holder_name',
        'branch',
        'is_default',
        'notes',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Scope untuk mengambil rekening utama / default
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
`
  },
  {
    id: 'f-controller-invoice',
    category: 'controllers',
    name: 'InvoiceController.php',
    path: 'app/Http/Controllers/InvoiceController.php',
    language: 'php',
    description: 'Controller utama faktur: CRUD, perhitungan pajak, dan Ekspor PDF menggunakan DomPDF.',
    code: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Invoice;
use App\\Models\\InvoiceItem;
use App\\Models\\Customer;
use App\\Models\\Item;
use App\\Models\\CompanySetting;
use App\\Models\\Payment;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Str;
use Barryvdh\\DomPDF\\Facade\\Pdf; // Package PDF standar Laravel

/**
 * InvoiceController (Metode MVC - Controller)
 * Menangani seluruh logika bisnis pembuatan faktur, kalkulasi diskon/PPN, 
 * hingga pembuatan dokumen PDF resmi perusahaan.
 */
class InvoiceController extends Controller
{
    /**
     * 1. Menampilkan Daftar Semua Faktur dengan Fitur Pencarian & Filter Status
     */
    public function index(Request $request)
    {
        $query = Invoice::with('customer')->latest();

        // Filter berdasarkan status jika dipilih (DRAFT, PAID, OVERDUE, dll)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian nomor faktur atau nama klien
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($c) use ($search) {
                      $c->where('name', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                  });
            });
        }

        $invoices = $query->paginate(15);

        return view('invoices.index', compact('invoices'));
    }

    /**
     * 2. Menampilkan Form Buat Faktur Baru
     */
    public function create()
    {
        $customers = Customer::orderBy('name')->get();
        $items = Item::orderBy('name')->get();
        $company = CompanySetting::first();

        // Generate Nomor Faktur Otomatis Berurutan
        $prefix = $company ? $company->invoice_prefix : 'INV-2026-';
        $nextNumber = $prefix . str_pad((Invoice::count() + 1), 4, '0', STR_PAD_LEFT);

        return view('invoices.create', compact('customers', 'items', 'company', 'nextNumber'));
    }

    /**
     * 3. Menyimpan Faktur Baru ke Database MySQL (Dengan Transaksi Database Aman)
     */
    public function store(Request $request)
    {
        // Validasi input form
        $request->validate([
            'invoice_number' => 'required|unique:invoices,invoice_number',
            'customer_id'    => 'required|exists:customers,id',
            'issue_date'     => 'required|date',
            'due_date'       => 'required|date|after_or_equal:issue_date',
            'items'          => 'required|array|min:1',
            'items.*.name'   => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price'  => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Hitung subtotal dan kalkulasi seluruh item
            $subtotal = 0;
            $taxTotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $qty = (float) $item['quantity'];
                $price = (float) $item['price'];
                $taxRate = isset($item['tax_rate']) ? (float) $item['tax_rate'] : 0;

                $rowSubtotal = $qty * $price;
                $rowTax = ($rowSubtotal * $taxRate) / 100;
                $rowTotal = $rowSubtotal + $rowTax;

                $subtotal += $rowSubtotal;
                $taxTotal += $rowTax;

                $itemsData[] = [
                    'id'          => (string) Str::uuid(),
                    'item_id'     => $item['item_id'] ?? null,
                    'name'        => $item['name'],
                    'description' => $item['description'] ?? '',
                    'quantity'    => $qty,
                    'unit'        => $item['unit'] ?? 'pcs',
                    'price'       => $price,
                    'tax_rate'    => $taxRate,
                    'subtotal'    => $rowSubtotal,
                    'tax_amount'  => $rowTax,
                    'total'       => $rowTotal,
                ];
            }

            // Hitung Diskon Global
            $discountType = $request->input('discount_type', 'fixed');
            $discountValue = (float) $request->input('discount_value', 0);
            $discountAmount = 0;

            if ($discountType === 'percent') {
                $discountAmount = ($subtotal * $discountValue) / 100;
            } else {
                $discountAmount = $discountValue;
            }

            $total = ($subtotal - $discountAmount) + $taxTotal;

            // Simpan Header Faktur
            $invoice = Invoice::create([
                'id'              => (string) Str::uuid(),
                'invoice_number'  => $request->invoice_number,
                'customer_id'     => $request->customer_id,
                'issue_date'      => $request->issue_date,
                'due_date'        => $request->due_date,
                'subtotal'        => $subtotal,
                'discount_type'   => $discountType,
                'discount_value'  => $discountValue,
                'discount_amount' => $discountAmount,
                'tax_total'       => $taxTotal,
                'total'           => $total,
                'amount_paid'     => 0,
                'balance'         => $total,
                'status'          => $request->input('status', 'DRAFT'),
                'notes'           => $request->notes,
                'terms'           => $request->terms,
            ]);

            // Simpan Rincian Baris Barang/Jasa
            foreach ($itemsData as $data) {
                $data['invoice_id'] = $invoice->id;
                InvoiceItem::create($data);
            }

            DB::commit();

            return redirect()->route('invoices.show', $invoice->id)
                ->with('success', "Faktur {$invoice->invoice_number} berhasil dibuat!");

        } catch (\\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Gagal membuat faktur: ' . $e->getMessage());
        }
    }

    /**
     * 4. Menampilkan Halaman Detail Faktur & Pilihan Aksi
     */
    public function show($id)
    {
        $invoice = Invoice::with(['customer', 'items', 'payments'])->findOrFail($id);
        $company = CompanySetting::first();

        return view('invoices.show', compact('invoice', 'company'));
    }

    /**
     * 5. FITUR EKSPOR PDF: Menghasilkan Dokumen PDF Resmi Standar Perusahaan
     * Dapat langsung dibuka di browser atau diunduh otomatis.
     */
    public function exportPdf($id)
    {
        $invoice = Invoice::with(['customer', 'items'])->findOrFail($id);
        $company = CompanySetting::first();

        // Load view khusus PDF (resources/views/invoices/pdf.blade.php)
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice', 'company'))
                  ->setPaper('a4', 'portrait');

        $fileName = 'FAKTUR_' . $invoice->invoice_number . '.pdf';

        // Stream (Buka langsung di tab browser) atau download() untuk unduh langsung
        return $pdf->stream($fileName);
    }

    /**
     * 6. Mencatat Pembayaran Cepat untuk Faktur Ini
     */
    public function recordPayment(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $request->validate([
            'amount'         => 'required|numeric|min:1|max:' . $invoice->balance,
            'payment_date'   => 'required|date',
            'payment_method' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $payment = Payment::create([
                'id'             => (string) Str::uuid(),
                'payment_number' => 'PAY-' . date('Ymd') . '-' . rand(100, 999),
                'invoice_id'     => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer_id'    => $invoice->customer_id,
                'customer_name'  => $invoice->customer->name,
                'amount'         => $request->amount,
                'payment_date'   => $request->payment_date,
                'payment_method' => $request->payment_method,
                'receipt_number' => $request->receipt_number,
                'notes'          => $request->notes,
            ]);

            // Update Saldo & Status Faktur
            $newPaid = $invoice->amount_paid + $request->amount;
            $newBalance = $invoice->total - $newPaid;
            $status = ($newBalance <= 0) ? 'PAID' : 'PARTIALLY_PAID';

            $invoice->update([
                'amount_paid' => $newPaid,
                'balance'     => max(0, $newBalance),
                'status'      => $status,
            ]);

            DB::commit();

            return back()->with('success', 'Pembayaran sebesar Rp ' . number_format($request->amount, 0, ',', '.') . ' berhasil dicatat!');

        } catch (\\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mencatat pembayaran: ' . $e->getMessage());
        }
    }
}
`
  },
  {
    id: 'f-view-layout',
    category: 'views',
    name: 'app.blade.php',
    path: 'resources/views/layouts/app.blade.php',
    language: 'blade',
    description: 'Master template Blade dengan Bootstrap 5 responsif, sidebar dinamis, dan header akuntansi.',
    code: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Crater Invoice Enterprise') - Sistem Faktur Perusahaan</title>
    
    <!-- Bootstrap 5.3 CSS (Responsif untuk berbagai ukuran gadget) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
        }
        .sidebar {
            min-height: 100vh;
            background-color: #0f172a;
            color: #94a3b8;
        }
        .sidebar .nav-link {
            color: #94a3b8;
            font-weight: 500;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-bottom: 0.25rem;
        }
        .sidebar .nav-link:hover, .sidebar .nav-link.active {
            color: #ffffff;
            background-color: #1e293b;
        }
        .card-custom {
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
    </style>
    @stack('styles')
</head>
<body>
<div class="container-fluid">
    <div class="row">
        <!-- Sidebar Responsif (Desktop & Tablet) -->
        <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse p-3">
            <div class="d-flex align-items-center mb-4 px-2 text-white">
                <i class="bi bi-receipt-cutoff fs-4 text-primary me-2"></i>
                <span class="fs-5 fw-bold">Crater Enterprise</span>
            </div>

            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">
                        <i class="bi bi-grid-1x2 me-2"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('invoices.*') ? 'active' : '' }}" href="{{ route('invoices.index') }}">
                        <i class="bi bi-file-earmark-text me-2"></i> Faktur (Invoices)
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('estimates.*') ? 'active' : '' }}" href="{{ route('estimates.index') }}">
                        <i class="bi bi-file-earmark-check me-2"></i> Penawaran (Estimates)
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('customers.*') ? 'active' : '' }}" href="{{ route('customers.index') }}">
                        <i class="bi bi-people me-2"></i> Klien & Pelanggan
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('items.*') ? 'active' : '' }}" href="{{ route('items.index') }}">
                        <i class="bi bi-box-seam me-2"></i> Produk & Jasa
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->routeIs('payments.*') ? 'active' : '' }}" href="{{ route('payments.index') }}">
                        <i class="bi bi-cash-stack me-2"></i> Pembayaran
                    </a>
                </li>
                <li class="nav-item mt-4 pt-3 border-top border-secondary">
                    <a class="nav-link {{ request()->routeIs('settings.*') ? 'active' : '' }}" href="{{ route('settings.edit') }}">
                        <i class="bi bi-gear me-2"></i> Pengaturan Perusahaan
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Area Konten Utama -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <!-- Pesan Notifikasi Sukses / Error -->
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</div>

<!-- Bootstrap 5 JavaScript Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
@stack('scripts')
</body>
</html>
`
  },
  {
    id: 'f-view-pdf',
    category: 'views',
    name: 'pdf.blade.php',
    path: 'resources/views/invoices/pdf.blade.php',
    language: 'blade',
    description: 'Template HTML murni A4 terstandarisasi untuk dicetak ke PDF dengan kop surat resmi, tabel rincian, dan tanda tangan.',
    code: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>FAKTUR - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 15mm 20mm;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11pt;
            color: #1e293b;
            line-height: 1.4;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #0f172a;
        }
        .company-sub {
            font-size: 9pt;
            color: #64748b;
        }
        .invoice-title {
            text-align: right;
            font-size: 22pt;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: 1px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
            font-size: 9pt;
        }
        .items-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9.5pt;
        }
        .text-right {
            text-align: right;
        }
        .total-box {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .total-box td {
            padding: 5px 8px;
            font-size: 10pt;
        }
        .grand-total {
            background-color: #f8fafc;
            font-weight: bold;
            font-size: 12pt;
            color: #0f172a;
            border-top: 2px solid #0f172a;
        }
        .signature-table {
            width: 100%;
            margin-top: 40px;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT PERUSAHAAN -->
    <table class="header-table">
        <tr>
            <td style="vertical-align: top; width: 60%;">
                <div class="company-name">{{ $company->name ?? 'PT NUSANTARA SOLUSI PRIMA' }}</div>
                <div class="company-sub">
                    {{ $company->legal_name ?? '' }}<br>
                    {{ $company->address ?? 'Gedung Menara Cyber 2 Lt 18, Jakarta' }}<br>
                    NPWP: {{ $company->tax_number ?? '01.345.678.9-012.000' }} | Telp: {{ $company->phone ?? '' }}<br>
                    Email: {{ $company->email ?? 'finance@nusantarasolusi.co.id' }}
                </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
                <div class="invoice-title">FAKTUR TAGIHAN</div>
                <div style="font-weight: bold; font-size: 11pt;">{{ $invoice->invoice_number }}</div>
                <div style="font-size: 9pt; color: #64748b;">
                    Tanggal: {{ $invoice->issue_date->format('d/m/Y') }}<br>
                    Jatuh Tempo: {{ $invoice->due_date->format('d/m/Y') }}<br>
                    Status: <strong>{{ $invoice->status }}</strong>
                </div>
            </td>
        </tr>
    </table>

    <!-- TUJUAN PENAGIHAN (BILL TO) -->
    <table class="meta-table">
        <tr>
            <td style="vertical-align: top;">
                <div style="font-size: 9pt; font-weight: bold; color: #64748b;">DITUJUKAN KEPADA:</div>
                <div style="font-weight: bold; font-size: 12pt;">{{ $invoice->customer->company ?? $invoice->customer->name }}</div>
                <div>Attn: {{ $invoice->customer->name }}</div>
                <div style="color: #475569; font-size: 9.5pt;">
                    {{ $invoice->customer->address }}<br>
                    {{ $invoice->customer->city }}<br>
                    NPWP: {{ $invoice->customer->tax_number ?? '-' }} | Telp: {{ $invoice->customer->phone }}
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL RINCIAN BARIS BARANG / JASA -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 45%;">Deskripsi Layanan / Barang</th>
                <th style="width: 12%;" class="text-right">Qty</th>
                <th style="width: 18%;" class="text-right">Harga Satuan</th>
                <th style="width: 20%;" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    <strong>{{ $item->name }}</strong>
                    @if($item->description)
                        <div style="font-size: 8.5pt; color: #64748b;">{{ $item->description }}</div>
                    @endif
                </td>
                <td class="text-right">{{ number_format($item->quantity, 0) }} {{ $item->unit }}</td>
                <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- KALKULASI TOTAL AKHIR -->
    <table class="total-box">
        <tr>
            <td>Subtotal:</td>
            <td class="text-right">Rp {{ number_format($invoice->subtotal, 0, ',', '.') }}</td>
        </tr>
        @if($invoice->discount_amount > 0)
        <tr>
            <td>Potongan Diskon:</td>
            <td class="text-right text-danger">- Rp {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr>
            <td>PPN (Pajak Pertambahan Nilai):</td>
            <td class="text-right">Rp {{ number_format($invoice->tax_total, 0, ',', '.') }}</td>
        </tr>
        <tr class="grand-total">
            <td><strong>TOTAL TAGIHAN:</strong></td>
            <td class="text-right"><strong>{{ $invoice->formatted_total }}</strong></td>
        </tr>
        @if($invoice->amount_paid > 0)
        <tr>
            <td>Sudah Dibayar:</td>
            <td class="text-right" style="color: #16a34a;">Rp {{ number_format($invoice->amount_paid, 0, ',', '.') }}</td>
        </tr>
        <tr style="font-weight: bold;">
            <td>Sisa Saldo:</td>
            <td class="text-right" style="color: #dc2626;">Rp {{ number_format($invoice->balance, 0, ',', '.') }}</td>
        </tr>
        @endif
    </table>

    <!-- INSTRUKSI PEMBAYARAN BANK & TANDA TANGAN -->
    <table class="signature-table">
        <tr>
            <td style="width: 60%; vertical-align: top; font-size: 9pt;">
                <strong>Instruksi Transfer Rekening Resmi:</strong><br>
                Bank: {{ $company->bank_name ?? 'Bank BCA' }}<br>
                No. Rekening: <strong>{{ $company->bank_account ?? '527-189-9920' }}</strong><br>
                Atas Nama: <strong>{{ $company->bank_holder ?? 'PT NUSANTARA SOLUSI PRIMA' }}</strong><br>
                <br>
                <em>Catatan: Mohon cantumkan nomor faktur ({{ $invoice->invoice_number }}) pada berita transfer.</em>
            </td>
            <td style="width: 40%; text-align: center; vertical-align: top; font-size: 9.5pt;">
                <div>{{ $company->city ?? 'Jakarta' }}, {{ $invoice->issue_date->format('d F Y') }}</div>
                <div style="font-weight: bold; margin-bottom: 60px;">{{ $company->name ?? 'PT Nusantara Solusi Prima' }}</div>
                <div style="text-decoration: underline; font-weight: bold;">{{ $company->signature_name ?? 'Bambang Triatmojo, S.Kom' }}</div>
                <div style="color: #64748b; font-size: 8.5pt;">{{ $company->signature_role ?? 'Direktur Keuangan' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
`
  },
  {
    id: 'f-migration',
    category: 'migrations',
    name: '2026_01_01_000001_create_crater_tables.php',
    path: 'database/migrations/2026_01_01_000001_create_crater_tables.php',
    language: 'php',
    description: 'File Migration Laravel Schema Blueprint untuk membuat seluruh tabel database relasional.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi: php artisan migrate
     */
    public function up(): void
    {
        // 1. Tabel Profil Perusahaan
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('legal_name');
            $table->string('tagline')->nullable();
            $table->string('email');
            $table->string('phone');
            $table->string('website')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('tax_number')->nullable();
            $table->string('bank_name');
            $table->string('bank_branch')->nullable();
            $table->string('bank_account');
            $table->string('bank_holder');
            $table->string('currency')->default('IDR');
            $table->decimal('default_tax_rate', 5, 2)->default(11.00);
            $table->string('invoice_prefix')->default('INV-2026-');
            $table->string('estimate_prefix')->default('EST-2026-');
            $table->string('signature_name')->nullable();
            $table->string('signature_role')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Master Pelanggan / Klien
        Schema::create('customers', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name');
            $table->string('company');
            $table->string('email');
            $table->string('phone');
            $table->text('address');
            $table->string('city');
            $table->string('tax_number')->nullable();
            $table->string('currency')->default('IDR');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Tabel Master Produk & Jasa
        Schema::create('items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->string('unit')->default('pcs');
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(11.00);
            $table->timestamps();
        });

        // 4. Tabel Transaksi Faktur (Invoices)
        Schema::create('invoices', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('invoice_number')->unique();
            $table->string('customer_id', 50);
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->enum('discount_type', ['percent', 'fixed'])->default('fixed');
            $table->decimal('discount_value', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2)->default(0);
            $table->enum('status', ['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'])->default('DRAFT');
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('restrict');
        });

        // 5. Tabel Baris Rincian Faktur (Invoice Items)
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('invoice_id', 50);
            $table->string('item_id', 50)->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('pcs');
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });

        // 6. Tabel Pembayaran Faktur (Payments)
        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('payment_number');
            $table->string('invoice_id', 50);
            $table->string('invoice_number');
            $table->string('customer_id', 50);
            $table->string('customer_name');
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->string('payment_method');
            $table->string('receipt_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('restrict');
        });

        // 7. Tabel Multi-Rekening Bank Perusahaan (Bank Accounts)
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('holder_name');
            $table->string('branch')->nullable();
            $table->boolean('is_default')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('items');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('company_settings');
    }
};
`
  }
];
