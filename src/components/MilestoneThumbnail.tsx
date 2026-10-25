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
 *
 * Phones get `transform: scale` instead, sized from the screen's measured
 * height. Safari's zoom left the screen too big for the card (the flag and
 * progress meter cut off) and confused its in-view check, so the reveal
 * paused partway and never drew the last check.
 */
export function MilestoneThumbnail() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const containerW = outer.clientWidth;
      const containerH = outer.clientHeight;
      if (containerW <= 0 || containerH <= 0) return;
      // A transform leaves layout alone, so the screen's own height is real
      const designH = touch ? inner.offsetHeight || DESIGN_H : DESIGN_H;
      setScale(Math.min(containerW / DESIGN_W, containerH / designH));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    if (touch) ro.observe(inner);
    return () => ro.disconnect();
  }, [touch]);

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
        backgroundColor: '#fafafa',
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: DESIGN_W,
          pointerEvents: 'none',
          userSelect: 'none',
          flexShrink: 0,
          ...(touch
            ? {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
              }
            : { zoom: scale }),
        }}
      >
        <MilestoneHeroScreen hideContinue />
      </div>
    </div>
  );
}
