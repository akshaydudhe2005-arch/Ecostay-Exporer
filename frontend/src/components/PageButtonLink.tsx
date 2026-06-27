'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * @interface PageButtonLinkProps
 * @property {string} href - Destination route.
 * @property {string} label - Visible link label.
 * @property {'primary' | 'secondary'} [variant='primary'] - Button variant.
 */

export interface PageButtonLinkProps {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

export function PageButtonLink({ href, label, variant = 'primary' }: PageButtonLinkProps) {
  const router = useRouter();

  return (
    <Button variant={variant} size="md" onClick={() => router.push(href)}>
      {label}
    </Button>
  );
}
