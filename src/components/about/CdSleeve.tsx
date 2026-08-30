'use client';

import { useState } from 'react';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

/**
 * Figma renders a node export against the page background, so the flat export of
 * this group arrived fully opaque — the sleeve's transparency was gone. The
 * pocket here is Figma's own SVG export instead, rendered on transparency and
 * desaturated the way its image filter does, so what sits behind it shows
 * through: the disc, then the back wash, then the card's fabric.
 */

/** Figma pads the pocket export by 12px a side to make room for its shadow. */
const PAD = 12;
const TILE = 164;
const BOX_W = TILE + PAD * 2;
const BOX_H = 186;

/** The sleeve fill, sampled from that render — the back panel is the same
 *  material at half opacity, which is a flat enough wash to do in CSS. */
const BACK_WASH = 'rgba(168, 173, 177, 0.314)';

/** Pointer travel, in px and degrees, at the very edge of a tile. */
const TILT_DEG = 7;
const DISC_DRIFT = 3;
const LIFT_PX = 6;

export function CdSleeve({
  src,
  alt,
  onOpen,
  discHidden = false,
}: {
  src: string;
  alt: string;
  onOpen?: () => void;
  /** Empties the pocket while the disc is flying in the close-up. */
  discHidden?: boolean;
}) {
  const canHover = useCanPrimaryHover();
  const [hovering, setHovering] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const active = hovering && canHover;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
    });
  };

  return (
    <div
      className="cd-tile"
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open ${alt}` : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (!onOpen) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPointer({ x: 0, y: 0 });
      }}
    >
      <div
        className="cd-tile-inner"
        style={{
          transform: [
            `translateY(${active ? -LIFT_PX : 0}px)`,
            `rotateX(${active ? -pointer.y * TILT_DEG : 0}deg)`,
            `rotateY(${active ? pointer.x * TILT_DEG : 0}deg)`,
            `scale(${active ? 1.04 : 1})`,
          ].join(' '),
        }}
      >
        <span className="cd-sleeve-back" style={{ background: BACK_WASH }} aria-hidden="true" />

        {/* The disc drifts inside the sleeve rather than with it — that offset
            between the layers is what reads as parallax. */}
        <div
          className="cd-disc-wrap"
          style={{
            transform: active
              ? `translate(${pointer.x * DISC_DRIFT}px, ${pointer.y * DISC_DRIFT}px)`
              : 'translate(0px, 0px)',
          }}
        >
          {/* Hidden via opacity, never unmounted — the close-up hands the disc
              back to this pocket and a remount would flash. */}
          <img
            className="cd-disc"
            src={src}
            alt={alt}
            width={162}
            height={162}
            draggable={false}
            style={{ opacity: discHidden ? 0 : 1 }}
          />
          <span className="cd-hole" aria-hidden="true" style={{ opacity: discHidden ? 0 : 1 }} />
        </div>

        <img
          className="cd-sleeve-front"
          src="/about/cds/sleeve-front.png"
          alt=""
          width={BOX_W}
          height={BOX_H}
          draggable={false}
        />
      </div>
    </div>
  );
}
