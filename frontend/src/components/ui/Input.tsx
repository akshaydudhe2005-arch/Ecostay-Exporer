'use client';

/**
 * @file Input.tsx
 * @description Labeled form input with auto-generated IDs and validation error slot.
 *
 * @interface InputProps
 * @property {string} label - Uppercase tracking label displayed above the field.
 * @property {string} [error] - Validation message rendered in red beneath the input when present.
 * @property {string} [id] - Optional explicit input id; auto-generated via `useId` when omitted.
 * @property {string} [className] - Additional Tailwind classes for the wrapper element.
 * @property {React.InputHTMLAttributes<HTMLInputElement>} [rest] - Native input attributes forwarded to the element.
 */

import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`.trim()}>
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2.5 text-gray-900 shadow-sm transition-colors',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
          error
            ? 'border-red-500 focus:ring-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
