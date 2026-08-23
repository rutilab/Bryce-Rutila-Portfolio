'use client';

import { useEffect, useRef } from 'react';

/**
 * Circle that stands in for the pointer site-wide, where the OS cursor is hidden.
 * It is painted white and blended with `difference`, so it inverts what is beneath
 * it — reading black on the cream background while never hiding the content it
 * passes over.
 *
 * Mounted once in the root layout, so it covers the home page, the case studies
 * and anything added later. The rule for standing down is simple: wherever the
 * page has asked for a cursor of its own, that cursor wins and the circle hides —
 * the grab hand on the BRYCE block and the BR flies, the footer's magic wand, the
 * zoom glass over expandable case-study media. Everywhere else the page renders
 * `cursor: none` (see `body[data-magnet-cursor] *`) and the circle is the pointer.
 */
export default function MagnetCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.style.cursor = 'none';
    document.body.dataset.magnetCursor = 'true';
    return () => {
      document.body.style.cursor = '';
      delete document.body.dataset.magnetCursor;
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const labelEl = labelRef.current;
    if (!labelEl) return;

    let shown = false;
    let currentLabel: string | null = null;

    /**
     * True when the page is drawing its own pointer here.
     *
     * The topmost hit-testable element is the one whose `cursor` the browser
     * actually paints, so it is the only one worth asking. `none` means the
     * blanket rule is in force and the circle is on duty; anything else — a grab
     * hand, a zoom glass, a custom image, a plain arrow — is a deliberate choice
     * by the page and takes precedence.
     */
    const yieldsToPage = (x: number, y: number) => {
      const top = document
        .elementsFromPoint(x, y)
        .find((node): node is Element => node instanceof Element && node.tagName !== 'HTML');
      if (!top) return false;
      // an iframe runs its own cursor and swallows mousemove, which would strand
      // the circle at the frame's edge — better to hand the pointer over
      if (top.tagName === 'IFRAME') return true;
      return getComputedStyle(top).cursor !== 'none';
    };

    /**
     * The label an element under the pointer has asked the cursor to carry, if
     * any. Read from the nearest `[data-cursor-label]` ancestor of the topmost
     * element, so a whole card can claim the cursor without every child of it
     * needing the attribute.
     */
    const labelAt = (x: number, y: number) => {
      const top = document
        .elementsFromPoint(x, y)
        .find((node): node is Element => node instanceof Element && node.tagName !== 'HTML');
      return top?.closest('[data-cursor-label]')?.getAttribute('data-cursor-label') ?? null;
    };

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!shown) { shown = true; el.classList.add('is-visible'); }
      el.classList.toggle('is-hidden', yieldsToPage(e.clientX, e.clientY));

      const label = labelAt(e.clientX, e.clientY);
      // Only touch the DOM on an actual change — this runs on every mousemove.
      if (label !== currentLabel) {
        currentLabel = label;
        if (label) labelEl.textContent = label;
        el.classList.toggle('has-label', label !== null);
      }
    };

    const onLeave = () => {
      shown = false;
      currentLabel = null;
      el.classList.remove('is-visible', 'has-label');
    };
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
      <em ref={labelRef} className="magnet-cursor-label" />
    </div>
  );
}
