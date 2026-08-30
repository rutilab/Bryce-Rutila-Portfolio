'use client';

import { useCallback, useRef, useState } from 'react';
import { CdSleeve } from './CdSleeve';
import { DiscCloseUp, type SourceRect } from '@/components/disc/DiscCloseUp';

/** Grid positions of the four sleeves inside the 427×344 fabric card. */
const CDS = [
  { src: '/about/cds/disc-1.jpg', alt: 'CD in its sleeve', left: 40, top: 24 },
  { src: '/about/cds/disc-2.jpg', alt: 'CD in its sleeve', left: 223, top: 24 },
  { src: '/about/cds/disc-3.jpg', alt: 'CD in its sleeve', left: 40, top: 212 },
  { src: '/about/cds/disc-4.jpg', alt: 'CD in its sleeve', left: 223, top: 212 },
];

/**
 * The fabric card of CDs, and the close-up a click opens. Owns that state so the
 * About page itself can stay a server component.
 */
export function CdCard() {
  const [open, setOpen] = useState<{ index: number; from: SourceRect } | null>(null);
  const [closing, setClosing] = useState(false);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);

  const openAt = useCallback((index: number) => {
    // Measure `.cd-tile` itself: it is absolutely positioned, so the wrapper
    // holding the ref shrink-wraps to nothing.
    const el = tiles.current[index]?.querySelector<HTMLElement>('.cd-tile');
    if (!el) return;
    const r = el.getBoundingClientRect();
    // The tile is scaled by its FitBox, so take the rendered size, not 164.
    setOpen({ index, from: { x: r.left, y: r.top, size: r.width } });
    setClosing(false);
  }, []);

  const finish = useCallback(() => {
    setOpen(null);
    setClosing(false);
  }, []);

  return (
    <>
      <div
        className="relative h-[344px] w-[427px] overflow-hidden rounded-[16px]"
        style={{
          backgroundImage: 'url(/about/cd-fabric.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {CDS.map((cd, i) => (
          <div
            key={cd.src}
            ref={(el) => { tiles.current[i] = el; }}
            style={{ position: 'absolute', left: cd.left, top: cd.top }}
          >
            <CdSleeve
              src={cd.src}
              alt={cd.alt}
              onOpen={() => openAt(i)}
              discHidden={open?.index === i}
            />
          </div>
        ))}
      </div>

      {open && (
        <DiscCloseUp
          src={CDS[open.index].src}
          alt={CDS[open.index].alt}
          from={open.from}
          closing={closing}
          onClose={() => setClosing(true)}
          onClosed={finish}
        />
      )}
    </>
  );
}
