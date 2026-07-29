import React from "react";

// Pure UI: renders whatever `modal` state it's given and calls `onClose`.
// No knowledge of bookings, network calls, or why it's open.
export const ConfirmationModal = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden p-8 text-center space-y-4">
        <div
          className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${
            modal.isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          {modal.isSuccess ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-serif font-bold text-stone-900 tracking-wide">{modal.title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{modal.message}</p>

        <div className="pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-md"
          >
            {modal.isSuccess ? "Awesome" : "Dismiss"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
