import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CompanyProfile, Customer, Item, Invoice, Estimate, Payment, ActiveTab, BankAccount 
} from '../types';
import { 
  INITIAL_COMPANY, INITIAL_CUSTOMERS, INITIAL_ITEMS, 
  INITIAL_INVOICES, INITIAL_ESTIMATES, INITIAL_PAYMENTS 
} from '../data/initialData';
import { generateFullSqlDump } from '../utils/sqlGenerator';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

interface InvoiceContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Data State
  company: CompanyProfile;
  customers: Customer[];
  items: Item[];
  invoices: Invoice[];
  estimates: Estimate[];
  payments: Payment[];

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Invoice Actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Estimate Actions
  addEstimate: (estimate: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) => Estimate;
  updateEstimate: (id: string, estimate: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
  convertEstimateToInvoice: (estimateId: string) => Invoice | null;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  // Item Actions
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Item;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => boolean;

  // Payment Actions
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>) => Payment;
  deletePayment: (id: string) => void;

  // Bank Account Actions (Multi-rekening)
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => BankAccount;
  updateBankAccount: (id: string, bank: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => boolean;
  setDefaultBankAccount: (id: string) => void;

  // Company Profile
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;

  // Utility & SQL Export
  resetToSampleData: () => void;
  downloadSqlDump: () => void;
  getSqlDumpString: () => string;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPANY: 'crater_invoice_company_v1',
  CUSTOMERS: 'crater_invoice_customers_v1',
  ITEMS: 'crater_invoice_items_v1',
  INVOICES: 'crater_invoice_invoices_v1',
  ESTIMATES: 'crater_invoice_estimates_v1',
  PAYMENTS: 'crater_invoice_payments_v1',
};

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Company Profile
  const [company, setCompany] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.bankAccounts || parsed.bankAccounts.length === 0) {
          parsed.bankAccounts = INITIAL_COMPANY.bankAccounts || [];
        }
        return parsed;
      }
      return INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Items
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  // Estimates
  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ESTIMATES);
      return saved ? JSON.parse(saved) : INITIAL_ESTIMATES;
    } catch {
      return INITIAL_ESTIMATES;
    }
  });

  // Payments
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  // Auto-Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [company, customers, items, invoices, estimates, payments]);

  // Toast Helpers
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- INVOICE ACTIONS ---
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const now = new Date().toISOString();
    const id = 'inv-' + Date.now();
    const customer = customers.find(c => c.id === invoiceData.customerId);
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      customer,
      createdAt: now,
      updatedAt: now,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    showToast('Faktur Dibuat', `Faktur nomor ${newInvoice.invoiceNumber} berhasil disimpan.`);
    return newInvoice;
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    const now = new Date().toISOString();
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const updated = { ...inv, ...invoiceData, updatedAt: now };
      if (invoiceData.customerId) {
        updated.customer = customers.find(c => c.id === invoiceData.customerId) || inv.customer;
      }
      return updated;
    }));
    showToast('Faktur Diperbarui', `Perubahan faktur telah disimpan.`);
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    showToast('Faktur Dihapus', `Faktur ${target?.invoiceNumber || ''} telah dihapus.`);
  };

  // --- ESTIMATE ACTIONS ---
  const addEstimate = (estimateData: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>): Estimate => {
    const now = new Date().toISOString();
    const id = 'est-' + Date.now();
    const customer = customers.find(c => c.id === estimateData.customerId);
    const newEstimate: Estimate = {
      ...estimateData,
      id,
      customer,
      createdAt: now,
      updatedAt: now,
    };
    setEstimates(prev => [newEstimate, ...prev]);
    showToast('Penawaran Dibuat', `Surat penawaran ${newEstimate.estimateNumber} berhasil dibuat.`);
    return newEstimate;
  };

  const updateEstimate = (id: string, estimateData: Partial<Estimate>) => {
    const now = new Date().toISOString();
    setEstimates(prev => prev.map(est => {
      if (est.id !== id) return est;
      const updated = { ...est, ...estimateData, updatedAt: now };
      if (estimateData.customerId) {
        updated.customer = customers.find(c => c.id === estimateData.customerId) || est.customer;
      }
      return updated;
    }));
    showToast('Penawaran Diperbarui', 'Perubahan penawaran berhasil disimpan.');
  };

  const deleteEstimate = (id: string) => {
    const target = estimates.find(e => e.id === id);
    setEstimates(prev => prev.filter(e => e.id !== id));
    showToast('Penawaran Dihapus', `Penawaran ${target?.estimateNumber || ''} telah dihapus.`);
  };

  const convertEstimateToInvoice = (estimateId: string): Invoice | null => {
    const est = estimates.find(e => e.id === estimateId);
    if (!est) return null;

    // Generate Invoice Number
    const nextSeq = invoices.length + 1;
    const invNumber = company.invoicePrefix + String(nextSeq).padStart(4, '0');
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInvoice = addInvoice({
      invoiceNumber: invNumber,
      customerId: est.customerId,
      customer: est.customer,
      issueDate: today,
      dueDate: dueDate,
      items: est.items,
      subtotal: est.subtotal,
      discountType: est.discountType,
      discountValue: est.discountValue,
      discountAmount: est.discountAmount,
      taxTotal: est.taxTotal,
      total: est.total,
      amountPaid: 0,
      balance: est.total,
      status: 'DRAFT',
      notes: `Dikonversi dari Surat Penawaran: ${est.estimateNumber}.\n${est.notes}`,
      terms: est.terms,
    });

    // Mark estimate as converted
    updateEstimate(est.id, {
      status: 'CONVERTED',
      convertedInvoiceId: newInvoice.id,
    });

    showToast('Berhasil Dikonversi!', `Penawaran ${est.estimateNumber} telah menjadi Faktur ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  // --- CUSTOMER ACTIONS ---
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const id = 'cust-' + Date.now();
    const newCustomer: Customer = {
      ...customerData,
      id,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    showToast('Klien Ditambahkan', `${newCustomer.name} (${newCustomer.company}) telah didaftarkan.`);
    return newCustomer;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    // Update reference in invoices and estimates
    setInvoices(prev => prev.map(inv => inv.customerId === id ? { ...inv, customer: { ...inv.customer!, ...customerData } } : inv));
    showToast('Klien Diperbarui', 'Data klien berhasil disimpan.');
  };

  const deleteCustomer = (id: string): boolean => {
    const hasInvoices = invoices.some(i => i.customerId === id);
    if (hasInvoices) {
      showToast('Tidak Dapat Dihapus', 'Klien ini memiliki riwayat faktur terkait.', 'error');
      return false;
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast('Klien Dihapus', 'Data klien telah dihapus.');
    return true;
  };

  // --- ITEM ACTIONS ---
  const addItem = (itemData: Omit<Item, 'id' | 'createdAt'>): Item => {
    const id = 'item-' + Date.now();
    const newItem: Item = {
      ...itemData,
      id,
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    showToast('Produk Ditambahkan', `${newItem.name} siap digunakan dalam faktur.`);
    return newItem;
  };

  const updateItem = (id: string, itemData: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...itemData } : i));
    showToast('Produk Diperbarui', 'Data item berhasil diubah.');
  };

  const deleteItem = (id: string): boolean => {
    setItems(prev => prev.filter(i => i.id !== id));
    showToast('Produk Dihapus', 'Item telah dihapus dari katalog.');
    return true;
  };

  // --- PAYMENT ACTIONS ---
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>): Payment => {
    const now = new Date().toISOString();
    const id = 'pay-' + Date.now();
    const seq = payments.length + 1;
    const paymentNumber = 'PAY-' + new Date().getFullYear() + '-' + String(seq).padStart(4, '0');

    const newPayment: Payment = {
      ...paymentData,
      id,
      paymentNumber,
      createdAt: now,
    };

    setPayments(prev => [newPayment, ...prev]);

    // Recalculate invoice balance & status
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== paymentData.invoiceId) return inv;
      const newPaid = inv.amountPaid + paymentData.amount;
      const newBalance = Math.max(0, inv.total - newPaid);
      let newStatus: Invoice['status'] = inv.status;
      if (newBalance <= 0) {
        newStatus = 'PAID';
      } else if (newPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }
      return {
        ...inv,
        amountPaid: newPaid,
        balance: newBalance,
        status: newStatus,
        updatedAt: now,
      };
    }));

    showToast('Pembayaran Diterima', `Pembayaran sebesar Rp ${paymentData.amount.toLocaleString('id-ID')} berhasil dicatat.`);
    return newPayment;
  };

  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    setPayments(prev => prev.filter(p => p.id !== id));

    // Revert invoice balance
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== payment.invoiceId) return inv;
      const newPaid = Math.max(0, inv.amountPaid - payment.amount);
      const newBalance = inv.total - newPaid;
      let newStatus: Invoice['status'] = inv.status;
      if (newPaid === 0) {
        newStatus = 'SENT';
      } else if (newBalance > 0) {
        newStatus = 'PARTIALLY_PAID';
      }
      return {
        ...inv,
        amountPaid: newPaid,
        balance: newBalance,
        status: newStatus,
      };
    }));

    showToast('Pembayaran Dibatalkan', 'Data pembayaran telah dihapus dan saldo faktur diperbarui.');
  };

  // --- BANK ACCOUNT ACTIONS ---
  const addBankAccount = (bankData: Omit<BankAccount, 'id'>): BankAccount => {
    const id = 'bank-' + Date.now();
    const newBank: BankAccount = { ...bankData, id };

    setCompany(prev => {
      const existing = prev.bankAccounts || [];
      const isFirst = existing.length === 0;
      const shouldBeDefault = bankData.isDefault || isFirst;

      const updatedAccounts = existing.map(b => shouldBeDefault ? { ...b, isDefault: false } : b);
      newBank.isDefault = shouldBeDefault;
      updatedAccounts.push(newBank);

      return {
        ...prev,
        bankAccounts: updatedAccounts,
        ...(shouldBeDefault ? {
          bankName: newBank.bankName,
          bankBranch: newBank.bankBranch || '',
          bankAccount: newBank.bankAccount,
          bankHolder: newBank.bankHolder,
        } : {})
      };
    });

    showToast('Rekening Ditambahkan', `${newBank.bankName} (${newBank.bankAccount}) berhasil disimpan.`);
    return newBank;
  };

  const updateBankAccount = (id: string, bankData: Partial<BankAccount>) => {
    setCompany(prev => {
      const existing = prev.bankAccounts || [];
      const updatedAccounts = existing.map(b => {
        if (b.id !== id) {
          return bankData.isDefault ? { ...b, isDefault: false } : b;
        }
        return { ...b, ...bankData };
      });

      const defaultAcc = updatedAccounts.find(b => b.isDefault) || updatedAccounts[0];

      return {
        ...prev,
        bankAccounts: updatedAccounts,
        ...(defaultAcc ? {
          bankName: defaultAcc.bankName,
          bankBranch: defaultAcc.bankBranch || '',
          bankAccount: defaultAcc.bankAccount,
          bankHolder: defaultAcc.bankHolder,
        } : {})
      };
    });

    showToast('Rekening Diperbarui', 'Data rekening bank berhasil diubah.');
  };

  const deleteBankAccount = (id: string): boolean => {
    const existing = company.bankAccounts || [];
    if (existing.length <= 1) {
      showToast('Gagal Menghapus', 'Perusahaan harus memiliki minimal satu rekening bank untuk faktur.', 'error');
      return false;
    }

    setCompany(prev => {
      const remaining = (prev.bankAccounts || []).filter(b => b.id !== id);
      const hasDefault = remaining.some(b => b.isDefault);
      if (!hasDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      const defaultAcc = remaining.find(b => b.isDefault) || remaining[0];

      return {
        ...prev,
        bankAccounts: remaining,
        ...(defaultAcc ? {
          bankName: defaultAcc.bankName,
          bankBranch: defaultAcc.bankBranch || '',
          bankAccount: defaultAcc.bankAccount,
          bankHolder: defaultAcc.bankHolder,
        } : {})
      };
    });

    showToast('Rekening Dihapus', 'Rekening bank telah dihapus.');
    return true;
  };

  const setDefaultBankAccount = (id: string) => {
    setCompany(prev => {
      const updated = (prev.bankAccounts || []).map(b => ({
        ...b,
        isDefault: b.id === id,
      }));
      const def = updated.find(b => b.id === id);

      return {
        ...prev,
        bankAccounts: updated,
        ...(def ? {
          bankName: def.bankName,
          bankBranch: def.bankBranch || '',
          bankAccount: def.bankAccount,
          bankHolder: def.bankHolder,
        } : {})
      };
    });

    showToast('Rekening Utama Diubah', 'Rekening utama untuk faktur telah diperbarui.');
  };

  // --- COMPANY PROFILE ---
  const updateCompanyProfile = (profileData: Partial<CompanyProfile>) => {
    setCompany(prev => {
      const updated = { ...prev, ...profileData };
      // Ensure bankAccounts exists
      if (!updated.bankAccounts || updated.bankAccounts.length === 0) {
        updated.bankAccounts = prev.bankAccounts || INITIAL_COMPANY.bankAccounts || [];
      }
      return updated;
    });
    showToast('Profil Disimpan', 'Informasi perusahaan dan rekening bank berhasil diperbarui.');
  };

  // --- SQL EXPORT & RESET ---
  const getSqlDumpString = (): string => {
    return generateFullSqlDump(company, customers, items, invoices, estimates, payments);
  };

  const downloadSqlDump = () => {
    const sql = getSqlDumpString();
    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `db_crater_invoice_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database SQL Diunduh', 'File database.sql siap diimpor ke XAMPP / phpMyAdmin.');
  };

  const resetToSampleData = () => {
    setCompany(INITIAL_COMPANY);
    setCustomers(INITIAL_CUSTOMERS);
    setItems(INITIAL_ITEMS);
    setInvoices(INITIAL_INVOICES);
    setEstimates(INITIAL_ESTIMATES);
    setPayments(INITIAL_PAYMENTS);
    localStorage.clear();
    showToast('Data Direset', 'Semua data dikembalikan ke contoh awal standar perusahaan.');
  };

  return (
    <InvoiceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        company,
        customers,
        items,
        invoices,
        estimates,
        payments,
        toasts,
        showToast,
        removeToast,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addEstimate,
        updateEstimate,
        deleteEstimate,
        convertEstimateToInvoice,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addItem,
        updateItem,
        deleteItem,
        recordPayment,
        deletePayment,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        setDefaultBankAccount,
        updateCompanyProfile,
        resetToSampleData,
        downloadSqlDump,
        getSqlDumpString,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};
