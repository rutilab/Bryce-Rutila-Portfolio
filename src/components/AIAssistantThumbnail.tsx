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
export function AIAssistantThumbnail() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale,       setScale]       = useState(0.44);
  const [modalHeight, setModalHeight] = useState(520);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const update = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w <= 0) return;
      const s = w / 725;
      setScale(s);
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
  }`;

  return (
    <div
      ref={wrapRef}
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
