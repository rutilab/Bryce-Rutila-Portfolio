'use client';

import { useEffect, useRef } from 'react';

/**
 * Circle that stands in for the pointer on the home page, where the OS cursor is
 * hidden. It is painted white and blended with `difference`, so it inverts what
 * is beneath it — reading black on the cream background while never hiding the
 * content it passes over.
 *
 * Anything the page marks as draggable (the BRYCE block, the BR flies, the sling
 * dash, the ideation chip) keeps its own grab hand; the circle steps aside there
 * rather than drawing two cursors at once.
 */

/** The page is already drawing a pointer here — a grab hand or a custom image */
function pageDrawsItsOwnCursor(cursor: string) {
  return (
    cursor.includes('url(') ||
    cursor === 'grab' ||
    cursor === 'grabbing' ||
    cursor === 'move'
  );
}

export default function MagnetCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let shown = false;

    /** True when something under the pointer is showing a grab hand of its own */
    const yieldsToPage = (x: number, y: number) => {
      for (const node of document.elementsFromPoint(x, y)) {
        if (!(node instanceof Element)) continue;
        if (pageDrawsItsOwnCursor(getComputedStyle(node).cursor)) return true;
      }
      return false;
    };

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!shown) { shown = true; el.classList.add('is-visible'); }
      el.classList.toggle('is-hidden', yieldsToPage(e.clientX, e.clientY));
    };

    const onLeave = () => { shown = false; el.classList.remove('is-visible'); };
    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="magnet-cursor" aria-hidden="true">
      <span />
    </div>
  );
}
