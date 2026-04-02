'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function PainPointGridPlaceholder() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const [poofing, setPoofing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const [bunnySrc, setBunnySrc] = useState<string | null>(null);

  useEffect(() => {
    if (!poofing) return;
    const t = window.setTimeout(() => {
      setRevealed(true);
      setPoofing(false);
    }, 420);
    return () => window.clearTimeout(t);
  }, [poofing]);

  // Preprocess bunny early so we never flash the raw black background on reveal.
  useEffect(() => {
    if (bunnySrc) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/easter-eggs/bunny.png';

    img.onload = () => {
      if (cancelled) return;

      // Downscale before processing to keep it fast and avoid layout impact.
      const maxDim = 360;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const isBg = (idx: number) => {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        return a > 0 && r < 18 && g < 18 && b < 18;
      };

      // Flood-fill from edges to remove only the background connected to the image border.
      const visited = new Uint8Array(w * h);
      const qx = new Int32Array(w * h);
      const qy = new Int32Array(w * h);
      let qh = 0;
      let qt = 0;

      const push = (x: number, y: number) => {
        const p = y * w + x;
        if (visited[p]) return;
        const idx = p * 4;
        if (!isBg(idx)) return;
        visited[p] = 1;
        qx[qt] = x;
        qy[qt] = y;
        qt += 1;
      };

      for (let x = 0; x < w; x++) {
        push(x, 0);
        push(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        push(0, y);
        push(w - 1, y);
      }

      while (qh < qt) {
        const x = qx[qh];
        const y = qy[qh];
        qh += 1;
        const p = y * w + x;
        const idx = p * 4;
        data[idx + 3] = 0;

        if (x > 0) push(x - 1, y);
        if (x < w - 1) push(x + 1, y);
        if (y > 0) push(x, y - 1);
        if (y < h - 1) push(x, y + 1);
      }

      ctx.putImageData(imageData, 0, 0);
      const url = canvas.toDataURL('image/png');
      if (!cancelled) setBunnySrc(url);
    };

    img.onerror = () => {
      if (!cancelled) setBunnySrc('/easter-eggs/bunny.png');
    };

    return () => {
      cancelled = true;
    };
  }, [bunnySrc]);

  const tooltipPos = useMemo(
    () => ({ left: mouse.clientX + 14, top: mouse.clientY + 16 }),
    [mouse.clientX, mouse.clientY]
  );

  const overlay = typeof document !== 'undefined' ? document.body : null;

  return (
    <div
      ref={rootRef}
      className={[
        'pain-point-grid__placeholder',
        'relative flex min-h-0 items-center justify-center px-4 py-6',
        !revealed ? 'cursor-pointer select-none' : 'cursor-default',
      ].join(' ')}
      role={!revealed ? 'button' : undefined}
      tabIndex={!revealed ? 0 : -1}
      aria-label={!revealed ? 'Click to eradicate placeholder' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const r = rootRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top, clientX: e.clientX, clientY: e.clientY });
      }}
      onClick={(e) => {
        if (poofing || revealed) return;
        setBurst({ id: Date.now(), x: e.clientX, y: e.clientY });
        window.setTimeout(() => setBurst(null), 480);
        setPoofing(true);
      }}
      onKeyDown={(e) => {
        if (revealed) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (poofing || revealed) return;
          const r = rootRef.current?.getBoundingClientRect();
          const cx = r ? r.left + r.width / 2 : mouse.clientX;
          const cy = r ? r.top + r.height / 2 : mouse.clientY;
          setBurst({ id: Date.now(), x: cx, y: cy });
          window.setTimeout(() => setBurst(null), 480);
          setPoofing(true);
        }
      }}
      style={
        {
          cursor: !revealed && hovered ? 'url(/cursors/magic-wand-32.png) 2 2, pointer' : undefined,
          ...(poofing
            ? {
                transform: 'scale(0.86)',
                opacity: 0,
                filter: 'blur(2px)',
                transition: 'transform 360ms ease, opacity 360ms ease, filter 360ms ease',
              }
            : {}),
        } as React.CSSProperties
      }
    >
      {!revealed && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <rect
            x="1%"
            y="1%"
            width="98%"
            height="98%"
            rx={18}
            ry={18}
            fill="none"
            stroke="#d8d8d8"
            strokeWidth={2}
            strokeDasharray="20 20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {overlay &&
        !poofing &&
        hovered &&
        !revealed &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] rounded-[10px] bg-[rgba(0,0,0,0.78)] px-2.5 py-1.5 text-[11px] font-medium tracking-[0.2px] text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
            aria-hidden
          >
            Alakazam!
          </div>,
          overlay
        )}

      {overlay && burst && createPortal(<MagicBurst key={burst.id} x={burst.x} y={burst.y} />, overlay)}

      {!revealed ? (
        <p className="relative z-[1] max-w-[min(100%,240px)] text-center text-[14px] font-normal leading-[150%] text-[#272727] sm:text-[15px]">
          You caught me at an awkward breakpoint 🫣
        </p>
      ) : (
        <div className="relative z-[1] p-[10px]">
          {bunnySrc ? (
            <img
              src={bunnySrc}
              alt="A bunny popping out of a magician hat"
              className="block h-auto"
              style={{
                width: 180,
                maxWidth: 'calc(100% - 20px)',
                opacity: 0,
                transform: 'scale(0.96)',
                animation: 'pp-reveal 260ms ease forwards',
              }}
            />
          ) : (
            <div style={{ width: 180, height: 180 }} aria-hidden />
          )}
        </div>
      )}

      <style>{`
@keyframes pp-reveal {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
      `}</style>
    </div>
  );
}

function MagicBurst({ x, y }: { x: number; y: number }) {
  const pieces = useMemo(() => {
    const colors = ['#7C3AED', '#22C55E', '#06B6D4', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#10B981'];
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.25;
      const dist = 36 + Math.random() * 44;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() * 140 - 70).toFixed(1);
      const size = 5 + Math.random() * 4;
      return {
        id: i,
        dx,
        dy,
        rot,
        size,
        color: colors[i % colors.length],
        delay: Math.random() * 40,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[10000]" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            width: p.size,
            height: Math.max(4, p.size * 0.8),
            background: p.color,
            borderRadius: 999,
            transform: `translate(-50%, -50%) translate(0px, 0px) rotate(0deg)`,
            opacity: 1,
            animation: `pp-burst 460ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
            animationDelay: `${p.delay}ms`,
            ['--pp-dx' as any]: `${p.dx}px`,
            ['--pp-dy' as any]: `${p.dy}px`,
            ['--pp-rot' as any]: `${p.rot}deg`,
          }}
        />
      ))}

      <style>{`
@keyframes pp-burst {
  0% { transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(1); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--pp-dx), var(--pp-dy)) rotate(var(--pp-rot)) scale(0.9); opacity: 0; }
}
      `}</style>
    </div>
  );
}
