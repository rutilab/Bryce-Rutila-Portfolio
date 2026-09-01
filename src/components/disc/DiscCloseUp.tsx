'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';
import { LightboxCloseButton } from '@/components/case-study/CaseStudyMedia';
import { Disc } from './Disc';

/**
 * The close-up, and the transition into it — Discc brief §6 and §7.
 *
 * One `progress` 0→1 timeline with a knee at SLIDE. The disc rides straight up
 * out of the pocket first and only then flies and grows; blending the two beats
 * reads as the disc smearing sideways through the plastic.
 *
 * Everything — the timeline, the spin, the tilt spring, the flip and the two
 * float phases — advances on a single rAF loop, so they can never drift apart.
 */

const SLIDE = 0.42;
const SLIDE_MS = 300;
const EXPAND_MS = 460;

const CLOSE_LIFT_MS = 520;
const CLOSE_DROP_MS = 640;
/** The disc must be square before the notched plastic ever reaches it (§6.2). */
const CLOSE_SETTLE_MS = CLOSE_LIFT_MS * 0.6;

/** How far the disc rides out of the sleeve before it takes off. */
const LIFT = 0.42;

/** Our sleeve-front.png carries a 12px shadow margin around a 164px tile. */
const POCKET = { width: 188 / 164, height: 186 / 164, left: -12 / 164, top: -12 / 164 };

const MAX_TILT = 12;
const FLIP_MS = 620;

// §6.5 release behaviour
const DECELERATION = 0.998;
const SPRING = { damping: 14, stiffness: 110, mass: 1 };
const VELOCITY_SMOOTHING = 0.6;
const SPIN_EPS = 0.02;
const TILT_EPS = 0.0004;
const MAX_STEP_MS = 50;

// §6.4 idle float — two unrelated periods so the loop is never perceptible.
const BOB_MS = 5200;
const BOB_TILT_MS = 7100;
const BOB_RISE = 7;

/** A tap is a press that neither lingered nor travelled (§6.3). */
const TAP_MS = 300;
const TAP_SLOP = 12;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));

/** Piecewise-linear interpolation with clamped ends, like Reanimated's. */
function interpolate(p: number, input: number[], output: number[]) {
  if (p <= input[0]) return output[0];
  const last = input.length - 1;
  if (p >= input[last]) return output[last];
  for (let i = 1; i <= last; i++) {
    if (p <= input[i]) {
      const t = (p - input[i - 1]) / (input[i] - input[i - 1]);
      return output[i - 1] + t * (output[i] - output[i - 1]);
    }
  }
  return output[last];
}

type Beat = { to: number; duration: number; ease: (t: number) => number };
type Timeline = { beats: Beat[]; index: number; from: number; t0: number; done?: () => void };
type Tween = { from: number; to: number; t0: number; duration: number; ease: (t: number) => number };

export type SourceRect = { x: number; y: number; size: number };

type Pose = {
  progress: number;
  spin: number;
  tiltX: number;
  tiltY: number;
  flip: number;
  bob: number;
};

export function DiscCloseUp({
  src,
  alt,
  from,
  onClose,
  onClosed,
  closing,
}: {
  src: string;
  alt?: string;
  /** The sleeve the disc is leaving, in viewport coordinates. */
  from: SourceRect;
  onClose: () => void;
  onClosed: () => void;
  /** Flipped by the parent to start the return journey. */
  closing: boolean;
}) {
  const canHover = useCanPrimaryHover();
  const [reduced, setReduced] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  /**
   * The disc is hit-tested mathematically rather than by the DOM, so the cursor
   * has to be told what the maths already knows: an open hand over the face
   * once it has settled, a closed one while it is being turned, and the plain
   * arrow out on the backdrop, which is a dismiss target and not a grab.
   */
  const [grip, setGrip] = useState<'default' | 'grab' | 'grabbing'>('default');
  const [pose, setPose] = useState<Pose>({
    progress: 0,
    spin: 0,
    tiltX: 0,
    tiltY: 0,
    flip: 0,
    bob: 0,
  });

  useEffect(() => {
    const sync = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener('resize', sync);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduced(mq.matches);
    syncMotion();
    mq.addEventListener('change', syncMotion);
    return () => {
      window.removeEventListener('resize', sync);
      mq.removeEventListener('change', syncMotion);
    };
  }, []);

  // The `from` rect is in viewport coordinates, so the page must not move under it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /** Close-up diameter. The brief's 359 is a 375-wide phone; on the web this has
   *  to answer the viewport, so the ratios hold and the number doesn't. */
  const size = Math.max(180, Math.min(viewport.w * 0.78, viewport.h * 0.66, 520));
  const centreX = viewport.w / 2;
  const centreY = viewport.h / 2;
  const fromCX = from.x + from.size / 2;
  const fromCY = from.y + from.size / 2;
  const liftedCY = fromCY - from.size * LIFT;
  const fromScale = from.size / size;

  const st = useRef({
    progress: 0,
    timeline: null as Timeline | null,
    spin: 0,
    spinVel: 0,
    spinTween: null as Tween | null,
    tiltX: 0,
    tiltY: 0,
    tiltVX: 0,
    tiltVY: 0,
    targetX: 0,
    targetY: 0,
    driven: false,
    dragging: false,
    grabAngle: 0,
    grabTime: 0,
    flip: 0,
    flipTween: null as Tween | null,
    bobPhase: 0,
    bobTiltPhase: 0,
    downAt: 0,
    downX: 0,
    downY: 0,
    downInside: false,
    raf: 0,
    last: 0,
  });

  const tickRef = useRef<(now: number) => void>(() => {});
  const schedule = useCallback(() => requestAnimationFrame((t) => tickRef.current(t)), []);

  const tick = useCallback(
    (now: number) => {
      const s = st.current;
      const dt = Math.min(now - s.last, MAX_STEP_MS);
      s.last = now;
      const h = dt / 1000;
      let alive = false;

      // ── the open/close timeline ──
      const tl = s.timeline;
      if (tl) {
        const beat = tl.beats[tl.index];
        const t = Math.min((now - tl.t0) / beat.duration, 1);
        s.progress = tl.from + (beat.to - tl.from) * beat.ease(t);
        if (t >= 1) {
          tl.from = beat.to;
          tl.index += 1;
          if (tl.index >= tl.beats.length) {
            s.timeline = null;
            tl.done?.();
          } else {
            tl.t0 = now;
          }
        }
        alive = true;
      }

      // ── flip, and the unwind on the way out ──
      for (const key of ['flipTween', 'spinTween'] as const) {
        const tw = s[key];
        if (!tw) continue;
        const t = Math.min((now - tw.t0) / tw.duration, 1);
        const v = tw.from + (tw.to - tw.from) * tw.ease(t);
        if (key === 'flipTween') s.flip = v;
        else s.spin = v;
        if (t >= 1) s[key] = null;
        alive = true;
      }

      // ── spin: free once released, decaying toward rest (§6.5) ──
      if (!s.dragging && !s.spinTween) {
        if (Math.abs(s.spinVel) > SPIN_EPS) {
          s.spinVel *= Math.pow(DECELERATION, dt);
          s.spin += s.spinVel * h;
          alive = true;
        } else {
          s.spinVel = 0;
        }
      }

      // ── tilt: pointer while it is on the disc, spring to square once it leaves ──
      if (s.driven) {
        s.tiltX = s.targetX;
        s.tiltY = s.targetY;
        s.tiltVX = 0;
        s.tiltVY = 0;
        alive = true;
      } else if (
        Math.abs(s.tiltX) > TILT_EPS ||
        Math.abs(s.tiltY) > TILT_EPS ||
        Math.abs(s.tiltVX) > TILT_EPS ||
        Math.abs(s.tiltVY) > TILT_EPS
      ) {
        const step = (x: number, v: number): [number, number] => {
          const a = (-SPRING.stiffness * x - SPRING.damping * v) / SPRING.mass;
          const nv = v + a * h;
          return [x + nv * h, nv];
        };
        [s.tiltX, s.tiltVX] = step(s.tiltX, s.tiltVX);
        [s.tiltY, s.tiltVY] = step(s.tiltY, s.tiltVY);
        alive = true;
      } else {
        s.tiltX = 0;
        s.tiltY = 0;
        s.tiltVX = 0;
        s.tiltVY = 0;
      }

      // ── §6.4 idle float. Linear phases, sine taken here, so the wrap is seamless.
      const floatAmount = reduced ? 0 : interpolate(s.progress, [0.85, 1], [0, 1]);
      if (!reduced) {
        s.bobPhase = (s.bobPhase + dt / BOB_MS) % 1;
        s.bobTiltPhase = (s.bobTiltPhase + dt / BOB_TILT_MS) % 1;
        if (floatAmount > 0) alive = true;
      }

      // Fed into tilt itself, not just the transform, so the glare and the
      // iridescence drift with it too — that is what makes a resting disc look alive.
      const tiltXf = s.tiltX + floatAmount * Math.sin(s.bobTiltPhase * Math.PI * 2) * 0.1;
      const tiltYf = s.tiltY + floatAmount * Math.cos(s.bobPhase * Math.PI * 2) * 0.08;
      const bob = floatAmount * Math.sin(s.bobPhase * Math.PI * 2) * BOB_RISE;

      setPose({
        progress: s.progress,
        spin: s.spin,
        tiltX: tiltXf,
        tiltY: tiltYf,
        flip: s.flip,
        bob,
      });

      s.raf = alive || s.dragging ? schedule() : 0;
    },
    [schedule, reduced]
  );

  useEffect(() => { tickRef.current = tick; }, [tick]);

  const wake = useCallback(() => {
    const s = st.current;
    if (s.raf) return;
    s.last = performance.now();
    s.raf = schedule();
  }, [schedule]);

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  // ── Entrance. Held until the viewport is measured so the first frame is right.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !viewport.w) return;
    started.current = true;
    const s = st.current;
    s.timeline = reduced
      ? { beats: [{ to: 1, duration: 180, ease: easeOutCubic }], index: 0, from: 0, t0: performance.now() }
      : {
          beats: [
            { to: SLIDE, duration: SLIDE_MS, ease: easeOutCubic },
            { to: 1, duration: EXPAND_MS, ease: easeInOutCubic },
          ],
          index: 0,
          from: 0,
          t0: performance.now(),
        };
    wake();
  }, [viewport.w, reduced, wake]);

  // ── Exit. The spin unwinds to the nearest whole turn — at most half a rotation —
  //    and both it and the unflip finish at 60% of the first beat, so the disc is
  //    square and face-up well before the notched pocket slides back over it.
  const leaving = useRef(false);
  useEffect(() => {
    if (!closing || leaving.current) return;
    leaving.current = true;
    const s = st.current;
    const now = performance.now();
    const TURN = Math.PI * 2;

    s.dragging = false;
    s.driven = false;
    s.spinVel = 0;
    setGrip('default');
    s.spinTween = {
      from: s.spin,
      to: Math.round(s.spin / TURN) * TURN,
      t0: now,
      duration: CLOSE_SETTLE_MS,
      ease: easeOutCubic,
    };
    s.flipTween = { from: s.flip, to: 0, t0: now, duration: CLOSE_SETTLE_MS, ease: easeInOutCubic };

    s.timeline = reduced
      ? { beats: [{ to: 0, duration: 180, ease: easeOutCubic }], index: 0, from: s.progress, t0: now, done: onClosed }
      : {
          beats: [
            { to: SLIDE, duration: CLOSE_LIFT_MS, ease: easeInOutCubic },
            // Decelerating all the way in, so it comes to rest rather than arriving.
            { to: 0, duration: CLOSE_DROP_MS, ease: easeOutCubic },
          ],
          index: 0,
          from: s.progress,
          t0: now,
          done: onClosed,
        };
    wake();
  }, [closing, reduced, onClosed, wake]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Pointer. The disc is hit-tested mathematically, the way the original does,
  //    so the whole overlay can carry the gesture.
  const radius = size / 2;
  const hits = (e: React.PointerEvent) =>
    Math.hypot(e.clientX - centreX, e.clientY - centreY) <= radius;
  const settled = () => st.current.progress >= 1 && !st.current.timeline;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    s.downAt = performance.now();
    s.downX = e.clientX;
    s.downY = e.clientY;
    s.downInside = hits(e);
    if (!s.downInside || !settled()) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    s.dragging = true;
    s.driven = true;
    s.spinVel = 0;
    s.grabAngle = Math.atan2(e.clientY - centreY, e.clientX - centreX);
    s.grabTime = performance.now();
    s.targetX = clamp1((e.clientY - centreY) / radius);
    s.targetY = clamp1((e.clientX - centreX) / radius);
    setGrip('grabbing');
    wake();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (s.dragging) {
      const angle = Math.atan2(e.clientY - centreY, e.clientX - centreX);
      let delta = angle - s.grabAngle;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      s.spin += delta;
      const now = performance.now();
      const dt = Math.max(now - s.grabTime, 1) / 1000;
      s.spinVel = s.spinVel * VELOCITY_SMOOTHING + (delta / dt) * (1 - VELOCITY_SMOOTHING);
      s.grabAngle = angle;
      s.grabTime = now;
      s.targetX = clamp1((e.clientY - centreY) / radius);
      s.targetY = clamp1((e.clientX - centreX) / radius);
      wake();
      return;
    }
    if (!canHover || !settled()) {
      setGrip('default');
      return;
    }
    const inside = hits(e);
    setGrip(inside ? 'grab' : 'default');
    s.driven = inside;
    if (inside) {
      s.targetX = clamp1((e.clientY - centreY) / radius);
      s.targetY = clamp1((e.clientX - centreX) / radius);
    }
    wake();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    const quick = performance.now() - s.downAt < TAP_MS;
    const still = Math.hypot(e.clientX - s.downX, e.clientY - s.downY) < TAP_SLOP;

    if (s.dragging) {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      s.dragging = false;
      s.driven = canHover && hits(e);
      setGrip(canHover && hits(e) ? 'grab' : 'default');
      // §6.3 — a tap on the face flips it.
      if (quick && still && settled()) {
        s.flipTween = {
          from: s.flip,
          to: s.flip > 0.5 ? 0 : 1,
          t0: performance.now(),
          duration: reduced ? 1 : FLIP_MS,
          ease: easeInOutCubic,
        };
      }
      wake();
      return;
    }
    // A click on the backdrop dismisses.
    if (!s.downInside && quick && still && !hits(e)) onClose();
  };

  if (!viewport.w) return null;

  const p = pose.progress;
  const x = interpolate(p, [0, SLIDE, 1], [fromCX, fromCX, centreX]);
  const y = interpolate(p, [0, SLIDE, 1], [fromCY, liftedCY, centreY]);
  const scale = interpolate(p, [0, SLIDE, 1], [fromScale, fromScale, 1]);

  // ── §7 environment, all keyed off progress and clamped ──
  const blur = interpolate(p, [0.1, 0.75], [0, 16]);
  const scrim = interpolate(p, [0.1, 0.75], [0, 1]);
  const pocketOpacity = interpolate(p, [SLIDE, SLIDE + 0.06], [1, 0]);
  const glareOpacity = interpolate(p, [SLIDE, 0.75], [0, 1]);
  const shadowOpacity = interpolate(p, [0, SLIDE], [0, 1]);
  const chrome = interpolate(p, [0.7, 1], [0, 1]);

  // A dip in scale mid-flip reads as the disc passing through the light.
  const flipDip = 1 - 0.07 * Math.sin(Math.PI * pose.flip);

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, touchAction: 'none', cursor: grip }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* The scrim holds off until the disc is already moving, so the first beat
          plays against the live page rather than a black wash (§7). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          background: `rgba(0,0,0,${0.85 * scrim})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: centreX - size / 2,
          top: centreY - size / 2,
          width: size,
          height: size,
          pointerEvents: 'none',
          // §8 — this order is load-bearing.
          transform: [
            `translateX(${x - centreX}px)`,
            `translateY(${y - centreY + pose.bob}px)`,
            'perspective(1400px)',
            `scale(${scale * flipDip})`,
            `rotateX(${-pose.tiltX * MAX_TILT}deg)`,
            `rotateY(${pose.tiltY * MAX_TILT + pose.flip * 180}deg)`,
          ].join(' '),
        }}
      >
        <Disc
          src={src}
          alt={alt}
          size={size}
          spin={pose.spin}
          tiltX={pose.tiltX}
          tiltY={pose.tiltY}
          flip={pose.flip}
          glareOpacity={glareOpacity}
          shadowOpacity={shadowOpacity}
        />
      </div>

      {/* A copy of the sleeve's front layer, above the disc, so it reads as
          coming out from behind the plastic rather than over it. */}
      <img
        src="/about/cds/sleeve-front.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: from.x + POCKET.left * from.size,
          top: from.y + POCKET.top * from.size,
          width: POCKET.width * from.size,
          height: POCKET.height * from.size,
          maxWidth: 'none',
          opacity: pocketOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* The site's one lightbox close button. It positions itself, so this
          wrapper only carries the fade — the chrome is held back until the disc
          has nearly arrived (§7). */}
      <div style={{ opacity: chrome, pointerEvents: chrome > 0.5 ? 'auto' : 'none' }}>
        <LightboxCloseButton onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
