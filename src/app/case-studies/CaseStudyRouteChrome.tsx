'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Same dot grid as Finding Focus hub + case studies index */
const DOT_BG: CSSProperties = {
  background: '#fcfcfc',
  backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
  backgroundSize: '8px 8px',
};

const MOBILE_MQ = '(max-width: 639px)';

function revealImage(img: HTMLImageElement) {
  if (img.dataset.csReveal === '1') return;
  img.dataset.csReveal = '1';
  const show = () => img.classList.add('case-study-img-visible');
  if (img.complete && img.naturalWidth > 0) {
    show();
    return;
  }
  // Cached/broken complete-with-0 still need load/error; also handle already-complete GIFs.
  if (img.complete) show();
  img.addEventListener('load', show, { once: true });
  img.addEventListener('error', show, { once: true });
  // Safety: never leave assets stuck at opacity 0 if events were missed
  window.setTimeout(show, 2500);
}

/**
 * Full-viewport light layer under nav (z-200) so iOS safe areas / status bar
 * show white + dots instead of the global dark body. Mobile-only image fade
 * reduces one-at-a-time image pop-in.
 *
 * Important: reveal must re-run when crossing into ≤639px (DevTools resize /
 * rotating device). Otherwise CSS sets opacity:0 and nothing adds the visible class.
 */
export function CaseStudyRouteChrome({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = contentRef.current;
    if (!root) return;

    const mq = window.matchMedia(MOBILE_MQ);

    const revealAll = () => {
      root.querySelectorAll('img').forEach((el) => revealImage(el as HTMLImageElement));
    };

    const sync = () => {
      // Always mark visible when leaving mobile so a later resize-in starts clean.
      if (!mq.matches) {
        root.querySelectorAll('img').forEach((el) => {
          el.classList.add('case-study-img-visible');
          (el as HTMLImageElement).dataset.csReveal = '1';
        });
        return;
      }
      revealAll();
    };

    sync();
    mq.addEventListener('change', sync);

    const mo = new MutationObserver(() => {
      if (mq.matches) revealAll();
      else sync();
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mq.removeEventListener('change', sync);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={DOT_BG}
      />
      <div ref={contentRef} className="case-study-content-layer relative z-10 min-h-screen min-h-[100dvh]">
        {children}
      </div>
    </>
  );
}
