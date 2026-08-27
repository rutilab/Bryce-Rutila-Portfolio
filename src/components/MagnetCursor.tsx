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
    /** Teardown for every frame we reached into. */
    const frameCleanups: (() => void)[] = [];
    const isTracked = (frame: HTMLIFrameElement) => frame.dataset.magnetTracked === '1';

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
      // A same-origin frame is tracked from the inside (see trackFrame), so the
      // circle stays on duty over it and its own document decides when to yield.
      // A cross-origin one cannot be reached, and would strand the circle at the
      // frame's edge — hand the pointer over there.
      if (top.tagName === 'IFRAME') return !isTracked(top as HTMLIFrameElement);
      return getComputedStyle(top).cursor !== 'none';
    };

    /**
     * Same rule as yieldsToPage, asked of a frame's own document.
     *
     * Inside a frame the parent's `elementsFromPoint` only ever reports the
     * frame itself, so the elements that actually set a cursor — a link, a
     * button — are invisible to it. Asking the frame's document instead keeps
     * the circle behaving over embedded content exactly as it does everywhere
     * else: it hides wherever the page has asked for a pointer of its own.
     */
    const yieldsInFrame = (doc: Document, x: number, y: number) => {
      const top = doc
        .elementsFromPoint(x, y)
        .find((node): node is Element => node instanceof Element && node.tagName !== 'HTML');
      if (!top) return false;
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

    /** Places the circle. `hidden` and `label` are decided by the caller, since
        a frame answers both questions from its own document. */
    const paint = (x: number, y: number, hidden: boolean, label: string | null) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) { shown = true; el.classList.add('is-visible'); }
      el.classList.toggle('is-hidden', hidden);

      // Only touch the DOM on an actual change — this runs on every mousemove.
      if (label !== currentLabel) {
        currentLabel = label;
        if (label) labelEl.textContent = label;
        el.classList.toggle('has-label', label !== null);
      }
    };

    const onMove = (e: MouseEvent) => {
      paint(e.clientX, e.clientY, yieldsToPage(e.clientX, e.clientY), labelAt(e.clientX, e.clientY));
    };

    const onLeave = () => {
      shown = false;
      currentLabel = null;
      el.classList.remove('is-visible', 'has-label');
    };
    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');

    /**
     * Carries the circle into same-origin frames.
     *
     * A frame swallows mousemove and paints its own cursor, so without this the
     * circle strands at the frame's edge and the OS arrow takes over — the seam
     * is obvious on the prototype embed, which fills a card the reader is meant
     * to move around inside. Relaying the frame's own mouse events out to the
     * parent, offset by where the frame sits, keeps one continuous pointer.
     *
     * The injected rule mirrors `body[data-magnet-cursor] *` rather than forcing
     * `none`: anything inside that deliberately asks for a pointer — a link, a
     * button — still wins, and the circle stands down for it exactly as it does
     * on the page around it.
     */
    const trackFrame = (frame: HTMLIFrameElement) => {
      let doc: Document | null = null;
      try {
        doc = frame.contentDocument;
      } catch {
        return; // cross-origin — nothing reachable inside
      }
      if (!doc || !doc.body || frame.dataset.magnetTracked === '1') return;
      // A freshly inserted frame reports the initial about:blank document, which
      // is thrown away the moment its real one arrives — taking the injected
      // style and the listeners with it. Wait for the load event instead.
      if (frame.src && doc.URL === 'about:blank') return;
      frame.dataset.magnetTracked = '1';

      const style = doc.createElement('style');
      style.textContent = '*, *::before, *::after { cursor: none; }';
      doc.head?.appendChild(style);

      const relay = (e: MouseEvent) => {
        const rect = frame.getBoundingClientRect();
        paint(
          rect.left + e.clientX,
          rect.top + e.clientY,
          yieldsInFrame(doc, e.clientX, e.clientY),
          null,
        );
      };
      doc.addEventListener('mousemove', relay, { passive: true });
      doc.addEventListener('mousedown', onDown, { passive: true });
      doc.addEventListener('mouseup', onUp, { passive: true });
      frameCleanups.push(() => {
        doc.removeEventListener('mousemove', relay);
        doc.removeEventListener('mousedown', onDown);
        doc.removeEventListener('mouseup', onUp);
        style.remove();
        delete frame.dataset.magnetTracked;
      });
    };

    const scanFrames = () => {
      document.querySelectorAll('iframe').forEach((frame) => {
        trackFrame(frame);
        // A frame that hasn't loaded yet has no document to reach into; catch it
        // when it does. Frames whose src is set late (lazy embeds) land here.
        frame.addEventListener('load', () => trackFrame(frame));
      });
    };

    scanFrames();
    // Frames arrive with the sections that hold them, not with the page.
    const frameObserver = new MutationObserver(scanFrames);
    frameObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      frameObserver.disconnect();
      frameCleanups.forEach((fn) => fn());
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
