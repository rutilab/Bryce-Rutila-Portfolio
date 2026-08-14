import { useEffect } from 'react';

let lockCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';

/**
 * Prevents page scroll behind overlays (lightboxes, modals) while `locked` is true.
 * Uses a ref-count so multiple simultaneous locks/unlocks stay balanced.
 *
 * IMPORTANT: do NOT leave overflow:hidden on html/body after unlock. That shorthand forces
 * overflow-y to auto and turns body into a scroll container, which silently breaks every
 * position:sticky on the site. Always restore overflow-x to clip (see globals.css).
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
        // Belt-and-suspenders: ensure sticky-safe overflow-x after modal unlock
        body.style.overflowX = 'clip';
        html.style.overflowX = 'clip';
      }
    };
  }, [locked]);
}
