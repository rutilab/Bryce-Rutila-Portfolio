'use client';

import { useEffect, useRef, useState } from 'react';
import { MilestoneHeroScreen } from '@/components/case-study';

/** Intrinsic width the screen is laid out at before scaling. */
const DESIGN_W = 520;
/**
 * Intrinsic height of MilestoneHeroScreen with `hideContinue` (content-hugged,
 * compact padding, 264×210 mountain). Used so we can scale to fit the full
 * mountain→progress asset inside the card instead of cropping by width alone.
 */
const DESIGN_H = 400;

/**
 * Home page card thumbnail for the Focus Coach Achievements case study — renders
 * the same live Milestone hero screen used at the top of the case study, scaled
 * to fit entirely within the card (contain).
 *
 * The Continue button is dropped (`hideContinue`) — it's not meaningful in a
 * thumbnail. Scaling uses both axes so the 4:3 project cards don't crop the
 * progress meter on larger breakpoints.
 *
 * Uses `zoom` rather than `transform: scale` deliberately: zoom scales layout, so
 * the box collapses to its scaled size with no separate height compensation
 * needed, and it avoids creating a transform containing block, which can disturb
 * the CSS animations inside the injected mountain SVG (drifting clouds, waving
 * flag).
 */
export function MilestoneThumbnail() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const update = () => {
      const containerW = outer.clientWidth;
      const containerH = outer.clientHeight;
      if (containerW <= 0 || containerH <= 0) return;
      setScale(Math.min(containerW / DESIGN_W, containerH / DESIGN_H));
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f1f2',
      }}
    >
      <div
        style={{
          width: DESIGN_W,
          zoom: scale,
          pointerEvents: 'none',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <MilestoneHeroScreen hideContinue />
      </div>
    </div>
  );
}
