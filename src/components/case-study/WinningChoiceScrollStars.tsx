'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Three-layer star from `Stars-scroll-reveal.html`, revealed by scroll position.
 * Progress ramps from when the icon enters the viewport until it reaches the upper
 * third — so the full sequence finishes before the callout scrolls away (same 25% / 55% step thresholds).
 */
export function WinningChoiceScrollStars({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [midVisible, setMidVisible] = useState(false);
  const [backVisible, setBackVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef({ mid: false, back: false });

  const measure = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the icon top is at/below the viewport bottom (just entering); 1 when it reaches
    // ~upper third — full animation completes while the callout is still clearly in view.
    const enter = vh;
    const done = vh * 0.32;
    const span = enter - done;
    const p = span > 0 ? Math.min(Math.max((enter - rect.top) / span, 0), 1) : 1;
    const mid = p >= 0.25;
    const back = p >= 0.55;
    if (mid !== lastRef.current.mid || back !== lastRef.current.back) {
      lastRef.current = { mid, back };
      setMidVisible(mid);
      setBackVisible(back);
    }
  }, []);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    measure();
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  return (
    <div ref={rootRef} className={className} aria-hidden>
      <style>{`
        .wcs-svg { display: block; width: 100%; height: 100%; }
        .wcs-star {
          transform-box: fill-box;
          transform-origin: center center;
        }
        .wcs-star-front { opacity: 1; }
        .wcs-star-mid {
          opacity: 0;
          transform: translate(3px, 3px) scale(0.92);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wcs-star-mid.wcs-star-mid--on {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
        .wcs-star-back {
          opacity: 0;
          transform: translate(6px, 6px) scale(0.85);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wcs-star-back.wcs-star-back--on {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
      `}</style>
      <svg className="wcs-svg" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={`wcs-star wcs-star-back ${backVisible ? 'wcs-star-back--on' : ''}`}>
          <path
            d="M23.8086 6.85156C22.9546 4.79846 20.0454 4.79846 19.1914 6.85156L16.9785 12.1729C16.4745 13.3847 15.3346 14.2125 14.0264 14.3174L8.28223 14.7783C6.06559 14.956 5.16663 17.7223 6.85547 19.1689L11.2324 22.918C12.229 23.7717 12.6637 25.1112 12.3594 26.3877L11.0225 31.9941C10.5068 34.1571 12.8601 35.8661 14.7578 34.707L19.6758 31.7031C20.7957 31.0192 22.2043 31.0192 23.3242 31.7031L28.2422 34.707C30.1399 35.8661 32.4932 34.1571 31.9775 31.9941L30.6406 26.3877C30.3363 25.1112 30.771 23.7717 31.7676 22.918L36.1445 19.1689C37.8334 17.7223 36.9344 14.956 34.7178 14.7783L28.9736 14.3174C27.6654 14.2125 26.5255 13.3847 26.0215 12.1729L23.8086 6.85156Z"
            fill="#7ECE04"
            stroke="black"
          />
        </g>
        <g className={`wcs-star wcs-star-mid ${midVisible ? 'wcs-star-mid--on' : ''}`}>
          <path
            d="M26.8086 9.85156C25.9546 7.79846 23.0454 7.79846 22.1914 9.85156L19.9785 15.1729C19.4745 16.3847 18.3346 17.2125 17.0264 17.3174L11.2822 17.7783C9.06559 17.956 8.16663 20.7223 9.85547 22.1689L14.2324 25.918C15.229 26.7717 15.6637 28.1112 15.3594 29.3877L14.0225 34.9941C13.5068 37.1571 15.8601 38.8661 17.7578 37.707L22.6758 34.7031C23.7957 34.0192 25.2043 34.0192 26.3242 34.7031L31.2422 37.707C33.1399 38.8661 35.4932 37.1571 34.9775 34.9941L33.6406 29.3877C33.3363 28.1112 33.771 26.7717 34.7676 25.918L39.1445 22.1689C40.8334 20.7223 39.9344 17.956 37.7178 17.7783L31.9736 17.3174C30.6654 17.2125 29.5255 16.3847 29.0215 15.1729L26.8086 9.85156Z"
            fill="#FFB310"
            stroke="black"
          />
        </g>
        <g className="wcs-star wcs-star-front">
          <path
            d="M29.8086 12.8516C28.9546 10.7985 26.0454 10.7985 25.1914 12.8516L22.9785 18.1729C22.4745 19.3847 21.3346 20.2125 20.0264 20.3174L14.2822 20.7783C12.0656 20.956 11.1666 23.7223 12.8555 25.1689L17.2324 28.918C18.229 29.7717 18.6637 31.1112 18.3594 32.3877L17.0225 37.9941C16.5068 40.1571 18.8601 41.8661 20.7578 40.707L25.6758 37.7031C26.7957 37.0192 28.2043 37.0192 29.3242 37.7031L34.2422 40.707C36.1399 41.8661 38.4932 40.1571 37.9775 37.9941L36.6406 32.3877C36.3363 31.1112 36.771 29.7717 37.7676 28.918L42.1445 25.1689C43.8334 23.7223 42.9344 20.956 40.7178 20.7783L34.9736 20.3174C33.6654 20.2125 32.5255 19.3847 32.0215 18.1729L29.8086 12.8516Z"
            fill="#F5E704"
            stroke="black"
          />
        </g>
      </svg>
    </div>
  );
}
