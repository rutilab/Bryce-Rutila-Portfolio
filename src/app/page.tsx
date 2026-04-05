'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, type CSSProperties } from 'react';
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

/** Fixed nav uses top-6 (24px) + ~48px pill; 24px gap below nav before hero copy/buttons. */
const HOME_HERO_TOP_PAD = 'calc(24px + 48px + 24px + env(safe-area-inset-top, 0px))';
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

  const getHeroExclusionRect = useCallback((): DOMRect | null => {
    const t = heroTitleRef.current?.getBoundingClientRect();
    const s = heroSubtitleRef.current?.getBoundingClientRect();
    const c = heroCtasRef.current?.getBoundingClientRect();
    if (t && s && c) return unionRects(unionRects(t, s), c);
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

  useLayoutEffect(() => {
    const el = heroContainerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
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

  const handleButterflyPointerDown = useCallback(
    (e: React.PointerEvent<HTMLImageElement>, index: number) => {
      e.preventDefault();
      const img = e.currentTarget;
      const cr = heroContainerRef.current?.getBoundingClientRect();
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
      const cr = heroContainerRef.current?.getBoundingClientRect();
      const scrollEl = heroScrollRef.current;
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

  return (
    <>
      {/* ── Hero page ── white background with dot grid ── */}
      <div
        ref={heroContainerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: '#ffffff',
          backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          overflow: 'hidden',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          opacity: chatOpen ? 0 : 1,
          visibility: chatOpen ? 'hidden' : 'visible',
          cursor: BUTTERFLY_CURSOR,
        }}
      >
        {/*
          Single scroll surface (case-studies pattern): butterflies + hero copy move together on
          overscroll; body scroll stays locked on mobile so the fixed nav does not rubber-band.
        */}
        <div
          ref={heroScrollRef}
          className="home-hero-scroll"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            overflowY: 'scroll',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div
            style={{
              position: 'relative',
              /* min-height + height so % children resolve; +1px preserves iOS edge overscroll */
              minHeight: 'calc(100% + 1px)',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'relative',
                /* Must fill scrollport so margin:auto on hero recenters (100% alone failed after scroll split) */
                minHeight: 'calc(100% + 1px)',
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
              {/* Title below butterflies in z-order so wings receive hits; subtitle/CTAs are z4 above butterflies */}
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
                    Howdy I&apos;m Bryce
                  </span>
                </h1>
              </div>

              {/* Between title (z2) and subtitle (z4): grab/hover works near hero copy */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
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
                    <img
                      key={i}
                      src={b.src}
                      alt=""
                      aria-hidden="true"
                      className={showSlam && !dragging ? b.reactClass : undefined}
                      onPointerDown={e => handleButterflyPointerDown(e, i)}
                      onPointerMove={e => handleButterflyPointerMove(e, i)}
                      onPointerUp={e => handleButterflyPointerUp(e, i)}
                      onPointerCancel={e => handleButterflyPointerCancel(e, i)}
                      style={{
                        position: 'absolute',
                        zIndex: dragging ? 10 : 1,
                        pointerEvents: 'auto',
                        touchAction: 'none',
                        cursor: dragging ? 'grabbing' : 'grab',
                        transition:
                          snapRevertingIndex === i
                            ? 'left 0.26s ease-out, top 0.26s ease-out'
                            : 'none',
                        width: b.style.width,
                        ...posStyle,
                        ...(showSlam && !dragging ? { animationDelay: b.reactDelay } : {}),
                      }}
                    />
                  );
                })}
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
    </>
  );
}
