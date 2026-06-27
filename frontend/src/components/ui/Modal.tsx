'use client';

/**
 * @file Modal.tsx
 * @description Dialog overlay controlled by `isOpen` with body scroll lock and backdrop blur.
 *
 * @interface ModalProps
 * @property {boolean} isOpen - Toggles modal visibility.
 * @property {() => void} onClose - Callback fired when the user dismisses the dialog.
 * @property {string} [title] - Optional heading at the top of the panel.
 * @property {React.ReactNode} children - Dialog body content.
 * @property {string} [className] - Additional Tailwind classes for the dialog panel.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={[
          'relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl',
          'dark:border-gray-700 dark:bg-gray-800',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}
