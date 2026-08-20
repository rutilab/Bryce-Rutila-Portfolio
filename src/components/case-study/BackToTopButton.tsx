'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Clear of the footer's top edge when the button parks above it. */
const FOOTER_GAP = 24;
/** Resting distance from the bottom of the viewport. */
const BASE_BOTTOM = 24;

/**
 * Floating return to the top of a case study.
 *
 * Rides with the right-hand section rail: it appears on the same signal — the
 * hero has left the screen — so the two page-navigation affordances arrive
 * together. Where the rail stands down at the footer, this one parks: it stops
 * above the footer's top edge rather than floating over the caterpillar scene.
 *
 * Mounted once for every case-study route. `#section-intro` is what marks a page
 * as a case study with a hero to return to, so the button simply never appears
 * on the routes that have none (the index, personal projects).
 */
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.getElementById('section-intro');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  /**
   * Park above the footer.
   *
   * Written straight to the node instead of through state: the offset has to
   * land in the same frame as the scroll that caused it. Going through React
   * costs a render before the paint, and *any* easing on the property is worse
   * still — the button lags into the footer and then snaps back out, which is
   * exactly the jump this avoids. Hence a transform (composited, no layout) with
   * no transition on it, leaving the button's own transform free for the entrance
   * and hover states.
   */
  useEffect(() => {
    const el = anchorRef.current;
    const footer = document.querySelector('.landing-footer');
    if (!el || !footer) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      // How far the footer's top edge has risen past the button's resting place
      const overlap = window.innerHeight - footer.getBoundingClientRect().top - BASE_BOTTOM + FOOTER_GAP;
      el.style.transform = overlap > 0 ? `translate3d(0, ${-Math.round(overlap)}px, 0)` : '';
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const toTop = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  return (
    <div ref={anchorRef} className="cs-back-to-top-anchor">
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        className="cs-back-to-top"
        data-visible={visible}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="cs-back-to-top-arrow">
          <path
            d="M9 15V3M9 3L3.5 8.5M9 3l5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
