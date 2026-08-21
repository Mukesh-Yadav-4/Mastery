import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Max width class (default: max-w-md) */
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;

    // Focus the panel on open
    const timeout = setTimeout(() => {
      panelRef.current?.focus();
    }, 50);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full rounded-card bg-surface border border-edge',
          'p-6 shadow-2xl shadow-black/40',
          'animate-scale-in',
          'focus:outline-none',
          maxWidth,
        )}
      >
        {/* Header */}
        {title ? (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'text-zinc-500 hover:text-zinc-300 hover:bg-elevated',
                'transition-colors duration-150 cursor-pointer',
              )}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
