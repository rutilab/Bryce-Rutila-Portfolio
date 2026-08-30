'use client';

import type { CSSProperties } from 'react';

/**
 * A CD, drawn at whatever diameter the caller needs. Every dimension is a ratio
 * of the diameter, so the 164px sleeve tile and the full-screen close-up are the
 * same object at two sizes.
 *
 * Values come from the Discc brief §2–§3 and were tuned against a working iOS
 * build — they are fixed, not suggestions.
 *
 * Step 1 of the port: static. `spin` and the tilt inputs are accepted and wired
 * through the same transforms motion will use, but nothing drives them yet.
 */

// ── §3.1 Data side — the radial rainbow ────────────────────────────────────
const IRIDESCENT = [
  'rgb(42,208,202) 0%',
  'rgb(225,246,100) 22.9167%',
  'rgb(254,176,254) 46.875%',
  'rgb(171,179,252) 68.2292%',
  'rgb(93,247,164) 87.5%',
  'rgb(88,196,246) 100%',
].join(', ');

/** The same rainbow mixed 50% toward rgb(232,232,232) — §3.1 "pale variant". */
const PALE = [
  'rgb(137,220,217) 0%',
  'rgb(229,239,166) 22.9167%',
  'rgb(243,204,243) 46.875%',
  'rgb(202,206,242) 68.2292%',
  'rgb(163,240,198) 87.5%',
  'rgb(160,214,239) 100%',
].join(', ');

/** The black/white diffraction ramp, drawn twice (difference, then screen). */
const SWEEP = [
  '#FFFFFF 0.069%',
  '#000000 14.0625%',
  '#000000 14.4348%',
  '#FFFFFF 24.4792%',
  '#000000 39.5833%',
  '#FFFFFF 54.6875%',
  '#000000 71.3542%',
  '#FFFFFF 83.3333%',
  '#000000 93.1117%',
  '#000000 100%',
].join(', ');

/**
 * Skia's sweep gradient starts at 3 o'clock, CSS conic-gradient at 12 — so every
 * conic here is rotated back a quarter turn to line up with the original (§8).
 */
const CONIC_FROM = '-90deg';

const fill: CSSProperties = { position: 'absolute', inset: 0, borderRadius: '50%' };

export type DiscProps = {
  /** Album art for the printed side. */
  src: string;
  alt?: string;
  /** Diameter in px. */
  size: number;
  /** Rotation of the disc about its own axis, radians. */
  spin?: number;
  /** Normalised −1…1. */
  tiltX?: number;
  tiltY?: number;
  /** 0 = printed side, 1 = data side. Hard swap at 0.5 (§3). */
  flip?: number;
  glare?: boolean;
  glareOpacity?: number;
  shadowOpacity?: number;
  className?: string;
  style?: CSSProperties;
};

export function Disc({
  src,
  alt = '',
  size,
  spin = 0,
  tiltX = 0,
  tiltY = 0,
  flip = 0,
  glare = true,
  glareOpacity = 1,
  shadowOpacity = 1,
  className,
  style,
}: DiscProps) {
  const D = size;
  const deg = (rad: number) => `${(rad * 180) / Math.PI}deg`;

  // §5 — the diffraction bands belong to the light, not the disc: they barely
  // follow its own rotation but sweep strongly with tilt.
  const sheenAngle = tiltY * 0.85 - tiltX * 0.45 + spin * 0.05;

  // The rainbow's hot spot and the glare slide with tilt, in opposite senses on Y.
  const rainbowX = (0.4483 + tiltY * 0.13) * 100;
  const rainbowY = (0.6854 - tiltX * 0.13) * 100;
  const glareX = tiltY * 0.19 * D;
  const glareY = -tiltX * 0.19 * D;

  const showArt = flip < 0.5;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: D,
        height: D,
        // Keeps `difference` / `screen` compositing against the disc rather than
        // whatever is behind it on the page (§8).
        isolation: 'isolate',
        ...style,
      }}
    >
      {/* Body + cast shadow. The faces cover this completely, so its opacity
          only ever affects the shadow. */}
      <div
        style={{
          ...fill,
          background: '#0B0B0B',
          opacity: shadowOpacity,
          boxShadow: `${-0.01114 * D}px ${0.01114 * D}px ${0.03343 * D}px rgba(0,0,0,0.5)`,
        }}
      />

      {/* ── Printed side ── */}
      <div style={{ ...fill, overflow: 'hidden', opacity: showArt ? 1 : 0 }}>
        <img
          src={src}
          alt={alt}
          width={D}
          height={D}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            objectFit: 'cover',
            transform: `rotate(${deg(spin)})`,
          }}
        />
      </div>

      {/* ── Data side ──
             `isolation` here is what confines the two blends to this stack, so
             they composite against the rainbow and nothing else. The sheen
             rotation goes on each ramp rather than a shared wrapper: a wrapper
             transform would open its own stacking context and the ramps would
             end up blending against transparency, which drains all the colour. */}
      <div style={{ ...fill, overflow: 'hidden', isolation: 'isolate', opacity: showArt ? 0 : 1 }}>
        {/* Layer 1: radial rainbow, rotates with the disc */}
        <div
          style={{
            ...fill,
            transform: `rotate(${deg(spin)})`,
            background: `radial-gradient(ellipse 52.06% 52.06% at ${rainbowX}% ${rainbowY}%, ${IRIDESCENT})`,
          }}
        />
        {/* Layers 2 and 3: the same ramp twice, rotating with the light */}
        <div
          style={{
            ...fill,
            transform: `rotate(${deg(sheenAngle)})`,
            background: `conic-gradient(from ${CONIC_FROM}, ${SWEEP})`,
            mixBlendMode: 'difference',
          }}
        />
        <div
          style={{
            ...fill,
            transform: `rotate(${deg(sheenAngle)})`,
            background: `conic-gradient(from ${CONIC_FROM}, ${SWEEP})`,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* ── §3.2 Glare — belongs to the room, so it slides with tilt but never
             rotates with the disc. That contrast is what sells the reflection. ── */}
      {glare && (
        <div style={{ ...fill, overflow: 'hidden', opacity: glareOpacity, pointerEvents: 'none' }}>
          <div style={{ ...fill, transform: `translate(${glareX}px, ${glareY}px)` }}>
            <span
              style={{
                position: 'absolute',
                left: 0.35 * D - 0.4 * D,
                top: 0.29 * D - 0.4 * D,
                width: 0.8 * D,
                height: 0.8 * D,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.14)',
                filter: `blur(${0.1 * D}px)`,
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 0.71 * D - 0.225 * D,
                top: 0.75 * D - 0.225 * D,
                width: 0.45 * D,
                height: 0.45 * D,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.09)',
                filter: `blur(${0.11 * D}px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Polished outer edge: silver with a hint of iridescence ── */}
      <div
        style={{
          ...fill,
          transform: `rotate(${deg(sheenAngle)})`,
          opacity: 0.55,
          background: `conic-gradient(from ${CONIC_FROM}, ${PALE})`,
          // Stroke centred on r = 0.497D, width 0.0056D → a 49.42%…49.98% ring.
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, transparent 49.42%, #000 49.42%, #000 49.98%, transparent 49.98%)',
          maskImage:
            'radial-gradient(circle at 50% 50%, transparent 49.42%, #000 49.42%, #000 49.98%, transparent 49.98%)',
        }}
      />

      {/* ── Hub: pale iridescent ring, then the grey centre ── */}
      <Centered d={0.13994 * D} style={{ background: '#D2D2D2' }} />
      <Centered
        d={0.13994 * D}
        style={{
          opacity: 0.85,
          transform: `rotate(${deg(sheenAngle)})`,
          background: `conic-gradient(from ${CONIC_FROM}, ${PALE})`,
        }}
      />
      <Centered
        d={0.12828 * D}
        style={{
          background: '#4B4B4B',
          boxShadow: `inset 0 ${4 * (D / 359)}px ${6 * (D / 359)}px rgba(0,0,0,0.6)`,
        }}
      />
    </div>
  );
}

/** A circle of diameter `d`, centred on the disc. */
function Centered({ d, style }: { d: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: d,
        height: d,
        marginLeft: -d / 2,
        marginTop: -d / 2,
        borderRadius: '50%',
        ...style,
      }}
    />
  );
}
