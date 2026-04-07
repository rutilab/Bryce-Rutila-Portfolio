'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChatContainer } from '@/components/chat';
import { CursorContrail } from '@/components/CursorContrail';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

/** 32×32 asset in `public/cursors/butterfly-cursor.png`; hotspot upper-left (wing tip). */
const BUTTERFLY_CURSOR = `url('/cursors/butterfly-cursor.png') 0 0, auto`;

// Option B: two-axis CSS scaling with min() caps.
//
// Horizontal (left/right) → vw, so positions track viewport width.
// Vertical   (top/bottom) → vh, so positions track viewport height.
// Width                   → min(Xvw, X_figma_px) — scales down on narrow
//                           viewports but never exceeds the Figma pixel value
//                           on wide ones, preventing the "too large" problem.
//
// All source values are frame-relative pixels from Figma (frame: 1440 × 1024).

const W = 1440; // Figma frame width
const H = 1024; // Figma frame height

// px() helpers — convert a Figma pixel to a vw/vh CSS string
const vw  = (px: number) => `${(px / W * 100).toFixed(4)}vw`;
const vh  = (px: number) => `${(px / H * 100).toFixed(4)}vh`;
// Butterfly width: vw at heart, capped at Figma px on large screens, with a
// floor so they stay legible on narrow viewports (not pure min(vw, cap)).
const mw = (figmaPx: number) => {
  const vwPct = (figmaPx / W) * 100;
  const minPx = Math.max(100, Math.round(figmaPx * 0.42));
  return `clamp(${minPx}px, ${vwPct.toFixed(4)}vw, ${figmaPx}px)`;
};

// reactClass  — which scatter animation to play on slam
// reactDelay  — offset from when phase==='done' so each butterfly reacts
//               slightly differently (slam impact lands at ~670ms)
const butterflies: {
  src:        string;
  style:      CSSProperties;
  reactClass: string;
  reactDelay: string;
}[] = [
  { src: '/butterflies/fly-1.svg', style: { left: vw(15),   top: vh(-21), width: mw(229.7) }, reactClass: 'butterfly-react-left',  reactDelay: '630ms' }, // magenta, top-left
  { src: '/butterflies/fly-2.svg', style: { left: vw(8),    top: vh(360), width: mw(235.8) }, reactClass: 'butterfly-react-left',  reactDelay: '660ms' }, // green,   left-mid
  { src: '/butterflies/fly-3.svg', style: { left: vw(-49),  top: vh(840), width: mw(166.8) }, reactClass: 'butterfly-react-left',  reactDelay: '645ms' }, // orange,  bottom-left
  { src: '/butterflies/fly-4.svg', style: { left: vw(1009), top: vh(-34), width: mw(223.8) }, reactClass: 'butterfly-react-right', reactDelay: '640ms' }, // green,   top-right
  { src: '/butterflies/fly-5.svg', style: { left: vw(1308), top: vh(491), width: mw(231.4) }, reactClass: 'butterfly-react-right', reactDelay: '675ms' }, // orange,  right-mid
  { src: '/butterflies/fly-6.svg', style: { left: vw(1092), top: vh(782), width: mw(209)   }, reactClass: 'butterfly-react-right', reactDelay: '615ms' }, // magenta, bottom-right
];

// Figma frame coords (same as vw()/vh() args) — used for fractional layout + drag
const BUTTERFLY_FIGMA = [
  { l: 15, t: -21 },
  { l: 8, t: 360 },
  { l: -49, t: 840 },
  { l: 1009, t: -34 },
  { l: 1308, t: 491 },
  { l: 1092, t: 782 },
] as const;

/** Narrow viewports only — less extreme edges so butterflies feel less scattered (width under 768px). */
const BUTTERFLY_FIGMA_MOBILE = [
  { l: 28, t: 28 },
  { l: 18, t: 330 },
  { l: -28, t: 800 },
  { l: 960, t: 24 },
  { l: 1140, t: 475 },
  { l: 1000, t: 740 },
] as const;

function rectsOverlap(a: DOMRect, b: DOMRect) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function unionRects(a: DOMRect, b: DOMRect): DOMRect {
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
}

// ── Testimonials ───────────────────────────────────────────────────────────
// Cards sit below the fold; as the user scrolls they reveal upward while the
// hero content stays fixed.  The scroll is intercepted via wheel/touch events
// so the hero never actually scrolls — only the panel translates.

/** Fallback peek height (px) if layout measurement is not ready yet. */
const TESTIMONIALS_PEEK_FALLBACK = 300;
/** Minimum gap below the panel when fully revealed. */
const TESTIMONIALS_BOTTOM_MARGIN = 24;
/**
 * Nudge the cut slightly into the header row so rounding never reveals the 16px margin or quote below it.
 * (Too large a floor used to force extra peek — see Math.max(peek, 160) removal.)
 */
const TESTIMONIALS_PEEK_EDGE_TRIM = 2;

/**
 * Peek = px from panel top through the section title + avatar/name/role row(s) that belong in the “peek” strip.
 * Uses `.testimonial-card-header` border box: marginBottom (gap before quote) is *outside* that box, so it must not appear.
 *
 * When cards are **side by side**, both headers share one row — include the lower of the two header bottoms
 * so the taller column is not clipped.
 * When cards **stack**, the second header sits *below* the first card’s quote; including it would inflate peek
 * and bump the first card up. In that case only the **first** card header is used so the peek matches the
 * single-row layout position.
 */
function measureTestimonialsPeekPx(panel: HTMLElement): number {
  const pr = panel.getBoundingClientRect();
  if (pr.height <= 0) return TESTIMONIALS_PEEK_FALLBACK;
  let maxBottom = 0;
  const h2 = panel.querySelector('h2');
  if (h2) {
    maxBottom = Math.max(maxBottom, h2.getBoundingClientRect().bottom - pr.top);
  }
  const headers = panel.querySelectorAll('.testimonial-card-header');
  const first = headers[0];
  if (first) {
    const r1 = first.getBoundingClientRect();
    maxBottom = Math.max(maxBottom, r1.bottom - pr.top);
    const second = headers[1];
    if (second) {
      const r2 = second.getBoundingClientRect();
      const stacked = r2.top > r1.bottom + 0.5;
      if (!stacked) {
        maxBottom = Math.max(maxBottom, r2.bottom - pr.top);
      }
    }
  }

  if (maxBottom <= 0) return TESTIMONIALS_PEEK_FALLBACK;
  const peek = Math.ceil(maxBottom) - TESTIMONIALS_PEEK_EDGE_TRIM;
  return Math.min(Math.max(peek, 1), panel.offsetHeight);
}

const TESTIMONIALS = [
  {
    name: 'Mike Mrazek',
    role: 'Co-Founder Finding Focus',
    quote:
      'Bryce is a deeply thoughtful designer who truly cares about creating great experiences for users. After working with him, nearly every aspect of our product has significantly improved. And beyond his considerable UX/UI skills, he is also a kind and principled person.',
    initials: 'MM',
    avatarSrc: '/images/testimonials/mike-mrazek.png',
  },
  {
    name: 'Yaning Zhu',
    role: 'UX Researcher Finding Focus',
    quote:
      "As the solo UX designer on the team, Bryce meticulously designed every aspect of the Finding Focus, ensuring a responsive, cohesive, and user-friendly experience. Bryce's dedication, expertise, and collaborative spirit make him an outstanding UX designer with excellent UX research craft.",
    initials: 'YZ',
    avatarSrc: '/images/testimonials/yaning-zhu.png',
  },
] as const;

// ── Subtitle typewriter animation ──────────────────────────────────────────
// The prefix stays static. Each suffix is typed in, highlighted, then
// instantly deleted before the next one starts. The final phrase stays.

const PHRASES = [
  'turns feedback into features',
  'genuinely cares about users',
  'dives deep into research',
  'brings ideas to life',                    // final — no highlight/delete
] as const;

// Highlight colours drawn from the butterfly palette, at reduced opacity
const HIGHLIGHT_COLORS = [
  'rgba(137, 255,  18, 0.38)',  // lime green — #89FF12
  'rgba(255, 156,  18, 0.38)',  // orange     — #FF9C12
  'rgba(255,  18, 251, 0.38)',  // magenta    — #FF12FB
];

type AnimPhase = 'typing' | 'highlighted' | 'pre-typing' | 'done';

/** Fixed nav uses top-6 (24px) + ~48px pill; 24px gap below nav before hero copy/buttons; −40px shifts hero block up. */
const HOME_HERO_TOP_PAD = 'calc(24px + 48px + 24px - 40px + env(safe-area-inset-top, 0px))';
const HOME_HERO_BOTTOM_PAD = 'calc(24px + env(safe-area-inset-bottom, 0px))';

/** Static prefix + phrase — must match the hero subtitle JSX for height measurement. */
const HERO_SUBTITLE_PREFIX = 'a product designer who ';

const HERO_SUBTITLE_TEXT_STYLE: CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '24px',
  fontWeight: 400,
  lineHeight: '32px',
  color: '#141510',
  margin: 0,
  maxWidth: '100%',
  wordBreak: 'normal',
  overflowWrap: 'normal',
  userSelect: 'none',
  WebkitTextStroke: '2px #ffffff',
  paintOrder: 'stroke fill',
};

// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  // Cycles green → orange → magenta → green … on each hover of "View my work"
  const VMW_HOVER_COLORS = ['#89FF12', '#FF9C12', '#FF12FB'] as const;
  const [vmwColorIndex, setVmwColorIndex] = useState(0);

  // Subtitle animation state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [phase,       setPhase]       = useState<AnimPhase>('typing');

  // Tracks whether the one-time slam has already fired
  const slamDoneRef = useRef(false);
  // Drives the slam CSS class — true only during the initial slam window
  const [showSlam, setShowSlam] = useState(false);

  const heroContainerRef = useRef<HTMLDivElement>(null);
  /** Scrollport for hero + butterflies (matches case-studies page pattern). */
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroSubtitleMeasureRef = useRef<HTMLDivElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);
  /** Max height of full subtitle lines at current width — keeps CTAs from jumping as phrases change. */
  const [subtitleBlockMinPx, setSubtitleBlockMinPx] = useState<number | null>(null);
  const canPrimaryHover = useCanPrimaryHover();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  /** Position as fraction of container width/height (matches Figma l/W, t/H) */
  const [butterflyPos, setButterflyPos] = useState<{ leftFrac: number; topFrac: number }[]>(() =>
    BUTTERFLY_FIGMA.map(({ l, t }) => ({ leftFrac: l / W, topFrac: t / H })),
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [snapRevertingIndex, setSnapRevertingIndex] = useState<number | null>(null);
  const dragStartFracRef = useRef<{ leftFrac: number; topFrac: number } | null>(null);
  const dragOffsetPxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  /** Synced on pointer down/up so first pointermove sees the drag (state can lag one frame). */
  const activeDragIndexRef = useRef<number | null>(null);
  /** True if butterfly already overlapped the hero zone at pointer down (e.g. breakpoint moved copy). */
  const dragStartOverlapsHeroRef = useRef(false);
  const butterflyPosRef = useRef(butterflyPos);
  butterflyPosRef.current = butterflyPos;

  // Testimonials panel + scroll-reveal state
  const testimonialsRef = useRef<HTMLDivElement>(null);
  /** Accumulated px the panel has travelled upward (0 = hidden, budget = fully revealed). */
  const testimonialsProgressRef = useRef(0);
  /** Mirrors ref for tooltip / UI when progress changes. */
  const [testimonialsProgress, setTestimonialsProgress] = useState(0);
  /** Panel height from ResizeObserver — used to compute reveal budget for tooltip. */
  const [testimonialsPanelHeight, setTestimonialsPanelHeight] = useState(0);
  /** Measured height from panel top through headings + avatar/name/role (not quotes). */
  const [testimonialsPeekPx, setTestimonialsPeekPx] = useState(TESTIMONIALS_PEEK_FALLBACK);
  const testimonialsPeekRef = useRef(TESTIMONIALS_PEEK_FALLBACK);
  const [testimonialsSectionHover, setTestimonialsSectionHover] = useState(false);
  const [testimonialsTooltipPos, setTestimonialsTooltipPos] = useState({ x: 0, y: 0 });
  const touchStartYRef = useRef<number | null>(null);
  /** Touch / narrow layout — drives overflow and touch chunk size only (max-width 767px). */
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false),
  );
  /** Reset butterfly bases when crossing mobile/desktop so mobile layout stays intentional. */
  const butterflyLayoutBandRef = useRef<'mobile' | 'desktop' | null>(null);

  // Hero copy (title + subtitle + CTAs) wrapper — translates up when testimonials approach
  const heroCopyRef = useRef<HTMLDivElement>(null);
  /** Current upward push applied to hero copy, in px. */
  const heroPushRef = useRef(0);

  /**
   * Compute how much to push the hero copy upward so the testimonials heading
   * never overlaps the CTA buttons.  Trigger window: 40 px of clearance.
   *
   * Uses refs throughout so the closure is never stale — safe to call from both
   * the ResizeObserver (useLayoutEffect) and the wheel/touch handler (useEffect).
   */
  const updateHeroPush = useCallback((progress: number) => {
    const copy = heroCopyRef.current;
    const ctas = heroCtasRef.current;
    if (!copy || !ctas) return;

    const vh = window.innerHeight;
    const peek = testimonialsPeekRef.current;
    // Top edge of the testimonials panel in viewport coordinates
    const panelTop = vh - peek - progress;

    // Reconstruct the un-translated CTAs bottom by undoing the current push
    const ctasNaturalBottom = ctas.getBoundingClientRect().bottom + heroPushRef.current;

    const gap = panelTop - ctasNaturalBottom;          // px between panel and CTAs
    const newPush = Math.max(0, 40 - gap);             // push only when gap < 40 px

    heroPushRef.current = newPush;
    copy.style.transform = newPush > 0 ? `translateY(${-newPush}px)` : '';
  }, []);

  const getHeroExclusionRect = useCallback((): DOMRect | null => {
    const rects: DOMRect[] = [];
    const t = heroTitleRef.current?.getBoundingClientRect();
    const s = heroSubtitleRef.current?.getBoundingClientRect();
    const c = heroCtasRef.current?.getBoundingClientRect();
    if (t) rects.push(t);
    if (s) rects.push(s);
    if (c) rects.push(c);
    if (rects.length > 0) {
      let u = rects[0];
      for (let i = 1; i < rects.length; i++) u = unionRects(u, rects[i]);
      return u;
    }
    return heroContentRef.current?.getBoundingClientRect() ?? null;
  }, []);

  /** Mobile: lock document scroll so rubber-band happens only in heroScrollRef (nav stays fixed). */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const html = document.documentElement;
    const body = document.body;
    let saved: { htmlOverflow: string; bodyOverflow: string; htmlHeight: string; bodyHeight: string } | null = null;

    const lock = () => {
      if (saved) return;
      saved = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        htmlHeight: html.style.height,
        bodyHeight: body.style.height,
      };
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      html.style.height = '100%';
      body.style.height = '100%';
    };

    const unlock = () => {
      if (!saved) return;
      html.style.overflow = saved.htmlOverflow;
      body.style.overflow = saved.bodyOverflow;
      html.style.height = saved.htmlHeight;
      body.style.height = saved.bodyHeight;
      saved = null;
    };

    const sync = () => {
      if (mq.matches) lock();
      else unlock();
    };

    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      unlock();
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobileViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    const update = () => {
      const scroll = heroScrollRef.current ?? heroContainerRef.current;
      if (!scroll) return;
      const w = scroll.clientWidth;
      const h = scroll.clientHeight;
      if (w > 0 && h > 0) {
        setContainerSize({ width: w, height: h });
        const band = w < 768 ? 'mobile' : 'desktop';
        if (butterflyLayoutBandRef.current !== band) {
          butterflyLayoutBandRef.current = band;
          const figma = band === 'mobile' ? BUTTERFLY_FIGMA_MOBILE : BUTTERFLY_FIGMA;
          setButterflyPos(figma.map(({ l, t }) => ({ leftFrac: l / W, topFrac: t / H })));
        }
      }
    };
    update();
    const ro = new ResizeObserver(update);
    const s = heroScrollRef.current;
    const c = heroContainerRef.current;
    if (s) ro.observe(s);
    if (c) ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = heroContentRef.current;
    const measure = heroSubtitleMeasureRef.current;
    if (!container || !measure) return;

    const run = () => {
      if (container.clientWidth < 16) return;
      let maxH = 0;
      for (const phrase of PHRASES) {
        measure.textContent = HERO_SUBTITLE_PREFIX + phrase;
        maxH = Math.max(maxH, measure.offsetHeight);
      }
      setSubtitleBlockMinPx(maxH);
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const phrase = PHRASES[phraseIndex];

    if (phase === 'typing') {
      if (charIndex < phrase.length) {
        // Add one character every 45 ms
        const t = setTimeout(() => setCharIndex(c => c + 1), 45);
        return () => clearTimeout(t);
      } else {
        // Fully typed — decide what happens next
        if (slamDoneRef.current) {
          // ── Manual cycling mode (after initial slam) ──
          // Every phrase settles here and waits for the next user click
          setPhase('done');
        } else if (phraseIndex === PHRASES.length - 1) {
          // ── Initial sequence: reached the last phrase ──
          // Trigger the one-time slam. The unlock timer lives in its own
          // effect (below) so React's cleanup cycle can't cancel it.
          setShowSlam(true);
          setPhase('done');
        } else {
          // ── Initial sequence: mid-run phrase ──
          // Auto-advance to the next phrase without waiting for a click
          const t = setTimeout(() => setPhase('highlighted'), 600);
          return () => clearTimeout(t);
        }
      }
    }

    if (phase === 'highlighted') {
      // Hold highlight for 700 ms then instantly delete and queue next phrase
      const t = setTimeout(() => {
        setCharIndex(0);
        // Wrap around so cycling loops back to phrase 0
        setPhraseIndex(i => (i + 1) % PHRASES.length);
        setPhase('pre-typing');
      }, 700);
      return () => clearTimeout(t);
    }

    if (phase === 'pre-typing') {
      // Brief blank pause (200 ms) before the next phrase starts typing
      const t = setTimeout(() => setPhase('typing'), 200);
      return () => clearTimeout(t);
    }
  }, [phase, charIndex, phraseIndex]);

  // ── Slam unlock timer — lives in its own effect so the typing effect's
  //    cleanup cycle can never cancel it. Fires once when showSlam → true,
  //    then after 1400 ms marks the slam as done and removes the slam class.
  useEffect(() => {
    if (!showSlam) return;
    const t = setTimeout(() => {
      slamDoneRef.current = true;
      setShowSlam(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [showSlam]);

  // ── Testimonials: keep position correct whenever the panel resizes ─────────
  useLayoutEffect(() => {
    const panel = testimonialsRef.current;
    if (!panel) return;

    const sync = () => {
      const H = panel.offsetHeight;
      if (H <= 0) return;
      setTestimonialsPanelHeight(H);
      const peek = measureTestimonialsPeekPx(panel);
      testimonialsPeekRef.current = peek;
      setTestimonialsPeekPx(peek);
      const budget = H - peek + TESTIMONIALS_BOTTOM_MARGIN;
      // Clamp progress in case a resize made the budget smaller
      const clamped = Math.min(testimonialsProgressRef.current, budget);
      testimonialsProgressRef.current = clamped;
      setTestimonialsProgress(clamped);
      panel.style.transform = `translateY(${H - peek - clamped}px)`;
      updateHeroPush(clamped);
    };

    sync();
    // First RO tick can run before fonts / images settle — re-sync on the next frame with real metrics.
    const raf = requestAnimationFrame(() => {
      sync();
    });
    void document.fonts?.ready?.then(() => sync()).catch(() => {});
    const ro = new ResizeObserver(sync);
    ro.observe(panel);
    window.addEventListener('resize', sync);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [updateHeroPush, setTestimonialsProgress]);

  // ── Testimonials: intercept wheel/touch to drive the reveal ────────────────
  useEffect(() => {
    /** Returns true if the event delta was consumed by the testimonials panel. */
    const updatePanel = (deltaY: number): boolean => {
      const panel = testimonialsRef.current;
      if (!panel) return false;
      const H = panel.offsetHeight;
      const peek = measureTestimonialsPeekPx(panel);
      testimonialsPeekRef.current = peek;
      const budget = H - peek + TESTIMONIALS_BOTTOM_MARGIN;
      const progress = testimonialsProgressRef.current;

      if (deltaY > 0 && progress < budget) {
        testimonialsProgressRef.current = Math.min(budget, progress + deltaY);
        panel.style.transform = `translateY(${H - peek - testimonialsProgressRef.current}px)`;
        updateHeroPush(testimonialsProgressRef.current);
        return true;
      }
      if (deltaY < 0 && progress > 0) {
        testimonialsProgressRef.current = Math.max(0, progress + deltaY);
        panel.style.transform = `translateY(${H - peek - testimonialsProgressRef.current}px)`;
        updateHeroPush(testimonialsProgressRef.current);
        return true;
      }
      return false;
    };

    const wouldConsume = (deltaY: number): boolean => {
      const panel = testimonialsRef.current;
      if (!panel) return false;
      const H = panel.offsetHeight;
      const peek = measureTestimonialsPeekPx(panel);
      testimonialsPeekRef.current = peek;
      const budget = H - peek + TESTIMONIALS_BOTTOM_MARGIN;
      const progress = testimonialsProgressRef.current;
      return (deltaY > 0 && progress < budget) || (deltaY < 0 && progress > 0);
    };

    let pendingDelta = 0;
    let rafId: number | null = null;
    const MAX_CHUNK = 96;

    const flushPending = () => {
      rafId = null;
      let remaining = pendingDelta;
      pendingDelta = 0;
      if (Math.abs(remaining) < 0.5) return;
      while (Math.abs(remaining) > 0.5) {
        const chunk = Math.sign(remaining) * Math.min(Math.abs(remaining), MAX_CHUNK);
        if (!updatePanel(chunk)) break;
        remaining -= chunk;
      }
      setTestimonialsProgress(testimonialsProgressRef.current);
      setTestimonialsPeekPx(testimonialsPeekRef.current);
    };

    const scheduleFlush = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(flushPending);
    };

    const handleWheel = (e: WheelEvent) => {
      if (activeDragIndexRef.current !== null) return;
      const raw = e.deltaY;
      const clamped = Math.sign(raw) * Math.min(Math.abs(raw), 120);
      if (!wouldConsume(clamped)) return;
      e.preventDefault();
      pendingDelta += clamped;
      scheduleFlush();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeDragIndexRef.current !== null) return;
      if (touchStartYRef.current === null) return;
      const clientY = e.touches[0].clientY;
      const raw = touchStartYRef.current - clientY;
      touchStartYRef.current = clientY;

      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const maxTouch = mobile ? 120 : 48;
      const deltaY = Math.sign(raw) * Math.min(Math.abs(raw), maxTouch);

      if (mobile) {
        const hero = heroScrollRef.current;
        const target = e.target;
        if (hero && target instanceof Node && hero.contains(target)) {
          const sh = hero.scrollHeight;
          const ch = hero.clientHeight;
          if (sh > ch + 2) {
            const atTop = hero.scrollTop <= 1;
            const atBottom = hero.scrollTop + ch >= sh - 2;
            if (deltaY > 0 && !atBottom) return;
            if (deltaY < 0 && !atTop) return;
          }
        }
      }

      if (!wouldConsume(deltaY)) return;
      e.preventDefault();
      pendingDelta += deltaY;
      scheduleFlush();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [updateHeroPush, setTestimonialsProgress]);

  const handleButterflyPointerDown = useCallback(
    (e: React.PointerEvent<HTMLImageElement>, index: number) => {
      e.preventDefault();
      const img = e.currentTarget;
      const cr = heroScrollRef.current?.getBoundingClientRect();
      if (!cr) return;
      const imgRect = img.getBoundingClientRect();
      dragOffsetPxRef.current = { x: e.clientX - imgRect.left, y: e.clientY - imgRect.top };
      dragStartFracRef.current = { ...butterflyPosRef.current[index] };
      const zone = getHeroExclusionRect();
      dragStartOverlapsHeroRef.current = Boolean(zone && rectsOverlap(imgRect, zone));
      activeDragIndexRef.current = index;
      setDraggingIndex(index);
      img.setPointerCapture(e.pointerId);
    },
    [getHeroExclusionRect],
  );

  const handleButterflyPointerMove = useCallback(
    (e: React.PointerEvent<HTMLImageElement>, index: number) => {
      if (activeDragIndexRef.current !== index) return;
      const scrollEl = heroScrollRef.current;
      const cr = scrollEl?.getBoundingClientRect();
      if (!cr || !scrollEl || cr.width <= 0 || cr.height <= 0) return;
      const sy = scrollEl.scrollTop;
      const sx = scrollEl.scrollLeft;
      const localLeft = e.clientX - cr.left - dragOffsetPxRef.current.x + sx;
      const localTop = e.clientY - cr.top - dragOffsetPxRef.current.y + sy;
      const leftFrac = localLeft / cr.width;
      const topFrac = localTop / cr.height;
      setButterflyPos(prev => {
        const next = [...prev];
        next[index] = { leftFrac, topFrac };
        return next;
      });
    },
    [],
  );

  const endButterflyDrag = useCallback((e: React.PointerEvent<HTMLImageElement>, index: number) => {
    if (activeDragIndexRef.current !== index) return;
    const start = dragStartFracRef.current;
    const img = e.currentTarget;
    try {
      img.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    const br = img.getBoundingClientRect();
    const zone = getHeroExclusionRect();
    const overlaps = Boolean(zone && rectsOverlap(br, zone));
    /** Only reject placement when dragging in from outside the zone; allow rescue drags from inside. */
    const shouldSnapBack =
      Boolean(overlaps && start) && !dragStartOverlapsHeroRef.current;

    activeDragIndexRef.current = null;
    setDraggingIndex(null);
    dragStartOverlapsHeroRef.current = false;

    if (shouldSnapBack && start) {
      setSnapRevertingIndex(index);
      requestAnimationFrame(() => {
        setButterflyPos(prev => {
          const next = [...prev];
          next[index] = { leftFrac: start.leftFrac, topFrac: start.topFrac };
          return next;
        });
      });
      window.setTimeout(() => setSnapRevertingIndex(null), 280);
    }
    dragStartFracRef.current = null;
  }, [getHeroExclusionRect]);

  const handleButterflyPointerUp = useCallback(
    (e: React.PointerEvent<HTMLImageElement>, index: number) => {
      endButterflyDrag(e, index);
    },
    [endButterflyDrag],
  );

  const handleButterflyPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLImageElement>, index: number) => {
      endButterflyDrag(e, index);
    },
    [endButterflyDrag],
  );

  // Click handler for cycling phrases after the initial slam has completed
  const handleSubtitleClick = () => {
    // Only allow clicking once we're fully settled and slam is done
    if (phase !== 'done' || !slamDoneRef.current) return;
    setPhase('highlighted');
  };

  const testimonialsBudget =
    testimonialsPanelHeight > 0
      ? testimonialsPanelHeight - testimonialsPeekPx + TESTIMONIALS_BOTTOM_MARGIN
      : 0;
  const showTestimonialsScrollTooltip =
    canPrimaryHover &&
    testimonialsSectionHover &&
    testimonialsBudget > 0 &&
    testimonialsProgress < testimonialsBudget - 0.5;

  return (
    <>
      {/* ── Hero page ── white background with dot grid ── */}
      <div
        ref={heroContainerRef}
        className="home-hero-root"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: '#ffffff',
          backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          /* Desktop: allow butterflies past edges; mobile: lock horizontal pan (handled via isMobileViewport) */
          overflowX: isMobileViewport ? 'hidden' : 'visible',
          overflowY: 'hidden',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          opacity: chatOpen ? 0 : 1,
          visibility: chatOpen ? 'hidden' : 'visible',
          cursor: BUTTERFLY_CURSOR,
        }}
      >
        {/*
          Scroll surface: on mobile, overflow scroll + inner +1px min-height preserves iOS rubber-band.
          On desktop (see globals.css .home-hero-scroll) overflow is hidden so there is no micro-scroll.
        */}
        <div
          ref={heroScrollRef}
          className="home-hero-scroll"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
          }}
        >
          <div
            className="home-hero-scroll-inner"
            style={{
              position: 'relative',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div
              className="home-hero-main-column"
              style={{
                position: 'relative',
                isolation: 'isolate',
                flex: '1 1 auto',
                minHeight: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                paddingTop: HOME_HERO_TOP_PAD,
                paddingBottom: HOME_HERO_BOTTOM_PAD,
                paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))',
                paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
                pointerEvents: 'none',
              }}
            >
              {/* Butterflies z1 — behind headline + subtitle; z6 while dragging so the active butterfly paints above copy */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: draggingIndex !== null ? 6 : 1,
                  pointerEvents: 'none',
                }}
              >
                {butterflies.map((b, i) => {
                  const cw = containerSize.width;
                  const ch = containerSize.height;
                  const usePx = cw > 0 && ch > 0;
                  const posStyle: CSSProperties = usePx
                    ? {
                        left: `${butterflyPos[i].leftFrac * cw}px`,
                        top: `${butterflyPos[i].topFrac * ch}px`,
                      }
                    : { left: b.style.left, top: b.style.top };
                  const dragging = draggingIndex === i;
                  return (
                    <div
                      key={i}
                      className={`butterfly-float butterfly-float--${i}`}
                      style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: dragging ? 10 : 1,
                        ...posStyle,
                        transition:
                          snapRevertingIndex === i
                            ? 'left 0.26s ease-out, top 0.26s ease-out'
                            : 'none',
                        ...(dragging ? { animationPlayState: 'paused' as const } : {}),
                      }}
                    >
                      <img
                        src={b.src}
                        alt=""
                        aria-hidden="true"
                        className={showSlam ? b.reactClass : undefined}
                        onPointerDown={e => handleButterflyPointerDown(e, i)}
                        onPointerMove={e => handleButterflyPointerMove(e, i)}
                        onPointerUp={e => handleButterflyPointerUp(e, i)}
                        onPointerCancel={e => handleButterflyPointerCancel(e, i)}
                        style={{
                          display: 'block',
                          /* Preflight’s max-width:100% + shrink-to-fit abs. wrapper squeezed imgs near the right edge */
                          maxWidth: 'none',
                          pointerEvents: 'auto',
                          touchAction: 'none',
                          cursor: dragging ? 'grabbing' : 'grab',
                          width: b.style.width,
                          height: 'auto',
                          ...(showSlam ? { animationDelay: b.reactDelay } : {}),
                          ...(dragging ? { animationPlayState: 'paused' as const } : {}),
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* ── Hero copy — title + subtitle + CTAs; translates up as testimonials approach ── */}
              <div
                ref={heroCopyRef}
                style={{
                  position: 'relative',
                  zIndex: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  willChange: 'transform',
                }}
              >
              {/* Headline — above butterflies; pointer-events none so drags pass through gaps */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  width: 'min(860px, max(88vw, min(300px, calc(100vw - 40px))))',
                }}
              >
                <h1
                  ref={heroTitleRef}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '36px',
                    fontWeight: 700,
                    lineHeight: '44px',
                    color: '#141510',
                    margin: 0,
                    letterSpacing: 0,
                    maxWidth: '100%',
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      WebkitTextStroke: '4px #ffffff',
                      paintOrder: 'stroke fill',
                      pointerEvents: 'none',
                    }}
                  >
                    Howdy, I&apos;m Bryce
                  </span>
                </h1>
              </div>

        {/* ── Subtitle + CTAs — z4 above butterflies so links/subtitle stay clickable ── */}
        <div
          ref={heroContentRef}
          style={{
            position: 'relative',
            zIndex: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            flexShrink: 0,
            marginTop: '32px',
            width: 'min(860px, max(88vw, min(300px, calc(100vw - 40px))))',
          }}
        >
          {/* Subtitle — min-height from max phrase height so CTAs do not jump when lines change */}
          <div
            style={{
              marginTop: 0,
              width: '100%',
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              minHeight: subtitleBlockMinPx ?? undefined,
              pointerEvents: 'none',
            }}
          >
            <div
              ref={heroSubtitleMeasureRef}
              aria-hidden
              style={{
                ...HERO_SUBTITLE_TEXT_STYLE,
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                left: 0,
                top: 0,
                width: '100%',
                boxSizing: 'border-box',
                display: 'block',
              }}
            />
            <p
              ref={heroSubtitleRef}
              className={showSlam ? 'subtitle-slam' : undefined}
              onClick={handleSubtitleClick}
              style={{
                ...HERO_SUBTITLE_TEXT_STYLE,
                marginTop: 0,
                display: 'inline-block',
                width: 'fit-content',
                cursor: phase === 'done' && slamDoneRef.current ? 'pointer' : 'default',
                pointerEvents: 'auto',
              }}
            >
              a product designer who{' '}

              {/* Animated suffix with alternating highlight */}
              <span
                style={{
                  backgroundColor: phase === 'highlighted'
                    ? HIGHLIGHT_COLORS[phraseIndex % HIGHLIGHT_COLORS.length]
                    : 'transparent',
                  borderRadius: '3px',
                  padding: phase === 'highlighted' ? '0 2px' : '0',
                  transition: 'background-color 0.08s ease',
                  ...(phase === 'highlighted'
                    ? { WebkitTextStroke: '0 transparent', paintOrder: 'fill' as const }
                    : {}),
                }}
              >
                {PHRASES[phraseIndex].slice(0, charIndex)}
              </span>

              {/* Blinking cursor — visible while typing, hidden when highlighted or done */}
              {(phase === 'typing' || phase === 'pre-typing') && (
                <span
                  aria-hidden="true"
                  className="cursor-blink"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.1em',
                    background: '#141510',
                    borderRadius: '1px',
                    marginLeft: '1px',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </p>
          </div>

          {/* CTAs — 48px below the text block, 16px gap between buttons */}
          <div
            ref={heroCtasRef}
            style={{ display: 'flex', gap: '16px', marginTop: '48px', pointerEvents: 'none' }}
          >

            {/* View my work — dark fill, 2px black stroke, 12px radius
                Hover: hard lime-green drop shadow offset 4px down (no blur) */}
            <Link
              href="/case-studies"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '16px',
                color: '#ffffff',
                background: '#141510',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: 'none',
                transition: 'box-shadow 0.15s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
              {...(canPrimaryHover
                ? {
                    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = `0 4px 0 0 ${VMW_HOVER_COLORS[vmwColorIndex]}`;
                      setVmwColorIndex(i => (i + 1) % VMW_HOVER_COLORS.length);
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = 'none';
                    },
                  }
                : {})}
            >
              View my work
            </Link>

            {/* Get to know me — white fill, 2px black stroke, 12px radius
                Hover: hard black drop shadow offset 4px down (no blur) */}
            <Link
              href="/about"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '16px',
                color: '#141510',
                background: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: 'none',
                transition: 'box-shadow 0.15s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
              {...(canPrimaryHover
                ? {
                    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = '0 4px 0 0 #000000';
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = 'none';
                    },
                  }
                : {})}
            >
              Get to know me
            </Link>

          </div>
        </div>
              </div>{/* end heroCopyRef */}
            </div>
          </div>
        </div>

        {/* ── Cursor contrail — canvas overlay, landing page only ── */}
        <CursorContrail />

        {/* ── BAR 9000 chat bar — pinned near bottom, centered ── */}
        {/* <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat with BAR 9000"
          style={{
            position: 'absolute',
            bottom: '9.4%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(280px, 38.9vw, 560px)',
            height: '48px',
            background: '#0f0f0e',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'text',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.42)',
              fontSize: '15px',
              fontFamily: 'var(--font-sf-pro)',
              letterSpacing: '-0.15px',
              userSelect: 'none',
            }}
          >
            Chat with BAR 9000...
          </span>
        </button> */}
      </div>

      {/* ── Chat overlay — mounts when chat bar is clicked ── */}
      {/* {chatOpen && (
        <ChatContainer
          disclaimerVisible={false}
          disclaimerHeight={0}
        />
      )} */}

      {/* ── Testimonials reveal panel ───────────────────────────────────────
           position: fixed so it never disrupts the hero layout.
           translateY is driven by wheel/touch events above; the ResizeObserver
           sets the initial value before the first paint.
      ── */}
      <div
        ref={testimonialsRef}
        aria-label="Kind things people have said about me"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          background: 'transparent',
          paddingTop: '24px',
          paddingBottom: '24px',
          opacity: chatOpen ? 0 : 1,
          /* Let clicks pass through transparent areas so hero butterflies stay draggable */
          pointerEvents: 'none',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          visibility: chatOpen ? 'hidden' : 'visible',
          willChange: 'transform',
        }}
      >
        {/* Heading + cards — hover shows cursor-following tooltip; hit box is content-width so butterflies beside the block stay draggable */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'fit-content',
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            setTestimonialsSectionHover(true);
            setTestimonialsTooltipPos({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={e => setTestimonialsTooltipPos({ x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setTestimonialsSectionHover(false)}
        >
          {typeof document !== 'undefined' &&
            showTestimonialsScrollTooltip &&
            createPortal(
              <div
                role="tooltip"
                style={{
                  position: 'fixed',
                  left: `${testimonialsTooltipPos.x + 14}px`,
                  top: `${testimonialsTooltipPos.y + 14}px`,
                  zIndex: 10001,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#89FF12',
                  border: '2px solid #000000',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '18px',
                  color: '#141510',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                Scroll down!
              </div>,
              document.body,
            )}
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#141510',
              textAlign: 'center',
              margin: '0 0 16px 0',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                WebkitTextStroke: '4px #ffffff',
                paintOrder: 'stroke fill',
              }}
            >
              Kind things people have said about me
            </span>
          </h2>

          {/* Cards row — wraps to single column on narrow viewports */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              maxWidth: '672px',
              margin: '0 auto',
              paddingLeft: '16px',
              paddingRight: '16px',
              boxSizing: 'border-box',
              flexWrap: 'wrap',
            }}
          >
          {TESTIMONIALS.map(({ name, role, quote, initials, avatarSrc }) => (
            <div
              key={name}
              style={{
                flex: '1 1 280px',
                background: '#ffffff',
                border: '1.5px solid rgba(0, 0, 0, 0.10)',
                borderRadius: '16px',
                padding: '20px',
                boxSizing: 'border-box',
              }}
            >
              {/* Avatar + name + role — measured for initial peek height */}
              <div
                className="testimonial-card-header"
                style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}
              >
                {avatarSrc ? (
                  <img
                    className="testimonial-avatar"
                    src={avatarSrc}
                    alt={name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(0, 0, 0, 0.10)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    className="testimonial-avatar-placeholder"
                    aria-hidden="true"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f0f0ef',
                      border: '1.5px solid rgba(0, 0, 0, 0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: '#6b6b6b',
                      userSelect: 'none',
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div>
                  <div
                    className="testimonial-name"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '16px',
                      lineHeight: '22px',
                      color: '#141510',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    className="testimonial-role"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontStyle: 'italic',
                      color: '#6b6b6b',
                    }}
                  >
                    {role}
                  </div>
                </div>
              </div>

              {/* Testimonial quote */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#141510',
                  margin: 0,
                }}
              >
                {quote}
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
  );
}
