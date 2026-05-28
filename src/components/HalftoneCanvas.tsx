'use client';

import { useEffect, useRef } from 'react';

// ── Grid constants ─────────────────────────────────────────────────────────
const GRID     = 10;
const R_BG     = 0.9;
const COLOR_BG = '#D8D8D8';

// ── Cursor radial glow ─────────────────────────────────────────────────────
const HIGHLIGHT_R        = 48;
const HIGHLIGHT_EXTRA_BG = 2.5;
const COLOR_HIGHLIGHT    = '#141510';

// ── Spring / damping ───────────────────────────────────────────────────────
const SPRING_K = 0.055;
const DAMPING  = 0.82;

// ── Cursor repulsion ──────────────────────────────────────────────────────
const REPEL_R = 60;
const REPEL_F = 6.5;

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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let alive = true;
    let grid: Grid | null = null;
    let rafId = 0;
    const mouse = { x: -9999, y: -9999, overClickable: false, inHalftone: false };

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
      if (document.body.dataset.modalOpen) {
        mouse.overClickable = false; mouse.inHalftone = false;
      }
      const dpr       = window.devicePixelRatio || 1;
      const g         = grid;
      const HR2       = HIGHLIGHT_R * HIGHLIGHT_R;
      // Offset dots by scroll position (mod GRID) so they scroll with the page
      const scrollOff = (window.scrollY % GRID) * dpr;

      const ripple      = rippleRef.current;
      const waveRadius  = ripple ? WAVE_SPEED * (ts - ripple.time) / 1000 : -1;
      const rippleActive = ripple !== null
        && waveRadius >= 0
        && ts - ripple.time < WAVE_DURATION;

      ctx.fillStyle = '#faf7f2';
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

          // Cursor repulsion
          if (!mouse.overClickable) {
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

        // ── Pass 1: Background dots ──────────────────────────────────────
        ctx.fillStyle = COLOR_BG;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          if (g.ox[i] !== 0 || g.oy[i] !== 0 || g.vx[i] !== 0 || g.vy[i] !== 0 || rippleActive) {
            stepPhysics(i);
          }

          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];
          const hdx  = dotX - mouse.x, hdy = dotY - mouse.y;
          if (!mouse.overClickable && !mouse.inHalftone && hdx * hdx + hdy * hdy < HR2) continue;

          const r  = g.br[i] * dpr;
          const cx = dotX * dpr, cy = dotY * dpr - scrollOff;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // ── Pass 2: Highlight zone ───────────────────────────────────────
        if (!mouse.overClickable && !mouse.inHalftone && mouse.x > -999) {
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
            const extra = HIGHLIGHT_EXTRA_BG * tf * tf;
            const r     = (g.br[i] + extra) * dpr;
            const cx    = dotX * dpr, cy = dotY * dpr - scrollOff;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
          ctx.fill();
        }
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
    const onMove  = (e: MouseEvent) => {
      if (document.body.dataset.modalOpen) {
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.overClickable = false; mouse.inHalftone = false;
        return;
      }
      mouse.x = e.clientX; mouse.y = e.clientY;

      const el = e.target as Element | null;
      if (el?.closest('a, button, [role="button"], select, input, label, .bryce-svg')) {
        mouse.overClickable = true;
      } else {
        const cs = el ? getComputedStyle(el).cursor : '';
        mouse.overClickable = cs === 'pointer' || cs === 'grab' || cs === 'grabbing';
      }

      const els = document.querySelectorAll('.br-fly-collected');
      let hit = false;
      for (let i = 0; i < els.length; i++) {
        const r = els[i].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          hit = true; break;
        }
      }
      mouse.inHalftone = hit;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; mouse.overClickable = false; mouse.inHalftone = false; };
    const onOver  = (e: MouseEvent) => {
      if (document.body.dataset.modalOpen) return;
      const el = e.target as Element | null;
      if (el?.closest('a, button, [role="button"], select, input, label, .bryce-svg')) {
        mouse.overClickable = true;
      } else {
        const cs = el ? getComputedStyle(el).cursor : '';
        mouse.overClickable = cs === 'pointer' || cs === 'grab' || cs === 'grabbing';
      }
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
