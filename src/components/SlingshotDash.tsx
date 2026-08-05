'use client';

import { useEffect, useRef, useState } from 'react';

const FLY_SRCS = [
  '/butterflies/updated-br-fly-1.svg',
  '/butterflies/updated-br-fly-2.svg',
  '/butterflies/updated-br-fly-3.svg',
] as const;

/** Matches .sling-dash vertical padding — visual rule sits here */
const LINE_Y = 14;
/** Pull either direction this far (px) */
const MAX_PULL = 800;
const GRAVITY = 0.45;
/** Ignore releases shorter than this */
const MIN_RELEASE = 24;
/** Peak flight height (px) scales linearly with pull, then caps */
const MIN_PEAK = 90;
const MAX_PEAK = 860;
/** Reach max peak height by this pull distance */
const LAUNCH_REF_PULL = 420;

type Pull = { x: number; y: number; originX: number; src: string };
type Flight = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  src: string;
  id: number;
  /** Hang under the band when launched downward */
  below: boolean;
};

type Anchor = { left: number; right: number; top: number; width: number };

type SlingshotDashProps = {
  onActiveChange?: (active: boolean) => void;
};

/**
 * Dashed section rule you can yank like a rubber band (up or down).
 * A BR fly perches on the fold and slingshots opposite the pull on release.
 */
export function SlingshotDash({ onActiveChange }: SlingshotDashProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef<Pull | null>(null);
  const [pull, setPull] = useState<Pull | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const flyIdx = useRef(0);
  const flightId = useRef(0);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  const readAnchor = (): Anchor | null => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const r = wrap.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      top: r.top + LINE_Y,
      width: r.width,
    };
  };

  useEffect(() => {
    onActiveChangeRef.current?.(!!pull || !!flight);
  }, [pull, flight]);

  useEffect(() => {
    if (!flight) return;
    let raf = 0;
    let cur = { ...flight };
    let alive = true;

    const tick = () => {
      if (!alive) return;
      cur = {
        ...cur,
        x: cur.x + cur.vx,
        y: cur.y + cur.vy,
        vx: cur.vx * 0.995,
        vy: cur.vy + GRAVITY,
        rot: cur.rot + cur.vx * 0.85,
      };
      setFlight(cur);
      const margin = 220;
      if (
        cur.y > window.innerHeight + margin ||
        cur.y < -margin ||
        cur.x < -margin ||
        cur.x > window.innerWidth + margin
      ) {
        setFlight(null);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight?.id]);

  const measurePull = (
    clientX: number,
    clientY: number,
    originX: number,
    src: string,
    a: Anchor,
  ): Pull => {
    const x = Math.min(Math.max(clientX - a.left, 0), a.width);
    const y = Math.min(Math.max(clientY - a.top, -MAX_PULL), MAX_PULL);
    return { x, y, originX, src };
  };

  useEffect(() => {
    if (!pull) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      const prev = pullRef.current;
      const a = readAnchor();
      if (!prev || !a) return;
      setAnchor(a);
      const next = measurePull(e.clientX, e.clientY, prev.originX, prev.src, a);
      pullRef.current = next;
      setPull(next);
    };

    const onUp = () => {
      document.body.style.overflow = prevOverflow;
      const p = pullRef.current;
      const a = readAnchor();
      pullRef.current = null;
      setPull(null);
      setAnchor(null);
      if (!p || !a || Math.abs(p.y) < MIN_RELEASE) return;

      const magnitude = Math.abs(p.y);
      // Peak height tracks pull distance 1:1 up to the cap, then speed follows
      const t = Math.min(magnitude / LAUNCH_REF_PULL, 1);
      const peak = MIN_PEAK + (MAX_PEAK - MIN_PEAK) * t;
      const launch = Math.sqrt(2 * GRAVITY * peak);
      const dir = -Math.sign(p.y) || -1; // opposite the pull
      const vx = ((p.originX - p.x) / Math.max(magnitude, 1)) * launch * 0.5;
      const vy = dir * launch;
      const below = p.y < 0; // pulled up → aiming down → fly under the band

      flightId.current += 1;
      setFlight({
        id: flightId.current,
        x: a.left + p.x,
        y: a.top + p.y,
        vx,
        vy,
        rot: vx * 2,
        src: p.src,
        below,
      });
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [!!pull]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || flight) return;
    e.preventDefault();
    e.stopPropagation();
    const wrap = wrapRef.current;
    const a = readAnchor();
    if (!wrap || !a) return;
    wrap.setPointerCapture(e.pointerId);
    setAnchor(a);
    const originX = Math.min(Math.max(e.clientX - a.left, 0), a.width);
    const src = FLY_SRCS[flyIdx.current % FLY_SRCS.length];
    flyIdx.current += 1;
    const next = measurePull(e.clientX, e.clientY, originX, src, a);
    pullRef.current = next;
    setPull(next);
  };

  const pulling = !!pull && !!anchor;

  // Fixed rubber band geometry (avoids overflow clipping on long pulls)
  let rubber: {
    left: number;
    top: number;
    w: number;
    h: number;
    d: string;
    flyX: number;
    flyY: number;
  } | null = null;

  if (pulling && pull && anchor) {
    const w = anchor.width;
    // Quadratic control point chosen so the curve passes through the pull
    // point at t=0.5 (true fold) — stays curved when aiming up or down.
    const cpx = 2 * pull.x - w * 0.5;
    const cpy = 2 * pull.y;
    const pad = 8;
    const minY = Math.min(0, pull.y, cpy) - pad;
    const maxY = Math.max(0, pull.y, cpy) + pad;
    const h = Math.max(maxY - minY, 8);
    rubber = {
      left: anchor.left,
      top: anchor.top + minY,
      w,
      h,
      d: `M 0 ${-minY} Q ${cpx} ${cpy - minY} ${w} ${-minY}`,
      flyX: anchor.left + pull.x,
      flyY: anchor.top + pull.y,
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`sling-dash${pulling ? ' is-pulling' : ''}${flight ? ' is-launching' : ''}`}
      onPointerDown={onPointerDown}
    >
      <div className={`sling-dash-idle${pulling ? ' is-hidden' : ''}`} />

      {rubber && (
        <svg
          className="sling-dash-rubber is-fixed"
          width={rubber.w}
          height={rubber.h}
          viewBox={`0 0 ${rubber.w} ${rubber.h}`}
          style={{ left: rubber.left, top: rubber.top }}
          overflow="visible"
        >
          <path
            d={rubber.d}
            fill="none"
            stroke="#141510"
            strokeWidth="1.25"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {rubber && pull && (
        <img
          className={`sling-dash-fly is-perched${pull.y < 0 ? ' is-below' : ''}`}
          src={pull.src}
          alt=""
          draggable={false}
          style={{ left: rubber.flyX, top: rubber.flyY }}
        />
      )}

      {flight && (
        <img
          className={`sling-dash-fly is-airborne${flight.below ? ' is-below' : ''}`}
          src={flight.src}
          alt=""
          draggable={false}
          style={{
            left: flight.x,
            top: flight.y,
            transform: `translate(-50%, ${flight.below ? '0%' : '-100%'}) rotate(${flight.rot}deg)`,
          }}
        />
      )}
    </div>
  );
}
