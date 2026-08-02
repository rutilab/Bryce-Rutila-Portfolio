'use client';

import { useEffect, useRef, useState } from 'react';

/** Shared with Milestone / Personal Best live screens. */
const ACHIEVEMENT_SCREEN_HEIGHT = 587;
/** Prototype week screen layout width — iframe content is authored at this size. */
const STREAK_DESIGN_WIDTH = 408;

/**
 * Focus Streak achievement screen — embeds the HTML prototype's week screen
 * (`?embed=streak`) so the flaming calendar SVG/CSS animations run exactly as
 * in the interactive demo at the bottom of the case study.
 *
 * Self-scales with CSS transform (not zoom): parent `zoom` does not shrink
 * iframe documents, which caused scrollbars on narrow breakpoints.
 */
export function FocusStreakScreen() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      setScale(available > 0 && available < STREAK_DESIGN_WIDTH ? available / STREAK_DESIGN_WIDTH : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaled = scale < 1;

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden rounded-[16px]"
      style={{
        background: '#f7f8fa',
        height: scaled ? ACHIEVEMENT_SCREEN_HEIGHT * scale : ACHIEVEMENT_SCREEN_HEIGHT,
      }}
      aria-label="Focus Streak achievement screen"
    >
      <div
        style={
          scaled
            ? {
                width: STREAK_DESIGN_WIDTH,
                height: ACHIEVEMENT_SCREEN_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }
            : { width: '100%', height: ACHIEVEMENT_SCREEN_HEIGHT }
        }
      >
        <iframe
          src="/case-studies/focus-coach-achievements/session-complete-prototype.html?embed=streak"
          title="Focus Streak achievement — live prototype"
          className="block border-0"
          style={{
            width: scaled ? STREAK_DESIGN_WIDTH : '100%',
            height: ACHIEVEMENT_SCREEN_HEIGHT,
            overflow: 'hidden',
          }}
          scrolling="no"
        />
      </div>
    </div>
  );
}
