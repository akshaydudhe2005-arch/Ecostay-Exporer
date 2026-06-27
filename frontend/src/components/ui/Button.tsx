'use client';

/**
 * @file Button.tsx
 * @description Reusable button with variant, size, and active-scale interaction.
 *
 * @typedef {'primary' | 'secondary' | 'danger'} ButtonVariant
 * `primary` = emerald, `secondary` = gray, `danger` = red.
 *
 * @typedef {'sm' | 'md' | 'lg'} ButtonSize
 * Padding and typography preset.
 *
 * @interface ButtonProps
 * @property {ButtonVariant} [variant='primary'] - Visual color variant.
 * @property {ButtonSize} [size='md'] - Size preset.
 * @property {boolean} [disabled=false] - Disables interaction and dims the button.
 * @property {React.ReactNode} children - Button label or inner content.
 * @property {string} [className] - Additional Tailwind utility classes.
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>} [rest] - Native HTML button attributes (`type`, `onClick`, etc.).
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600',
  secondary:
    'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
