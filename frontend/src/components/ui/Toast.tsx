'use client';

/**
 * @file Toast.tsx
 * @description Bottom-right floating notification with auto-dismiss timer support.
 *
 * @typedef {'success' | 'info' | 'error'} ToastVariant
 * Color scheme preset for the toast alert.
 *
 * @interface ToastProps
 * @property {string} message - Notification text content.
 * @property {ToastVariant} [variant='info'] - Visual theme (`success`, `error`, or `info`).
 * @property {boolean} [visible=true] - Controls toast visibility.
 * @property {number} [duration=4000] - Auto-dismiss delay in milliseconds; set to `0` to disable.
 * @property {() => void} [onDismiss] - Callback fired on manual dismiss or auto-dismiss timeout.
 * @property {string} [className] - Additional Tailwind classes for the toast container.
 */

import type { ReactNode } from 'react';
import { useAutoDismiss } from '@/hooks/useAutoDismiss';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible?: boolean;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

const variantClasses: Record<ToastVariant, string> = {
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
  info: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100',
  error:
    'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100',
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

export function Toast({
  message,
  variant = 'info',
  visible = true,
  duration = 4000,
  onDismiss,
  className = '',
}: ToastProps) {
  useAutoDismiss({
    active: visible && duration > 0 && Boolean(onDismiss),
    duration,
    onDismiss: onDismiss ?? (() => undefined),
  });

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
        'transition-all duration-300',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {variantIcons[variant]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
