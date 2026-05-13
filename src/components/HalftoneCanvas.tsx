'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID       = 10;
// Name halftone uses a finer sub-grid so each letter has ~4× the dot resolution
// of the background. Background and butterfly dots stay on the GRID lattice.
const NAME_GRID  = 5;
const R_BG       = 0.9;
const R_HT_MAX   = 2.8;
const R_NAME_MAX = 2.0;
const R_NAME_MIN = 0.55;
// Cells whose averaged coverage (0–255) is below this threshold drop out entirely.
const NAME_COVERAGE_THRESHOLD = 18;
// Coverage values (0–1, after threshold normalization) are passed through
// smoothstep(EDGE_LO, EDGE_HI, c) and mapped from R_NAME_MIN → R_NAME_MAX.
const NAME_EDGE_LO = 0.02;
const NAME_EDGE_HI = 0.30;
const COLOR_BG   = '#D8D8D8';
const COLOR_HT   = '#C0C0C0';
const COLOR_NAME = '#141510';

// ── Cursor radial glow ─────────────────────────────────────────────────────
const HIGHLIGHT_R        = 60;
const HIGHLIGHT_EXTRA_BG = 2.5;
const HIGHLIGHT_EXTRA_HT = 1.5;
const HIGHLIGHT_EXTRA_NM = 2.0;
const COLOR_HIGHLIGHT    = '#141510';

// ── Halftone fade-in ───────────────────────────────────────────────────────
const HT_FADE_MS = 350;

// ── Breathing ──────────────────────────────────────────────────────────────
const BREATHE_AMP   = 0.12;
const BREATHE_SPEED = 0.00055;

// ── Spring / damping ───────────────────────────────────────────────────────
const SPRING_K = 0.055;
const DAMPING  = 0.82;

// ── Cursor repulsion ──────────────────────────────────────────────────────
const REPEL_R  = 60;
const REPEL_F  = 6.5;
// Name dots use the same repel physics as butterflies so the visible dispersal
// radius matches. Density is brought down to butterfly-equivalent in pass 4
// via a 2×2 subsample (since the name sub-grid is 4× denser than butterflies).
const NAME_REPEL_R = REPEL_R;
const NAME_REPEL_F = REPEL_F;

// ── Slam ripple ────────────────────────────────────────────────────────────
const WAVE_SPEED      = 450;
const WAVE_HALF_WIDTH = 65;
const WAVE_FORCE_HT   = 0.85;
const WAVE_FORCE_BG   = 0.32;
const WAVE_DURATION   = 2200;

// ── Butterfly configs ─────────────────────────────────────────────────────
type BfConfig = { url: string; lf: number; tf: number; wf: number; ar: number; rot?: number };

// Positions mirror the Landing Page frame in Figma (1440×1024 design canvas).
// The SVGs are exported from Figma with rotation already baked into the path
// geometry, so each is rendered at its natural (rotated-bbox) dimensions with
// no additional rotation applied. ar = svg height / svg width.
const CONFIGS: BfConfig[] = [
  { url: '/butterflies/fly-1.svg', lf:   34.5 / 1440, tf:   -6.0 / 1024, wf: 191 / 1440, ar: 190 / 191 },
  { url: '/butterflies/fly-2.svg', lf:   34.0 / 1440, tf:  362.0 / 1024, wf: 184 / 1440, ar: 226 / 184 },
  { url: '/butterflies/fly-3.svg', lf:  -33.0 / 1440, tf:  833.0 / 1024, wf: 134 / 1440, ar: 202 / 134 },
  { url: '/butterflies/fly-4.svg', lf: 1011.0 / 1440, tf:   -7.0 / 1024, wf: 220 / 1440, ar: 158 / 220 },
  { url: '/butterflies/fly-5.svg', lf: 1351.0 / 1440, tf:  499.0 / 1024, wf: 144 / 1440, ar: 222 / 144 },
  { url: '/butterflies/fly-6.svg', lf: 1086.0 / 1440, tf:  771.0 / 1024, wf: 222 / 1440, ar: 214 / 222 },
  { url: '/butterflies/fly-7.svg', lf:  515.5 / 1440, tf:  742.5 / 1024, wf: 289 / 1440, ar: 249 / 289 },
];

function activeConfigs(h: number) {
  if (h >= 700) return CONFIGS;
  if (h >= 500) return CONFIGS.filter(c => c.tf < 0.6);
  return CONFIGS.filter(c => c.tf < 0.1);
}

// ── Name SVG config ────────────────────────────────────────────────────────
const NAME_URL = '/name.svg';
const NAME_SVG_W = 766;
const NAME_SVG_H = 115;
// Target rendered width as a fraction of viewport width (capped at max pixels).
// On narrow viewports the fraction grows so letterforms keep enough grid cells
// to remain legible.
const NAME_W_FRAC        = 0.68;
const NAME_W_FRAC_NARROW = 0.88;
const NAME_NARROW_BP     = 900;
const NAME_W_MAX         = 880;

// ── Dot grid ───────────────────────────────────────────────────────────────
type Grid = {
  n: number; cols: number; rows: number;
  gx: Float32Array; gy: Float32Array;
  br: Float32Array;    // bg dot radius
  hr: Float32Array;    // butterfly halftone radius
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  ph: Float32Array;
  ht:     Uint8Array;  // 1 = butterfly halftone
  nameHt: Uint8Array;  // 1 = covered by name (gates bg dot at this cell)
};

// Separate higher-resolution grid for the name halftone only. Lets us put more
// detail into each letter without changing the background dot lattice.
type NameGrid = {
  n: number; cols: number; rows: number;
  gx: Float32Array; gy: Float32Array;
  nr: Float32Array;
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  ph: Float32Array;
  active: Uint8Array;  // 1 = has a name dot at this cell
};

function makeGrid(
  bfMap: Uint8Array,
  nameMask: Uint8Array,
  cols: number,
  rows: number,
): Grid {
  const n = cols * rows;
  const g: Grid = {
    n, cols, rows,
    gx: new Float32Array(n), gy: new Float32Array(n),
    br: new Float32Array(n),
    hr: new Float32Array(n),
    ox: new Float32Array(n), oy: new Float32Array(n),
    vx: new Float32Array(n), vy: new Float32Array(n),
    ph: new Float32Array(n),
    ht:     new Uint8Array(n),
    nameHt: new Uint8Array(n),
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      g.gx[i] = c * GRID + GRID / 2;
      g.gy[i] = r * GRID + GRID / 2;
      g.ph[i] = Math.random() * Math.PI * 2;

      if (nameMask[i] > NAME_COVERAGE_THRESHOLD) {
        g.nameHt[i] = 1;
      } else if (bfMap[i] > 10) {
        g.ht[i] = 1;
        g.hr[i] = R_HT_MAX * (bfMap[i] / 255);
      }
      g.br[i] = R_BG;
    }
  }
  return g;
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Map averaged per-cell ink coverage (0–255) to a dot radius. Below the
// threshold the cell drops out (callers gate on NAME_COVERAGE_THRESHOLD).
function nameRadiusFromCoverage(coverage: number) {
  const norm = (coverage - NAME_COVERAGE_THRESHOLD) / (255 - NAME_COVERAGE_THRESHOLD);
  const s = smoothstep(NAME_EDGE_LO, NAME_EDGE_HI, norm);
  return R_NAME_MIN + (R_NAME_MAX - R_NAME_MIN) * s;
}

function applyMaps(g: Grid, bfMap: Uint8Array, nameMask: Uint8Array) {
  for (let i = 0; i < g.n; i++) {
    if (nameMask[i] > NAME_COVERAGE_THRESHOLD) {
      g.nameHt[i] = 1;
    } else if (bfMap[i] > 10) {
      g.ht[i] = 1;
      g.hr[i] = R_HT_MAX * (bfMap[i] / 255);
    }
  }
}

function makeNameGrid(nameMap: Uint8Array, cols: number, rows: number): NameGrid {
  const n = cols * rows;
  const g: NameGrid = {
    n, cols, rows,
    gx: new Float32Array(n), gy: new Float32Array(n),
    nr: new Float32Array(n),
    ox: new Float32Array(n), oy: new Float32Array(n),
    vx: new Float32Array(n), vy: new Float32Array(n),
    ph: new Float32Array(n),
    active: new Uint8Array(n),
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      g.gx[i] = c * NAME_GRID + NAME_GRID / 2;
      g.gy[i] = r * NAME_GRID + NAME_GRID / 2;
      g.ph[i] = Math.random() * Math.PI * 2;
      const na = nameMap[i];
      if (na > NAME_COVERAGE_THRESHOLD) {
        g.active[i] = 1;
        g.nr[i] = nameRadiusFromCoverage(na);
      }
    }
  }
  return g;
}

function applyNameMap(g: NameGrid, nameMap: Uint8Array) {
  for (let i = 0; i < g.n; i++) {
    const na = nameMap[i];
    if (na > NAME_COVERAGE_THRESHOLD) {
      g.active[i] = 1;
      g.nr[i] = nameRadiusFromCoverage(na);
    } else {
      g.active[i] = 0;
      g.nr[i] = 0;
    }
  }
}

// Load one SVG into an off-screen canvas and sample it into a per-cell alpha map.
//
// strokeExpand (in screen-space pixels): draws the SVG onto a second canvas
// repeatedly at offsets covering a disk of this radius, producing a morphological
// dilation that fattens thin strokes before sampling. This is more reliable than
// CSS blur because it keeps alpha at 255 everywhere inside the expanded stroke
// (no soft falloff), so cells overlapping a fattened stroke fully register.
//
// oversample: when > 1, the SVG is rasterized at oversample× resolution and each
// grid cell's value is the AVERAGE alpha over its full pixel block. This produces
// true coverage values (proportional to ink-area within the cell) instead of a
// near-binary point sample, which lets the caller drive dot radius off coverage.
async function sampleSvg(
  url: string,
  renderW: number, renderH: number,
  originX: number, originY: number,
  cols: number, rows: number,
  rot = 0,
  sampleRadius = 0,
  strokeExpand = 0,
  oversample = 1,
  gridSize = GRID,
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve) => {
    const map = new Uint8Array(cols * rows);
    const img = new Image();
    img.onload = () => {
      const OS   = Math.max(1, Math.floor(oversample));
      const bufW = renderW * OS;
      const bufH = renderH * OS;
      const oc   = document.createElement('canvas');
      oc.width  = bufW;
      oc.height = bufH;
      const ctx2 = oc.getContext('2d');
      if (!ctx2) { resolve(map); return; }

      if (strokeExpand > 0) {
        // strokeExpand is in screen pixels; scale into high-res buffer space.
        const se = Math.round(strokeExpand * OS);
        const r2 = se * se;
        for (let dy = -se; dy <= se; dy++) {
          for (let dx = -se; dx <= se; dx++) {
            if (dx * dx + dy * dy <= r2) {
              ctx2.drawImage(img, dx, dy, bufW, bufH);
            }
          }
        }
      } else {
        ctx2.drawImage(img, 0, 0, bufW, bufH);
      }

      const id   = ctx2.getImageData(0, 0, bufW, bufH);
      const cosR = Math.cos(rot * Math.PI / 180);
      const sinR = Math.sin(rot * Math.PI / 180);
      const cx   = originX + renderW / 2;
      const cy   = originY + renderH / 2;

      if (OS > 1) {
        // Coverage mode: average alpha over the (gridSize·OS)² block matching the cell.
        const block = gridSize * OS;
        const half  = block / 2;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dx = c * gridSize + gridSize / 2 - cx;
            const dy = r * gridSize + gridSize / 2 - cy;
            const lx = dx * cosR + dy * sinR + renderW / 2;
            const ly = -dx * sinR + dy * cosR + renderH / 2;
            const hxC = lx * OS;
            const hyC = ly * OS;
            const x0 = Math.max(0, Math.floor(hxC - half));
            const x1 = Math.min(bufW, Math.ceil(hxC + half));
            const y0 = Math.max(0, Math.floor(hyC - half));
            const y1 = Math.min(bufH, Math.ceil(hyC + half));
            if (x1 <= x0 || y1 <= y0) continue;
            let sum = 0, count = 0;
            for (let py = y0; py < y1; py++) {
              const row = py * bufW;
              for (let px = x0; px < x1; px++) {
                sum += id.data[(row + px) * 4 + 3];
                count++;
              }
            }
            const avg = sum / count;
            if (avg > 4) {
              const v = Math.min(255, Math.round(avg));
              if (v > map[r * cols + c]) map[r * cols + c] = v;
            }
          }
        }
      } else {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dx = c * gridSize + gridSize / 2 - cx;
            const dy = r * gridSize + gridSize / 2 - cy;
            const lx = Math.round(dx * cosR + dy * sinR + renderW / 2);
            const ly = Math.round(-dx * sinR + dy * cosR + renderH / 2);

            let alpha = 0;
            for (let ry = -sampleRadius; ry <= sampleRadius; ry++) {
              for (let rx = -sampleRadius; rx <= sampleRadius; rx++) {
                const px = lx + rx, py = ly + ry;
                if (px >= 0 && px < renderW && py >= 0 && py < renderH) {
                  alpha = Math.max(alpha, id.data[(py * renderW + px) * 4 + 3]);
                }
              }
            }
            if (alpha > 10) {
              map[r * cols + c] = Math.max(map[r * cols + c], alpha);
            }
          }
        }
      }
      resolve(map);
    };
    img.onerror = () => resolve(map);
    img.src = url;
  });
}

async function buildMaps(w: number, h: number): Promise<{
  bfMap: Uint8Array;
  nameMap: Uint8Array;
  nameMask: Uint8Array;
  cols: number;
  rows: number;
  nameCols: number;
  nameRows: number;
}> {
  const cols = Math.ceil(w / GRID);
  const rows = Math.ceil(h / GRID);
  const nameCols = Math.ceil(w / NAME_GRID);
  const nameRows = Math.ceil(h / NAME_GRID);

  // ── Butterflies ──────────────────────────────────────────────────────────
  const bfMap = new Uint8Array(cols * rows);
  await Promise.all(
    activeConfigs(h).map(({ url, lf, tf, wf, ar, rot = 0 }) => {
      const bW = Math.round(wf * w);
      const bH = Math.round(bW * ar);
      const bX = Math.round(lf * w);
      const bY = Math.round(tf * h);
      return sampleSvg(url, bW, bH, bX, bY, cols, rows, rot).then(m => {
        for (let i = 0; i < m.length; i++) bfMap[i] = Math.max(bfMap[i], m[i]);
      });
    }),
  );

  // ── Name (centered, scaled to viewport) ─────────────────────────────────
  // On narrow viewports use a larger width fraction so glyphs cover enough grid
  // cells to remain legible after halftoning.
  const frac  = w < NAME_NARROW_BP ? NAME_W_FRAC_NARROW : NAME_W_FRAC;
  const nameW = Math.min(Math.round(w * frac), NAME_W_MAX);
  const nameH = Math.round(nameW * (NAME_SVG_H / NAME_SVG_W));
  const nameX = Math.round((w - nameW) / 2);
  // Position name slightly above vertical center to leave room for CTA area
  const nameY = Math.round(h / 2 - nameH / 2);
  // Coverage-based sampling at the NAME_GRID sub-grid (finer than GRID), so
  // each letter has ~4× the dot resolution of the background. strokeExpand
  // (in screen px) dilates the stencil font's many small brush marks until
  // they merge into solid letterforms; the smoothstep curve in
  // nameRadiusFromCoverage maps coverage → dot radius so interiors fill solid
  // and edges fade. R_NAME_MAX is small enough that dots never overlap on the
  // 5px lattice.
  const nameMap = await sampleSvg(
    NAME_URL, nameW, nameH, nameX, nameY,
    nameCols, nameRows, 0, 0, 4, 3, NAME_GRID,
  );

  // Coarse gate mask at the 10px grid: a bg cell is suppressed if any of its
  // 2×2 sub-cells in the name grid is active. Prevents bg dots from peeking
  // through the letter interiors.
  const nameMask = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let max = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const nc = c * 2 + dx;
          const nr = r * 2 + dy;
          if (nc < nameCols && nr < nameRows) {
            const v = nameMap[nr * nameCols + nc];
            if (v > max) max = v;
          }
        }
      }
      nameMask[r * cols + c] = max;
    }
  }

  return { bfMap, nameMap, nameMask, cols, rows, nameCols, nameRows };
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props { rippleTrigger?: number; }

export default function HalftoneCanvas({ rippleTrigger = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rippleRef = useRef<{ time: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (rippleTrigger === 0) return;
    rippleRef.current = {
      time: performance.now(),
      ox: window.innerWidth  / 2,
      oy: window.innerHeight / 2,
    };
  }, [rippleTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alive       = true;
    let grid: Grid | null = null;
    let nameGrid: NameGrid | null = null;
    let htFadeStart = 0;
    let rafId       = 0;
    let t0          = 0;
    const mouse = { x: -9999, y: -9999, overClickable: false };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    // ── Frame ──────────────────────────────────────────────────────────────
    const frame = (ts: number) => {
      if (!alive) return;
      if (t0 === 0) t0 = ts;
      const t   = ts - t0;
      const dpr = window.devicePixelRatio || 1;
      const g   = grid;
      const HR2 = HIGHLIGHT_R * HIGHLIGHT_R;

      const htAlpha = htFadeStart > 0
        ? Math.min(1, (ts - htFadeStart) / HT_FADE_MS)
        : 0;

      const ripple      = rippleRef.current;
      const waveRadius  = ripple ? WAVE_SPEED * (ts - ripple.time) / 1000 : -1;
      const rippleActive = ripple !== null
        && waveRadius >= 0
        && ts - ripple.time < WAVE_DURATION;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (g) {
        // ── Helper: run spring + optional repulsion ──────────────────────
        const stepPhysics = (i: number, enableRepel: boolean) => {
          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];

          // Ripple
          if (rippleActive) {
            const rdx  = dotX - ripple!.ox;
            const rdy  = dotY - ripple!.oy;
            const dist = Math.sqrt(rdx * rdx + rdy * rdy);
            const fromFront = dist - waveRadius;
            if (Math.abs(fromFront) < WAVE_HALF_WIDTH && dist > 0.1) {
              const norm  = fromFront / WAVE_HALF_WIDTH;
              const bell  = (1 - norm * norm) * (1 - norm * norm);
              const force = g.ht[i] || g.nameHt[i] ? WAVE_FORCE_HT : WAVE_FORCE_BG;
              g.vx[i] += (rdx / dist) * force * bell;
              g.vy[i] += (rdy / dist) * force * bell;
            }
          }

          // Cursor repulsion
          if (enableRepel) {
            const dx = dotX - mouse.x;
            const dy = dotY - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < REPEL_R * REPEL_R && d2 > 0.01) {
              const d = Math.sqrt(d2);
              g.vx[i] += (dx / d) * (1 - d / REPEL_R) * REPEL_F;
              g.vy[i] += (dy / d) * (1 - d / REPEL_R) * REPEL_F;
            }
          }

          g.vx[i] += -SPRING_K * g.ox[i];
          g.vy[i] += -SPRING_K * g.oy[i];
          g.vx[i] *= DAMPING;
          g.vy[i] *= DAMPING;
          g.ox[i] += g.vx[i];
          g.oy[i] += g.vy[i];
        };

        // ── Pass 1: BG dots ──────────────────────────────────────────────
        ctx.fillStyle = COLOR_BG;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          if (g.ht[i] || g.nameHt[i]) continue;

          if (g.ox[i] !== 0 || g.oy[i] !== 0 || g.vx[i] !== 0 || g.vy[i] !== 0 || rippleActive) {
            stepPhysics(i, false);
          }

          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];
          const hdx  = dotX - mouse.x, hdy = dotY - mouse.y;
          if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

          const r  = g.br[i] * dpr;
          const cx = dotX * dpr, cy = dotY * dpr;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // ── Pass 2: Butterfly halftone dots ──────────────────────────────
        if (htAlpha > 0) {
          if (htAlpha < 1) ctx.globalAlpha = htAlpha;
          ctx.fillStyle = COLOR_HT;
          ctx.beginPath();
          for (let i = 0; i < g.n; i++) {
            if (!g.ht[i]) continue;
            stepPhysics(i, true);
            const dotX = g.gx[i] + g.ox[i];
            const dotY = g.gy[i] + g.oy[i];
            const hdx  = dotX - mouse.x, hdy = dotY - mouse.y;
            if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

            const br = g.hr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
            const r  = br * dpr;
            const cx = (g.gx[i] + g.ox[i]) * dpr;
            const cy = (g.gy[i] + g.oy[i]) * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          ctx.fill();
          if (htAlpha < 1) ctx.globalAlpha = 1;
        }

        // ── Pass 3: Name halftone dots (dark, fine sub-grid) ─────────────
        const ng = nameGrid;
        const stepNamePhysics = (i: number) => {
          const dotX = ng!.gx[i] + ng!.ox[i];
          const dotY = ng!.gy[i] + ng!.oy[i];

          if (rippleActive) {
            const rdx  = dotX - ripple!.ox;
            const rdy  = dotY - ripple!.oy;
            const dist = Math.sqrt(rdx * rdx + rdy * rdy);
            const fromFront = dist - waveRadius;
            if (Math.abs(fromFront) < WAVE_HALF_WIDTH && dist > 0.1) {
              const norm = fromFront / WAVE_HALF_WIDTH;
              const bell = (1 - norm * norm) * (1 - norm * norm);
              ng!.vx[i] += (rdx / dist) * WAVE_FORCE_HT * bell;
              ng!.vy[i] += (rdy / dist) * WAVE_FORCE_HT * bell;
            }
          }

          if (!mouse.overClickable) {
            const dx = dotX - mouse.x;
            const dy = dotY - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < NAME_REPEL_R * NAME_REPEL_R && d2 > 0.01) {
              const d = Math.sqrt(d2);
              ng!.vx[i] += (dx / d) * (1 - d / NAME_REPEL_R) * NAME_REPEL_F;
              ng!.vy[i] += (dy / d) * (1 - d / NAME_REPEL_R) * NAME_REPEL_F;
            }
          }

          ng!.vx[i] += -SPRING_K * ng!.ox[i];
          ng!.vy[i] += -SPRING_K * ng!.oy[i];
          ng!.vx[i] *= DAMPING;
          ng!.vy[i] *= DAMPING;
          ng!.ox[i] += ng!.vx[i];
          ng!.oy[i] += ng!.vy[i];
        };

        if (ng && htAlpha > 0) {
          if (htAlpha < 1) ctx.globalAlpha = htAlpha;
          ctx.fillStyle = COLOR_NAME;
          ctx.beginPath();
          for (let i = 0; i < ng.n; i++) {
            if (!ng.active[i]) continue;
            stepNamePhysics(i);
            const dotX = ng.gx[i] + ng.ox[i];
            const dotY = ng.gy[i] + ng.oy[i];
            const hdx  = dotX - mouse.x, hdy = dotY - mouse.y;
            if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

            const nr = ng.nr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + ng.ph[i]));
            const r  = nr * dpr;
            const cx = dotX * dpr;
            const cy = dotY * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          ctx.fill();
          if (htAlpha < 1) ctx.globalAlpha = 1;
        }

        // ── Pass 4: Highlight zone (iterates both grids) ─────────────────
        if (!mouse.overClickable && mouse.x > -999) {
          ctx.fillStyle = COLOR_HIGHLIGHT;
          ctx.beginPath();
          for (let i = 0; i < g.n; i++) {
            if (g.nameHt[i]) continue; // name handled below
            const dotX = g.gx[i] + g.ox[i];
            const dotY = g.gy[i] + g.oy[i];
            const dx   = dotX - mouse.x;
            const dy   = dotY - mouse.y;
            const d2   = dx * dx + dy * dy;
            if (d2 >= HR2) continue;

            const tf    = 1 - d2 / HR2;
            const f     = tf * tf;
            let extra: number;
            let baseR: number;

            if (g.ht[i]) {
              baseR = g.hr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
              extra = HIGHLIGHT_EXTRA_HT * f;
            } else {
              baseR = g.br[i];
              extra = HIGHLIGHT_EXTRA_BG * f;
            }

            const r  = (baseR + extra) * dpr;
            const cx = dotX * dpr, cy = dotY * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          if (ng) {
            for (let i = 0; i < ng.n; i++) {
              if (!ng.active[i]) continue;
              // Subsample every other cell in both axes so the dispersed ring
              // inside HR2 reads at butterfly density (10px-equivalent spacing)
              // instead of the 5px name-grid density.
              const nc = i % ng.cols;
              const nr = (i - nc) / ng.cols;
              if ((nc & 1) || (nr & 1)) continue;
              const dotX = ng.gx[i] + ng.ox[i];
              const dotY = ng.gy[i] + ng.oy[i];
              const dx   = dotX - mouse.x;
              const dy   = dotY - mouse.y;
              const d2   = dx * dx + dy * dy;
              if (d2 >= HR2) continue;

              const tf    = 1 - d2 / HR2;
              const f     = tf * tf;
              const baseR = ng.nr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + ng.ph[i]));
              const extra = HIGHLIGHT_EXTRA_NM * f;
              const r     = (baseR + extra) * dpr;
              const cx = dotX * dpr, cy = dotY * dpr;
              ctx.moveTo(cx + r, cy);
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
            }
          }
          if (htAlpha < 1) ctx.globalAlpha = htAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    // ── Init ───────────────────────────────────────────────────────────────
    const init = async (isResize = false) => {
      const w = window.innerWidth, h = window.innerHeight;
      const cols = Math.ceil(w / GRID), rows = Math.ceil(h / GRID);
      const nCols = Math.ceil(w / NAME_GRID), nRows = Math.ceil(h / NAME_GRID);

      if (!grid || isResize) {
        grid = makeGrid(
          new Uint8Array(cols * rows),
          new Uint8Array(cols * rows),
          cols,
          rows,
        );
        nameGrid = makeNameGrid(new Uint8Array(nCols * nRows), nCols, nRows);
        htFadeStart = 0;
      }

      const built = await buildMaps(w, h);
      if (!alive) return;

      if (grid && grid.cols === built.cols && grid.rows === built.rows) {
        applyMaps(grid, built.bfMap, built.nameMask);
      } else {
        grid = makeGrid(built.bfMap, built.nameMask, built.cols, built.rows);
      }
      if (nameGrid && nameGrid.cols === built.nameCols && nameGrid.rows === built.nameRows) {
        applyNameMap(nameGrid, built.nameMap);
      } else {
        nameGrid = makeNameGrid(built.nameMap, built.nameCols, built.nameRows);
      }
      htFadeStart = performance.now();
    };

    rafId = requestAnimationFrame(frame);
    init();

    // ── Events ─────────────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; mouse.overClickable = false; };
    const onOver  = (e: MouseEvent) => {
      const el = e.target as Element | null;
      mouse.overClickable = !!el?.closest('a, button, [role="button"], select, input, label');
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); init(true); }, 200);
    };

    window.addEventListener('mousemove',    onMove,   { passive: true });
    window.addEventListener('mouseover',    onOver,   { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize',       onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove',    onMove);
      window.removeEventListener('mouseover',    onOver);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize',       onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
