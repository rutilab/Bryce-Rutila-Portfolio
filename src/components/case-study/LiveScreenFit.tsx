'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scales a live HTML screen down as a unit when the container is narrower than
 * `designWidth`, so fixed layouts (rating grids, stats rows, continue buttons)
 * never overflow on XS. Above the design width the content stays fluid at 100%.
 */
export function LiveScreenFit({
  children,
  designWidth = 408,
  className,
}: {
  children: ReactNode;
  /** Intrinsic layout width the screen was designed for. */
  designWidth?: number;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const measure = () => {
      const available = outer.clientWidth;
      const next = available > 0 && available < designWidth ? available / designWidth : 1;
      setScale(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={outerRef}
      className={['w-full', className].filter(Boolean).join(' ')}
    >
      <div
        ref={innerRef}
        style={
          scale < 1
            ? {
                /* zoom scales layout without creating a CSS transform containing block,
                   which would break nested SVG animations (e.g. flame transform-box: fill-box). */
                width: designWidth,
                zoom: scale,
              }
            : { width: '100%' }
        }
      >
        {children}
      </div>
    </div>
  );
}
