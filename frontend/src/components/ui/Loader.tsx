/**
 * @file Loader.tsx
 * @description Emerald animated spinner with optional centered status label.
 *
 * @typedef {'sm' | 'md' | 'lg'} LoaderSize
 * Spinner diameter preset.
 *
 * @interface LoaderProps
 * @property {string} [label] - Optional metadata status text centered below the spinner.
 * @property {LoaderSize} [size='md'] - Spinner size preset.
 * @property {string} [className] - Additional Tailwind classes for the wrapper.
 */

export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
  label?: string;
  size?: LoaderSize;
  className?: string;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

export function Loader({ label, size = 'md', className = '' }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}
    >
      <div
        className={[
          'animate-spin rounded-full border-emerald-600 border-t-transparent dark:border-emerald-400',
          sizeClasses[size],
        ].join(' ')}
        aria-hidden="true"
      />
      {label && (
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
      )}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </div>
  );
}
