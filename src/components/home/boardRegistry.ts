/**
 * Shared between the circuit board and the probe cursor: the board publishes
 * its traces here once it has laid itself out, so the probe can snap to them,
 * and both draw buses with the same offset helper.
 */

export type Pt = [number, number];

/** Each circuit's traces as segments, in the board's own coordinates */
export type BoardTrace = { color: string; segs: [Pt, Pt][] };
/** Where the board already has a part (a pad, ring, nut, resistor…) and how big it is */
export type BoardPart = { at: Pt; r: number };
type Board = { svg: SVGSVGElement; traces: BoardTrace[]; parts: BoardPart[] };

let current: Board | null = null;
export const setBoard = (b: Board | null) => {
  current = b;
};
export const getBoard = () => current;

/** A polyline shifted sideways by `d`, mitred at the corners, for drawing buses */
export function offsetPolyline(pts: Pt[], d: number): Pt[] {
  const normal = (a: Pt, b: Pt): Pt => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  return pts.map((p, i) => {
    const n1 = i > 0 ? normal(pts[i - 1], p) : null;
    const n2 = i < pts.length - 1 ? normal(p, pts[i + 1]) : null;
    if (!n1 || !n2) {
      const n = (n1 ?? n2) as Pt;
      return [p[0] + n[0] * d, p[1] + n[1] * d];
    }
    let mx = n1[0] + n2[0];
    let my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    const k = d / (mx * n1[0] + my * n1[1]);
    return [p[0] + mx * k, p[1] + my * k];
  });
}
