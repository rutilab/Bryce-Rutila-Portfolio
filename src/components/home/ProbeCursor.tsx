'use client';

import { useEffect, useRef } from 'react';
import { getBoard, type Pt } from './boardRegistry';

/**
 * The home page's pointer: a test probe in the board's own vocabulary, a pad
 * drawn as two open rings, wired to the board.
 *
 * - A thin probe wire runs from the nearest trace to the probe, routed at 45°
 *   like the board's own lines. Each time it clips on it takes a different one
 *   of the board's parts as its connector, unless it lands on a part that's
 *   already there. It's strongest up close and lets go once the probe is too
 *   far from any trace.
 * - Near a trace the probe snaps onto the line and slides along it, and the
 *   wire disappears into the contact (the board lights the circuit itself).
 * - Over anything clickable the probe grows a touch and its centre ring
 *   closes, so it reads as ready to press.
 *
 * Like the site's dot it's drawn in white and blended with `difference`, so it
 * reads as ink on the paper and stays visible over black buttons and photos.
 * It replaces that dot while the home page is open (see
 * `body[data-probe-cursor]`), and stands down wherever the page asks for a
 * cursor of its own.
 */

const CLICKABLE = 'a, button, [role="button"], summary, label, input, select, textarea';
const SNAP = 14; // same reach the board uses to light a circuit
const REACH = 150; // the wire lets go beyond this

// The part the wire clips on with, drawn around (0, 0): ring, diamond, hex
// nut, via and solder dot, a new one each time it connects
const hex = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 3) * k + Math.PI / 6;
  return `${(3.6 * Math.cos(a)).toFixed(2)},${(3.6 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
const CLIPS = [
  <circle key="ring" r={2.75} />,
  <polygon key="diamond" points="0,-3.75 3.75,0 0,3.75 -3.75,0" />,
  <polygon key="hex" points={hex} />,
  <g key="via">
    <circle r={3.25} />
    <circle r={1.2} />
  </g>,
  <circle key="dot" className="is-solid" r={2.25} />,
];

const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

/** From a to b the way the board routes: a 45° run, then straight */
function route(a: Pt, b: Pt): Pt[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.min(Math.abs(dx), Math.abs(dy));
  return [a, [a[0] + Math.sign(dx) * d, a[1] + Math.sign(dy) * d], b];
}

/** The nearest point on any trace to p, within `max` (viewport coordinates) */
function nearestTrace(p: Pt, max: number): { at: Pt; d: number; onPart: boolean } | null {
  const board = getBoard();
  if (!board) return null;
  const r = board.svg.getBoundingClientRect();
  const q: Pt = [p[0] - r.left, p[1] - r.top];
  let best = max;
  let hit: { at: Pt; d: number; q: Pt } | null = null;
  for (const t of board.traces) {
    for (const [[ax, ay], [bx, by]] of t.segs) {
      const dx = bx - ax;
      const dy = by - ay;
      const k = Math.max(0, Math.min(1, ((q[0] - ax) * dx + (q[1] - ay) * dy) / (dx * dx + dy * dy || 1)));
      const x = ax + k * dx;
      const y = ay + k * dy;
      const d = Math.hypot(q[0] - x, q[1] - y);
      if (d < best) {
        best = d;
        hit = { at: [x + r.left, y + r.top], d, q: [x, y] };
      }
    }
  }
  if (!hit) return null;
  // Landing on (or right beside) a part the board already has: clip onto its
  // centre and let it be the connector
  const [hx, hy] = hit.q;
  const part = board.parts
    .map((pt) => ({ pt, gap: Math.hypot(pt.at[0] - hx, pt.at[1] - hy) - pt.r }))
    .filter(({ gap }) => gap <= 6)
    .sort((a, b) => a.gap - b.gap)[0]?.pt;
  if (part) return { at: [part.at[0] + r.left, part.at[1] + r.top], d: hit.d, onPart: true };
  return { at: hit.at, d: hit.d, onPart: false };
}

export default function ProbeCursor() {
  const tipRef = useRef<HTMLDivElement>(null);
  const wireRef = useRef<SVGSVGElement>(null);
  const clipRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const tip = tipRef.current;
    const wireSvg = wireRef.current;
    const clipSvg = clipRef.current;
    if (!tip || !wireSvg || !clipSvg || !window.matchMedia('(pointer: fine)').matches) return;
    document.body.dataset.probeCursor = 'true';
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wire = wireSvg.querySelector('path')!;
    const clip = clipSvg.querySelector<SVGGElement>('.probe-clip')!;
    const parts = [...clip.children] as SVGElement[];

    let pointer: Pt | null = null;
    let pos: Pt | null = null;
    let target: Pt | null = null;
    let snapped = false;
    let anchor: { at: Pt; d: number; onPart: boolean } | null = null; // where the wire is clipped on
    let connector = 0; // which part it clips on with this time
    let connected = false;
    let raf = 0;

    const set = (cls: string, on: boolean) => tip.classList.toggle(cls, on);

    const update = () => {
      if (!pointer) return;
      const p = pointer;
      const top = document
        .elementsFromPoint(p[0], p[1])
        .find((n): n is Element => n instanceof Element && n.tagName !== 'HTML');
      // The page has asked for its own cursor here: stand down, as the dot does
      const yields = !!top && (top.tagName === 'IFRAME' || getComputedStyle(top).cursor !== 'none');
      const clickable = !!top?.closest(CLICKABLE);
      const near = yields || clickable ? null : nearestTrace(p, REACH);
      snapped = !!near && near.d < SNAP;

      set('is-visible', true);
      set('is-hidden', yields);
      set('is-clickable', clickable);
      set('is-snapped', snapped);
      anchor = near && !snapped ? near : null;
      target = snapped ? near!.at : p;
    };

    const onMove = (e: MouseEvent) => {
      pointer = [e.clientX, e.clientY];
      update();
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!target) return;
      // Glide onto a trace; otherwise keep right under the pointer
      pos = !pos || still || !snapped ? target : [pos[0] + (target[0] - pos[0]) * 0.45, pos[1] + (target[1] - pos[1]) * 0.45];
      tip.style.transform = `translate3d(${pos[0]}px, ${pos[1]}px, 0)`;

      // The wire: strong up close, gone by the edge of its reach
      if (anchor && tip.classList.contains('is-visible')) {
        const strength = Math.pow(1 - anchor.d / REACH, 1.5);
        wire.setAttribute('d', toPath(route(anchor.at, pos)));
        const o = (0.15 + strength * 0.55).toFixed(3);
        wire.setAttribute('stroke-opacity', o);
        clip.setAttribute('transform', `translate(${anchor.at[0].toFixed(1)} ${anchor.at[1].toFixed(1)})`);
        const on = strength > 0.02;
        // A fresh connection gets a different connector from the last
        if (on && !connected) connector = (connector + 1 + Math.floor(Math.random() * (parts.length - 1))) % parts.length;
        connected = on;
        parts.forEach((el, k) => el.setAttribute('visibility', k === connector && !anchor!.onPart ? 'visible' : 'hidden'));
        wireSvg.classList.toggle('is-on', on);
        clipSvg.classList.toggle('is-on', on && !anchor.onPart);
      } else {
        connected = false;
        wireSvg.classList.remove('is-on');
        clipSvg.classList.remove('is-on');
      }
    };

    const onLeave = () => {
      set('is-visible', false);
      anchor = null;
    };
    const onDown = () => set('is-down', true);
    const onUp = () => set('is-down', false);

    window.addEventListener('mousemove', onMove, { passive: true });
    // The board moves under a still pointer when the page scrolls
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      delete document.body.dataset.probeCursor;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', update);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <svg ref={wireRef} className="probe-wire" aria-hidden="true">
        <path />
      </svg>
      {/* The connector sits on the trace like the board's own parts, paper
          filled with an ink outline, so it can't share the wire's inverting
          layer (which can't hold a solid fill) */}
      <svg ref={clipRef} className="probe-clip-layer" aria-hidden="true">
        <g className="probe-clip">{CLIPS}</g>
      </svg>
      <div ref={tipRef} className="probe-tip" aria-hidden="true">
        <svg width="32" height="32" viewBox="-16 -16 32 32">
          <circle className="probe-ring" r="6.5" />
          <circle className="probe-core" r="2.5" />
        </svg>
      </div>
    </>
  );
}
