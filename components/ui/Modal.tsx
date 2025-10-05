import { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  if (!open) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`noise-overlay relative w-[min(92vw,720px)] rounded-lg border border-grit-500/30 bg-ink-800 shadow-2xl ${className}`}
      >
        {title && (
          <header className="flex items-center justify-between border-b border-grit-500/30 px-4 py-3">
            <h2 className="brand-heading m-0 text-lg text-bone-100">{title}</h2>
            <button
              className="brand-heading rounded border border-grit-500/50 px-2 py-1 text-sm text-grit-300 hover:bg-white/5 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </header>
        )}
        <div className="p-4 md:p-5 text-bone-100">{children}</div>
      </div>
    </div>
  );
}
