'use client';

import { useEffect, useRef, useState } from 'react';
import { AI_ASSISTANT_CSS, AI_ASSISTANT_HTML } from '@/app/case-studies/finding-focus-ai-assistant/ai-assistant-modal';

// The modal was designed at 725px wide × 520px tall.
// This component scales it to fill whatever card container it lives in:
//   - scale  = containerWidth / 725      (width always fills)
//   - height = containerHeight / scale   (height fills too, no dead space)
// The modal uses flex-direction:column with flex-grow:1 on the body and
// margin-top:auto on the footer, so stretching the container height just
// pushes the input + disclaimer to the bottom — nothing breaks.
// A box a little too short for the modal at full width (the home card on a
// phone) first tightens the modal's empty space so it can still fill the width.
// One still too short (Quick view's wide frame) scales by height instead and
// centres it, so the top is never cut off.
export function AIAssistantThumbnail() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale,       setScale]       = useState(0.44);
  const [modalHeight, setModalHeight] = useState(520);
  const [offsetX,     setOffsetX]     = useState(0);
  const [tight,       setTight]       = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const update = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w <= 0) return;
      // The modal's own content height, unforced (inline !important outranks the override)
      const modal = wrap.querySelector<HTMLElement>('.chat-container');
      const naturalHeight = (isTight: boolean) => {
        if (!modal) return 0;
        wrap.classList.toggle('ai-thumb-tight', isTight);
        modal.style.setProperty('height', 'auto', 'important');
        modal.style.setProperty('min-height', '0', 'important');
        const n = modal.offsetHeight;
        modal.style.removeProperty('height');
        modal.style.removeProperty('min-height');
        return n;
      };
      const fits = (n: number) => h <= 0 || n <= h / (w / 725);
      let natural = naturalHeight(false);
      let useTight = false;
      if (!fits(natural)) {
        const tightNatural = naturalHeight(true);
        useTight = fits(tightNatural);
        natural = useTight ? tightNatural : naturalHeight(false);
      }
      setTight(useTight);
      const s = h > 0 && natural > 0 ? Math.min(w / 725, h / natural) : w / 725;
      setScale(s);
      setOffsetX(Math.max(0, (w - 725 * s) / 2));
      if (h > 0) setModalHeight(Math.ceil(h / s));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Override the modal's height so it exactly fills the card.
  // Comes after AI_ASSISTANT_CSS so the !important wins.
  const heightCSS = `.chat-container.css-1fysqw3 {
    min-height: ${modalHeight}px !important;
    height:     ${modalHeight}px !important;
  }
  .ai-thumb-tight .css-exoci9 { padding-top: 16px; padding-bottom: 16px; }
  .ai-thumb-tight .css-jrq3u7 { margin-top: 24px; }`;

  return (
    <div
      ref={wrapRef}
      className={tight ? 'ai-thumb-tight' : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          width: '725px',
          transformOrigin: 'top left',
          marginLeft:      offsetX,
          transform: `scale(${scale})`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: AI_ASSISTANT_CSS + '\n' + heightCSS }} />
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: AI_ASSISTANT_HTML }} />
      </div>
    </div>
  );
}
