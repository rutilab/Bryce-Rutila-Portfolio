'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID     = 10;
const R_BG     = 0.9;
const COLOR_BG = '#D8D8D8';
/** The page ground. The canvas repaints it each frame; the wrapper holds it
 *  before the canvas can and wherever the canvas has not caught up. */
const BACKDROP = '#faf7f2';

// ── Spring / damping ───────────────────────────────────────────────────────
const SPRING_K = 0.055;
const DAMPING  = 0.82;

// ── Cursor repulsion ──────────────────────────────────────────────────────
// The displacement is the whole effect, so it pushes gently — dots lean away
// from the drawn cursor rather than evacuating.
const CURSOR_R = 50;
const CURSOR_F = 1.8;

// ── Slam ripple ────────────────────────────────────────────────────────────
const WAVE_SPEED      = 450;
const WAVE_HALF_WIDTH = 65;
const WAVE_FORCE_BG   = 0.32;
const WAVE_DURATION   = 2200;

// ── Dot grid ───────────────────────────────────────────────────────────────
type Grid = {
  n: number; cols: number; rows: number;
  gx: Float32Array; gy: Float32Array;
  br: Float32Array;
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  ph: Float32Array;
};

function makeGrid(cols: number, rows: number): Grid {
  const n = cols * rows;
  const g: Grid = {
    n, cols, rows,
    gx: new Float32Array(n), gy: new Float32Array(n),
    br: new Float32Array(n),
    ox: new Float32Array(n), oy: new Float32Array(n),
    vx: new Float32Array(n), vy: new Float32Array(n),
    ph: new Float32Array(n),
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      g.gx[i] = c * GRID + GRID / 2;
      // Start one row above the viewport so scroll-offset never reveals a gap
      g.gy[i] = (r - 1) * GRID + GRID / 2;
      g.ph[i] = Math.random() * Math.PI * 2;
      g.br[i] = R_BG;
    }
  }
  return g;
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  rippleTrigger?: number;
}

/**
 * The page's dot field. Dots lean away from the pointer and settle back on a
 * spring; a ripple can be fired through them from the centre.
 *
 * The collected BR flies draw their own halftone art — see HalftoneFly — which
 * is a separate canvas with its own scatter, unrelated to this one.
 */
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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let alive = true;
    let grid: Grid | null = null;
    let rafId = 0;
    const mouse = { x: -9999, y: -9999 };

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
      const dpr       = window.devicePixelRatio || 1;
      const g         = grid;
      // Offset dots by scroll position (mod GRID) so they scroll with the page
      const scrollOff = (window.scrollY % GRID) * dpr;
      // Dots are drawn scrollOff higher than their grid position, so compare the
      // pointer in grid space — otherwise the effect trails the cursor by up to one cell.
      const mouseYG = mouse.y + scrollOff / dpr;

      const ripple      = rippleRef.current;
      const waveRadius  = ripple ? WAVE_SPEED * (ts - ripple.time) / 1000 : -1;
      const rippleActive = ripple !== null
        && waveRadius >= 0
        && ts - ripple.time < WAVE_DURATION;

      ctx.fillStyle = BACKDROP;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (g) {
        const stepPhysics = (i: number) => {
          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];

          // Ripple wave
          if (rippleActive) {
            const rdx  = dotX - ripple!.ox;
            const rdy  = dotY - ripple!.oy;
            const dist = Math.sqrt(rdx * rdx + rdy * rdy);
            const fromFront = dist - waveRadius;
            if (Math.abs(fromFront) < WAVE_HALF_WIDTH && dist > 0.1) {
              const norm = fromFront / WAVE_HALF_WIDTH;
              const bell = (1 - norm * norm) * (1 - norm * norm);
              g.vx[i] += (rdx / dist) * WAVE_FORCE_BG * bell;
              g.vy[i] += (rdy / dist) * WAVE_FORCE_BG * bell;
            }
          }

          // Cursor repulsion — runs everywhere, including over links.
          const dx = dotX - mouse.x;
          const dy = dotY - mouseYG;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_R * CURSOR_R && d2 > 0.01) {
            const d = Math.sqrt(d2);
            g.vx[i] += (dx / d) * (1 - d / CURSOR_R) * CURSOR_F;
            g.vy[i] += (dy / d) * (1 - d / CURSOR_R) * CURSOR_F;
          }

          g.vx[i] += -SPRING_K * g.ox[i];
          g.vy[i] += -SPRING_K * g.oy[i];
          g.vx[i] *= DAMPING;
          g.vy[i] *= DAMPING;
          g.ox[i] += g.vx[i];
          g.oy[i] += g.vy[i];
        };

        ctx.fillStyle = COLOR_BG;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          // A dot at rest has no offset or velocity, so it would never be stepped and
          // never feel the cursor. Wake the ones the pointer is close enough to shove.
          const nearCursor =
            Math.abs(g.gx[i] - mouse.x) < CURSOR_R &&
            Math.abs(g.gy[i] - mouseYG) < CURSOR_R;
          if (g.ox[i] !== 0 || g.oy[i] !== 0 || g.vx[i] !== 0 || g.vy[i] !== 0 || rippleActive || nearCursor) {
            stepPhysics(i);
          }

          const r  = g.br[i] * dpr;
          const cx = (g.gx[i] + g.ox[i]) * dpr;
          const cy = (g.gy[i] + g.oy[i]) * dpr - scrollOff;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };

    // ── Init ───────────────────────────────────────────────────────────────
    const init = (isResize = false) => {
      const w = window.innerWidth, h = window.innerHeight;
      const cols = Math.ceil(w / GRID);
      // +2 rows: one above viewport (for scroll offset) + one below for safety
      const rows = Math.ceil(h / GRID) + 2;
      if (!grid || isResize) {
        grid = makeGrid(cols, rows);
      }
    };

    rafId = requestAnimationFrame(frame);
    init();

    // ── Events ─────────────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); init(true); }, 200);
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
    /**
     * The ground is this div, not the canvas. A canvas sizes itself from its
     * width/height attributes, which only get set once the script runs and then
     * only on a 200ms debounce — so before hydration it was 300×150, and during
     * a window drag it lagged the viewport. Either way the layer behind it
     * showed through, and on the case-study routes that layer is a different
     * white. A plain div with inset:0 fills the viewport from the very first
     * paint and never lags, so the colour behind the dots is always this one.
     */
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: BACKDROP,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
