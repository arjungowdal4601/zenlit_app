'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
}

interface ModalProps {
  open: boolean;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ModalAction[];
  onClose: () => void;
  closeLabel?: string;
}

const Modal = ({
  open,
  title,
  description,
  children,
  actions = [],
  onClose,
  closeLabel = 'Close',
}: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            {title ? <h3 className="text-base font-semibold text-white">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-gray-300">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children ? <div className="px-5 py-4 text-sm text-gray-200">{children}</div> : null}

        <div className="flex flex-col gap-2 px-5 py-4">
          {actions.map(({ label, icon, onClick, tone }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tone === 'danger'
                  ? 'bg-red-600/80 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
