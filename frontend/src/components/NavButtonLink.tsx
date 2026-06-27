'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * @interface NavButtonLinkProps
 * @property {string} href - Next.js route path.
 * @property {string} label - Button label text.
 * @property {'primary' | 'secondary'} [variant='primary'] - Visual style variant.
 */

export interface NavButtonLinkProps {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

export function NavButtonLink({ href, label, variant = 'primary' }: NavButtonLinkProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size="lg"
      className={variant === 'primary' ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-emerald-800/50 text-white hover:bg-emerald-800/70'}
      onClick={() => router.push(href)}
    >
      {label}
    </Button>
  );
}
