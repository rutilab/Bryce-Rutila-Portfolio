'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

export type StackPhoto = {
  src: string;
  alt: string;
};

/** Where a print sits once it reaches this depth in the deck, relative to the stage centre. */
export type StackSlot = { dx: number; dy: number; rot: number };

// ── The print ──────────────────────────────────────────────────────────────
/** The design's print size. Every card in a deck shares it, so nothing in the
 *  pile sprawls wider than the front frame. */
const PRINT_W = 216;
const PRINT_H = 303;
/** Figma draws a 4px white stroke inside the frame, so the photo sits inset. */
const PRINT_BORDER = 4;
const PRINT_RADIUS = 8;

// ── Stacking order ─────────────────────────────────────────────────────────
/** Back of the pile … front of the pile. Slots interpolate between the two. */
const Z_BOTTOM = 0;
const Z_TOP = 10;
/** Clear of the whole deck while a print is in the air. */
const Z_AIRBORNE = 20;

// ── The resting deck ───────────────────────────────────────────────────────
/** Each step deeper sits this much smaller, so the deck reads as a messy pile. */
const DEPTH_SCALE_STEP = 0.02;
/** One decelerating curve for everything that is easing into place. */
const SETTLE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ── The pop ────────────────────────────────────────────────────────────────
/** Lift is measured off the print height, so a taller deck throws higher. */
const LIFT_RATIO = 0.62;
const LIFT_MIN = 130;
/** Sideways drift on the way up — this is what bends the path into an arc. */
const LIFT_ARC_X = 36;
const LIFT_ROT = 5;
const LIFT_SCALE = 1.05;

const LIFT_MS = 300;
const TUCK_MS = 430;
/** Spring on the way up… */
const LIFT_EASE = 'cubic-bezier(0.34, 1.5, 0.64, 1)';
/** …and a settling ease-out on the way back down. */
const TUCK_EASE = SETTLE_EASE;
/** Belt and braces: if transitionend never lands, hand off on a timer instead. */
const LIFT_TIMEOUT_MS = LIFT_MS + 140;

// ── The reveal ─────────────────────────────────────────────────────────────
/**
 * The rest of the deck coming up a place. This runs from the instant the top
 * print leaves, alongside the lift and the tuck, so the incoming print eases out
 * of its old rotation and scale *during* the gesture rather than correcting
 * itself once everything else has stopped.
 */
const ADVANCE_MS = 560;
const ADVANCE_EASE = SETTLE_EASE;

// ── Elevation ──────────────────────────────────────────────────────────────
const SHADOW_REST = '0 2px 2px 1px rgba(0, 0, 0, 0.25)';
const SHADOW_HOVER = '0 12px 20px -6px rgba(0, 0, 0, 0.3), 0 2px 2px 1px rgba(0, 0, 0, 0.22)';
const SHADOW_LIFT = '0 36px 52px -10px rgba(0, 0, 0, 0.45), 0 12px 18px rgba(0, 0, 0, 0.18)';

// ── Pointer parallax ───────────────────────────────────────────────────────
/** Pointer travel, in px and degrees, at the very edge of the stage. */
const PARALLAX_PX = 9;
const PARALLAX_DEG = 7;
/** Prints further back drift less, which is what sells the depth. */
const DEPTH_FALLOFF = 0.32;

type Phase = 'idle' | 'lift' | 'tuck';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/**
 * A deck of prints in matching white frames. Hovering floats the top print and
 * parallaxes the deck under the pointer; clicking arcs the top print up off the
 * pile and tucks it in at the bottom while the rest come up a place.
 */
export function PhotoStack({
  photos,
  slots,
  width,
  height,
  label,
  liftPx,
  printWidth = PRINT_W,
  printHeight = PRINT_H,
}: {
  /** Back of the deck first, matching the design's layer order. */
  photos: StackPhoto[];
  /** Same ordering: slots[0] is the deepest position. */
  slots: StackSlot[];
  width: number;
  height: number;
  label: string;
  /** Override the throw height where the default would collide with something. */
  liftPx?: number;
  /** One frame size for the whole deck — see PRINT_W / PRINT_H. */
  printWidth?: number;
  printHeight?: number;
}) {
  const canHover = useCanPrimaryHover();
  const reduced = usePrefersReducedMotion();

  /** Photo indices, back to front. The last entry is the one on top. */
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  /**
   * The print currently in the air. It has already been dealt to the back of
   * `order`, but flies its own path until it lands there.
   */
  const [departing, setDeparting] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hovering, setHovering] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const throwHeight = liftPx ?? Math.max(LIFT_MIN, printHeight * LIFT_RATIO);
  /** The pose the departing print is leaving from — the top of the deck. */
  const frontSlot = slots[slots.length - 1];

  /** Deepest slot is smallest; the front print sits at 1. */
  const slotScale = (slotIndex: number) =>
    1 - DEPTH_SCALE_STEP * (order.length - 1 - slotIndex);

  /** Spread the deck evenly between the bottom and top of the stacking range. */
  const slotZ = (slotIndex: number) =>
    order.length < 2
      ? Z_TOP
      : Math.round(Z_BOTTOM + (slotIndex / (order.length - 1)) * (Z_TOP - Z_BOTTOM));

  /** The flight is over; the print is already on its slot, so nothing moves. */
  const finish = useCallback(() => {
    setDeparting(null);
    setPhase('idle');
  }, []);

  /**
   * Second half of the flight. Only ever called from the top of the arc, so the
   * print is at its furthest from the pile when its z-index drops underneath —
   * dropping it any earlier is what makes a card look like it clips through.
   */
  const beginTuck = useCallback(() => {
    clearTimers();
    setPhase('tuck');
    timers.current.push(window.setTimeout(finish, TUCK_MS));
  }, [finish]);

  const cycle = useCallback(() => {
    if (phase !== 'idle' || photos.length < 2) return;

    if (reduced) {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
      return;
    }

    clearTimers();
    // The deck advances immediately: the next print in line is promoted to the
    // top of the stacking range and starts easing into the front pose on the
    // same frame the current one starts to lift.
    setDeparting(order[order.length - 1]);
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
    setPhase('lift');
    // Normally the lift's transitionend hands off; this is the fallback.
    timers.current.push(window.setTimeout(beginTuck, LIFT_TIMEOUT_MS));
  }, [phase, photos.length, reduced, order, beginTuck]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
    });
  };

  /**
   * Hover only gets the deck once it is completely at rest. While a gesture is
   * running, the float, the parallax and the brisk hover timing all stay out of
   * the way rather than fighting the cards easing into place.
   */
  const hoverActive = hovering && canHover && !reduced && phase === 'idle';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      className="relative select-none outline-none"
      style={{ width, height, perspective: 1000, cursor: 'pointer' }}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPointer({ x: 0, y: 0 });
      }}
      onClick={cycle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycle();
        }
      }}
    >
      {order.map((photoIndex, slotIndex) => {
        const photo = photos[photoIndex];
        const isDeparting = photoIndex === departing;
        const isFront = slotIndex === order.length - 1;
        /** 0 at the front, growing toward the back — drives how much a print drifts. */
        const depth = order.length - 1 - slotIndex;

        // Resting pose for this depth: the design's scatter, plus the size falloff.
        // Every print that isn't in the air is already aimed at its new slot.
        let x = slots[slotIndex].dx;
        let y = slots[slotIndex].dy;
        let rot = slots[slotIndex].rot;
        let scale = slotScale(slotIndex);
        let shadow = SHADOW_REST;
        let z = slotZ(slotIndex);
        let ease =
          phase !== 'idle'
            ? `transform ${ADVANCE_MS}ms ${ADVANCE_EASE}, box-shadow ${ADVANCE_MS}ms ${ADVANCE_EASE}`
            : hoverActive
              ? 'transform 140ms ease-out, box-shadow 200ms ease-out'
              : `transform 420ms ${SETTLE_EASE}, box-shadow 320ms ease-out`;

        const drift = hoverActive ? Math.pow(DEPTH_FALLOFF, depth) : 0;
        const tilt = isFront && hoverActive ? 1 : 0;

        if (isDeparting && phase === 'lift') {
          // Measured from the slot it is leaving, not the one it has been dealt
          // to, so the climb continues from where the print already is.
          x = frontSlot.dx + LIFT_ARC_X;
          y = frontSlot.dy - throwHeight;
          rot = frontSlot.rot + LIFT_ROT;
          scale = LIFT_SCALE;
          shadow = SHADOW_LIFT;
          z = Z_AIRBORNE; // clear of the whole deck for the entire climb
          ease = `transform ${LIFT_MS}ms ${LIFT_EASE}, box-shadow ${LIFT_MS}ms ease-out`;
        } else if (isDeparting && phase === 'tuck') {
          // Falling onto the bottom slot it already holds, now under the pile.
          z = Z_BOTTOM;
          ease = `transform ${TUCK_MS}ms ${TUCK_EASE}, box-shadow ${TUCK_MS}ms ease-out`;
        } else if (isFront && hoverActive) {
          y -= 10;
          scale *= 1.03;
          shadow = SHADOW_HOVER;
        }

        return (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={printWidth}
            height={printHeight}
            draggable={false}
            onTransitionEnd={(e) => {
              // Hand the gesture over the instant the print actually reaches the
              // top of its arc, rather than trusting a timer to match the easing.
              if (isDeparting && phase === 'lift' && e.propertyName === 'transform') beginTuck();
            }}
            className="absolute left-1/2 top-1/2 object-cover"
            style={{
              width: printWidth,
              height: printHeight,
              zIndex: z,
              // border-box keeps the outer size at the design's, so the white
              // frame eats into the photo exactly like Figma's inside stroke.
              boxSizing: 'border-box',
              border: `${PRINT_BORDER}px solid #ffffff`,
              borderRadius: PRINT_RADIUS,
              boxShadow: shadow,
              transform: [
                'translate(-50%, -50%)',
                `translate(${x + pointer.x * PARALLAX_PX * drift}px, ${y + pointer.y * PARALLAX_PX * drift}px)`,
                `rotate(${rot}deg)`,
                `rotateX(${-pointer.y * PARALLAX_DEG * tilt}deg)`,
                `rotateY(${pointer.x * PARALLAX_DEG * tilt}deg)`,
                `scale(${scale})`,
              ].join(' '),
              transition: ease,
              willChange: 'transform',
            }}
          />
        );
      })}
    </div>
  );
}
