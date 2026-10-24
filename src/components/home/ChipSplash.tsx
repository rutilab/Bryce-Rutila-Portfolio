'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BRAND, GLYPH_H, GLYPH_W, INK, PAPER, layoutGlyph, type Pt } from './chipGlyphs';

/**
 * First-visit splash for the home page. It opens deep inside BR1, where BRYCE
 * is etched letter by letter into the die, then pulls back out to the full
 * page. While we're inside, the name is the only thing moving; the board only
 * starts drawing once the camera has settled (`onHandoff`), and the splash
 * gets out of the way after that (`onDone`). Any click, key, scroll or touch
 * skips it; reduced motion never sees it.
 */

type Props = { onHandoff: () => void; onDone: () => void };

const NAME = 'BRYCE';
const LETTER_GAP = 2;
const NAME_W = NAME.length * GLYPH_W + (NAME.length - 1) * LETTER_GAP; // 28 units
const NAME_H = GLYPH_H;

/** BRYCE at unit size `u` from (x0, y0), one letter after another */
function layoutName(u: number, x0: number, y0: number, start: number, stagger: number, perLetter: number) {
  return [...NAME].map((ch, i) => ({
    ch,
    color: BRAND[i],
    ...layoutGlyph(ch, u, x0 + i * (GLYPH_W + LETTER_GAP) * u, y0, start + i * stagger, perLetter),
  }));
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Anything that reads as "get on with it" skips the splash */
function useSkip(skip: () => void) {
  const ref = useRef(skip);
  useEffect(() => {
    ref.current = skip;
  });
  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      ref.current();
    };
    const opts = { passive: true } as const;
    window.addEventListener('pointerdown', go, opts);
    window.addEventListener('keydown', go);
    window.addEventListener('wheel', go, opts);
    window.addEventListener('touchmove', go, opts);
    return () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
      window.removeEventListener('wheel', go);
      window.removeEventListener('touchmove', go);
    };
  }, []);
}

function useViewport() {
  const [vp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  return vp;
}

/** BR1's body on the page, once the board has laid itself out */
function useChipRect() {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    let raf = 0;
    let tries = 0;
    const look = () => {
      const el = document.querySelector('.cb-circuit--hero .cb-chip-body');
      if (el) setRect(el.getBoundingClientRect());
      else if (tries++ < 120) raf = requestAnimationFrame(look);
    };
    look();
    return () => cancelAnimationFrame(raf);
  }, []);
  return rect;
}

export default function ChipSplash({ onHandoff, onDone }: Props) {
  const [reduced] = useState(prefersReducedMotion);

  // Nothing scrolls under the splash
  useEffect(() => {
    if (reduced) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [reduced]);

  useEffect(() => {
    if (!reduced) return;
    onHandoff();
    onDone();
  }, [reduced, onHandoff, onDone]);
  if (reduced) return null;

  return <ZoomSplash onHandoff={onHandoff} onDone={onDone} />;
}

function ZoomSplash({ onHandoff, onDone }: Props) {
  const vp = useViewport();
  const chip = useChipRect();
  const [main, setMain] = useState<HTMLElement | null>(null);
  const [fade, setFade] = useState(false);
  const raf = useRef(0);
  const doneRef = useRef(false);
  const skipRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    setMain(document.querySelector<HTMLElement>('.landing-main'));
  }, []);

  const HOLD = 1.5; // while BRYCE is etched
  const PULL = 1.7; // the pull back out to the page

  // Geometry of the dive: scale about BR1's centre, and shift so BR1 starts
  // in the middle of the screen
  const geo = chip && main
    ? (() => {
        const m = main.getBoundingClientRect();
        const ox = chip.left + chip.width / 2 - m.left;
        const oy = chip.top + chip.height / 2 - m.top;
        const dx = vp.w / 2 - (chip.left + chip.width / 2);
        const dy = vp.h / 2 - (chip.top + chip.height / 2);
        // The etched name fills about two-thirds of the screen at the start
        const s0 = Math.min((0.66 * vp.w) / (chip.width * 0.78), (0.5 * vp.h) / (chip.height * 0.4));
        return { ox, oy, dx, dy, s0, rel: { left: chip.left - m.left, top: chip.top - m.top } };
      })()
    : null;

  useLayoutEffect(() => {
    if (!geo || !main) return;
    const header = document.querySelector<HTMLElement>('.home-header');
    const { ox, oy, dx, dy, s0 } = geo;
    main.style.transformOrigin = `${ox}px ${oy}px`;
    const set = (s: number) => {
      // Shift shrinks in step with the zoom, so BR1 glides home as it settles
      const f = (s - 1) / (s0 - 1);
      main.style.transform = `translate(${(dx * f).toFixed(2)}px, ${(dy * f).toFixed(2)}px) scale(${s.toFixed(4)})`;
    };
    // BR1 shows from the start; everything else on the board holds still
    document.documentElement.classList.add('splash-zoom');
    if (header) {
      header.style.opacity = '0';
      header.style.transition = 'opacity 500ms ease';
    }
    const start = performance.now();
    const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimationFrame(raf.current);
      main.style.transform = '';
      main.style.transformOrigin = '';
      if (header) header.style.opacity = '';
      // splash-zoom stays on: taking it off would replay BR1's fade-in
      onHandoff();
      onDone();
    };
    const tick = (now: number) => {
      const el = (now - start) / 1000;
      if (el < HOLD) {
        // A slow drift back while the name is etched
        set(s0 * (1 - 0.1 * (el / HOLD)));
      } else {
        const p = Math.min(1, (el - HOLD) / PULL);
        const from = Math.log(s0 * 0.9);
        set(Math.exp(from * (1 - ease(p))));
        if (p > 0.62) setFade(true);
        if (p > 0.8 && header) header.style.opacity = '1';
        if (p >= 1) return finish();
      }
      raf.current = requestAnimationFrame(tick);
    };
    set(s0);
    raf.current = requestAnimationFrame(tick);
    skipRef.current = finish;
    return () => cancelAnimationFrame(raf.current);
    // geo is derived from chip/main, which settle once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chip, main]);

  useSkip(() => skipRef.current());

  if (!geo || !main) return <div className="splash--cover" aria-hidden="true" />;

  // The die, drawn in BR1's own pixels: a fine grid, bond pads round the rim,
  // and BRYCE etched across the middle
  const cw = chip!.width;
  const ch = chip!.height;
  const u = (cw * 0.78) / NAME_W;
  const nx = (cw - NAME_W * u) / 2;
  const ny = (ch - NAME_H * u) / 2;
  const letters = layoutName(u, nx, ny, 0.25, 0.2, 0.45);
  const t = (s: number) => `${s.toFixed(3)}s`;
  const bond: Pt[] = [];
  for (let x = 6; x <= cw - 6; x += 5) bond.push([x, 3], [x, ch - 3]);
  for (let y = 8; y <= ch - 8; y += 5) bond.push([3, y], [cw - 3, y]);

  return createPortal(
    <div
      className={`splash-die${fade ? ' is-fading' : ''}`}
      aria-hidden="true"
      style={{ left: geo.rel.left, top: geo.rel.top, width: cw, height: ch }}
    >
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`}>
        <defs>
          <pattern id="die-grid" width={2} height={2} patternUnits="userSpaceOnUse">
            <path d="M2 0H0V2" fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={0.06} />
          </pattern>
        </defs>
        <rect x={1} y={1} width={cw - 2} height={ch - 2} rx={3} fill={PAPER} />
        <rect x={1} y={1} width={cw - 2} height={ch - 2} rx={3} fill="url(#die-grid)" />
        {bond.map(([x, y], k) => (
          <rect key={k} x={x - 0.9} y={y - 0.9} width={1.8} height={1.8} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={0.12} />
        ))}
        {letters.map((L) => (
          <g key={L.ch} style={{ '--c': L.color } as React.CSSProperties}>
            {L.strokes.map((s, k) => (
              <path key={k} className="splash-stroke" d={s.d} pathLength={1} style={{ '--at': t(s.at), '--dur': t(s.dur) } as React.CSSProperties} />
            ))}
            {L.pads.map(({ p, at, free }, k) => (
              <circle key={k} className={free ? 'splash-pad' : 'splash-joint'} cx={p[0]} cy={p[1]} r={free ? 0.55 : 0.32} style={{ '--at': t(at) } as React.CSSProperties} />
            ))}
            {L.strokes.map((s, k) => (
              <circle key={`s${k}`} className="splash-signal" r={0.5} style={{ offsetPath: `path('${s.d}')`, '--at': t(s.at), '--dur': t(s.dur) } as React.CSSProperties} />
            ))}
          </g>
        ))}
      </svg>
    </div>,
    main,
  );
}
