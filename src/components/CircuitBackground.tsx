'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { offsetPolyline, setBoard } from './home/boardRegistry';

/**
 * Circuit-board backdrop for the home page frame.
 *
 * Two layers of board, after the III Points poster:
 *
 * - The hero board treats the headline as the part everything is soldered to.
 *   Three-line buses run along its top and bottom edges, tap down into it with
 *   pads, and wire it to a little BR1 chip on its right. It sits darker than the
 *   rest of the page because it's meant to be seen.
 * - Below the hero, traces come in off the frame edge and route around the
 *   cards — into the gaps between sections and down the side gutters — with
 *   the same parts vocabulary: rings, vias, hex nuts, diamonds, banded
 *   resistors, arrowheads, and pads where a trace meets a card.
 *
 * Ink at rest; on hover a trace's parts pick up a BRYCE fill with the same
 * black outline. Hover is hit-tested against the geometry because the content
 * sits on top and would swallow DOM events.
 */

const BRAND = ['#12B4FF', '#FF12F7', '#31E300', '#FF9C12', '#FFF712'] as const;

// Same two marks as the eyebrow icons, drawn in a 16×16 box
const BURST_OUTER =
  'M8 0L9.16938 5.17688L13.6569 2.34315L10.8231 6.83062L16 8L10.8231 9.16938L13.6569 13.6569L9.16938 10.8231L8 16L6.83062 10.8231L2.34315 13.6569L5.17688 9.16938L0 8L5.17688 6.83062L2.34315 2.34315L6.83062 5.17688L8 0Z';
const BURST_INNER =
  'M8 4L8.58469 6.58844L10.8284 5.17157L9.41156 7.41531L12 8L9.41156 8.58469L10.8284 10.8284L8.58469 9.41156L8 12L7.41531 9.41156L5.17157 10.8284L6.58844 8.58469L4 8L6.58844 7.41531L5.17157 5.17157L7.41531 6.58844L8 4Z';
const SPARK_OUTER = 'M8 0L10.1607 5.83927L16 8L10.1607 10.1607L8 16L5.83927 10.1607L0 8L5.83927 5.83927L8 0Z';
const SPARK_INNER = 'M8 4L9.08036 6.91964L12 8L9.08036 9.08036L8 12L6.91964 9.08036L4 8L6.91964 6.91964L8 4Z';

type Pt = [number, number];
type NodeKind = 'ring' | 'dot' | 'square' | 'hex' | 'diamond' | 'via' | 'arrow' | 'pad';
/** Every part lights up on its own now and then: in `color` (its circuit's, unless set), once every `dur` seconds */
type Twinkle = { color?: string; dur: number; delay: number };
type CNode = { x: number; y: number; kind: NodeKind; r: number; angle?: number; twinkle?: Twinkle };
type Part = { x: number; y: number; vertical?: boolean; twinkle?: Twinkle }; // banded resistor, centred on its run
/** `feet`: where each pin ends, for its solder pad */
type Chip = { x: number; y: number; w: number; h: number; pins: string; feet: Pt[]; label: string };
type Circuit = {
  id: number;
  color: string;
  traces: { d: string; thin?: boolean }[];
  nodes: CNode[];
  parts: Part[];
  chip?: Chip;
  segs: [Pt, Pt][];
  /** The path the travelling dot runs, start to end */
  pulsePts: Pt[];
  pulseDur: number;
  pulseDelay: number;
  hero?: boolean;
};
type Star = { id: number; x: number; y: number; size: number; kind: 'burst' | 'spark'; color: string; dur: number; delay: number };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
const toSegs = (pts: Pt[]) => pts.slice(1).map((p, i) => [pts[i], p] as [Pt, Pt]);

function distToSeg([px, py]: Pt, [[ax, ay], [bx, by]]: [Pt, Pt]) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** A polyline shifted sideways by `d`, mitred at the corners so 45° runs stay parallel */

/** Cuts a polyline down to a fraction of its length */
function trimPolyline(pts: Pt[], frac: number): Pt[] {
  const lens = toSegs(pts).map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  let left = lens.reduce((s, l) => s + l, 0) * frac;
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left <= lens[i]) {
      const t = left / (lens[i] || 1);
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
      return out;
    }
    left -= lens[i];
    out.push(pts[i + 1]);
  }
  return out;
}

const angleOf = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]);

/** Page content the board routes around, in the frame's own coordinates */
type Rect = { x0: number; y0: number; x1: number; y1: number };
const SOLID =
  '.home-hero > *, .home-section > .iri-eyebrow, .work-card, .home-about-grid, .endorsements-heading-wrap, .endorsements-section > :not(.endorsements-grid), .endorsement-card';
const CLEARANCE = 14;

/** `starry`: bands of the page (top, bottom) that get extra stars */
type Layout = { w: number; h: number; solid: Rect[]; text: Rect | null; heroBottom: number; starry: [number, number][] };

function measure(frame: HTMLElement): Omit<Layout, 'w' | 'h'> {
  const f = frame.getBoundingClientRect();
  const rel = (r: DOMRect, pad = 0): Rect => ({
    x0: r.left - f.left - pad,
    y0: r.top - f.top - pad,
    x1: r.right - f.left + pad,
    y1: r.bottom - f.top + pad,
  });
  const solid = [...frame.querySelectorAll<HTMLElement>(SOLID)]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => rel(r, CLEARANCE));
  const parts = [...frame.querySelectorAll<HTMLElement>('.home-hero-title, .home-hero-desc')].map((el) => rel(el.getBoundingClientRect()));
  const text = parts.length
    ? parts.reduce((u, r) => ({ x0: Math.min(u.x0, r.x0), y0: Math.min(u.y0, r.y0), x1: Math.max(u.x1, r.x1), y1: Math.max(u.y1, r.y1) }))
    : null;
  const hero = frame.querySelector<HTMLElement>('.home-hero');
  const heroBottom = hero ? rel(hero.getBoundingClientRect()).y1 : 0;
  // The hero, and About through Endorsements, get a few more stars
  const about = frame.querySelector<HTMLElement>('.home-about-grid')?.closest('section');
  const ends = frame.querySelector<HTMLElement>('.endorsements-section');
  const starry: [number, number][] = [[0, heroBottom]];
  if (about && ends) starry.push([rel(about.getBoundingClientRect()).y0, rel(ends.getBoundingClientRect()).y1]);
  return { solid, text, heroBottom, starry };
}

const inRect = ([x, y]: Pt, r: Rect) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1;
const boxHits = (pts: Pt[], r: Rect) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return Math.min(...xs) < r.x1 && Math.max(...xs) > r.x0 && Math.min(...ys) < r.y1 && Math.max(...ys) > r.y0;
};

/**
 * The hero board: the headline block T is the part, buses run along its top
 * and bottom, pads tap into it, and a BR1 chip wires it all together.
 *
 * Wide frames put BR1 beside the copy. Narrower ones (anything under ~990px)
 * don't have the room, so BR1 drops below the copy at the right: the top bus
 * turns down the right gutter and into its top pins, and the bottom bus leaves
 * its left pins and sweeps up to run under the copy. Either way the copy is
 * boxed in on three sides, which is what makes it read as part of the board.
 */
function heroBoard(w: number, T: Rect, startId: number): Circuit[] {
  const out: Circuit[] = [];
  let id = startId;
  const add = (c: Omit<Circuit, 'id' | 'hero' | 'pulseDur' | 'pulseDelay' | 'segs'>, lines: Pt[][], dur = 6) => {
    out.push({ ...c, id: id++, hero: true, segs: lines.flatMap(toSegs), pulseDur: dur, pulseDelay: -(id * 1.7) % dur });
  };

  const wide = w - T.x1 >= 200;
  const MARGIN = 64; // buses stay this far off the copy
  const TAP_GAP = 24; // pads stop this far short of it
  const PIN = 8;
  const s = 10; // chamfer
  const span = T.x1 - T.x0;
  const ARROW_IN = 16; // arrowheads sit in from the edge so their tips aren't clipped

  // BR1's box and pins for whichever layout this is
  const cw = wide ? 88 : 64;
  const ch = wide ? 64 : 44;
  const cx0 = wide ? Math.round(T.x1 + (w - T.x1 - cw) / 2) : w - 40 - cw;
  // Compact: the top bus's diagonals land just above BR1, starting no higher
  // than the margin line under the copy
  const landY = T.y1 + MARGIN + 70;
  const cy0 = wide ? Math.round((T.y0 + T.y1) / 2 - ch / 2) : landY + PIN + 8;
  const pinX = (wide ? [22, 44, 66] : [16, 32, 48]).map((o) => cx0 + o);
  const pinY = (wide ? [16, 32, 48] : [12, 22, 32]).map((o) => cy0 + o);

  // ── Top bus: three lines along the headline's top edge, the outer one
  // wrapping widest so they nest
  const topY = (k: number) => Math.max(10, T.y0 - MARGIN - 16) + k * 8;
  const top = [0, 1, 2].map((k): Pt[] => {
    const y = topY(k);
    const px = pinX[2 - k];
    if (wide) return [[0, y], [px - s, y], [px, y + s], [px, cy0 - PIN]];
    // Down the right gutter, then a 45° jog onto BR1's top pins
    const gx = w - 6 - 6 * k;
    return [[0, y], [gx - s, y], [gx, y + s], [gx, landY - (gx - px)], [px, landY], [px, cy0 - PIN]];
  });
  // Taps end in pads at least TAP_GAP off the copy, some stopping a little
  // shorter so they don't read as a ruled line
  const TAP_R = 4;
  const topTaps = [0.14, 0.55].map((f, k): Pt[] => {
    const x = T.x0 + span * f;
    return [[x, topY(2)], [x, T.y0 - TAP_GAP - TAP_R - [7, 0][k]]];
  });
  // Every so often a tap's pad lights up on its own, each on a slow loop of its own
  const tapGlow = (k: number) => ({ color: BRAND[[2, 4, 3, 0][k]], dur: [13, 17, 19, 23][k], delay: -[2, 9, 5, 14][k] });
  add(
    {
      color: BRAND[0],
      traces: [...top.map((d) => ({ d: toPath(d) })), ...topTaps.map((d) => ({ d: toPath(d), thin: true }))],
      nodes: [
        // The top bus flows in towards BR1, so its arrow points that way
        { x: ARROW_IN, y: topY(1), kind: 'arrow', r: 6, angle: 0 },
        { x: 52, y: topY(0), kind: 'via', r: 4.5 },
        { x: T.x0 + span * 0.8, y: topY(0), kind: 'diamond', r: 5 },
        ...topTaps.map((t, k) => ({ x: t[1][0], y: t[1][1], kind: 'ring' as const, r: TAP_R, twinkle: tapGlow(k) })),
      ],
      parts: [{ x: T.x0 + span * 0.34, y: topY(1) }],
      pulsePts: top[1],
    },
    [...top, ...topTaps],
  );

  // ── Bottom bus: back out of BR1 and along under the copy to the left edge,
  // with a hex nut hanging off the outer line
  const botY = (k: number) => T.y1 + MARGIN + k * 8;
  const bot = [0, 1, 2].map((k): Pt[] => {
    const y = botY(k);
    if (wide) {
      const px = pinX[k];
      return [[px, cy0 + ch + PIN], [px, y - s], [px - s, y], [0, y]];
    }
    // Out of BR1's left pins, then a long 45° climb to the margin line
    const py = pinY[k];
    const x = cx0 - PIN - 10 - 14 * k;
    return [[cx0 - PIN, py], [x, py], [x - (py - y), y], [0, y]];
  });
  // How far left each line runs flat under the copy, so parts land on it
  const flatEnd = (k: number) => bot[k][bot[k].length - 2][0];
  const along = (k: number, f: number) => Math.min(T.x0 + span * f, flatEnd(k) - 24);
  const botTaps = [0.06, 0.62]
    .map((f) => T.x0 + span * f)
    .filter((x) => x < flatEnd(0) - 16)
    .map((x, k): Pt[] => [[x, botY(0)], [x, T.y1 + TAP_GAP + TAP_R + [0, 9][k]]]);
  const hexX = along(2, 0.24);
  const hang: Pt[] = [[hexX, botY(2)], [hexX, botY(2) + 16]];
  add(
    {
      color: BRAND[1],
      traces: [...bot.map((d) => ({ d: toPath(d) })), ...[...botTaps, hang].map((d) => ({ d: toPath(d), thin: true }))],
      nodes: [
        { x: ARROW_IN, y: botY(1), kind: 'arrow', r: 6, angle: Math.PI },
        { x: hexX, y: botY(2) + 22, kind: 'hex', r: 6.5 },
        { x: along(1, 0.82), y: botY(1), kind: 'diamond', r: 5 },
        { x: along(0, 0.46), y: botY(0), kind: 'via', r: 4.5 },
        ...botTaps.map((t, k) => ({ x: t[1][0], y: t[1][1], kind: 'ring' as const, r: TAP_R, twinkle: tapGlow(k + 2) })),
      ],
      parts: [{ x: along(2, 0.66), y: botY(2) }],
      pulsePts: bot[1],
    },
    [...bot, ...botTaps, hang],
    7,
  );

  // ── Wide only: BR1's left pins wire it to the copy, ending in pads at its edge
  if (wide) {
    const xe = T.x1 + TAP_GAP + 3.5; // pad edge, not centre, sits TAP_GAP off
    // Staggered ends so the three pads don't stack into one blob
    const left = pinY.map((y, k): Pt[] => [[cx0 - PIN, y], [xe + [0, 16, 4][k], y]]);
    add(
      {
        color: BRAND[2],
        traces: left.map((d) => ({ d: toPath(d) })),
        nodes: left.map((d) => ({ x: d[d.length - 1][0], y: d[d.length - 1][1], kind: 'pad' as const, r: 3 })),
        parts: [],
        pulsePts: [...left[2]].reverse(),
      },
      left,
      4,
    );
  }

  // ── Right pins run off the board, one with an arrowhead pointing out
  const xr = cx0 + cw + PIN;
  const right: Pt[][] = wide
    ? [
        [[xr, pinY[0]], [w - 18, pinY[0]], [w - 4, pinY[0] - 14]],
        [[xr, pinY[1]], [w, pinY[1]]],
        [[xr, pinY[2]], [w - 26, pinY[2]], [w - 8, pinY[2] + 18]],
      ]
    : pinY.map((y): Pt[] => [[xr, y], [w, y]]);
  add(
    {
      color: BRAND[3],
      traces: right.map((d) => ({ d: toPath(d) })),
      nodes: wide
        ? [
            { x: w - ARROW_IN, y: pinY[1], kind: 'arrow', r: 6, angle: 0 },
            { x: w - 4, y: pinY[0] - 14, kind: 'dot', r: 3 },
            { x: w - 8, y: pinY[2] + 18, kind: 'ring', r: 4.5 },
          ]
        : [{ x: w - 12, y: pinY[1], kind: 'arrow', r: 5, angle: 0 }],
      parts: [],
      pulsePts: right[1],
    },
    right,
    4,
  );

  // ── BR1 itself. Hovering it lights the whole hero board.
  const pins = [
    ...pinX.map((x) => `M${x} ${cy0}V${cy0 - PIN}` + (wide ? `M${x} ${cy0 + ch}V${cy0 + ch + PIN}` : '')),
    ...pinY.map((y) => `M${cx0} ${y}H${cx0 - PIN}M${cx0 + cw} ${y}H${cx0 + cw + PIN}`),
  ].join('');
  const feet: Pt[] = [
    ...pinX.flatMap((x): Pt[] => (wide ? [[x, cy0 - PIN], [x, cy0 + ch + PIN]] : [[x, cy0 - PIN]])),
    ...pinY.flatMap((y): Pt[] => [[cx0 - PIN, y], [cx0 + cw + PIN, y]]),
  ];
  const outline: Pt[] = [[cx0, cy0], [cx0 + cw, cy0], [cx0 + cw, cy0 + ch], [cx0, cy0 + ch], [cx0, cy0]];
  out.push({
    id: id++,
    hero: true,
    color: BRAND[4],
    traces: [],
    nodes: [],
    parts: [],
    chip: { x: cx0, y: cy0, w: cw, h: ch, pins, feet, label: 'BR1' },
    segs: [...toSegs(outline), [[cx0, cy0], [cx0 + cw, cy0 + ch]], [[cx0 + cw, cy0], [cx0, cy0 + ch]]],
    pulsePts: [],
    pulseDur: 0,
    pulseDelay: 0,
  });

  return out;
}

function generate({ w, h, solid: measured, text, heroBottom, starry }: Layout) {
  const rand = rng(9000);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (a: number, b: number) => a + rand() * (b - a);

  const circuits: Circuit[] = text ? heroBoard(w, text, 0) : [];
  // Everything else keeps out of the hero, which has its own board
  const solid = heroBottom ? [...measured, { x0: -1e4, y0: -1e4, x1: 1e4, y1: heroBottom }] : measured;
  const blocked = (pts: Pt[]) => solid.some((r) => boxHits(pts, r));

  // How far a trace can run in from one border through the band [y0, y1]
  // before it meets content
  const freeReach = (side: 1 | -1, y0: number, y1: number) =>
    solid
      .filter((r) => r.y0 < y1 && r.y1 > y0)
      .reduce((m, r) => Math.min(m, side === 1 ? r.x0 : w - r.x1), w * 0.5);

  const reachMax = Math.min(w * (w < 640 ? 0.42 : 0.36), 340);
  const kinds: NodeKind[] = ['ring', 'dot', 'square', 'hex', 'diamond', 'via'];
  const lastY = { 1: -Infinity, [-1]: -Infinity } as Record<1 | -1, number>;

  let y = heroBottom + 20;
  while (y < h - 40) {
    // Take whichever border has room here, preferring the one used less recently
    const order: (1 | -1)[] = lastY[1] <= lastY[-1] ? [1, -1] : [-1, 1];
    const side = order.find((sd) => y - lastY[sd] > 150 && freeReach(sd, y - 30, y + 30) >= 70);
    if (!side) {
      y += 24;
      continue;
    }
    lastY[side] = y;

    const x0 = side === 1 ? 0 : w;
    const X = (d: number) => x0 + side * d; // distance in from the border → x
    const room = freeReach(side, y - 30, y + 30);
    const reach = Math.min(reachMax, room) * between(0.8, 1);

    // Trunk: run, chamfer, run, (chamfer, run). Short ones stay straight.
    const pts: Pt[] = [[X(0), y]];
    let d = between(Math.min(28, reach * 0.3), Math.min(80, reach * 0.4));
    let cy = y;
    pts.push([X(d), cy]);
    const steps = reach < 110 ? 0 : rand() < 0.55 ? 2 : 1;
    for (let s = 0; s < steps; s++) {
      let step = between(12, 22) * (rand() < 0.5 ? -1 : 1);
      if (Math.abs(cy + step - y) > 20) step = -step; // stay inside the band freeReach checked
      d += Math.abs(step);
      cy += step;
      pts.push([X(d), cy]);
      d = s === steps - 1 ? reach : d + between(30, Math.max(31, (reach - d) * 0.6));
      pts.push([X(d), cy]);
    }
    if (steps === 0) {
      d = reach;
      pts.push([X(d), cy]);
    }

    const segs = toSegs(pts);
    const end = pts[pts.length - 1];
    const endKind = pick(['ring', 'ring', 'arrow', 'via'] as const);
    const nodes: CNode[] = [{ x: end[0], y: end[1], kind: endKind, r: endKind === 'arrow' ? 6 : 5.5, angle: angleOf(pts[pts.length - 2], end) }];
    const parts: Part[] = [];
    const traces: Circuit['traces'] = [{ d: toPath(pts) }];

    // A second line riding alongside, cut short, so most runs read as a bus
    if (reach > 120) {
      const twin = trimPolyline(offsetPolyline(pts, 7 * (rand() < 0.5 ? 1 : -1)), between(0.55, 0.8));
      if (!blocked(twin.slice(1))) {
        traces.push({ d: toPath(twin), thin: true });
        segs.push(...toSegs(twin));
        const t = twin[twin.length - 1];
        nodes.push({ x: t[0], y: t[1], kind: 'dot', r: 2.5 });
      }
    }

    // Stubs off the horizontal runs, alternating above and below; any that
    // would poke into content are dropped
    const horizontal = toSegs(pts).filter(([a, b]) => a[1] === b[1] && Math.abs(b[0] - a[0]) > 40);
    const nBranches = horizontal.length ? 2 + Math.floor(rand() * 2) : 0;
    for (let b = 0; b < nBranches; b++) {
      const [a, z] = pick(horizontal);
      const t = between(0.25, 0.8);
      const bx = a[0] + (z[0] - a[0]) * t;
      const by = a[1];
      const dir = b % 2 === 0 ? -1 : 1;
      const len = between(20, 46);
      const bp: Pt[] = [[bx, by], [bx, by + dir * len]];
      if (rand() < 0.4) {
        const k = between(10, 18);
        bp.push([bx + side * k, by + dir * (len + k)]);
      }
      if (blocked(bp.slice(1))) continue;
      const e = bp[bp.length - 1];
      traces.push({ d: toPath(bp), thin: true });
      segs.push(...toSegs(bp));
      const kind = pick(kinds);
      nodes.push({ x: e[0], y: e[1], kind, r: kind === 'dot' ? 3.5 : kind === 'hex' ? 6 : 5 });
    }

    // One banded resistor on the longest run
    const longest = horizontal.reduce<[Pt, Pt] | null>(
      (m, s) => (!m || Math.abs(s[1][0] - s[0][0]) > Math.abs(m[1][0] - m[0][0]) ? s : m),
      null,
    );
    if (longest && Math.abs(longest[1][0] - longest[0][0]) > 60 && rand() < 0.75) {
      const px = (longest[0][0] + longest[1][0]) / 2;
      parts.push({ x: px, y: longest[0][1] });
    }

    circuits.push({
      id: circuits.length,
      color: BRAND[circuits.length % BRAND.length],
      traces,
      nodes,
      parts,
      segs,
      pulsePts: pts,
      pulseDur: between(7, 12),
      pulseDelay: -between(0, 12),
    });

    y += between(90, 150);
  }

  // Gutter runs: traces that duck in off the border and run down the side
  // channel beside the content, tapping into the card they pass like a pin
  const placed = () => circuits.flatMap((c) => c.segs);
  for (let gy = heroBottom + 60, k = 0; gy < h - 160; gy += between(50, 110), k++) {
    const side: 1 | -1 = k % 2 === 0 ? -1 : 1;
    const len = between(110, 260);
    // The 24px gutter beside the cards is enough for a pin row
    if (freeReach(side, gy - 12, gy + len + 12) < 8) continue;
    const x0 = side === 1 ? 0 : w;
    const X = (d: number) => x0 + side * d;
    const inset = between(9, 12);
    const near = placed().some(([a, b]) =>
      [a, b].some(([px, py]) => Math.abs(px - x0) < 60 && py > gy - 40 && py < gy + len + 40),
    );
    if (near) continue;

    const pts: Pt[] = [[X(0), gy], [X(inset - 6), gy], [X(inset), gy + 6], [X(inset), gy + len]];
    const segs = toSegs(pts);
    const parts: Part[] = rand() < 0.6 ? [{ x: X(inset), y: gy + len * between(0.35, 0.6), vertical: true }] : [];
    const nodes: CNode[] = [{ x: X(inset), y: gy + len, kind: pick(['ring', 'hex', 'via'] as const), r: 5.5 }];
    const traces: Circuit['traces'] = [{ d: toPath(pts) }];
    const clear = (ty: number) => !parts.some((p) => Math.abs(p.y - ty) < 20);

    // One tap back to the border, one into the content beside it
    const back = gy + len * between(0.15, 0.4);
    if (clear(back)) {
      const bp: Pt[] = [[X(inset), back], [X(2), back]];
      traces.push({ d: toPath(bp), thin: true });
      segs.push(...toSegs(bp));
    }
    const into = gy + len * between(0.6, 0.85);
    const beside = solid.some((r) => into > r.y0 + CLEARANCE && into < r.y1 - CLEARANCE);
    if (clear(into) && beside) {
      const bp: Pt[] = [[X(inset), into], [X(20), into]];
      traces.push({ d: toPath(bp), thin: true });
      segs.push(...toSegs(bp));
      nodes.push({ x: X(21), y: into, kind: 'pad', r: 2.5 });
    }

    circuits.push({
      id: circuits.length,
      color: BRAND[circuits.length % BRAND.length],
      traces,
      nodes,
      parts,
      segs,
      pulsePts: pts,
      pulseDur: between(6, 10),
      pulseDelay: -between(0, 10),
    });
    gy += len;
  }

  // Stars wherever there's open paper, kept clear of content and traces: one
  // a row down the page, and a second pass over the starry bands that adds a
  // few more, a little closer together
  const stars: Star[] = [];
  const allSegs = circuits.flatMap((c) => c.segs);
  const scatter = (y0: number, y1: number, step: [number, number], spacing: number) => {
    for (let sy = y0; sy < y1; sy += between(...step)) {
      for (let tries = 0; tries < 16; tries++) {
        const sx = between(16, w - 16);
        const yy = sy + between(-30, 30);
        if (yy < 12 || yy > h - 20) continue;
        if (measured.some((r) => inRect([sx, yy], r))) continue;
        if (allSegs.some((g) => distToSeg([sx, yy], g) < 22)) continue;
        if (stars.some((o) => Math.hypot(o.x - sx, o.y - yy) < spacing)) continue;
        const kind = rand() < 0.5 ? 'burst' : 'spark';
        stars.push({
          id: stars.length,
          x: sx,
          y: yy,
          size: kind === 'burst' ? between(14, 20) : between(12, 22),
          kind,
          color: pick(BRAND),
          dur: between(8, 14),
          delay: -between(0, 14),
        });
        break;
      }
    }
  };
  scatter(60, h - 30, [110, 170], 90);
  for (const [y0, y1] of starry) scatter(y0 + 30, y1 - 10, [70, 110], 70);

  // Every part lights up on its own every so often, each on a slow loop of
  // its own so they never fall into step
  for (const c of circuits) {
    for (const x of [...c.nodes, ...c.parts]) {
      if (x.twinkle) continue;
      const dur = between(16, 34);
      x.twinkle = { dur, delay: -between(0, dur) };
    }
  }
  return { circuits, stars };
}

const poly = (n: CNode, count: number, start: number) =>
  Array.from({ length: count }, (_, k) => {
    const a = ((Math.PI * 2) / count) * k + start;
    return `${(n.x + n.r * Math.cos(a)).toFixed(1)},${(n.y + n.r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

/** Extra props for the element that lights up now and then, if any */
type Blink = { className: string; style?: React.CSSProperties };

function NodeShape({ n, b }: { n: CNode; b: Blink }) {
  const cls = (base: string) => `cb-node ${base}${b.className}`;
  switch (n.kind) {
    case 'square':
      return <rect className={cls('cb-node--fill')} style={b.style} x={n.x - n.r} y={n.y - n.r} width={n.r * 2} height={n.r * 2} />;
    case 'pad':
      // Round pads: an ink disc with a paper eye
      return (
        <g>
          <circle className={cls('cb-node--ink')} style={b.style} cx={n.x} cy={n.y} r={n.r + 0.5} />
          <circle className="cb-node cb-node--hole" cx={n.x} cy={n.y} r={n.r * 0.4} />
        </g>
      );
    case 'hex':
      return (
        <g>
          <polygon className={cls('cb-node--fill')} style={b.style} points={poly(n, 6, Math.PI / 6)} />
          <circle className="cb-node cb-node--hole" cx={n.x} cy={n.y} r={n.r * 0.42} />
        </g>
      );
    case 'diamond':
      return <polygon className={cls('cb-node--fill')} style={b.style} points={poly(n, 4, 0)} />;
    case 'via':
      return (
        <g>
          <circle className={cls('cb-node--fill')} style={b.style} cx={n.x} cy={n.y} r={n.r} />
          <circle className="cb-node cb-node--hole" cx={n.x} cy={n.y} r={n.r * 0.45} />
        </g>
      );
    case 'arrow': {
      const a = n.angle ?? 0;
      const p = (dx: number, dy: number) =>
        `${(n.x + dx * Math.cos(a) - dy * Math.sin(a)).toFixed(1)},${(n.y + dx * Math.sin(a) + dy * Math.cos(a)).toFixed(1)}`;
      return <polygon className={cls('cb-node--ink')} style={b.style} points={`${p(n.r, 0)} ${p(-n.r, -n.r)} ${p(-n.r, n.r)}`} />;
    }
    case 'dot':
      return <circle className={cls('cb-node--solid')} style={b.style} cx={n.x} cy={n.y} r={n.r} />;
    default:
      return (
        <g>
          <circle className={cls('cb-node--ring')} style={b.style} cx={n.x} cy={n.y} r={n.r} />
          <circle className="cb-node cb-node--solid" cx={n.x} cy={n.y} r={n.r * 0.4} />
        </g>
      );
  }
}

function Resistor({ p, b }: { p: Part; b: Blink }) {
  const [w, h] = p.vertical ? [9, 20] : [20, 9];
  const bands = [-4.5, 0, 4.5].map((o) =>
    p.vertical ? `M${p.x - 4.5} ${p.y + o}H${p.x + 4.5}` : `M${p.x + o} ${p.y - 4.5}V${p.y + 4.5}`,
  );
  return (
    <g>
      <rect className={`cb-node cb-node--fill${b.className}`} style={b.style} x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx={2} />
      <path className="cb-band" d={bands.join('')} />
    </g>
  );
}

export default function CircuitBackground({ ready = true }: { ready?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [activeCircuit, setActiveCircuit] = useState<number | null>(null);
  const [activeStar, setActiveStar] = useState<number | null>(null);

  // Regenerate only on real size changes — rounding stops sub-pixel reflows
  // from reshuffling the board. The hero copy is watched too: when its font
  // arrives (or it rewraps) the page may not change height, but the buses
  // and taps have to move with the text.
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const sameText = (a: Rect | null, b: Rect | null) =>
      a === b || (!!a && !!b && [a.x0 - b.x0, a.y0 - b.y0, a.x1 - b.x1, a.y1 - b.y1].every((d) => Math.abs(d) < 1));
    let retry = 0;
    const update = () => {
      // Mid-splash the page is scaled up around BR1, and measuring it then
      // would lay the board out at the wrong size; wait for it to settle
      if (el.style.transform) {
        clearTimeout(retry);
        retry = window.setTimeout(update, 200);
        return;
      }
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight / 40) * 40;
      const m = measure(el);
      setLayout((prev) => (prev && prev.w === w && prev.h === h && sameText(prev.text, m.text) ? prev : { w, h, ...m }));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.querySelectorAll('.home-hero-title, .home-hero-desc').forEach((t) => ro.observe(t));
    document.fonts?.ready.then(update);
    return () => {
      ro.disconnect();
      clearTimeout(retry);
    };
  }, []);

  const board = useMemo(() => (layout ? generate(layout) : null), [layout]);

  // Publish the traces for the probe cursor to snap to (BR1's outline isn't a
  // trace, so it's left out), and where the parts sit, so its wire can clip
  // straight onto one rather than adding a connector of its own
  useEffect(() => {
    const svg = svgRef.current;
    if (!board || !svg) return;
    setBoard({
      svg,
      traces: board.circuits.filter((c) => !c.chip).map((c) => ({ color: c.color, segs: c.segs })),
      parts: board.circuits.flatMap((c) => [
        ...c.nodes.map((n) => ({ at: [n.x, n.y] as Pt, r: n.r })),
        ...c.parts.map((p) => ({ at: [p.x, p.y] as Pt, r: 10 })),
        ...(c.chip?.feet ?? []).map((f) => ({ at: f, r: 2 })),
      ]),
    });
    return () => setBoard(null);
  }, [board]);

  const twinkleFor = (tw: Twinkle | undefined): Blink =>
    tw
      ? {
          className: ' cb-twinkle',
          style: { ...(tw.color ? { '--c': tw.color } : {}), '--tw-dur': `${tw.dur.toFixed(2)}s`, '--tw-delay': `${tw.delay.toFixed(2)}s` } as React.CSSProperties,
        }
      : { className: '' };
  const chipActive = board?.circuits.find((c) => c.id === activeCircuit)?.chip !== undefined;

  // Every time a hero signal arrives at BR1 or sets off from it, the chip
  // answers in that signal's colour. The answers are SMIL animations like the
  // dots themselves, so they run on the same clock and can't drift apart
  // however long the page stays open (CSS animations keep their own time,
  // and a background tab throttles the two differently).
  const chip = board?.circuits.find((c) => c.chip)?.chip;
  const chipPulses = chip
    ? board!.circuits.flatMap((h) => {
        if (!h.hero || h.pulsePts.length < 2) return [];
        const near = (p: Pt) => inRect(p, { x0: chip.x - 12, y0: chip.y - 12, x1: chip.x + chip.w + 12, y1: chip.y + chip.h + 12 });
        const at = near(h.pulsePts[h.pulsePts.length - 1]) ? 1 : near(h.pulsePts[0]) ? 0 : null;
        if (at === null) return [];
        const timing = { dur: `${h.pulseDur}s`, begin: `${(h.pulseDelay + at * 0.4 * h.pulseDur).toFixed(3)}s`, repeatCount: 'indefinite' };
        return [{ color: h.color, timing }];
      })
    : [];

  useEffect(() => {
    if (!board) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const p: Pt = [e.clientX - r.left, e.clientY - r.top];

      const star = board.stars.find((s) => Math.hypot(s.x - p[0], s.y - p[1]) < s.size * 0.75 + 4);
      setActiveStar(star ? star.id : null);

      let hit: number | null = null;
      let best = 14;
      for (const c of board.circuits) {
        if (c.chip && inRect(p, { x0: c.chip.x - 10, y0: c.chip.y - 10, x1: c.chip.x + c.chip.w + 10, y1: c.chip.y + c.chip.h + 10 })) {
          hit = c.id;
          break;
        }
        for (const g of c.segs) {
          const dd = distToSeg(p, g);
          if (dd < best) {
            best = dd;
            hit = c.id;
          }
        }
      }
      setActiveCircuit(hit);
    };
    const onLeave = () => {
      setActiveCircuit(null);
      setActiveStar(null);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [board]);

  return (
    <svg
      ref={svgRef}
      className={`circuit-bg${ready ? ' is-ready' : ''}`}
      // No viewBox: the board's units are the page's pixels. With one, the
      // height (rounded to the nearest 40 to keep reflows from reshuffling
      // the board) got stretched to the frame's real height, nudging every
      // part a few pixels off where the layout put it.
      aria-hidden="true"
    >
      {board?.circuits.map((c, idx) => (
        <g
          key={c.id}
          className={`cb-circuit${c.hero ? ' cb-circuit--hero' : ''}${activeCircuit === c.id || (chipActive && c.hero) ? ' is-active' : ''}`}
          style={{ '--c': c.color, '--draw-delay': `${0.15 + idx * 0.08}s`, '--pulse-dur': `${c.pulseDur}s` } as React.CSSProperties}
        >
          {c.traces.map((t, k) => (
            <path key={k} className={`cb-trace${t.thin ? ' cb-trace--thin' : ''}`} d={t.d} pathLength={1} />
          ))}
          {c.parts.map((p, k) => (
            <Resistor key={k} p={p} b={twinkleFor(p.twinkle)} />
          ))}
          {c.nodes.map((n, k) => (
            <NodeShape key={k} n={n} b={twinkleFor(n.twinkle)} />
          ))}
          {c.chip && (
            <g className="cb-chip">
              <path className="cb-chip-pins" d={c.chip.pins} />
              {c.chip.feet.map(([fx, fy], k) => (
                <rect key={k} className="cb-chip-foot" x={fx - 1.75} y={fy - 1.75} width={3.5} height={3.5} />
              ))}
              {/* Signals arriving or leaving: a ring that swells off the body
                  and a flush of the signal's colour */}
              {chipPulses.map((p, k) => {
                const { x, y, w, h } = c.chip!;
                const gx = w * 0.11;
                const gy = h * 0.11;
                const swell = (from: number, to: number) => `${from};${to};${to}`;
                return (
                  <rect key={`g${k}`} className="cb-chip-fx cb-chip-glow" stroke={p.color} x={x} y={y} width={w} height={h} rx={4} opacity={0}>
                    <animate attributeName="opacity" values="0.9;0;0" keyTimes="0;0.12;1" {...p.timing} />
                    <animate attributeName="x" values={swell(x, x - gx)} keyTimes="0;0.12;1" {...p.timing} />
                    <animate attributeName="y" values={swell(y, y - gy)} keyTimes="0;0.12;1" {...p.timing} />
                    <animate attributeName="width" values={swell(w, w + 2 * gx)} keyTimes="0;0.12;1" {...p.timing} />
                    <animate attributeName="height" values={swell(h, h + 2 * gy)} keyTimes="0;0.12;1" {...p.timing} />
                  </rect>
                );
              })}
              <rect className="cb-chip-body" x={c.chip.x} y={c.chip.y} width={c.chip.w} height={c.chip.h} rx={4} />
              {chipPulses.map((p, k) => (
                <rect
                  key={`f${k}`}
                  className="cb-chip-fx"
                  fill={p.color}
                  x={c.chip!.x + 1}
                  y={c.chip!.y + 1}
                  width={c.chip!.w - 2}
                  height={c.chip!.h - 2}
                  rx={3}
                  opacity={0}
                >
                  <animate attributeName="opacity" values="0.3;0;0" keyTimes="0;0.1;1" {...p.timing} />
                </rect>
              ))}
              {/* The die under the lid, and a status light that blinks with each signal */}
              <rect className="cb-chip-die" x={c.chip.x + 5} y={c.chip.y + 5} width={c.chip.w - 10} height={c.chip.h - 10} rx={2} />
              <circle className="cb-chip-dot" cx={c.chip.x + 9} cy={c.chip.y + 9} r={2.5} />
              <circle className="cb-chip-led" cx={c.chip.x + c.chip.w - 9} cy={c.chip.y + 9} r={2.25} />
              {chipPulses.map((p, k) => (
                <circle key={`l${k}`} className="cb-chip-fx cb-chip-led" style={{ fill: p.color }} cx={c.chip!.x + c.chip!.w - 9} cy={c.chip!.y + 9} r={2.25} opacity={0}>
                  <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.14;0.22;1" {...p.timing} />
                </circle>
              ))}
              <text className="cb-chip-label" x={c.chip.x + c.chip.w / 2} y={c.chip.y + c.chip.h / 2 + 5} textAnchor="middle">
                {c.chip.label}
              </text>
            </g>
          )}
          {/* A signal that runs the trace now and then, then rests out of sight */}
          {c.pulsePts.length > 1 && (
            <circle className="cb-pulse" r={3.5} opacity={0}>
              <animateMotion
                path={toPath(c.pulsePts)}
                dur={`${c.pulseDur}s`}
                begin={`${c.pulseDelay}s`}
                repeatCount="indefinite"
                keyPoints="0;1;1"
                keyTimes="0;0.4;1"
                calcMode="linear"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0;0"
                keyTimes="0;0.03;0.37;0.41;1"
                dur={`${c.pulseDur}s`}
                begin={`${c.pulseDelay}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      ))}

      {board?.stars.map((s) => (
        <g key={s.id} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}>
          <g
            className={`cb-star${activeStar === s.id ? ' is-active' : ''}`}
            style={{ '--c': s.color, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` } as React.CSSProperties}
          >
            <g transform={`scale(${(s.size / 16).toFixed(3)}) translate(-8 -8)`}>
              <path className="cb-star-outer" d={s.kind === 'burst' ? BURST_OUTER : SPARK_OUTER} />
              <path className="cb-star-inner" d={s.kind === 'burst' ? BURST_INNER : SPARK_INNER} />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
