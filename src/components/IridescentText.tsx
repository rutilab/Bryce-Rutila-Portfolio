'use client';

import { useRef } from 'react';
import { useCursorIriGlow } from '@/hooks/useCursorIriGlow';

type IridescentTextProps = {
  text: string;
  className?: string;
};

/**
 * Hero copy with a cursor-local BRYCE-colored wash + white sticker outline.
 * Uses a single masked overlay (not per-glyph DOM) so hover stays fluid
 * alongside the tip canvas.
 */
export function IridescentText({ text, className }: IridescentTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  useCursorIriGlow(rootRef, fxRef);

  return (
    <span
      ref={rootRef}
      className={['subheader-iri', className].filter(Boolean).join(' ')}
    >
      <span className="subheader-iri-base">{text}</span>
      <span ref={fxRef} className="subheader-iri-fx" aria-hidden>
        <span className="subheader-iri-fx-stack">
          <span className="subheader-iri-outline">{text}</span>
          <span className="subheader-iri-shine">{text}</span>
        </span>
      </span>
    </span>
  );
}
