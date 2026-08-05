'use client';

import { useCallback, useRef, useState } from 'react';

const DEFAULT_ROTATION = -5;

/** Custom 32×32 rotate cursor — hotspot at center. */
export const ROTATE_CURSOR = 'url("/cursors/rotate.png") 16 16';

/**
 * Figma-style "ideation" selection chip — blue marquee with corner handles.
 * Drag around its center to rotate; hover shows a rotate cursor and suppresses
 * the tip. While dragging, the rotate cursor stays on and the tip stays
 * suppressed even if the pointer leaves the chip.
 */
export function IdeationChip() {
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const rootRef = useRef<HTMLSpanElement>(null);
  const rotationRef = useRef(DEFAULT_ROTATION);
  rotationRef.current = rotation;

  const angleAt = useCallback((clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startAngle = angleAt(e.clientX, e.clientY);
    const startRotation = rotationRef.current;

    // Keep rotate cursor + suppress tip for the whole drag, even off-chip.
    document.body.dataset.ideationRotating = 'true';
    document.body.style.cursor = `${ROTATE_CURSOR}, grabbing`;

    const onMove = (ev: PointerEvent) => {
      const delta = angleAt(ev.clientX, ev.clientY) - startAngle;
      setRotation(startRotation + delta);
    };
    const onUp = () => {
      delete document.body.dataset.ideationRotating;
      // Home page hides the system cursor; restore that default.
      document.body.style.cursor = 'none';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <span
      ref={rootRef}
      className="subheader-ideation"
      data-suppress-halftone=""
      role="img"
      aria-label="ideation"
      onPointerDown={onPointerDown}
      style={{
        transform: `rotate(${rotation}deg)`,
        cursor: `${ROTATE_CURSOR}, grab`,
        touchAction: 'none',
      }}
    >
      <span
        className="subheader-ideation-frame"
        style={{ boxShadow: '0 2px 8px rgba(20, 21, 16, 0.14)' }}
      >
        ideation
        <span className="subheader-ideation-handle subheader-ideation-handle--tl" aria-hidden />
        <span className="subheader-ideation-handle subheader-ideation-handle--tr" aria-hidden />
        <span className="subheader-ideation-handle subheader-ideation-handle--bl" aria-hidden />
        <span className="subheader-ideation-handle subheader-ideation-handle--br" aria-hidden />
      </span>
    </span>
  );
}
