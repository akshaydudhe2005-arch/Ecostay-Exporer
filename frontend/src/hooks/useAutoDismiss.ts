'use client';

'use client';

/**
 * @file useAutoDismiss.ts
 * @description Timer hook that invokes a callback after a duration when active.
 *
 * @interface UseAutoDismissOptions
 * @property {boolean} active - Whether the auto-dismiss timer should run.
 * @property {number} duration - Milliseconds before `onDismiss` is called.
 * @property {() => void} onDismiss - Callback fired when the timer elapses.
 */

import { useEffect } from 'react';

export interface UseAutoDismissOptions {
  active: boolean;
  duration: number;
  onDismiss: () => void;
}

export function useAutoDismiss({ active, duration, onDismiss }: UseAutoDismissOptions) {
  useEffect(() => {
    if (!active || duration <= 0) return;

    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [active, duration, onDismiss]);
}
