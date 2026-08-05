'use client';

import { useEffect, useRef, useState } from 'react';
import { MilestoneHeroScreen } from '@/components/case-study';

/** Intrinsic width the screen is laid out at before scaling. */
const DESIGN_W = 520;

/**
 * Home page card thumbnail for the Focus Coach Achievements case study — renders
 * the same live Milestone hero screen used at the top of the case study, scaled
 * to fill the card.
 *
 * The Continue button is dropped (`hideContinue`) — it's not meaningful in a
 * thumbnail and dropping it brings the screen's proportions close enough to the
 * card's that filling by width leaves only a sliver of trailing whitespace to
 * crop, not any actual content.
 *
 * Uses `zoom` rather than `transform: scale` deliberately: zoom scales layout, so
 * the box collapses to its scaled size with no separate height compensation
 * needed, and it avoids creating a transform containing block, which can disturb
 * the CSS animations inside the injected mountain SVG (drifting clouds, waving
 * flag).
 */
export function MilestoneThumbnail() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const update = () => {
      const containerW = outer.clientWidth;
      if (containerW > 0) setScale(containerW / DESIGN_W);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          width: DESIGN_W,
          zoom: scale,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <MilestoneHeroScreen hideContinue />
      </div>
    </div>
  );
}
