'use client';

import { useEffect, useRef, useState } from 'react';
import { BRAND, INK, PAPER, layoutGlyph } from './chipGlyphs';

const SIZE = 64;
const BODY = 7; // inset of the chip body inside its 64px box; pins fill the margin
const PINS = [0.2, 0.4, 0.6, 0.8].map((f) => BODY + (SIZE - 2 * BODY) * f);
const U = 5; // glyph unit: the letter is 20 × 30

const pinPath = PINS.map(
  (p) => `M${p} 1V${BODY}M${p} ${SIZE - BODY}V${SIZE - 1}M1 ${p}H${BODY}M${SIZE - BODY} ${p}H${SIZE - 1}`,
).join('');

const t = (s: number) => `${s.toFixed(3)}s`;

/**
 * One letter as a CPU chip, after BR1: pins on all four sides and the letter
 * cut into the die as a trace, with a signal riding each stroke from `at`.
 * When the row is hovered the body takes the chip's colour, `litAt` seconds
 * in. Nothing runs until the parent marks the row live.
 */
function WordChip({ letter, color, at, litAt, x }: { letter: string; color: string; at: number; litAt: number; x: number }) {
  const g = layoutGlyph(letter, U, (SIZE - 4 * U) / 2, (SIZE - 6 * U) / 2, at, 0.4);
  return (
    <svg
      className="word-chip"
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={letter}
      style={{ '--c': color, '--lit-at': t(litAt), left: x } as React.CSSProperties}
    >
      <path d={pinPath} fill="none" stroke={INK} strokeWidth={1.75} />
      <rect className="word-chip-body" x={BODY} y={BODY} width={SIZE - 2 * BODY} height={SIZE - 2 * BODY} rx={3} fill={PAPER} stroke={INK} strokeWidth={2} />
      <circle cx={BODY + 6} cy={BODY + 6} r={1.8} fill={INK} />
      {g.strokes.map((s, k) => (
        <path key={k} className="word-chip-stroke" d={s.d} pathLength={1} style={{ '--at': t(s.at), '--dur': t(s.dur) } as React.CSSProperties} />
      ))}
      {g.pads.map(({ p, at: pa, free }, k) => (
        <circle key={k} className={free ? 'word-chip-pad' : 'word-chip-joint'} cx={p[0]} cy={p[1]} r={free ? 2.6 : 1.5} style={{ '--at': t(pa) } as React.CSSProperties} />
      ))}
      {g.strokes.map((s, k) => (
        <circle key={`s${k}`} className="word-chip-signal" r={2.2} style={{ offsetPath: `path('${s.d}')`, '--at': t(s.at), '--dur': t(s.dur) } as React.CSSProperties} />
      ))}
    </svg>
  );
}

const GAP = 4;
const STRIDE = SIZE + GAP;
const SLIDE = 0.5; // the chips glide together first
const ETCH = 0.15; // then each letter etches in, W to S
const HOP = 0.18; // on hover, the connection runs chip to chip

/**
 * WORDS, for the endorsements heading. When it scrolls into view the chips
 * glide together and each letter etches into its die. Hovering closes the
 * circuit: wires draw across from W to S, then colour sweeps along the row.
 * Leaving lets it go dark again. On touch, a tap does what hover does.
 */
export function WordChips({ word = 'WORDS' }: { word?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setLive(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const n = word.length;
  const etchAt = (i: number) => SLIDE + i * ETCH;
  const wireAt = (i: number) => i * HOP;
  const connected = wireAt(n - 2) + 0.2;
  const middle = (n - 1) / 2;

  return (
    <span
      ref={ref}
      className={`word-chips${live ? ' is-live' : ''}${hot ? ' is-hot' : ''}`}
      style={{ width: n * SIZE + (n - 1) * GAP, height: SIZE }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHot(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHot(false)}
      onPointerDown={(e) => e.pointerType !== 'mouse' && setHot((h) => !h)}
    >
      <svg className="word-chips-wires" width={n * STRIDE} height={SIZE} aria-hidden="true">
        {[...Array(n - 1)].map((_, i) =>
          PINS.map((y, k) => (
            <path
              key={`${i}-${k}`}
              className="word-chips-wire"
              d={`M${i * STRIDE + SIZE - BODY} ${y}H${(i + 1) * STRIDE + BODY}`}
              pathLength={1}
              style={{ '--at': t(wireAt(i) + k * 0.03), '--dur': t(0.15) } as React.CSSProperties}
            />
          )),
        )}
      </svg>
      {[...word].map((ch, i) => (
        <span key={i} className="word-chips-slot" style={{ '--spread': `${(i - middle) * 14}px` } as React.CSSProperties}>
          <WordChip letter={ch} color={BRAND[i % BRAND.length]} at={etchAt(i)} litAt={connected + i * 0.07} x={i * STRIDE} />
        </span>
      ))}
    </span>
  );
}
