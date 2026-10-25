/**
 * Letters cut as circuit traces, shared by the BR1 splash and the WORDS chips.
 * Each letter sits on a 4×6 grid, cut the way a router would: straight runs
 * and 45° corners. Free stroke ends get a coloured pad; ends that land on
 * another stroke get a solder dot.
 */

export type Pt = [number, number];

export const INK = '#141510';
export const PAPER = '#f9fafb';
export const BRAND = ['#12B4FF', '#FF12F7', '#31E300', '#FF9C12', '#FFF712'] as const;

export const GLYPH_W = 4;
export const GLYPH_H = 6;

// `vias`: extra coloured pads on the line, for letters that would otherwise
// have no free end to put one on
type Glyph = { strokes: Pt[][]; vias?: Pt[] };

const GLYPHS: Record<string, Glyph> = {
  // B's middle bar stops short of its spine so B gets a coloured pad like the rest
  B: { strokes: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]] },
  R: { strokes: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[2, 3], [4, 5], [4, 6]]] },
  Y: { strokes: [[[0, 0], [0, 1], [2, 3], [2, 6]], [[4, 0], [4, 1], [2, 3]]] },
  C: { strokes: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]] },
  E: { strokes: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]] },
  W: { strokes: [[[0, 0], [0, 5], [1, 6], [2, 5], [2, 3]], [[2, 5], [3, 6], [4, 5], [4, 0]]] },
  O: { strokes: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]], vias: [[4, 3]] },
  // D closes on itself, so its corners are solder dots and its one coloured
  // pad sits on the bowl, opposite the spine
  D: { strokes: [[[0, 0], [0, 6]], [[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6]]], vias: [[4, 3]] },
  S: { strokes: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]] },
};

export const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const polyLen = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + segLen(pts[i], p), 0);
function onSeg([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) < 1e-6;
}

export type LaidGlyph = {
  strokes: { pts: Pt[]; d: string; at: number; dur: number }[];
  /** `at`: when the trace reaches it; `free`: a coloured pad rather than a solder dot */
  pads: { p: Pt; at: number; free: boolean }[];
  end: number;
};

/**
 * One letter at unit size `u` from (x0, y0), its strokes cut one after another
 * starting at `start` and taking `dur` seconds in all.
 */
export function layoutGlyph(ch: string, u: number, x0: number, y0: number, start: number, dur: number): LaidGlyph {
  const g = GLYPHS[ch];
  const place = ([x, y]: Pt): Pt => [x0 + x * u, y0 + y * u];
  const strokes = g.strokes.map((s) => s.map(place));
  const total = strokes.reduce((s, p) => s + polyLen(p), 0);
  let t = start;
  const timed = strokes.map((pts) => {
    const d = (dur * polyLen(pts)) / total;
    const out = { pts, d: toPath(pts), at: t, dur: d };
    t += d;
    return out;
  });

  const segs = strokes.flatMap((s) => s.slice(1).map((p, k): [Pt, Pt] => [s[k], p]));
  const seen = new Set<string>();
  const pads = timed
    .flatMap((s) => [s.pts[0], s.pts[s.pts.length - 1]].map((p, end) => ({ p, at: end ? s.at + s.dur : s.at })))
    .filter(({ p }) => {
      const k = `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map(({ p, at }) => ({ p, at, free: segs.filter(([a, b]) => onSeg(p, a, b)).length === 1 }));

  // A via lights when the trace runs past it
  for (const v of (g.vias ?? []).map(place)) {
    for (const s of timed) {
      let run = 0;
      const k = s.pts.slice(1).findIndex((b, i) => {
        if (onSeg(v, s.pts[i], b)) return true;
        run += segLen(s.pts[i], b);
        return false;
      });
      if (k < 0) continue;
      run += segLen(s.pts[k], v);
      pads.push({ p: v, at: s.at + (s.dur * run) / polyLen(s.pts), free: true });
      break;
    }
  }

  return { strokes: timed, pads, end: t };
}
