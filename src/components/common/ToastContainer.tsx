import React from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useInvoice();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-500/5'
                : isError
                ? 'bg-white/95 border-rose-200 text-slate-800 shadow-rose-500/5'
                : 'bg-white/95 border-indigo-200 text-slate-800 shadow-indigo-500/5'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-600" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-indigo-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {toast.title}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
