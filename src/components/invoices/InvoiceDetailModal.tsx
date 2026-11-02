import React, { useEffect } from 'react';
import { Invoice } from '../../types';
import { useInvoice } from '../../context/InvoiceContext';
import { InvoicePdfTemplate } from './InvoicePdfTemplate';

interface InvoiceDetailModalProps {
  isOpen?: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen = true,
  invoice,
  onClose,
  onRecordPayment,
}) => {
  const { company } = useInvoice();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen && invoice) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, invoice, onClose]);

  if (!isOpen || !invoice) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl my-auto py-4">
        <InvoicePdfTemplate
          invoice={invoice}
          company={company}
          onClose={onClose}
          onRecordPayment={onRecordPayment}
        />
      </div>
    </div>
  );
};
