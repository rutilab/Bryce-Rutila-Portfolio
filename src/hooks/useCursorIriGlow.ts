'use client';

import { useEffect, type RefObject } from 'react';

export const IRI_FADE_IN = 0.28;
/** ~20% slower fade-out than the original 0.055 rate */
export const IRI_FADE_OUT = 0.044;
export const IRI_POS_LERP = 0.42;

/**
 * Shared cursor-follow glow for iridescent overlays.
 * Sets --iri-glow / --iri-x / --iri-y on `fxRef` and toggles `is-iri-active` on `rootRef`.
 */
export function useCursorIriGlow(
  rootRef: RefObject<HTMLElement | null>,
  fxRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    const fx = fxRef.current;
    if (!root || !fx) return;

    let raf = 0;
    let running = false;
    let reducedMotion = false;
    const mouse = { x: 0, y: 0, over: false };
    const glow = { current: 0 };
    const pos = { x: 0, y: 0, ready: false };

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      reducedMotion = mq.matches;
    };
    syncMotion();
    mq.addEventListener('change', syncMotion);

    const localPoint = (clientX: number, clientY: number) => {
      const r = root.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const tick = () => {
      // Ideation rotate drag — keep the BRYCE wash off until the gesture ends
      const rotating = !!document.body.dataset.ideationRotating;
      const target = mouse.over && !rotating ? 1 : 0;
      const fadeIn = reducedMotion ? 0.55 : IRI_FADE_IN;
      const fadeOut = reducedMotion ? 0.16 : IRI_FADE_OUT;
      const rate = target > glow.current ? fadeIn : fadeOut;
      glow.current += (target - glow.current) * rate;
      if (glow.current < 0.008) glow.current = 0;

      if (!pos.ready) {
        pos.x = mouse.x;
        pos.y = mouse.y;
        pos.ready = true;
      } else {
        const follow = reducedMotion ? 1 : IRI_POS_LERP;
        pos.x += (mouse.x - pos.x) * follow;
        pos.y += (mouse.y - pos.y) * follow;
      }

      fx.style.setProperty('--iri-glow', glow.current.toFixed(3));
      fx.style.setProperty('--iri-x', `${pos.x.toFixed(1)}px`);
      fx.style.setProperty('--iri-y', `${pos.y.toFixed(1)}px`);
      root.classList.toggle('is-iri-active', glow.current > 0);

      if (mouse.over || glow.current > 0 || rotating) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        pos.ready = false;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const p = localPoint(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      start();
    };
    const onEnter = (e: PointerEvent) => {
      mouse.over = true;
      const p = localPoint(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      pos.x = p.x;
      pos.y = p.y;
      pos.ready = true;
      start();
    };
    const onLeave = () => {
      mouse.over = false;
      start();
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      mq.removeEventListener('change', syncMotion);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [rootRef, fxRef]);
}
