'use client';

import { useEffect, useRef } from 'react';

const GRID   = 8;
const R_MAX  = 2.8;
const COLOR  = '#C0C0C0';

const REPEL_R = 48;
const REPEL_F = 6.0;

const SPRING_K = 0.055;
const DAMPING  = 0.82;

const HIGHLIGHT_R     = 48;
const HIGHLIGHT_EXTRA = 1.5;
const COLOR_HIGHLIGHT = '#141510';

type DotGrid = {
  n: number;
  gx: Float32Array; gy: Float32Array;
  br: Float32Array;
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
};

interface Props {
  src: string;
  collected?: boolean;
}

export default function HalftoneFly({ src, collected = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alive = true;
    let grid: DotGrid | null = null;
    let rafId = 0;
    const mouse = { x: -9999, y: -9999 };

    const buildGrid = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === 0 || h === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        const oc = document.createElement('canvas');
        oc.width = w; oc.height = h;
        const ctx2 = oc.getContext('2d');
        if (!ctx2) return;
        ctx2.drawImage(img, 0, 0, w, h);
        const id = ctx2.getImageData(0, 0, w, h);

        const cols = Math.ceil(w / GRID);
        const rows = Math.ceil(h / GRID);
        const dots: { gx: number; gy: number; br: number }[] = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const sx = Math.round(c * GRID + GRID / 2);
            const sy = Math.round(r * GRID + GRID / 2);
            if (sx >= w || sy >= h) continue;
            const alpha = id.data[(sy * w + sx) * 4 + 3];
            if (alpha <= 10) continue;
            dots.push({ gx: sx, gy: sy, br: R_MAX * (alpha / 255) });
          }
        }

        const n = dots.length;
        const g: DotGrid = {
          n,
          gx: new Float32Array(n), gy: new Float32Array(n),
          br: new Float32Array(n),
          ox: new Float32Array(n), oy: new Float32Array(n),
          vx: new Float32Array(n), vy: new Float32Array(n),
        };
        for (let i = 0; i < n; i++) {
          g.gx[i] = dots[i].gx;
          g.gy[i] = dots[i].gy;
          g.br[i] = dots[i].br;
        }
        grid = g;
      };
      img.src = src;
    };

    const frame = () => {
      if (!alive) return;
      const g = grid;
      if (!g) { rafId = requestAnimationFrame(frame); return; }

      const dpr = window.devicePixelRatio || 1;
      const HR2 = HIGHLIGHT_R * HIGHLIGHT_R;
      const rect = container.getBoundingClientRect();
      const mx = mouse.x - rect.left;
      const my = mouse.y - rect.top;
      const interactive = collected && mx > -999;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = COLOR;
      ctx.beginPath();
      for (let i = 0; i < g.n; i++) {
        const dotX = g.gx[i] + g.ox[i];
        const dotY = g.gy[i] + g.oy[i];

        if (interactive) {
          const dx = dotX - mx;
          const dy = dotY - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < REPEL_R * REPEL_R && d2 > 0.01) {
            const d = Math.sqrt(d2);
            g.vx[i] += (dx / d) * (1 - d / REPEL_R) * REPEL_F;
            g.vy[i] += (dy / d) * (1 - d / REPEL_R) * REPEL_F;
          }
        }

        if (g.ox[i] !== 0 || g.oy[i] !== 0 || g.vx[i] !== 0 || g.vy[i] !== 0) {
          g.vx[i] += -SPRING_K * g.ox[i];
          g.vy[i] += -SPRING_K * g.oy[i];
          g.vx[i] *= DAMPING;
          g.vy[i] *= DAMPING;
          g.ox[i] += g.vx[i];
          g.oy[i] += g.vy[i];
        }

        if (interactive) {
          const hdx = dotX - mx, hdy = dotY - my;
          if (hdx * hdx + hdy * hdy < HR2) continue;
        }

        const r = g.br[i] * dpr;
        const cx = (g.gx[i] + g.ox[i]) * dpr;
        const cy = (g.gy[i] + g.oy[i]) * dpr;
        ctx.moveTo(cx + r, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.fill();

      if (interactive) {
        ctx.fillStyle = COLOR_HIGHLIGHT;
        ctx.beginPath();
        for (let i = 0; i < g.n; i++) {
          const dotX = g.gx[i] + g.ox[i];
          const dotY = g.gy[i] + g.oy[i];
          const dx = dotX - mx;
          const dy = dotY - my;
          const d2 = dx * dx + dy * dy;
          if (d2 >= HR2) continue;

          const tf = 1 - d2 / HR2;
          const extra = HIGHLIGHT_EXTRA * tf * tf;
          const r = (g.br[i] + extra) * dpr;
          const cx = (g.gx[i] + g.ox[i]) * dpr;
          const cy = (g.gy[i] + g.oy[i]) * dpr;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };

    buildGrid();
    rafId = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => buildGrid());
    ro.observe(container);

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [src, collected]);

  return (
    <div
      ref={containerRef}
      className="halftone-fly"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
