'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Same dot grid as Finding Focus hub + case studies index */
const DOT_BG: CSSProperties = {
  background: '#fcfcfc',
  backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
  backgroundSize: '8px 8px',
};

/**
 * Full-viewport light layer under nav (z-200) so iOS safe areas / status bar
 * show white + dots instead of the global dark body. Mobile-only image fade
 * reduces one-at-a-time image pop-in.
 */
export function CaseStudyRouteChrome({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    if (!mq.matches) return;

    const root = contentRef.current;
    if (!root) return;

    const reveal = (img: HTMLImageElement) => {
      if (img.dataset.csReveal === '1') return;
      img.dataset.csReveal = '1';
      const show = () => img.classList.add('case-study-img-visible');
      if (img.complete) show();
      else {
        img.addEventListener('load', show, { once: true });
        img.addEventListener('error', show, { once: true });
      }
    };

    root.querySelectorAll('img').forEach(el => reveal(el as HTMLImageElement));

    const mo = new MutationObserver(() => {
      root.querySelectorAll('img').forEach(el => reveal(el as HTMLImageElement));
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
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
