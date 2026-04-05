'use client';

import { useEffect, useRef } from 'react';

// The three palette colors — sampled in sequence as the cursor moves
const COLORS = [
  { r: 137, g: 255, b:  18 }, // #89FF12  lime green
  { r: 255, g: 156, b:  18 }, // #FF9C12  orange
  { r: 255, g:  18, b: 251 }, // #FF12FB  magenta
];

const TRAIL_DURATION = 480;  // ms each dot lives before fully fading
const DOT_SIZE       = 4;    // px — square pixel size
const MIN_DIST       = 2;    // px — min distance between stored points
// How many pixels of cursor travel = one full green→orange→magenta→green cycle.
// Lower = faster cycling; higher = more gradual.
const CYCLE_PX       = 700;
// Home cursor: 32×32 PNG with hotspot (0,0) = top-left; trail emerges from image center.
const TRAIL_ORIGIN_X = 16;
const TRAIL_ORIGIN_Y = 16;

// Smoothly interpolate between two palette entries
function lerp(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

// Sample the color ribbon at position `pos` (0 → COLORS.length, wrapping).
// Fractional values smoothly blend between adjacent colors.
function sampleRibbon(pos: number) {
  const n = COLORS.length;
  const p = ((pos % n) + n) % n;          // keep in [0, n)
  const i = Math.floor(p) % n;
  const j = (i + 1) % n;
  return lerp(COLORS[i], COLORS[j], p - i);
}

export function CursorContrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Each dot stores its own baked color so the trailing pixels never change
    // hue after they're born — only new dots pull from the advancing ribbon.
    let trail: { x: number; y: number; t: number; r: number; g: number; b: number }[] = [];

    // ribbonPos advances with cumulative distance traveled; starts at 0 = green.
    let ribbonPos = 0;
    let raf = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const tx = e.clientX + TRAIL_ORIGIN_X;
      const ty = e.clientY + TRAIL_ORIGIN_Y;
      const last = trail[trail.length - 1];

      // Measure distance from last stored point
      let dist = 0;
      if (last) {
        const dx = tx - last.x;
        const dy = ty - last.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_DIST) return; // skip micro-movements
      }

      // Advance ribbon by the fraction of a cycle this movement represents
      ribbonPos = (ribbonPos + (dist / CYCLE_PX) * COLORS.length) % COLORS.length;

      // Bake the current ribbon color directly into this dot
      const { r, g, b } = sampleRibbon(ribbonPos);
      trail.push({ x: tx, y: ty, t: now, r, g, b });
    };

    window.addEventListener('mousemove', onMove);

    const draw = () => {
      const now = Date.now();

      // Drop expired dots
      trail = trail.filter(p => now - p.t < TRAIL_DURATION);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const point of trail) {
        const age     = now - point.t;
        const t       = age / TRAIL_DURATION;   // 0 (fresh) → 1 (gone)
        const opacity = (1 - t) * (1 - t);      // quadratic ease-out fade

        ctx.fillStyle = `rgba(${point.r},${point.g},${point.b},${opacity.toFixed(3)})`;
        ctx.fillRect(
          Math.round(point.x) - Math.floor(DOT_SIZE / 2),
          Math.round(point.y) - Math.floor(DOT_SIZE / 2),
          DOT_SIZE,
          DOT_SIZE,
        );
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
