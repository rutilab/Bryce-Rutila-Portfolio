'use client';

import { useEffect, useRef } from 'react';

/**
 * A soft pull past the bottom of the page, after Dia's footer: keep scrolling
 * once you've hit the end and the page gives a little, a stepped glow of
 * BRYCE colours rising out of the ink band, then springs back when you let go.
 *
 * The page really scrolls: a spacer under the footer grows by the pull and
 * the window is held at its new bottom, so everything above moves up together
 * and the fixed header stays put. The glow is a row of stepped columns, each
 * the same band of colours, scaled up from the bottom edge with the pull and
 * blurred into one soft ridge.
 */

const MAX = 260; // px the page can be pulled past its end
const GIVE = 0.55; // how soon the pull stiffens
const RETURN_MS = 650;
const IDLE_MS = 140; // no wheel input for this long counts as letting go
// Column heights, outside in, as a share of the tallest
const STEPS = [0.42, 0.55, 0.68, 0.84, 1, 0.84, 0.68, 0.55, 0.42];

/** Stretch in, pull out: easy at first, stiffening towards MAX */
const rubber = (s: number) => MAX * (1 - 1 / ((GIVE * s) / MAX + 1));
const unrubber = (p: number) => (MAX / GIVE) * (1 / (1 - Math.min(p, MAX - 1) / MAX) - 1);

export default function FooterOverscroll() {
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const doc = document.documentElement;
    let pull = 0;
    let stretch = 0;
    let idle = 0;
    let tween = 0;
    let touchBase: number | null = null;

    const atBottom = () => window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    const apply = (p: number) => {
      pull = p;
      spacer.style.height = `${p}px`;
      spacer.style.setProperty('--rise', (p / MAX).toFixed(4));
      if (p > 0) window.scrollTo({ top: doc.scrollHeight, behavior: 'instant' });
    };
    const cancelReturn = () => {
      cancelAnimationFrame(tween);
      tween = 0;
    };
    const springBack = () => {
      cancelReturn();
      const from = pull;
      if (!from) return;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / RETURN_MS);
        apply(from * Math.pow(1 - t, 4));
        stretch = unrubber(pull);
        tween = t < 1 ? requestAnimationFrame(step) : 0;
      };
      tween = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      // Pulling past the end, or easing back out of a pull, is ours; anything
      // else is ordinary scrolling
      if ((dy > 0 && atBottom()) || (dy < 0 && pull > 0)) {
        e.preventDefault();
        cancelReturn();
        stretch = Math.max(0, stretch + dy);
        apply(rubber(stretch));
        clearTimeout(idle);
        idle = window.setTimeout(springBack, IDLE_MS);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (touchBase === null) {
        if (!atBottom()) return;
        touchBase = y;
      }
      const dy = touchBase - y;
      if (dy <= 0 && pull === 0) {
        touchBase = null;
        return;
      }
      e.preventDefault();
      cancelReturn();
      stretch = Math.max(0, dy);
      apply(rubber(stretch));
    };
    const onTouchEnd = () => {
      touchBase = null;
      springBack();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      clearTimeout(idle);
      cancelReturn();
    };
  }, []);

  return (
    <div className="footer-overscroll" ref={spacerRef} aria-hidden="true">
      <div className="footer-overscroll-glow">
        {STEPS.map((h, i) => (
          <span key={i} style={{ '--h': h } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
