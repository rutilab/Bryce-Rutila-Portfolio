'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID       = 12;
const R_BG       = 0.8;
const R_HT_MAX   = 3.0;
const COLOR_BG   = '#D8D8D8';
const COLOR_HT   = '#C0C0C0';

// ── Cursor radial glow ─────────────────────────────────────────────────────
const HIGHLIGHT_R        = 56;
const HIGHLIGHT_EXTRA_BG = 2.5;
const HIGHLIGHT_EXTRA_HT = 1.5;
const COLOR_HIGHLIGHT    = '#141510';

// ── Halftone fade-in ───────────────────────────────────────────────────────
const HT_FADE_MS = 350;

// ── Breathing ──────────────────────────────────────────────────────────────
const BREATHE_AMP   = 0.15;
const BREATHE_SPEED = 0.00055;

// ── Spring / damping ───────────────────────────────────────────────────────
const SPRING_K = 0.055;
const DAMPING  = 0.82;

// ── Cursor repulsion (halftone only) ──────────────────────────────────────
const REPEL_R_HT = 56;
const REPEL_F_HT = 6.0;

// ── Slam ripple ────────────────────────────────────────────────────────────
const WAVE_SPEED      = 450;
const WAVE_HALF_WIDTH = 65;
const WAVE_FORCE_HT   = 0.85;  // impulse for halftone dots
const WAVE_FORCE_BG   = 0.32;  // impulse for background dots (subtler scatter)
const WAVE_DURATION   = 2200;

// ── Butterfly configs (Figma 1440×1024 frame) ─────────────────────────────
// tf = top fraction — used for height-based visibility culling
const CONFIGS = [
  { url: '/butterflies/fly-1.svg', lf: 15 / 1440,   tf: -0.020, wf: 229.7 / 1440, ar: 223 / 191 },
  { url: '/butterflies/fly-2.svg', lf: 8 / 1440,    tf:  0.352, wf: 235.8 / 1440, ar: 226 / 184 },
  { url: '/butterflies/fly-3.svg', lf: -49 / 1440,  tf:  0.820, wf: 166.8 / 1440, ar: 217 / 206 },
  { url: '/butterflies/fly-4.svg', lf: 1009 / 1440, tf: -0.033, wf: 223.8 / 1440, ar: 212 / 220 },
  { url: '/butterflies/fly-5.svg', lf: 1308 / 1440, tf:  0.480, wf: 231.4 / 1440, ar: 222 / 200 },
  { url: '/butterflies/fly-6.svg', lf: 1092 / 1440, tf:  0.764, wf: 209 / 1440,   ar: 214 / 222 },
] as const;

// Which butterflies to show at different viewport heights
function activeConfigs(h: number) {
  if (h >= 700) return CONFIGS;
  if (h >= 500) return CONFIGS.filter(c => c.tf < 0.6);  // drop fly-3 & fly-6
  return CONFIGS.filter(c => c.tf < 0.1);                // top pair only
}

// ── Dot grid ───────────────────────────────────────────────────────────────
type Grid = {
  n: number; cols: number; rows: number;
  gx: Float32Array; gy: Float32Array;
  br: Float32Array;
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  ph: Float32Array;
  ht: Uint8Array;
};

function makeGrid(alphaMap: Uint8Array, cols: number, rows: number): Grid {
  const n = cols * rows;
  const g: Grid = {
    n, cols, rows,
    gx: new Float32Array(n), gy: new Float32Array(n),
    br: new Float32Array(n),
    ox: new Float32Array(n), oy: new Float32Array(n),
    vx: new Float32Array(n), vy: new Float32Array(n),
    ph: new Float32Array(n),
    ht: new Uint8Array(n),
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      g.gx[i] = c * GRID + GRID / 2;
      g.gy[i] = r * GRID + GRID / 2;
      g.ph[i] = Math.random() * Math.PI * 2;
      const a = alphaMap[i];
      if (a > 10) { g.ht[i] = 1; g.br[i] = R_HT_MAX * (a / 255); }
      else         { g.br[i] = R_BG; }
    }
  }
  return g;
}

// Update halftone values in-place — preserves spring state, avoids pop
function applyHalftoneMap(g: Grid, map: Uint8Array) {
  for (let i = 0; i < g.n; i++) {
    const a = map[i];
    if (a > 10) { g.ht[i] = 1; g.br[i] = R_HT_MAX * (a / 255); }
  }
}

async function buildAlphaMap(
  w: number, h: number,
): Promise<{ map: Uint8Array; cols: number; rows: number }> {
  const cols = Math.ceil(w / GRID);
  const rows = Math.ceil(h / GRID);
  const map  = new Uint8Array(cols * rows);
  const cfgs = activeConfigs(h);

  await Promise.all(cfgs.map(({ url, lf, tf, wf, ar }) =>
    new Promise<void>((resolve) => {
      const img  = new Image();
      img.onload = () => {
        const bW = Math.round(wf * w), bH = Math.round(bW * ar);
        const bX = Math.round(lf * w), bY = Math.round(tf * h);
        const oc = document.createElement('canvas');
        oc.width = bW; oc.height = bH;
        const ctx2 = oc.getContext('2d');
        if (!ctx2) { resolve(); return; }
        ctx2.drawImage(img, 0, 0, bW, bH);
        const id = ctx2.getImageData(0, 0, bW, bH);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const lx = Math.round(c * GRID + GRID / 2 - bX);
            const ly = Math.round(r * GRID + GRID / 2 - bY);
            if (lx >= 0 && lx < bW && ly >= 0 && ly < bH) {
              const alpha = id.data[(ly * bW + lx) * 4 + 3];
              if (alpha > 10) { const i = r * cols + c; map[i] = Math.max(map[i], alpha); }
            }
          }
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    }),
  ));

  return { map, cols, rows };
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
    let htFadeStart = 0;   // perf.now() when halftone first applied; 0 = not yet
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

      // Halftone fade alpha (0→1 over HT_FADE_MS after first load)
      const htAlpha = htFadeStart > 0
        ? Math.min(1, (ts - htFadeStart) / HT_FADE_MS)
        : 0;

      // Ripple state
      const ripple     = rippleRef.current;
      const waveRadius = ripple ? WAVE_SPEED * (ts - ripple.time) / 1000 : -1;
      const rippleActive = ripple !== null
        && waveRadius >= 0
        && ts - ripple.time < WAVE_DURATION;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (g) {
        // ── Pass 1: BG dots ──────────────────────────────────────────────
        ctx.fillStyle = COLOR_BG;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          if (g.ht[i]) continue;

          // Ripple physics for bg dots
          if (rippleActive) {
            const dotX = g.gx[i] + g.ox[i];
            const dotY = g.gy[i] + g.oy[i];
            const rdx  = dotX - ripple!.ox;
            const rdy  = dotY - ripple!.oy;
            const dist = Math.sqrt(rdx * rdx + rdy * rdy);
            const fromFront = dist - waveRadius;
            if (Math.abs(fromFront) < WAVE_HALF_WIDTH && dist > 0.1) {
              const norm  = fromFront / WAVE_HALF_WIDTH;
              const bell  = (1 - norm * norm) * (1 - norm * norm);
              g.vx[i] += (rdx / dist) * WAVE_FORCE_BG * bell;
              g.vy[i] += (rdy / dist) * WAVE_FORCE_BG * bell;
            }
          }

          // Spring return (only runs when dot has been displaced)
          if (g.ox[i] !== 0 || g.oy[i] !== 0 || g.vx[i] !== 0 || g.vy[i] !== 0) {
            g.vx[i] += -SPRING_K * g.ox[i];
            g.vy[i] += -SPRING_K * g.oy[i];
            g.vx[i] *= DAMPING;
            g.vy[i] *= DAMPING;
            g.ox[i] += g.vx[i];
            g.oy[i] += g.vy[i];
          }

          const dotX = (g.gx[i] + g.ox[i]) * dpr;
          const dotY = (g.gy[i] + g.oy[i]) * dpr;

          // Skip if in highlight zone
          const hdx = g.gx[i] + g.ox[i] - mouse.x;
          const hdy = g.gy[i] + g.oy[i] - mouse.y;
          if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

          const r = g.br[i] * dpr;
          ctx.moveTo(dotX + r, dotY);
          ctx.arc(dotX, dotY, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // ── Pass 2: Halftone dots ────────────────────────────────────────
        if (htAlpha > 0) {
          if (htAlpha < 1) ctx.globalAlpha = htAlpha;
          ctx.fillStyle = COLOR_HT;
          ctx.beginPath();
          for (let i = 0; i < g.n; i++) {
            if (!g.ht[i]) continue;

            // Spring
            g.vx[i] += -SPRING_K * g.ox[i];
            g.vy[i] += -SPRING_K * g.oy[i];

            // Cursor repulsion
            const dotX = g.gx[i] + g.ox[i];
            const dotY = g.gy[i] + g.oy[i];
            const dx   = dotX - mouse.x;
            const dy   = dotY - mouse.y;
            const d2   = dx * dx + dy * dy;
            if (d2 < REPEL_R_HT * REPEL_R_HT && d2 > 0.01) {
              const d = Math.sqrt(d2);
              g.vx[i] += (dx / d) * (1 - d / REPEL_R_HT) * REPEL_F_HT;
              g.vy[i] += (dy / d) * (1 - d / REPEL_R_HT) * REPEL_F_HT;
            }

            // Ripple wave
            if (rippleActive) {
              const rdx  = dotX - ripple!.ox;
              const rdy  = dotY - ripple!.oy;
              const dist = Math.sqrt(rdx * rdx + rdy * rdy);
              const fromFront = dist - waveRadius;
              if (Math.abs(fromFront) < WAVE_HALF_WIDTH && dist > 0.1) {
                const norm = fromFront / WAVE_HALF_WIDTH;
                const bell = (1 - norm * norm) * (1 - norm * norm);
                g.vx[i] += (rdx / dist) * WAVE_FORCE_HT * bell;
                g.vy[i] += (rdy / dist) * WAVE_FORCE_HT * bell;
              }
            }

            g.vx[i] *= DAMPING;
            g.vy[i] *= DAMPING;
            g.ox[i] += g.vx[i];
            g.oy[i] += g.vy[i];

            // Skip if in highlight zone
            const hdx = dotX - mouse.x, hdy = dotY - mouse.y;
            if (!mouse.overClickable && hdx * hdx + hdy * hdy < HR2) continue;

            const cx = (g.gx[i] + g.ox[i]) * dpr;
            const cy = (g.gy[i] + g.oy[i]) * dpr;
            const br = g.br[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
            const r  = br * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          ctx.fill();
          if (htAlpha < 1) ctx.globalAlpha = 1;
        }

        // ── Pass 3: Highlight zone (skip if over clickable) ──────────────
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
            const t_f   = 1 - d2 / HR2;
            const f     = t_f * t_f;
            const extra = g.ht[i] ? HIGHLIGHT_EXTRA_HT * f : HIGHLIGHT_EXTRA_BG * f;
            const baseR = g.ht[i]
              ? g.br[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]))
              : g.br[i];
            const r  = (baseR + extra) * dpr;
            const cx = dotX * dpr, cy = dotY * dpr;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          if (htAlpha < 1) ctx.globalAlpha = htAlpha; // fade highlight with halftone
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
        // Fresh grid (first load or resize)
        grid = makeGrid(new Uint8Array(cols * rows), cols, rows);
        htFadeStart = 0;
      }

      const { map, cols: c2, rows: r2 } = await buildAlphaMap(w, h);
      if (!alive) return;

      if (grid && grid.cols === c2 && grid.rows === r2) {
        // Same dimensions — update in place, preserving spring state
        applyHalftoneMap(grid, map);
        htFadeStart = performance.now();
      } else {
        // Dimensions changed during load — rebuild
        grid = makeGrid(map, c2, r2);
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
