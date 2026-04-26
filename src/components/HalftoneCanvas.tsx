'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID       = 10;
const R_BG       = 0.9;
const R_HT_MAX   = 2.8;
const R_NAME_MAX = 4.5;
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

// ── Slam ripple ────────────────────────────────────────────────────────────
const WAVE_SPEED      = 450;
const WAVE_HALF_WIDTH = 65;
const WAVE_FORCE_HT   = 0.85;
const WAVE_FORCE_BG   = 0.32;
const WAVE_DURATION   = 2200;

// ── Butterfly configs ─────────────────────────────────────────────────────
type BfConfig = { url: string; lf: number; tf: number; wf: number; ar: number; rot?: number };

const CONFIGS: BfConfig[] = [
  { url: '/butterflies/fly-1.svg', lf:  179.7 / 1440, tf: 122 / 1024, wf: 218 / 1440, ar: 223 / 191, rot: 15 },
  { url: '/butterflies/fly-4.svg', lf: 1130   / 1440, tf:  65 / 1024, wf: 267 / 1440, ar: 212 / 220 },
  { url: '/butterflies/fly-3.svg', lf:   94.5 / 1440, tf: 707 / 1024, wf: 277 / 1440, ar: 217 / 206 },
  { url: '/butterflies/fly-6.svg', lf: 1042   / 1440, tf: 805 / 1024, wf: 218 / 1440, ar: 214 / 222 },
];

function activeConfigs(h: number) {
  if (h >= 700) return CONFIGS;
  if (h >= 500) return CONFIGS.filter(c => c.tf < 0.6);
  return CONFIGS.filter(c => c.tf < 0.1);
}

// ── Name SVG config ────────────────────────────────────────────────────────
const NAME_URL = '/name.svg';
const NAME_SVG_W = 771;
const NAME_SVG_H = 115;
// Target rendered width as a fraction of viewport width (capped at max pixels)
const NAME_W_FRAC = 0.68;
const NAME_W_MAX  = 880;

// ── Dot grid ───────────────────────────────────────────────────────────────
type Grid = {
  n: number; cols: number; rows: number;
  gx: Float32Array; gy: Float32Array;
  br: Float32Array;    // bg dot radius
  nr: Float32Array;    // name dot radius
  hr: Float32Array;    // butterfly halftone radius
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  ph: Float32Array;
  ht:     Uint8Array;  // 1 = butterfly halftone
  nameHt: Uint8Array;  // 1 = name halftone
};

function makeGrid(
  bfMap: Uint8Array,
  nameMap: Uint8Array,
  cols: number,
  rows: number,
): Grid {
  const n = cols * rows;
  const g: Grid = {
    n, cols, rows,
    gx: new Float32Array(n), gy: new Float32Array(n),
    br: new Float32Array(n),
    nr: new Float32Array(n),
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

      const na = nameMap[i];
      const ba = bfMap[i];

      if (na > 10) {
        g.nameHt[i] = 1;
        g.nr[i] = R_NAME_MAX * (na / 255);
      } else if (ba > 10) {
        g.ht[i] = 1;
        g.hr[i] = R_HT_MAX * (ba / 255);
      }
      g.br[i] = R_BG; // every dot has a bg radius (used when not ht/nameHt)
    }
  }
  return g;
}

function applyMaps(g: Grid, bfMap: Uint8Array, nameMap: Uint8Array) {
  for (let i = 0; i < g.n; i++) {
    const na = nameMap[i];
    const ba = bfMap[i];
    if (na > 10) {
      g.nameHt[i] = 1;
      g.nr[i] = R_NAME_MAX * (na / 255);
    } else if (ba > 10) {
      g.ht[i] = 1;
      g.hr[i] = R_HT_MAX * (ba / 255);
    }
  }
}

// Load one SVG into an off-screen canvas and sample it into a per-cell alpha map
async function sampleSvg(
  url: string,
  renderW: number, renderH: number,
  originX: number, originY: number,
  cols: number, rows: number,
  rot = 0,
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve) => {
    const map = new Uint8Array(cols * rows);
    const img = new Image();
    img.onload = () => {
      const oc  = document.createElement('canvas');
      oc.width  = renderW;
      oc.height = renderH;
      const ctx2 = oc.getContext('2d');
      if (!ctx2) { resolve(map); return; }
      ctx2.drawImage(img, 0, 0, renderW, renderH);
      const id   = ctx2.getImageData(0, 0, renderW, renderH);
      const cosR = Math.cos(rot * Math.PI / 180);
      const sinR = Math.sin(rot * Math.PI / 180);
      const cx   = originX + renderW / 2;
      const cy   = originY + renderH / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c * GRID + GRID / 2 - cx;
          const dy = r * GRID + GRID / 2 - cy;
          const lx = Math.round(dx * cosR + dy * sinR + renderW / 2);
          const ly = Math.round(-dx * sinR + dy * cosR + renderH / 2);
          if (lx >= 0 && lx < renderW && ly >= 0 && ly < renderH) {
            const alpha = id.data[(ly * renderW + lx) * 4 + 3];
            if (alpha > 10) {
              const i = r * cols + c;
              map[i] = Math.max(map[i], alpha);
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
  cols: number;
  rows: number;
}> {
  const cols = Math.ceil(w / GRID);
  const rows = Math.ceil(h / GRID);

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
  const nameW = Math.min(Math.round(w * NAME_W_FRAC), NAME_W_MAX);
  const nameH = Math.round(nameW * (NAME_SVG_H / NAME_SVG_W));
  const nameX = Math.round((w - nameW) / 2);
  // Position name slightly above vertical center to leave room for CTA area
  const nameY = Math.round(h / 2 - nameH / 2);
  const nameMap = await sampleSvg(NAME_URL, nameW, nameH, nameX, nameY, cols, rows);

  return { bfMap, nameMap, cols, rows };
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

        // ── Pass 3: Name halftone dots (dark) ────────────────────────────
        if (htAlpha > 0) {
          if (htAlpha < 1) ctx.globalAlpha = htAlpha;
          ctx.fillStyle = COLOR_NAME;
          ctx.beginPath();
          for (let i = 0; i < g.n; i++) {
            if (!g.nameHt[i]) continue;
            stepPhysics(i, true);
            const dotX = g.gx[i] + g.ox[i];
            const dotY = g.gy[i] + g.oy[i];
            const hdx  = dotX - mouse.x, hdy = dotY - mouse.y;
            if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

            const nr = g.nr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
            const r  = nr * dpr;
            const cx = (g.gx[i] + g.ox[i]) * dpr;
            const cy = (g.gy[i] + g.oy[i]) * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          ctx.fill();
          if (htAlpha < 1) ctx.globalAlpha = 1;
        }

        // ── Pass 4: Highlight zone ────────────────────────────────────────
        if (!mouse.overClickable && mouse.x > -999) {
          ctx.fillStyle = COLOR_HIGHLIGHT;
          ctx.beginPath();
          for (let i = 0; i < g.n; i++) {
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

            if (g.nameHt[i]) {
              // Name dots: slightly enlarge on hover (already dark, so just size)
              baseR = g.nr[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
              extra = HIGHLIGHT_EXTRA_NM * f;
            } else if (g.ht[i]) {
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

      if (!grid || isResize) {
        grid = makeGrid(
          new Uint8Array(cols * rows),
          new Uint8Array(cols * rows),
          cols,
          rows,
        );
        htFadeStart = 0;
      }

      const { bfMap, nameMap, cols: c2, rows: r2 } = await buildMaps(w, h);
      if (!alive) return;

      if (grid && grid.cols === c2 && grid.rows === r2) {
        applyMaps(grid, bfMap, nameMap);
        htFadeStart = performance.now();
      } else {
        grid = makeGrid(bfMap, nameMap, c2, r2);
        htFadeStart = performance.now();
      }
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
