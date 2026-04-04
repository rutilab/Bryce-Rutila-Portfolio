import { useEffect } from 'react';

let lockCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';

/**
 * Prevents page scroll behind overlays (lightboxes, modals) while `locked` is true.
 * Uses a ref-count so multiple simultaneous locks/unlocks stay balanced.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    if (lockCount === 0) {
      savedBodyOverflow = body.style.overflow;
      savedHtmlOverflow = html.style.overflow;
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.overflow = savedBodyOverflow;
        html.style.overflow = savedHtmlOverflow;
      }
    };
  }, [locked]);
}
