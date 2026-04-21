'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID       = 12;    // CSS px between dot centers
const R_BG       = 0.8;   // background dot radius (CSS px)
const R_HT_MAX   = 3.0;   // halftone dot max radius (CSS px)
const COLOR_BG   = '#D8D8D8';
const COLOR_HT   = '#C0C0C0';

// ── Breathing ──────────────────────────────────────────────────────────────
const BREATHE_AMP   = 0.15;    // ±15 % of halftone radius
const BREATHE_SPEED = 0.00055; // rad/ms — one full cycle ≈ 11 s

// ── Spring / damping ───────────────────────────────────────────────────────
const SPRING_K = 0.055;
const DAMPING  = 0.82;

// ── Cursor repulsion ───────────────────────────────────────────────────────
const REPEL_R_BG  = 50;   // CSS px influence radius for bg dots
const REPEL_R_HT  = 75;   // CSS px influence radius for halftone dots
const REPEL_F_BG  = 2.5;  // max CSS px displacement for bg dots
const REPEL_F_HT  = 6.0;  // max CSS px displacement for halftone dots

// ── Butterfly asset positions (mirror Figma layout, 1440×1024 frame) ───────
// lf = left/1440, tf = top/1024, wf = width/1440, ar = svgH/svgW
const CONFIGS = [
  { url: '/butterflies/fly-1.svg', lf: 15 / 1440,   tf: -21 / 1024,  wf: 229.7 / 1440, ar: 223 / 191 },
  { url: '/butterflies/fly-2.svg', lf: 8 / 1440,    tf: 360 / 1024,  wf: 235.8 / 1440, ar: 226 / 184 },
  { url: '/butterflies/fly-3.svg', lf: -49 / 1440,  tf: 840 / 1024,  wf: 166.8 / 1440, ar: 217 / 206 },
  { url: '/butterflies/fly-4.svg', lf: 1009 / 1440, tf: -34 / 1024,  wf: 223.8 / 1440, ar: 212 / 220 },
  { url: '/butterflies/fly-5.svg', lf: 1308 / 1440, tf: 491 / 1024,  wf: 231.4 / 1440, ar: 222 / 200 },
  { url: '/butterflies/fly-6.svg', lf: 1092 / 1440, tf: 782 / 1024,  wf: 209 / 1440,   ar: 214 / 222 },
] as const;

// ── Dot grid (flat typed arrays for perf) ──────────────────────────────────
type Grid = {
  n:  number;
  gx: Float32Array; gy: Float32Array;  // grid base positions (CSS px)
  br: Float32Array;                    // base radius (CSS px)
  ox: Float32Array; oy: Float32Array;  // spring offset (CSS px)
  vx: Float32Array; vy: Float32Array;  // velocity (CSS px / frame)
  ph: Float32Array;                    // breathing phase offset (rad)
  ht: Uint8Array;                      // 1 = halftone dot
};

function makeGrid(
  alphaMap: Uint8Array,
  cols: number,
  rows: number,
): Grid {
  const n = cols * rows;
  const g: Grid = {
    n,
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
      if (a > 10) {
        g.ht[i] = 1;
        g.br[i] = R_HT_MAX * (a / 255);
      } else {
        g.br[i] = R_BG;
      }
    }
  }
  return g;
}

// Sample each butterfly SVG into a per-dot alpha map
async function buildAlphaMap(
  w: number,
  h: number,
): Promise<{ map: Uint8Array; cols: number; rows: number }> {
  const cols = Math.ceil(w / GRID);
  const rows = Math.ceil(h / GRID);
  const map  = new Uint8Array(cols * rows);

  await Promise.all(
    CONFIGS.map(({ url, lf, tf, wf, ar }) =>
      new Promise<void>((resolve) => {
        const img  = new Image();
        img.onload = () => {
          const bW   = Math.round(wf * w);
          const bH   = Math.round(bW * ar);
          const bX   = Math.round(lf * w);
          const bY   = Math.round(tf * h);
          const oc   = document.createElement('canvas');
          oc.width   = bW;
          oc.height  = bH;
          const ctx2 = oc.getContext('2d');
          if (!ctx2) { resolve(); return; }
          ctx2.drawImage(img, 0, 0, bW, bH);
          const id = ctx2.getImageData(0, 0, bW, bH);

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const dotX = c * GRID + GRID / 2;
              const dotY = r * GRID + GRID / 2;
              const lx   = Math.round(dotX - bX);
              const ly   = Math.round(dotY - bY);
              if (lx >= 0 && lx < bW && ly >= 0 && ly < bH) {
                const alpha = id.data[(ly * bW + lx) * 4 + 3];
                if (alpha > 10) {
                  const i = r * cols + c;
                  map[i]  = Math.max(map[i], alpha);
                }
              }
            }
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src     = url;
      }),
    ),
  );

  return { map, cols, rows };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HalftoneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alive = true;
    let grid: Grid | null = null;
    let rafId = 0;
    let t0 = 0;
    const mouse = { x: -9999, y: -9999 };

    // ── Size canvas to viewport at device pixel ratio ──────────────────────
    const resize = () => {
      const dpr       = window.devicePixelRatio || 1;
      canvas.width    = window.innerWidth  * dpr;
      canvas.height   = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    // ── Animation loop ─────────────────────────────────────────────────────
    const frame = (ts: number) => {
      if (!alive) return;
      if (t0 === 0) t0 = ts;
      const t   = ts - t0;
      const dpr = window.devicePixelRatio || 1;
      const g   = grid;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (g) {
        // BG dots pass
        ctx.fillStyle = COLOR_BG;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          if (g.ht[i]) continue;

          // Spring
          g.vx[i] += -SPRING_K * g.ox[i];
          g.vy[i] += -SPRING_K * g.oy[i];

          // Cursor repulsion (CSS px throughout)
          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];
          const dx   = dotX - mouse.x;
          const dy   = dotY - mouse.y;
          const d2   = dx * dx + dy * dy;
          if (d2 < REPEL_R_BG * REPEL_R_BG && d2 > 0.01) {
            const d   = Math.sqrt(d2);
            const f   = (1 - d / REPEL_R_BG) * REPEL_F_BG;
            g.vx[i]  += (dx / d) * f;
            g.vy[i]  += (dy / d) * f;
          }

          g.vx[i] *= DAMPING;
          g.vy[i] *= DAMPING;
          g.ox[i] += g.vx[i];
          g.oy[i] += g.vy[i];

          const cx = (g.gx[i] + g.ox[i]) * dpr;
          const cy = (g.gy[i] + g.oy[i]) * dpr;
          const r  = g.br[i] * dpr;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // Halftone dots pass (separate color)
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
            const d   = Math.sqrt(d2);
            const f   = (1 - d / REPEL_R_HT) * REPEL_F_HT;
            g.vx[i]  += (dx / d) * f;
            g.vy[i]  += (dy / d) * f;
          }

          g.vx[i] *= DAMPING;
          g.vy[i] *= DAMPING;
          g.ox[i] += g.vx[i];
          g.oy[i] += g.vy[i];

          const cx = (g.gx[i] + g.ox[i]) * dpr;
          const cy = (g.gy[i] + g.oy[i]) * dpr;
          const br = g.br[i] * (1 + BREATHE_AMP * Math.sin(t * BREATHE_SPEED + g.ph[i]));
          const r  = br * dpr;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };

    // ── Init: bg-only grid first, then async halftone ──────────────────────
    const init = async () => {
      const w    = window.innerWidth;
      const h    = window.innerHeight;
      const cols = Math.ceil(w / GRID);
      const rows = Math.ceil(h / GRID);
      // Immediate bg-only grid so something renders while SVGs load
      grid = makeGrid(new Uint8Array(cols * rows), cols, rows);
      // Load halftone map
      const { map, cols: c2, rows: r2 } = await buildAlphaMap(w, h);
      if (alive) grid = makeGrid(map, c2, r2);
    };

    rafId = requestAnimationFrame(frame);
    init();

    // ── Events ─────────────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent)  => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = ()               => { mouse.x = -9999; mouse.y = -9999; };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); init(); }, 200);
    };

    window.addEventListener('mousemove',    onMove,   { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize',       onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove',    onMove);
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
