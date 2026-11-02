import React, { useState } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceListView } from './components/invoices/InvoiceListView';
import { InvoiceFormModal } from './components/invoices/InvoiceFormModal';
import { InvoiceDetailModal } from './components/invoices/InvoiceDetailModal';
import { EstimateListView } from './components/estimates/EstimateListView';
import { EstimateFormModal } from './components/estimates/EstimateFormModal';
import { EstimateDetailModal } from './components/estimates/EstimateDetailModal';
import { CustomerListView } from './components/customers/CustomerListView';
import { CustomerModal } from './components/customers/CustomerModal';
import { ItemListView } from './components/items/ItemListView';
import { ItemModal } from './components/items/ItemModal';
import { PaymentListView } from './components/payments/PaymentListView';
import { PaymentModal } from './components/payments/PaymentModal';
import { SettingsView } from './components/settings/SettingsView';
import { LaravelStudioView } from './components/laravel/LaravelStudioView';
import { SqlExportModal } from './components/sql/SqlExportModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Invoice, Estimate, Customer, Item } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, convertEstimateToInvoice } = useInvoice();

  // Navigation drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);

  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);

  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [estimateToEdit, setEstimateToEdit] = useState<Estimate | null>(null);

  const [isEstimateDetailOpen, setIsEstimateDetailOpen] = useState(false);
  const [selectedEstimateForDetail, setSelectedEstimateForDetail] = useState<Estimate | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<Invoice | null>(null);

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // --- Handlers ---
  const handleOpenNewInvoice = (customerId?: string) => {
    setInvoiceToEdit(null);
    setPreselectedCustomerId(customerId);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setInvoiceToEdit(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setSelectedInvoiceForDetail(inv);
    setIsInvoiceDetailOpen(true);
  };

  const handleOpenNewEstimate = () => {
    setEstimateToEdit(null);
    setIsEstimateModalOpen(true);
  };

  const handleEditEstimate = (est: Estimate) => {
    setEstimateToEdit(est);
    setIsEstimateModalOpen(true);
  };

  const handleViewEstimate = (est: Estimate) => {
    setSelectedEstimateForDetail(est);
    setIsEstimateDetailOpen(true);
  };

  const handleOpenNewCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (cust: Customer) => {
    setCustomerToEdit(cust);
    setIsCustomerModalOpen(true);
  };

  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (it: Item) => {
    setItemToEdit(it);
    setIsItemModalOpen(true);
  };

  const handleRecordPaymentForInvoice = (inv: Invoice) => {
    setTargetInvoiceForPayment(inv);
    setIsPaymentModalOpen(true);
  };

  const handleOpenNewPayment = () => {
    setTargetInvoiceForPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleConvertToInvoice = (est: Estimate) => {
    const inv = convertEstimateToInvoice(est.id);
    if (inv) {
      setIsEstimateDetailOpen(false);
      setSelectedEstimateForDetail(null);
      setSelectedInvoiceForDetail(inv);
      setIsInvoiceDetailOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Navbar (Fixed at top) */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenNewInvoice={handleOpenNewInvoice}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewInvoice={handleOpenNewInvoice}
              onOpenNewEstimate={handleOpenNewEstimate}
              onOpenNewCustomer={handleOpenNewCustomer}
              onViewInvoice={handleViewInvoice}
              onRecordPaymentForInvoice={handleRecordPaymentForInvoice}
              onOpenSqlModal={() => setIsSqlModalOpen(true)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceListView
              onOpenNewInvoice={handleOpenNewInvoice}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={handleViewInvoice}
              onRecordPaymentForInvoice={handleRecordPaymentForInvoice}
            />
          )}

          {activeTab === 'estimates' && (
            <EstimateListView
              onOpenNewEstimate={handleOpenNewEstimate}
              onEditEstimate={handleEditEstimate}
              onViewEstimate={handleViewEstimate}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerListView
              onOpenNewCustomer={handleOpenNewCustomer}
              onEditCustomer={handleEditCustomer}
              onViewInvoice={handleViewInvoice}
              onRecordPaymentForInvoice={handleRecordPaymentForInvoice}
              onCreateInvoiceForCustomer={(cust) => handleOpenNewInvoice(cust.id)}
            />
          )}

          {activeTab === 'items' && (
            <ItemListView
              onOpenNewItem={handleOpenNewItem}
              onEditItem={handleEditItem}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentListView
              onOpenNewPayment={handleOpenNewPayment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenSqlModal={() => setIsSqlModalOpen(true)}
            />
          )}

          {activeTab === 'laravel-code' && (
            <LaravelStudioView />
          )}
        </main>
      </div>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
        preselectedCustomerId={preselectedCustomerId}
        onOpenNewCustomerModal={handleOpenNewCustomer}
      />

      <InvoiceDetailModal
        isOpen={isInvoiceDetailOpen}
        invoice={selectedInvoiceForDetail}
        onClose={() => {
          setIsInvoiceDetailOpen(false);
          setSelectedInvoiceForDetail(null);
        }}
        onRecordPayment={handleRecordPaymentForInvoice}
      />

      <EstimateFormModal
        isOpen={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        estimateToEdit={estimateToEdit}
        onOpenNewCustomerModal={handleOpenNewCustomer}
      />

      <EstimateDetailModal
        isOpen={isEstimateDetailOpen}
        estimate={selectedEstimateForDetail}
        onClose={() => {
          setIsEstimateDetailOpen(false);
          setSelectedEstimateForDetail(null);
        }}
        onConvertToInvoice={handleConvertToInvoice}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        targetInvoice={targetInvoiceForPayment}
      />

      <SqlExportModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <InvoiceProvider>
      <MainAppContent />
    </InvoiceProvider>
  );
}
