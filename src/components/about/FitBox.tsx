'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Holds a fixed-geometry block (a photo deck, the CD grid) at its Figma pixel
 * size and scales the whole thing down when the column gets narrower than the
 * design. Everything inside can then be written in the design's own numbers.
 */
export function FitBox({
  designWidth,
  designHeight,
  children,
  className,
}: {
  designWidth: number;
  designHeight: number;
  children: ReactNode;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(w > 0 ? Math.min(1, w / designWidth) : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  return (
    <div ref={outer} className={className} style={{ height: designHeight * scale }}>
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
