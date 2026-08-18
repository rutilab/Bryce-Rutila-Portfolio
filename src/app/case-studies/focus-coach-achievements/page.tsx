'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties, MutableRefObject, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import KeyboardDoubleArrowDownOutlined from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Check from '@mui/icons-material/Check';
import DarkMode from '@mui/icons-material/DarkMode';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightMode from '@mui/icons-material/LightMode';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { CaseStudyMedia, CaseStudyMediaGallery, CaseStudyMediaPlaceholder, CompletionQuoteScreen, CompletionWeekTrackerScreen, EndOfSessionFlow, FocusStreakScreen, LightboxCloseButton, LightboxIconButton, LiveScreenFit, MediaCarouselStage, MilestoneHeroScreen, NorthStarAnimatedIcon, PersonalBestScreen, ReflectionScreen } from '@/components/case-study';
import type { CaseStudyMediaItem } from '@/components/case-study';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type ThemeMode = 'light' | 'dark';

const MOBILE_ASSET = '/case-studies/focus-coach-achievements';

function mobileSrc(name: string, mode: ThemeMode, cacheKey = '1') {
  const prefix = mode === 'light' ? 'lm' : 'dm';
  return `${MOBILE_ASSET}/mobile-${prefix}-${name}.png?v=${cacheKey}`;
}

/** Section eyebrows */
const EYEBROW_ICON_COLOR = '#272727';
/** Finding Focus blue — the accent used across all Finding Focus case studies */
const ACCENT = '#006efe';
const ACCENT_DARK = '#0057c2';
/** Frosted block behind visuals + reflection cards + flow diagram (#dce8f8 @ 45%) */
const BLOCK_BG = 'rgba(220, 232, 248, 0.45)';
/** Solid light container for content cards (goal cards, anatomy cards) */
const CARD_LIGHT = '#f5f7fa';
/** Hairline border on white cards (TL;DR, callout, flow-step cards, segmented control) */
const BORDER = '#e6ecf4';
/** Problem-stat + dark-pattern accent */
const DANGER_BG = '#fceaea';
const DANGER = '#fe0000';

// ── Utility components ───────────────────────────────────────────────────────

function useInView<T extends Element>(
  threshold = 0.35,
  rootMargin = '0px 0px -8% 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, threshold, rootMargin]);

  return [ref, inView];
}

/** Italic emphasis inside headings — same typeface, marks the operative words. */
function Em({ children }: { children: ReactNode }) {
  return <em className="italic">{children}</em>;
}

function Eyebrow({ label, color = EYEBROW_ICON_COLOR }: { label: string; color?: string }) {
  return (
    <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color }}>
      {label}
    </p>
  );
}

function Section({
  eyebrow,
  heading,
  body,
  children,
  id,
}: {
  eyebrow?: string;
  heading?: ReactNode;
  body?: string | string[];
  children?: ReactNode;
  id?: string;
}) {
  const bodies = body == null ? [] : Array.isArray(body) ? body : [body];
  return (
    <div id={id} className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="max-w-[760px]">
          {eyebrow && <Eyebrow label={eyebrow} />}
          {heading && (
            <h2 className="text-[22px] md:text-[30px] font-semibold leading-[130%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
              {heading}
            </h2>
          )}
        </div>
        {bodies.length > 0 && (
          <div className="flex flex-col gap-4 max-w-[820px]">
            {bodies.map((b, i) => (
              <p key={i} className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555]">
                {b}
              </p>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function VisualCard({
  children,
  caption,
  pad = 'p-4 sm:p-8',
}: {
  children: ReactNode;
  caption?: string;
  pad?: string;
}) {
  return (
    <div>
      <div className="relative rounded-[24px] overflow-hidden" style={{ background: BLOCK_BG }}>
        <div className={pad}>{children}</div>
      </div>
      {caption && <p className="text-[13px] text-[#999] text-center mt-3">{caption}</p>}
    </div>
  );
}

/**
 * Sun/moon control that swaps the card's assets between modes.
 * Shows an outline icon of the mode you'll switch *to*, fills it on hover/focus,
 * and reveals a matching tooltip. Matches the white media-control chrome used by
 * the ImageViewer arrows elsewhere on the page.
 */
function ThemeModeToggle({
  mode,
  onToggle,
}: {
  mode: ThemeMode;
  onToggle: () => void;
}) {
  const [active, setActive] = useState(false);
  const goingDark = mode === 'light';
  const label = goingDark ? 'View dark mode' : 'View light mode';
  const OutlineIcon = goingDark ? DarkModeOutlined : LightModeOutlined;
  const FilledIcon = goingDark ? DarkMode : LightMode;

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full focus-visible:outline-none"
        style={{
          padding: 4,
          background: '#ffffff',
          border: `1px solid ${active ? 'rgba(0,110,254,0.35)' : 'rgba(0,0,0,0.08)'}`,
          boxShadow: active ? '0 3px 12px rgba(0,110,254,0.20)' : '0 1px 4px rgba(0,0,0,0.10)',
          color: active ? ACCENT : '#555555',
          transform: active ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease',
        }}
      >
        {/* Crossfade outline → filled without shifting layout */}
        <span className="relative inline-flex" style={{ width: 18, height: 18 }}>
          <OutlineIcon
            sx={{ fontSize: 18, position: 'absolute', inset: 0, opacity: active ? 0 : 1, transition: 'opacity 0.18s ease' }}
          />
          <FilledIcon
            sx={{ fontSize: 18, position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 0.18s ease' }}
          />
        </span>
      </button>

      <span
        role="tooltip"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          whiteSpace: 'nowrap',
          background: '#111113',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1,
          padding: '6px 9px',
          borderRadius: 7,
          pointerEvents: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.20)',
          opacity: active ? 1 : 0,
          transform: active ? 'translateY(0)' : 'translateY(-3px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          zIndex: 20,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * VisualCard with an independent light/dark toggle in the top-right.
 * Children receive the active mode so image sources can swap.
 */
function ThemedVisualCard({
  children,
  caption,
  pad = 'p-4 sm:p-8',
  defaultMode = 'dark',
  mode: controlledMode,
  onModeChange,
}: {
  children: (mode: ThemeMode) => ReactNode;
  caption: (mode: ThemeMode) => string;
  pad?: string;
  defaultMode?: ThemeMode;
  mode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
}) {
  const [internalMode, setInternalMode] = useState<ThemeMode>(defaultMode);
  const mode = controlledMode ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  return (
    <div>
      <div className="relative rounded-[24px] overflow-hidden" style={{ background: BLOCK_BG }}>
        {/* Inset past the 24px radius so the control isn’t clipped in the corner */}
        <div className="absolute z-10" style={{ top: 16, right: 16 }}>
          <ThemeModeToggle
            mode={mode}
            onToggle={() => setMode(mode === 'light' ? 'dark' : 'light')}
          />
        </div>
        {/*
          Both themes stay mounted in one grid cell and crossfade on opacity, so
          switching never re-fetches or remounts an <img> — no phantom/blank flash.
          Identical light/dark dimensions keep the cell height stable.
        */}
        <div className={pad}>
          <div style={{ display: 'grid' }}>
            {(['light', 'dark'] as ThemeMode[]).map((m) => {
              const activeLayer = mode === m;
              return (
                <div
                  key={m}
                  aria-hidden={activeLayer ? undefined : true}
                  style={{
                    gridArea: '1 / 1',
                    opacity: activeLayer ? 1 : 0,
                    pointerEvents: activeLayer ? 'auto' : 'none',
                    transition: 'opacity 0.35s ease',
                    visibility: activeLayer ? 'visible' : 'hidden',
                  }}
                >
                  {children(m)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="text-[13px] text-[#999] text-center mt-3">{caption(mode)}</p>
    </div>
  );
}

/**
 * Side-by-side phone mockups until the row no longer fits, then Content Ideas–
 * style carousel (one at a time with arrows). Light/dark mode is shared so the
 * carousel index is preserved across theme toggles.
 */
function ThemedMockupCarousel({
  caption,
  buildItems,
  columns,
  desktopMaxWidth,
  carouselMaxWidth = 260,
}: {
  caption: (mode: ThemeMode) => string;
  buildItems: (mode: ThemeMode) => CaseStudyMediaItem[];
  columns: 2 | 3;
  desktopMaxWidth: number;
  carouselMaxWidth?: number;
}) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [sideBySide, setSideBySide] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const items = buildItems(mode);

  // Minimum container width to keep all phones on one row (before switching to carousel).
  const MIN_PHONE = 160;
  const GAP = 12;
  const PAD = 40;
  const minSideBySide = columns * MIN_PHONE + (columns - 1) * GAP + PAD;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      setSideBySide(el.clientWidth >= minSideBySide);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minSideBySide]);

  return (
    <div ref={wrapRef} className="w-full">
      {sideBySide ? (
        <ThemedVisualCard
          caption={caption}
          mode={mode}
          onModeChange={setMode}
          pad="p-4 sm:p-6"
        >
          {(m) => (
            <CaseStudyMediaGallery
              columns={columns}
              maxWidth={desktopMaxWidth}
              gapClassName="gap-3 sm:gap-4"
              preventStack
              items={buildItems(m)}
            />
          )}
        </ThemedVisualCard>
      ) : (
        <MediaCarouselStage
          items={items}
          caption={caption(mode)}
          maxWidth={carouselMaxWidth}
          background={BLOCK_BG}
          topRight={
            <ThemeModeToggle
              mode={mode}
              onToggle={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
            />
          }
        />
      )}
    </div>
  );
}

/** Placeholder slot for an image/GIF to be added later. */
function PlaceholderVisual({
  description,
  minHeight = 320,
  style,
}: {
  description: string;
  minHeight?: number;
  style?: CSSProperties;
}) {
  return (
    <CaseStudyMediaPlaceholder description={description} minHeight={minHeight} style={style} />
  );
}

/** Manual image carousel — same chrome as ImageViewer on the Finding Focus landing case study. */
function ImageViewer({ items }: { items: { src: string; alt: string; label: string }[] }) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<'xs' | 'sm' | 'md'>('md');
  const item = items[current];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setViewport('xs');
      else if (w < 768) setViewport('sm');
      else setViewport('md');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useBodyScrollLock(lightboxOpen && mounted);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % items.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, items.length]);

  const stageHeight = viewport === 'xs' ? 260 : viewport === 'sm' ? 400 : 420;
  const stagePad = viewport === 'xs' ? 16 : 32;

  useEffect(() => {
    // Self-reveal for mobile fade CSS (same system as CaseStudyMedia)
    const imgs = document.querySelectorAll('.case-study-content-layer img');
    imgs.forEach((el) => {
      const img = el as HTMLImageElement;
      const show = () => {
        img.classList.add('case-study-img-visible');
        img.dataset.csReveal = '1';
      };
      if (img.complete) show();
      else {
        img.addEventListener('load', show, { once: true });
        img.addEventListener('error', show, { once: true });
      }
    });
  }, [current, item.src]);

  return (
    <>
      <div>
        <div
          className="rounded-[24px] overflow-hidden relative"
          style={{ background: BLOCK_BG, height: stageHeight }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: stagePad }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              role="button"
              tabIndex={0}
              aria-label={`Expand image: ${item.alt}`}
              onClick={() => setLightboxOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }}
              src={item.src}
              alt={item.alt}
              className="max-h-full max-w-full w-auto h-auto block rounded-md select-none"
              style={{ cursor: 'zoom-in' }}
              draggable={false}
            />
          </div>

          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => c - 1);
            }}
            style={{
              visibility: current > 0 ? 'visible' : 'hidden',
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', background: 'white',
              border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#555', cursor: 'pointer', zIndex: 2,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => c + 1);
            }}
            style={{
              visibility: current < items.length - 1 ? 'visible' : 'hidden',
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', background: 'white',
              border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#555', cursor: 'pointer', zIndex: 2,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 px-2">
          <p className="text-[13px] text-[#999] text-center">{item.label}</p>
          {items.length > 1 && (
            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  style={{
                    height: 5, borderRadius: 3,
                    width: i === current ? 20 : 5,
                    transition: 'width 0.25s',
                    background: i === current ? EYEBROW_ICON_COLOR : 'rgba(0,0,0,0.12)',
                    border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && mounted && createPortal(
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(6, 6, 9, 0.96)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            /* Tight side padding on XS so arrows don't steal width from the image */
            padding: viewport === 'xs' ? '56px 12px 32px' : '64px 84px 40px',
            boxSizing: 'border-box',
            cursor: 'zoom-out',
            overflow: 'hidden',
          }}
        >
          <LightboxCloseButton onClose={() => setLightboxOpen(false)} />
          {items.length > 1 ? (
            <>
              <LightboxIconButton
                label="Previous"
                size={viewport === 'xs' ? 32 : 44}
                onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
                position={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: viewport === 'xs' ? 6 : 20,
                  visibility: current > 0 ? 'visible' : 'hidden',
                }}
              >
                <svg width={viewport === 'xs' ? 13 : 16} height={viewport === 'xs' ? 13 : 16} viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </LightboxIconButton>
              <LightboxIconButton
                label="Next"
                size={viewport === 'xs' ? 32 : 44}
                onClick={() => setCurrent((c) => (c + 1) % items.length)}
                position={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  right: viewport === 'xs' ? 6 : 20,
                  visibility: current < items.length - 1 ? 'visible' : 'hidden',
                }}
              >
                <svg width={viewport === 'xs' ? 13 : 16} height={viewport === 'xs' ? 13 : 16} viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </LightboxIconButton>
            </>
          ) : null}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default', maxWidth: 'min(92vw, 1200px)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              style={{
                maxWidth: '100%',
                maxHeight: 'min(72vh, calc(100vh - 210px))',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 14,
                display: 'block',
              }}
            />
            <p style={{ marginTop: 18, maxWidth: 'min(760px, 90vw)', textAlign: 'center', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
              {item.label}
            </p>
            {items.length > 1 ? (
              <p style={{ marginTop: 8, fontSize: 12, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.4)' }}>
                {current + 1} / {items.length}
              </p>
            ) : null}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// Ported from the Focus Coach HTML prototype's live week-card implementation.
function FocusStreakWeekCard() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [run, setRun] = useState(0);
  const [entered, setEntered] = useState(false);
  const [flamePhase, setFlamePhase] = useState<'idle' | 'pop' | 'spin' | 'slam'>('idle');
  const [completedDays, setCompletedDays] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Kick off / continue the loop while the card is in view.
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setRun((value) => value + 1), 0);
    return () => clearTimeout(timer);
  }, [inView]);

  useEffect(() => {
    if (run === 0 || !inView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    // Reset → play → hold on the expanded state → loop
    later(() => {
      setEntered(false);
      setFlamePhase('idle');
      setCompletedDays(0);
      setExpanded(false);
    }, 0);
    later(() => setEntered(true), 120);
    later(() => setFlamePhase('pop'), 850);
    later(() => setFlamePhase('spin'), 1070);
    later(() => setFlamePhase('slam'), 1770);
    later(() => {
      for (let day = 1; day <= 5; day += 1) {
        later(() => setCompletedDays(day), (day - 1) * 112);
      }
    }, 1910);
    later(() => setFlamePhase('idle'), 2190);
    later(() => setExpanded(true), 2850);
    // Pause on the final expanded frame, then restart
    later(() => setRun((value) => value + 1), 5200);

    return () => timers.forEach(clearTimeout);
  }, [run, inView]);

  const days = ['M', 'Tu', 'W', 'Th', 'F'];
  const sparkles = [
    { x: -24, y: -24, color: '#ff6a00', size: 5 },
    { x: 24, y: -24, color: '#ffb830', size: 6 },
    { x: -28, y: 6, color: '#ffd700', size: 4 },
    { x: 28, y: 6, color: '#ff6a00', size: 5 },
    { x: 0, y: -32, color: '#fe9f00', size: 4 },
    { x: 14, y: -28, color: '#ffd700', size: 3 },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center py-4 sm:py-7">
      {/* Fixed-height stage so expand/collapse never shifts page layout */}
      <div className="relative flex w-full max-w-[408px] items-start justify-center" style={{ height: 180 }}>
        <div
          className="focus-streak-card relative w-full overflow-hidden bg-white"
          data-entered={entered}
          data-expanded={expanded}
          aria-label="Focus Streak week container animation"
        >
        <div className="flex h-[96px] items-center justify-center">
          <div className="flex items-center gap-3">
            {days.map((day, index) => {
              const wasDone = index < 4;
              const impacted = index < completedDays;
              const isFriday = index === 4;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span
                    className="text-[14px] font-bold transition-colors duration-300"
                    style={{ color: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#c0c0c0' }}
                  >
                    {day}
                  </span>
                  <div
                    className={`focus-streak-day relative flex size-10 shrink-0 items-center justify-center rounded-full ${
                      impacted ? 'focus-streak-impact' : ''
                    }`}
                    style={{
                      background: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#d8d8d8',
                      transition: 'background 0.3s ease',
                    }}
                  >
                    {isFriday && !impacted ? (
                      <span className={`focus-streak-flame focus-streak-flame-${flamePhase}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M12,3 C12.6666667,5.66666667 14,7.83333333 16,9.5 C18,11.1666667 19,13 19,15 C19,18.8659932 15.8659932,22 12,22 C8.13400679,22 5,18.8659932 5,15 C5,13.9181489 5.35088936,12.8654809 6,12 C6,13.3807119 7.11928813,14.5 8.5,14.5 C9.88071187,14.5 11,13.3807119 11,12 C11,10 9.5,9 9.5,7 C9.5,5.66666667 10.3333333,4.33333333 12,3"
                            fill={flamePhase === 'idle' ? 'none' : '#ff6a00'}
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeOpacity={flamePhase === 'idle' ? 0.8 : 0}
                          />
                        </svg>
                      </span>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <polyline
                          stroke="#fff"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="20 6 9 17 4 12"
                        />
                      </svg>
                    )}
                    {impacted
                      ? sparkles.map((sparkle, sparkleIndex) => (
                          <span
                            key={`${run}-${sparkleIndex}`}
                            className="focus-streak-sparkle"
                            style={{
                              width: sparkle.size * 2,
                              height: sparkle.size * 2,
                              background: sparkle.color,
                              '--spark-x': `${sparkle.x}px`,
                              '--spark-y': `${sparkle.y}px`,
                              animationDelay: `${sparkleIndex * 28}ms`,
                            } as CSSProperties}
                          />
                        ))
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-stretch">
          <svg width="100%" height="12" viewBox="0 0 404 12" fill="none" preserveAspectRatio="none">
            <path
              d="M 0 11 L 291 11 L 306 1 L 321 11 L 404 11"
              stroke="#d8d8d8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex items-center justify-center px-5 py-4">
            <p className="w-full max-w-[249px] text-center text-[14px] font-semibold leading-[1.4] text-[#666]">
              Nice job completing a session every day this week!
            </p>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        .focus-streak-card {
          height: 96px;
          border: 2px solid #d8d8d8;
          border-radius: 16px 16px 0 0;
          opacity: 0;
          transform: translateY(16px);
          transition:
            height 0.55s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.55s ease,
            opacity 0.45s ease,
            transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .focus-streak-card[data-entered='true'] {
          opacity: 1;
          transform: translateY(0);
        }
        .focus-streak-card[data-expanded='true'] {
          height: 180px;
          border-radius: 16px;
        }
        .focus-streak-flame {
          display: flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          transform-origin: center;
        }
        .focus-streak-flame-pop {
          animation: focus-streak-flame-pop 0.22s cubic-bezier(0.34, 1.8, 0.64, 1) forwards;
        }
        .focus-streak-flame-spin {
          animation: focus-streak-flame-spin 0.7s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        .focus-streak-flame-slam {
          animation: focus-streak-flame-slam 0.28s cubic-bezier(0.34, 1.5, 0.64, 1) forwards;
        }
        .focus-streak-impact {
          animation: focus-streak-impact 0.45s cubic-bezier(0.34, 1, 0.64, 1) forwards;
        }
        .focus-streak-sparkle {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          border-radius: 999px;
          pointer-events: none;
          animation: focus-streak-sparkle 0.62s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
        @keyframes focus-streak-flame-pop {
          from { transform: scale(1) translateY(0); }
          to { transform: scale(1.35) translateY(-8px); }
        }
        @keyframes focus-streak-flame-spin {
          from { transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(0deg); }
          to { transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(720deg); }
        }
        @keyframes focus-streak-flame-slam {
          0% { transform: scale(1.35) translateY(-8px); }
          50% { transform: scale(0.88) translateY(3px); }
          78% { transform: scale(1.07) translateY(-1px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes focus-streak-impact {
          0% { transform: scale(1); }
          30% { transform: scale(1.42); }
          100% { transform: scale(1); }
        }
        @keyframes focus-streak-sparkle {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--spark-x)),
              calc(-50% + var(--spark-y))
            ) scale(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .focus-streak-card,
          .focus-streak-flame,
          .focus-streak-day,
          .focus-streak-sparkle {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── StatRow: three headline numbers with a blue underline tick ────────────────
function StatRow({ stats }: { stats: { value: string; label: string; icon?: ReactNode }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.45);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-[820px]">
      {stats.map((s, i) => (
        <div key={i}>
          <div className="flex flex-col w-fit">
            <div className="flex items-center gap-1">
              {s.icon}
              <p className="text-[24px] font-semibold text-[#1a1a1a] leading-[32px]">{s.value}</p>
            </div>
            <div
              style={{
                width: s.icon ? '100%' : 28,
                height: 3,
                background: ACCENT,
                borderRadius: 2,
                margin: '10px 0',
                transformOrigin: 'left center',
                transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 120}ms`,
              }}
            />
          </div>
          <p className="text-[14px] font-normal leading-[160%] text-[#666]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── SmallStatRow: evidence stats in filled danger cards ───────────────────────
function SmallStatRow({ stats }: { stats: { value: string; label: string }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-10">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-[20px] p-6"
          style={{
            background: DANGER_BG,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 0.55s ease ${i * 140}ms, transform 0.55s ease ${i * 140}ms`,
          }}
        >
          <p className="text-[24px] font-semibold text-[#1a1a1a] leading-[32px]">{s.value}</p>
          <div
            style={{
              width: 72,
              height: 3,
              background: DANGER,
              borderRadius: 2,
              margin: '10px 0',
              transformOrigin: 'left center',
              transform: inView ? 'scaleX(1)' : 'scaleX(0)',
              transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${180 + i * 140}ms`,
            }}
          />
          <p className="text-[14px] font-normal leading-[160%] text-[#666]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── GoalCards: numbered, one sentence each ────────────────────────────────────
const GOALS = [
  { n: '01', title: 'Feeling seen', body: 'The end of a session should acknowledge the effort users put in.' },
  { n: '02', title: 'Celebrating real progress', body: 'Sessions should acknowledge real progress users have built up, not empty praise.' },
  { n: '03', title: 'Quick honest reflection', body: 'Taking a moment to look back on how a session went shouldn’t require a lot of cognitive effort.' },
];

function GoalCards() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
      {GOALS.map((g, i) => (
        <div
          key={g.n}
          className="rounded-[20px] p-4 sm:p-6 flex flex-col gap-3"
          style={{
            background: CARD_LIGHT,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity 0.55s ease ${i * 160}ms, transform 0.55s ease ${i * 160}ms`,
          }}
        >
          <span className="text-[12px] font-medium tracking-[1px]" style={{ color: ACCENT_DARK, fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
            {g.n}
          </span>
          <div>
            <p className="text-[16px] font-semibold mb-1.5 text-[#1a1a1a]">{g.title}</p>
            <p className="text-[15px] font-normal leading-[170%] text-[#555]">{g.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Callout: left accent bar + eyebrow + heading + body (neutral / danger) ────
function Callout({
  variant,
  eyebrow,
  heading,
  body,
}: {
  variant: 'neutral' | 'danger';
  eyebrow: string;
  heading: string;
  body: string;
}) {
  const isDanger = variant === 'danger';
  const bg = isDanger ? DANGER_BG : '#ffffff';
  const bar = isDanger ? DANGER : ACCENT_DARK;
  return (
    <div
      className="flex items-stretch gap-4 sm:gap-5 rounded-[20px] p-4 sm:p-6 max-w-[820px]"
      style={{ background: bg, ...(isDanger ? {} : { border: `1px solid ${BORDER}` }) }}
    >
      <div style={{ width: 2, borderRadius: 2, background: bar, flexShrink: 0 }} />
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: bar }}>{eyebrow}</p>
        <p className="text-[19px] font-semibold text-[#1a1a1a] leading-[135%]">{heading}</p>
        <p className="text-[15px] font-normal leading-[170%] text-[#555]">{body}</p>
      </div>
    </div>
  );
}

// ── FlowStepCards: Reflection → Achievement → Completion, colored accent bars ──
const FLOW_STEPS = [
  { n: '1', color: '#006efe', title: 'Reflection', tag: 'Always Shown', body: 'Confirms the session ended, shows its stats, and asks users to rate their focus.' },
  { n: '2', color: '#ea580c', title: 'Achievement', tag: 'Conditional', body: 'A full-screen celebration when a streak, milestone, or personal best is reached.' },
  { n: '3', color: '#0d9488', title: 'Completion', tag: 'Always Shown', body: 'All-time stats plus either the week tracker or a course quote.' },
];

function FlowStepCards() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <div ref={ref} className="flex flex-col lg:flex-row lg:items-stretch gap-3">
      {FLOW_STEPS.map((s, i) => (
        <div
          key={s.n}
          className="flex flex-col lg:flex-1 lg:flex-row lg:items-stretch lg:gap-3"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.55s ease ${i * 180}ms, transform 0.55s ease ${i * 180}ms`,
          }}
        >
          <div
            className="w-full lg:flex-1 flex flex-col rounded-[16px] overflow-hidden bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div style={{ height: 6, background: s.color }} />
            <div className="flex flex-col gap-2 px-6 pt-5 pb-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[26px] font-semibold leading-none" style={{ color: s.color }}>{s.n}</span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.5px] px-3 py-[5px] rounded-full"
                  style={{ background: `${s.color}1f`, color: s.color }}
                >
                  {s.tag}
                </span>
              </div>
              <p className="text-[20px] font-semibold text-[#1a1a1a]">{s.title}</p>
              <p className="text-[14px] font-normal leading-[150%] text-[#555]">{s.body}</p>
            </div>
          </div>
          {i < FLOW_STEPS.length - 1 && (
            <span className="hidden lg:flex lg:items-center text-[18px] text-[#8c8c8c] shrink-0">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── EndOfSessionFlowDiagram: three scenario rows of nodes ─────────────────────
type FlowNodeTone = 'reflection' | 'achievement' | 'completion';
type FlowNode = { title: string; sub?: string; tone: FlowNodeTone };

const FLOW_NODE_COLORS: Record<FlowNodeTone, string> = {
  reflection: '#006efe',
  achievement: '#ea580c',
  completion: '#0d9488',
};

const FLOW_SCENARIOS: { label: string; info: string; nodes: FlowNode[] }[] = [
  {
    label: 'First session of the day (no achievement)',
    info: 'The first session of the day will always show a week tracker component on the completion page, unless they earned a streak.',
    nodes: [
      { title: 'Reflection', tone: 'reflection' },
      { title: 'Completion', sub: '(week tracker)', tone: 'completion' },
    ],
  },
  {
    label: 'Sessions after the first of the day (no achievement)',
    info: 'All subsequent sessions completed in a day will show a quote container on the completion page.',
    nodes: [
      { title: 'Reflection', tone: 'reflection' },
      { title: 'Completion', sub: '(quote)', tone: 'completion' },
    ],
  },
  {
    label: 'Achievement session (e.g. milestone reached)',
    info: 'When users trigger a milestone, there will be a screen dedicated to that milestone that appears in between the reflection and completion screens.',
    nodes: [
      { title: 'Reflection', tone: 'reflection' },
      { title: 'Achievement', sub: '(milestone)', tone: 'achievement' },
      { title: 'Completion', sub: '(week tracker / quote)', tone: 'completion' },
    ],
  },
  {
    label: 'Streak completed session',
    info: 'When users earn a streak, the completion page will always show the quote container.',
    nodes: [
      { title: 'Reflection', tone: 'reflection' },
      { title: 'Achievement', sub: '(streak)', tone: 'achievement' },
      { title: 'Completion', sub: '(quote)', tone: 'completion' },
    ],
  },
];

function FlowInfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePos() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      left: Math.min(r.left, window.innerWidth - 320),
    });
  }

  function show() {
    updatePos();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="flex items-center justify-center rounded-full text-[11px] font-semibold leading-none shrink-0"
        style={{
          width: 18,
          height: 18,
          color: '#6b6b6b',
          background: open ? '#ececec' : '#f0f0f0',
          border: '1px solid #d0d0d0',
          cursor: 'help',
        }}
      >
        i
      </button>
      {open && mounted && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 10000,
            width: 'max-content',
            maxWidth: 'min(300px, calc(100vw - 24px))',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            color: '#fff',
            background: 'rgba(33,33,33,0.94)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.16)',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}

function FlowNodeChip({ node }: { node: FlowNode }) {
  const color = FLOW_NODE_COLORS[node.tone];
  const hasSub = Boolean(node.sub);
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[12px] px-6 shrink-0"
      style={{
        background: `${color}1f`,
        minHeight: 62,
        minWidth: 117,
      }}
    >
      <div className="flex flex-col items-center justify-center" style={{ minHeight: hasSub ? undefined : 32 }}>
        <span className="text-[14px] font-semibold text-[#1a1a1a] whitespace-nowrap leading-[17px]">{node.title}</span>
        {hasSub && (
          <span className="text-[12px] whitespace-nowrap leading-[15px] mt-0.5 text-[#1a1a1a]">{node.sub}</span>
        )}
      </div>
    </div>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="text-[16px] shrink-0"
      style={{
        color: active ? ACCENT : '#999999',
        transform: active ? 'translateX(1px)' : 'translateX(0)',
        transition: 'color 0.7s ease, transform 0.7s ease',
        fontWeight: 400,
      }}
    >
      →
    </span>
  );
}

/** Design width of the nowrap flow chart — scales as a unit below this. */
const FLOW_DIAGRAM_MIN_W = 680;

function EndOfSessionFlowDiagram() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [pulseStep, setPulseStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lightboxFrameRef = useRef<HTMLDivElement>(null);
  const lightboxInnerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerHeight, setInnerHeight] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxInnerHeight, setLightboxInnerHeight] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      setPulseStep(step => (step + 1) % 3);
    }, 1600);
    return () => window.clearInterval(id);
  }, [inView]);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const naturalW = Math.max(inner.scrollWidth, FLOW_DIAGRAM_MIN_W);
      const available = outer.clientWidth;
      const next = available > 0 && available < naturalW ? available / naturalW : 1;
      setScale(next);
      setInnerHeight(inner.offsetHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = lightboxFrameRef.current;
    const inner = lightboxInnerRef.current;
    if (!frame || !inner) return;

    const measure = () => {
      const naturalW = Math.max(inner.scrollWidth, FLOW_DIAGRAM_MIN_W);
      const available = frame.clientWidth;
      const next = available > 0 && available < naturalW ? available / naturalW : 1;
      setLightboxScale(next);
      setLightboxInnerHeight(inner.offsetHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  useBodyScrollLock(open && mounted);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function renderChartBody(stopTipPropagate: boolean) {
    return (
      <>
        {FLOW_SCENARIOS.map(sc => (
          <div key={sc.label} className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-[#4a4a4a] whitespace-nowrap">{sc.label}</span>
              {stopTipPropagate ? (
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <FlowInfoTip text={sc.info} />
                </span>
              ) : (
                <FlowInfoTip text={sc.info} />
              )}
            </div>
            {/* nowrap so rows never stack — the whole chart scales instead */}
            <div className="flex items-center gap-3 flex-nowrap">
              {sc.nodes.map((node, i) => {
                const arrowActive = inView && i > 0 && pulseStep === i - 1;
                return (
                  <div key={i} className="flex items-center gap-3 shrink-0">
                    {i > 0 && <FlowArrow active={arrowActive} />}
                    <FlowNodeChip node={node} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div
        ref={(node) => {
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
          outerRef.current = node;
        }}
        role="button"
        tabIndex={0}
        aria-label="Expand end of session logic diagram"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="rounded-[24px] overflow-hidden w-full"
        style={{
          background: BLOCK_BG,
          height: innerHeight > 0 ? innerHeight * scale : undefined,
          cursor: 'zoom-in',
        }}
      >
        <div
          ref={innerRef}
          className="flex flex-col items-start gap-7 px-10 py-8 box-border"
          style={{
            width: FLOW_DIAGRAM_MIN_W,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
          }}
        >
          {renderChartBody(true)}
        </div>
      </div>

      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(6, 6, 9, 0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 16px 40px',
            boxSizing: 'border-box',
            cursor: 'zoom-out',
            overflow: 'auto',
          }}
        >
          <LightboxCloseButton onClose={() => setOpen(false)} />
          <div
            ref={lightboxFrameRef}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[24px] overflow-hidden w-full"
            style={{
              /* Solid fill in lightbox — frosted BLOCK_BG reads as transparent on the dark overlay */
              background: '#e8eef8',
              cursor: 'default',
              maxWidth: FLOW_DIAGRAM_MIN_W,
              height: lightboxInnerHeight > 0 ? lightboxInnerHeight * lightboxScale : undefined,
            }}
          >
            <div
              ref={lightboxInnerRef}
              className="flex flex-col items-start gap-7 px-10 py-8 box-border"
              style={{
                width: FLOW_DIAGRAM_MIN_W,
                transform: lightboxScale < 1 ? `scale(${lightboxScale})` : undefined,
                transformOrigin: 'top left',
              }}
            >
              {renderChartBody(false)}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── StudentSurveyChart: Yes / Maybe / No response bars (n = 89) ───────────────
const SURVEY_RESPONSES = [
  { label: 'Yes', percent: 49.4, count: 44, color: ACCENT },
  { label: 'Maybe', percent: 34.8, count: 31, color: '#4fa0e6' },
  { label: 'No', percent: 15.7, count: 14, color: '#a9c2e8' },
] as const;

function StudentSurveyChart() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <div
      ref={ref}
      className="rounded-[20px] bg-white p-4 sm:p-8 flex flex-col gap-6"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>
            Survey responses
          </p>
          <p className="text-[16px] font-semibold text-[#1a1a1a] mt-1.5">
            Would badges or levels make you use Focus Coach more?
          </p>
        </div>
        <p className="text-[13px] text-[#888] shrink-0">n = 89 students</p>
      </div>

      <div className="flex flex-col gap-5">
        {SURVEY_RESPONSES.map((row, i) => (
          <div key={row.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold text-[#1a1a1a]">{row.label}</span>
              <span className="text-[14px] text-[#555]">
                <span className="font-semibold text-[#1a1a1a]">{row.percent}%</span>
                <span className="text-[#999]"> · n = {row.count}</span>
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: CARD_LIGHT }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: inView ? `${row.percent}%` : '0%',
                  background: row.color,
                  transition: `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 140}ms`,
                }}
                role="presentation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AnatomyCards: numbered circle badge + title + body ────────────────────────
const ANATOMY = [
  { n: '1', title: 'Acknowledge', body: 'A persistent checkmark and "Session Complete" title signal the end of the session.' },
  { n: '2', title: 'Contextualize', body: 'Session stats show what was just accomplished: how long the session was and number of check-ins.' },
  { n: '3', title: 'Reflect', body: 'One question about their focus, four options, less cognitive load.' },
];

function AnatomyCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ANATOMY.map(a => (
        <div key={a.n} className="rounded-[16px] p-4 flex flex-col gap-2" style={{ background: CARD_LIGHT }}>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ width: 22, height: 22, background: 'rgba(0,110,254,0.12)', color: ACCENT_DARK }}
            >
              {a.n}
            </span>
            <span className="text-[14px] font-semibold text-[#1a1a1a]">{a.title}</span>
          </div>
          <p className="text-[13px] font-normal leading-[160%] text-[#555]">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

// ── Outcomes: leading (early usability) vs. lagging (core retention) indicators ──
const LEADING_INDICATORS = [
  {
    title: 'Reflection friction',
    body: 'Time spent rating focus is already down 22% — an early signal that simplifying the reflection screen lowered the cognitive load.',
    status: 'Observed',
  },
  {
    title: 'Focus Streak completion',
    body: 'Track the percentage of students who achieve their first Focus Streak to confirm that the reward is both attainable and motivating.',
    status: 'Tracking',
  },
] as const;

const LAGGING_INDICATORS = [
  {
    title: 'First-session retention',
    body: 'Reduce the baseline 39.3% single-session abandonment rate to under 25%.',
    status: 'Target',
  },
  {
    title: 'Session distribution',
    body: 'Reduce the percentage of total sessions completed by the top 1% from 54.6% to under 30%.',
    status: 'Target',
  },
] as const;

function IndicatorCard({ title, body, status }: { title: string; body: string; status: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] p-6" style={{ background: CARD_LIGHT }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[16px] font-semibold text-[#1a1a1a]">{title}</p>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[1px] uppercase"
          style={{ color: ACCENT_DARK, background: 'rgba(0,0,0,0.05)' }}
        >
          {status}
        </span>
      </div>
      <p className="text-[14px] leading-[165%] text-[#666]">{body}</p>
    </div>
  );
}

function IndicatorGroup({
  label,
  indicators,
}: {
  label: string;
  indicators: ReadonlyArray<{ title: string; body: string; status: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] font-medium tracking-[1px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {indicators.map(indicator => (
          <IndicatorCard key={indicator.title} {...indicator} />
        ))}
      </div>
    </div>
  );
}

const TAKEAWAYS = [
  {
    eyebrow: 'Restraint',
    title: 'The strongest product decision was what we chose not to ship.',
    body: 'Early research showed that almost half of students would have been in favor of badges and levels. But leaning fully into gamification would have made collecting badges the point of using the tool. Choosing streaks, milestones, and personal bests gave us a way to celebrate effort without turning focus into a currency.',
  },
  {
    eyebrow: 'Designing for context',
    title: "Product decisions should match the user's reality.",
    body: "Students aren't using this app in a vacuum. They don't control when classes meet or when homework happens. Making streaks roll over week-to-week instead of being something students have to maintain day after day removed cheap loss-aversion tactics and respected how students actually use classroom tools.",
  },
] as const;

// ── SegmentedMedia: pill tabs that swap media + caption ───────────────────────
function SegmentedMedia({
  tabs,
}: {
  tabs: {
    label: string;
    type: 'Image' | 'GIF';
    description: string;
    caption: string;
    /** When provided, renders real media with lightbox. */
    src?: string;
    alt?: string;
    maxWidth?: number | string;
    /** Live interactive screen — takes precedence over src / placeholder. */
    content?: ReactNode;
    /** Content handles its own XS scaling (e.g. iframe embeds). */
    selfFit?: boolean;
  }[];
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const tabsShellRef = useRef<HTMLDivElement>(null);
  const [tabScale, setTabScale] = useState(1);
  const t = tabs[active];

  useEffect(() => {
    return () => {
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  // Scale the pill row down as a unit instead of wrapping the last tab.
  useEffect(() => {
    const row = tabsRowRef.current;
    const shell = tabsShellRef.current;
    if (!row || !shell) return;
    const measure = () => {
      const available = shell.clientWidth;
      // Temporarily clear scale to measure intrinsic width
      const prev = row.style.transform;
      row.style.transform = 'none';
      const needed = row.scrollWidth;
      row.style.transform = prev;
      setTabScale(available > 0 && needed > available ? available / needed : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [tabs]);

  function switchTab(i: number) {
    if (i === active) return;
    setVisible(false);
    if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 160);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={tabsShellRef} className="w-full flex justify-center overflow-hidden">
        <div
          ref={tabsRowRef}
          className="inline-flex flex-nowrap items-center gap-1 rounded-full bg-white p-1"
          style={{
            border: `1px solid ${BORDER}`,
            transform: tabScale < 1 ? `scale(${tabScale})` : undefined,
            transformOrigin: 'center center',
          }}
        >
          {tabs.map((tab, i) => {
            const on = i === active;
            return (
              <button
                key={tab.label}
                onClick={() => switchTab(i)}
                className="shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px] transition-colors"
                style={
                  on
                    ? { background: 'rgba(0,110,254,0.12)', color: ACCENT_DARK, fontWeight: 600 }
                    : { color: '#545454', fontWeight: 500 }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        <VisualCard pad={t.content ? 'p-3 sm:p-5' : 'p-4'} caption={t.caption}>
          {t.content ? (
            t.selfFit ? t.content : <LiveScreenFit>{t.content}</LiveScreenFit>
          ) : t.src ? (
            <CaseStudyMedia
              src={t.src}
              alt={t.alt ?? t.label}
              caption={t.caption}
              maxWidth={t.maxWidth}
            />
          ) : (
            <PlaceholderVisual description={t.description} minHeight={320} />
          )}
        </VisualCard>
      </div>
    </div>
  );
}

// ── ClosingCTA ────────────────────────────────────────────────────────────────
const PROTOTYPE_SRC = '/case-studies/focus-coach-achievements/session-complete-prototype.html';

function ClosingCTA() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open && mounted);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // The prototype (same-origin iframe) asks to close via postMessage.
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data && e.data.type === 'fc-close-prototype') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('message', onMessage);
    };
  }, [open]);

  return (
    <>
      <div
        ref={ref}
        className="rounded-[24px] px-5 sm:px-14 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 28px rgba(0,13,38,0.08)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}
      >
        <div className="flex flex-col gap-2.5">
          <p className="text-[22px] font-semibold text-[#1a1a1a]">Try the end of session experience yourself</p>
          <p className="text-[16px] font-normal text-[#555]">
            Shipped to production in July 2026 — live at{' '}
            <a href="https://findingfocus.app" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: ACCENT }}>
              findingfocus.app
            </a>
          </p>
        </div>
        {/* Prototype iframe experience isn't usable at small viewports — button hidden below 600px. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden min-[600px]:inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-4 text-[16px] font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: '#111113' }}
        >
          Try the Prototype
        </button>
      </div>

      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Focus Coach end of session prototype"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(8, 10, 16, 0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: 14,
                  flexShrink: 0,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    Interactive prototype
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                    End of session flow
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close prototype"
                  onClick={() => setOpen(false)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 22,
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#020101',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <iframe
                  key={open ? 'open' : 'closed'}
                  src={PROTOTYPE_SRC}
                  title="Focus Coach session complete prototype"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block',
                    background: '#020101',
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

// ── SectionNav ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'section-intro', label: 'Intro' },
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-research', label: 'Research' },
  { id: 'section-design', label: 'Design' },
  { id: 'section-outcomes', label: 'Outcomes' },
  { id: 'section-reflection', label: 'Takeaways' },
];

function smoothScrollTo(targetY: number) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const duration = 550;
  const startTime = performance.now();
  function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function step(now: number) {
    const p = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + diff * ease(p));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function sectionDocumentTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return Number.POSITIVE_INFINITY;
  return el.getBoundingClientRect().top + window.scrollY;
}

function SectionNav() {
  const [pastHero, setPastHero] = useState(false);
  /** The footer is on screen. The rail is fixed, so without this it parks on
      top of the footer's links and copy. */
  const [atFooter, setAtFooter] = useState(false);
  const visible = pastHero && !atFooter;
  const [active, setActive] = useState('section-intro');

  useEffect(() => {
    const hero = document.getElementById('section-intro');
    if (!hero) return;
    const obs = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), { threshold: 0 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // Stand down as soon as the footer comes into view, so the rail is never
  // around once the reader reaches it.
  useEffect(() => {
    const footer = document.querySelector('.landing-footer');
    if (!footer) return;
    const obs = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Near the bottom, force the last section active so Outcomes/Takeaways can win
      if (scrollBottom >= docHeight - 24) {
        setActive(NAV_SECTIONS[NAV_SECTIONS.length - 1].id);
        return;
      }

      const marker = window.scrollY + Math.min(window.innerHeight * 0.28, 160);
      let current = NAV_SECTIONS[0].id;
      for (const { id } of NAV_SECTIONS) {
        if (sectionDocumentTop(id) <= marker) current = id;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 40);
  }

  return (
    <nav className="hidden min-[600px]:flex flex-col" style={{
      position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
      width: 100, alignItems: 'flex-end', paddingRight: 16, gap: 4, zIndex: 100,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {NAV_SECTIONS.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => goTo(id)}
          style={{
            background: 'none', border: 'none', padding: '5px 0', textAlign: 'right', cursor: 'pointer', fontSize: 13,
            fontWeight: active === id ? 600 : 400, color: active === id ? '#1a1a1a' : '#aaa',
            opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(12px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease, color 0.2s ease, font-weight 0.2s ease',
            transitionDelay: visible ? `${i * 55}ms` : '0ms',
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ label, id }: { label?: string; id?: string }) {
  return (
    <div id={id} className="max-w-[1200px] mx-auto flex items-center h-[84px] px-5 sm:px-10">
      <div className="flex-1 h-px bg-[#e8e8e8]" />
      {label && (
        <>
          <span className="mx-5 text-[15px] text-[#1a1a1a] font-semibold">{label}</span>
          <div className="flex-1 h-px bg-[#e8e8e8]" />
        </>
      )}
    </div>
  );
}

// ── CompetitiveAuditTable: 1:1 port of the Figma comparison table ─────────────
const AUDIT_APPS: { slug: string; name: string; highlight?: boolean }[] = [
  { slug: 'finding-focus', name: 'Finding Focus', highlight: true },
  { slug: 'insight-timer', name: 'Insight Timer' },
  { slug: 'balance', name: 'Balance' },
  { slug: 'oak', name: 'Oak' },
  { slug: 'forest', name: 'Forest' },
  { slug: 'focus-pomo', name: 'Focus Pomo' },
  { slug: 'focus-keeper', name: 'Focus Keeper' },
];
// marks[] aligns to AUDIT_APPS order; true = ✓, false = –
const AUDIT_ROWS: { label: string; marks: boolean[] }[] = [
  { label: 'Celebration', marks: [false, true, true, true, true, true, true] },
  { label: 'Streak', marks: [false, true, true, true, false, false, false] },
  { label: 'Cumulative Stats', marks: [true, false, true, true, false, false, false] },
  { label: 'Badge / Reward', marks: [false, false, false, true, true, false, true] },
  { label: 'Forward-Looking Hook', marks: [false, true, true, false, false, false, false] },
];

function CompetitiveAuditTable() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const FEATURE_W = compact ? 112 : 178;
  const COL_W = compact ? 88 : 114;
  const HEADER_H = compact ? 92 : 104;
  const ROW_H = compact ? 52 : 62;
  const ICON = compact ? 32 : 44;
  const PINNED_W = FEATURE_W + COL_W; // Feature + Finding Focus columns stay pinned
  const CARD_W = FEATURE_W + COL_W * 7;
  const INTER = 'var(--font-inter), sans-serif';

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflowing(max > 1);
      setScrolled(el.scrollLeft > 1);
      setAtEnd(el.scrollLeft >= max - 1);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [FEATURE_W, COL_W, CARD_W]);

  // One cell of the grid. First two columns (Feature + Finding Focus) are sticky.
  const cellStyle = (col: number, isHeader: boolean, rowIdx: number): CSSProperties => {
    const sticky = col <= 1;
    return {
      position: sticky ? 'sticky' : 'relative',
      left: col === 0 ? 0 : col === 1 ? FEATURE_W : undefined,
      zIndex: sticky ? 2 : 1,
      background: col === 0 ? '#ffffff' : col === 1 ? '#e8f0fc' : 'transparent',
      borderBottom: isHeader || rowIdx < 4 ? '1px solid #edeff2' : undefined,
      boxSizing: 'border-box',
      display: 'flex',
    };
  };

  const cells: ReactNode[] = [];
  // Header — "Feature" label (baseline-aligned with the app names)
  cells.push(
    <div key="h-feature" style={{ ...cellStyle(0, true, -1), alignItems: 'flex-end', paddingLeft: compact ? 10 : 16, paddingBottom: 15 }}>
      <span style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: '#7a8aa0' }}>Feature</span>
    </div>,
  );
  // Header — app icons + names
  AUDIT_APPS.forEach((app, i) => {
    cells.push(
      <div key={`h-${app.slug}`} style={{ ...cellStyle(i + 1, true, -1), flexDirection: 'column', alignItems: 'center', paddingTop: compact ? 14 : 22, paddingInline: 4 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/case-studies/focus-coach-achievements/competitors/${app.slug}.png`}
          alt={`${app.name} app icon`}
          width={ICON}
          height={ICON}
          style={{ width: ICON, height: ICON, borderRadius: compact ? 9 : 12, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.15))' }}
        />
        <span style={{ marginTop: compact ? 6 : 8, fontSize: compact ? 10 : 12, fontWeight: app.highlight ? 600 : 500, lineHeight: compact ? '12px' : '15px', color: '#1a1a1a', textAlign: 'center' }}>
          {app.name}
        </span>
      </div>,
    );
  });
  // Body rows
  AUDIT_ROWS.forEach((row, r) => {
    cells.push(
      <div key={`r${r}-label`} style={{ ...cellStyle(0, false, r), alignItems: 'center', paddingLeft: compact ? 10 : 16, paddingRight: 6 }}>
        <span style={{ fontSize: compact ? 11 : 13, fontWeight: 500, color: '#333333', lineHeight: 1.25 }}>{row.label}</span>
      </div>,
    );
    row.marks.forEach((on, i) => {
      cells.push(
        <div key={`r${r}-${i}`} style={{ ...cellStyle(i + 1, false, r), alignItems: 'center', justifyContent: 'center' }}>
          {on ? (
            <Check sx={{ fontSize: compact ? 18 : 22, color: '#1da85f' }} />
          ) : (
            <span style={{ fontSize: compact ? 16 : 20, fontWeight: 700, lineHeight: 1, color: '#c1c8d2' }}>–</span>
          )}
        </div>,
      );
    });
  });

  return (
    <div className="rounded-[24px] p-3 sm:p-8" style={{ background: BLOCK_BG }}>
      {/* Rounded frame clips the scroll area, so its corners stay rounded even when the table is scrolled and cut off. */}
      <div className="relative mx-auto w-full" style={{ maxWidth: CARD_W, borderRadius: 16, background: '#ffffff', overflow: 'hidden' }}>
        <div ref={scrollerRef} className="audit-scroller" style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `${FEATURE_W}px repeat(7, ${COL_W}px)`,
              gridTemplateRows: `${HEADER_H}px repeat(5, ${ROW_H}px)`,
              width: CARD_W,
              fontFamily: INTER,
            }}
          >
            {cells}
          </div>
        </div>

        {/* Frozen-column boundary shadow — appears once competitors scroll behind the pinned columns */}
        <div
          aria-hidden
          style={{ position: 'absolute', top: 0, bottom: 0, left: PINNED_W, width: 14, pointerEvents: 'none', zIndex: 3, background: 'linear-gradient(to right, rgba(15,23,42,0.10), rgba(15,23,42,0))', opacity: scrolled ? 1 : 0, transition: 'opacity 0.2s ease' }}
        />

        {/* Right fade — only when the table overflows and isn't scrolled to the end */}
        <div
          aria-hidden
          style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: compact ? 28 : 48, pointerEvents: 'none', zIndex: 3, background: 'linear-gradient(to left, #ffffff, rgba(255,255,255,0))', opacity: overflowing && !atEnd ? 1 : 0, transition: 'opacity 0.2s ease' }}
        />

        {/* Hairline border drawn on top so it never affects the scroll width */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1px solid #e6e8ec', pointerEvents: 'none', zIndex: 4 }} />
      </div>

      <style jsx>{`
        .audit-scroller {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .audit-scroller::-webkit-scrollbar {
          height: 8px;
        }
        .audit-scroller::-webkit-scrollbar-track {
          background: transparent;
        }
        .audit-scroller::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 999px;
        }
        .audit-scroller::-webkit-scrollbar-thumb:hover {
          background-color: #aab6c6;
        }
      `}</style>
    </div>
  );
}

const SECTION = 'max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FocusCoachAchievementsCaseStudy() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] min-[600px]:pr-[100px]">

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(0,110,254,0.12)] to-[#fcfcfc] to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pt-[80px] pb-0">

          <div className="flex flex-wrap items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/case-studies/finding-focus-ai-assistant/finding-focus-logo.svg" alt="Finding Focus logo" className="h-7 w-auto shrink-0" style={{ filter: 'brightness(0)' }} />
            <span className="text-[14px] sm:text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus • Edtech • Product Design</span>
          </div>

          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[110%] tracking-[-1px] text-[#1a1a1a] mb-10 max-w-[680px]">
            Rebuilding the Focus Coach&rsquo;s End of Session Experience
          </h1>

          <MilestoneHeroScreen />

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 mt-10 text-center">
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Team</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">
                Mike Mrazek, Co-founder<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Timeline</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Jan – Jul 2026</p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">My Role</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Sole Product Designer</p>
            </div>
          </div>

          {/* ── TL;DR ── */}
          <div className="mt-14 pb-14 md:pb-28">
            <div
              className="relative rounded-[24px] px-5 pt-5 pb-6 sm:px-8 sm:pt-8 md:px-10 md:pt-10 flex flex-col gap-6"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}
            >
              <Eyebrow label="TL;DR" />
              <p className="text-[16px] font-normal leading-[150%] text-[#333] max-w-[880px]">
                Students weren&apos;t coming back to the Focus Coach — and the end of a session was where we lost them.
                I redesigned it into a guided flow with a simpler reflection, celebratory achievements, and a brand-new
                completion screen, built to motivate without manipulative tactics.
              </p>
              <StatRow
                stats={[
                  { value: '89', label: 'students surveyed on rewards and motivation' },
                  { value: '3', label: 'achievement types, each with its own animated screen' },
                  {
                    value: '22%',
                    label: 'less time spent rating focus at the end of a session',
                    icon: <KeyboardDoubleArrowDownOutlined sx={{ fontSize: 24, color: ACCENT }} />,
                  },
                ]}
              />
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  className="tldr-jump-btn"
                  onClick={() => {
                    const el = document.getElementById('section-final-designs');
                    if (!el) return;
                    smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 40);
                  }}
                >
                  Jump to final designs
                  <span className="tldr-jump-arrow" aria-hidden="true">
                    <ArrowDownward sx={{ fontSize: 15 }} />
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      <Divider label="Overview" id="section-overview" />

      {/* ── OVERVIEW ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Context"
            heading="The Focus Coach is the flagship tool from Finding Focus, an edtech company building attention training tools for classrooms."
            body="It's a guided study timer that helps students stay on task while doing their work by periodically checking in on them."
          >
            <VisualCard caption="What a check-in looks like during a Focus Session" pad="p-3 sm:p-6">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/focus-coach-check-in.gif"
                alt="What a check-in looks like during a Focus Session"
                caption="What a check-in looks like during a Focus Session"
              />
            </VisualCard>
          </Section>

          <Section
            eyebrow="The Problem"
            heading="Users were not coming back to the Focus Coach."
            body="39.3% of our users were one and done after completing their first session – meaning almost 2 in 5 of our users completed a single Focus Session and then abandoned the tool."
          >
            <SmallStatRow
              stats={[
                { value: '39.3%', label: 'of users only ever completed one Focus Session' },
                { value: '54.6%', label: 'of all sessions were completed by the top 1% of users' },
              ]}
            />
          </Section>

          <Section
            eyebrow="Hypothesis"
            heading="The end of session experience was where we lost users."
            body='Every session ended with a brief "session complete" animation, a 1–100 reflection slider, and an MVP-state completion screen built around a check-in graph. We&rsquo;d assumed students would rack up check-ins, but most sessions only had one or two, which meant the graph had little value.'
          >
            <VisualCard caption="This is what the previous end of session flow looked like. If students did not have a check-in the graph provided no value">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/old-session-flow.gif?v=2"
                alt="The original end of session flow, including the focus rating and completion screen"
                caption="This is what the previous end of session flow looked like. If students did not have a check-in the graph provided no value"
              />
            </VisualCard>
          </Section>

          <Section
            eyebrow="Project Goals"
            heading={<>Before designing anything, I mapped out what the end of session should be for.</>}
          >
            <GoalCards />
          </Section>

          {/* North Star — bordered container matching Figma */}
          <div
            className="rounded-[24px] px-8 py-10 flex flex-col items-center text-center gap-4 bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <NorthStarAnimatedIcon className="block size-14 shrink-0" />
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>North Star</p>
            <p className="text-[24px] font-semibold leading-[145%] tracking-[-0.3px] text-[#1a1a1a] max-w-[680px]">
              Turn the end of every session into an opportunity to delight and engage users
            </p>
          </div>
        </div>
      </section>

      <Divider label="Research" id="section-research" />

      {/* ── RESEARCH ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Student Signal"
            heading="Students told us rewards would bring them back."
            body='A survey we sent out to students asked: "If you could earn badges or unlock levels by completing more sessions, would that make you want to use the Focus Coach more?" Roughly half said yes and another third said maybe.'
          >
            <StudentSurveyChart />
          </Section>

          <Section
            eyebrow="Competitive Audit"
            heading={<>Strong completions <Em>celebrate</Em>. Ours <Em>reported</Em>.</>}
            body="I audited the end-of-session experiences for six of the biggest mindfulness and timer apps. The best experiences used the end of a session as an opportunity to celebrate the user and promote future engagement. Something ours failed to do."
          >
            <CompetitiveAuditTable />
          </Section>

          <Section
            eyebrow="Gamification Question"
            heading={<>We considered XP, badges, and collectibles.<br />We decided <Em>against</Em> all of them.</>}
            body="Our survey showed that students supported the idea of badges and rewards, and the competitive audit found that similar applications used gamification. But despite that, full gamification wasn't something I recommended: Finding Focus exists to help students genuinely improve their focus, not to collect rewards. The moment a badge becomes the reason a student starts a session, the tool is failing at its actual job."
          >
            <Callout
              variant="neutral"
              eyebrow="Behavioral Insight"
              heading="One student completed hundreds of one-minute sessions to win a teacher’s prize."
              body="This was a clear signal that attaching rewards to usage can lead to users gaming the system."
            />
          </Section>
        </div>
      </section>

      <Divider label="Design" id="section-design" />

      {/* ── DESIGN ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="Content Ideas"
            heading="I started by defining everything the completion page could include."
            body={[
              'Without wanting to lean too heavily into gamification, I proposed four kinds of content we could show: cumulative milestones, personal bests, streaks, and course quotes.',
              'My team was in full support so I got to work creating designs and a spec sheet of the full system – trigger logic, thresholds, priority rules, and the copy.',
            ]}
          >
            <ImageViewer
              items={[
                {
                  src: '/case-studies/focus-coach-achievements/personal-best-spec.png',
                  alt: 'Slack canvas screenshot documenting Personal Best achievement rules, logic, and copy',
                  label: 'Screenshot from a Slack canvas documenting Personal Best criteria — trigger logic, thresholds, and copy.',
                },
                {
                  src: '/case-studies/focus-coach-achievements/streaks-logic-spec.png',
                  alt: 'Slack canvas screenshot documenting Focus Streak logic for how full weeks are tracked and celebrated',
                  label: 'Screenshot from a Slack canvas documenting Focus Streak logic — how full weeks are tracked and celebrated.',
                },
                {
                  src: '/case-studies/focus-coach-achievements/milestone-logic-spec.png',
                  alt: 'Slack canvas screenshot proposing milestone thresholds and copy options across Sessions, Hours, and Check-ins',
                  label: 'Screenshot from a Slack canvas proposing milestone thresholds and rotating copy options across Sessions, Hours, and Check-ins.',
                },
              ]}
            />
          </Section>

          {/* Streaks Behavior — heading + body + dark-pattern callout, then a second heading + image */}
          <div className="flex flex-col gap-10">
            <Section
              eyebrow="Streaks Behavior"
              heading="Traditional streaks employ a dark pattern."
              body="Our team had long considered adding streaks, but my background in behavior analysis made me cautious. Streaks often trigger a 'streak maintenance mode,' where users return to an app purely to keep a number alive rather than to engage meaningfully. That’s a classic dark pattern, and one we specifically wanted to avoid given that Finding Focus serves K-12 students."
            >
              <Callout
                variant="danger"
                eyebrow="Dark Pattern"
                heading="Streak Maintenance"
                body="Streaks can often be manipulative; exploiting psychological biases like loss aversion to coerce users into daily engagement."
              />
            </Section>

            <Section
              heading="Enter Focus Streaks: a more ethical take on streaks."
              body="My solution to the streaks dilemma was to make it something that users earned rather than maintained. As long as a user completed at least one session each weekday (Monday - Friday) they were able to earn a Focus Streak for that week. Once users earned one there was no risk of losing it, and they could earn as many as they wanted."
            >
              <VisualCard caption="A custom animation I created that plays when users earn a Focus Streak" pad="p-6 sm:p-10">
                <FocusStreakWeekCard />
              </VisualCard>
            </Section>
          </div>

          <Section
            eyebrow="Early Mockups"
            heading="Now that we had Focus Streaks we had to think through how to show the rest of the content."
            body="The original idea was to rotate through different content on the completion screen and show whatever was relevant to the session a user just completed, so the page always had something fresh to show."
          >
            {(() => {
              const earlyItems: CaseStudyMediaItem[] = [
                {
                  src: '/case-studies/focus-coach-achievements/early-milestone-mockup.png',
                  alt: 'Early Milestone completion screen mockup',
                  caption: 'Early Milestone mockup',
                },
                {
                  src: '/case-studies/focus-coach-achievements/early-personal-best-mockup.png',
                  alt: 'Early Personal Best completion screen mockup',
                  caption: 'Early Personal Best mockup',
                },
                {
                  src: '/case-studies/focus-coach-achievements/early-quote-mockup.png',
                  alt: 'Early Quote completion screen mockup',
                  caption: 'Early Quote mockup',
                },
              ];
              const earlyCaption = 'Early rotating-content concepts for Milestones, Personal Bests, and Quotes';
              return (
                <>
                  <div className="sm:hidden">
                    <MediaCarouselStage
                      items={earlyItems}
                      caption={earlyCaption}
                      maxWidth={260}
                      background={BLOCK_BG}
                    />
                  </div>
                  <div className="hidden sm:block">
                    <VisualCard caption={earlyCaption} pad="p-4 sm:p-6">
                      <CaseStudyMediaGallery maxWidth={520} items={earlyItems} />
                    </VisualCard>
                  </div>
                </>
              );
            })()}
          </Section>

          <Section
            eyebrow="The Realization"
            heading="A guided experience is more engaging than a single page full of content."
            body={[
              'The idea for a completion page that rotated through different content worked in theory, but once I began creating mockups it became clear that the design wasn’t working.',
              'That’s when I realized the best experience would be a guided end-of-session flow where each piece of content - if it was triggered - had its own dedicated screen and a purposeful animation.',
            ]}
          >
            <FlowStepCards />
          </Section>

          <Section
            eyebrow="End of Session Logic"
            heading="A few rules decide which screens are shown at the end of a session."
          >
            <div className="flex flex-col gap-3">
              <EndOfSessionFlowDiagram />
              <p className="text-[13px] text-[#999] text-center">
                The flow adapts to each session — the achievement screen only appears when one is earned, which is what makes it a special moment
              </p>
            </div>
          </Section>

          <Section
            eyebrow="Personal Reflection"
            heading="With the flow defined, I started re-designing the personal reflection screen."
            body="The redesign does three jobs: acknowledge the session has ended, provide context on what was accomplished, and allow users to quickly reflect."
          >
            <div className="flex flex-col gap-10">
              <AnatomyCards />
              <VisualCard caption="The new design showed users more clearly that their session had ended and allowed them to quickly reflect on it." pad="p-3 sm:p-5">
                <LiveScreenFit>
                  <ReflectionScreen />
                </LiveScreenFit>
              </VisualCard>
            </div>
          </Section>

          <Section
            eyebrow="Achievement Screens"
            heading="Designing three kinds of achievements, each with its own unique animated illustration."
            body="In order to elevate the experience I created three different vector illustrations to distinguish the three different achievements. I was then able to animate the illustrations using CSS Keyframes with the help of Claude Code."
          >
            <SegmentedMedia
              tabs={[
                {
                  label: 'Milestone',
                  type: 'GIF',
                  description: 'Live milestone achievement screen with animated summit illustration',
                  caption: 'Milestones — one of three tracks users progress towards: total sessions, total time focused, and total check-ins answered',
                  content: <MilestoneHeroScreen />,
                },
                {
                  label: 'Focus Streak',
                  type: 'GIF',
                  description: 'Live Focus Streak achievement screen with flaming calendar and week tracker',
                  caption: 'Focus Streaks — shown when a user completes at least one session each weekday during a week',
                  content: <FocusStreakScreen />,
                  selfFit: true,
                },
                {
                  label: 'Personal Best',
                  type: 'GIF',
                  description: 'Live Personal Best achievement screen with rocket illustration',
                  caption: 'Personal Best — celebrates users beating their longest session record',
                  content: <PersonalBestScreen />,
                },
              ]}
            />
          </Section>

          <Section
            eyebrow="The Completion Screen"
            heading="A completion screen with progress you can see, and a nudge to come back."
            body="All-time stats count up odometer style, showing users how this session added to their all-time progress. Below the stats container sits one of two containers: a week tracker or a course quote. If it is the first session of the day then the week tracker is shown, if not then the course quote container is shown."
          >
            <SegmentedMedia
              tabs={[
                {
                  label: 'Week Tracker',
                  type: 'GIF',
                  description: 'Live completion screen with week tracker',
                  caption: 'Week Tracker — shown after the first session of the day, gently encouraging a session every weekday',
                  content: <CompletionWeekTrackerScreen />,
                },
                {
                  label: 'Course Quote',
                  type: 'GIF',
                  description: 'Live completion screen with course quote',
                  caption: 'Course Quote — a rotating dose of motivation for every session after the first each day',
                  content: <CompletionQuoteScreen />,
                },
              ]}
            />
          </Section>

          <Section
            id="section-final-designs"
            eyebrow="Final Design"
            heading="The complete end of session flow – all together."
          >
            <VisualCard caption="The end of session flow users see after completing their first session">
              <EndOfSessionFlow />
            </VisualCard>
          </Section>

          <ThemedVisualCard
            caption={(mode) => `Personal reflection — mobile, ${mode} mode`}
            pad="p-4 sm:p-8"
          >
            {(mode) => (
              <CaseStudyMedia
                src={mobileSrc('reflection', mode)}
                alt={`Mobile ${mode} mode personal reflection screen with Session Complete checkmark and four focus options`}
                maxWidth={260}
                caption={`Personal reflection — mobile, ${mode} mode`}
              />
            )}
          </ThemedVisualCard>

          <ThemedMockupCarousel
            caption={(mode) => `Achievement screens — mobile, ${mode} mode`}
            columns={3}
            desktopMaxWidth={780}
            buildItems={(mode) => [
              {
                src: mobileSrc('milestone', mode, '3'),
                alt: `Mobile ${mode} mode milestone screen with mountain illustration and progress to 25 sessions`,
                caption: `Milestone — mobile, ${mode} mode`,
              },
              {
                src: mobileSrc('streak', mode, '3'),
                alt: `Mobile ${mode} mode Focus Streak screen with flaming calendar and weekday tracker`,
                caption: `Focus Streak — mobile, ${mode} mode`,
              },
              {
                src: mobileSrc('personal-best', mode, '3'),
                alt: `Mobile ${mode} mode Personal Best screen with rocket and previous vs new best comparison`,
                caption: `Personal Best — mobile, ${mode} mode`,
              },
            ]}
          />

          <ThemedMockupCarousel
            caption={(mode) => `Completion screens — mobile, ${mode} mode`}
            columns={2}
            desktopMaxWidth={520}
            buildItems={(mode) => [
              {
                src: mobileSrc('completion-streak', mode, '6'),
                alt: `Mobile ${mode} mode completion screen with all-time stats and week tracker`,
                caption: `Week Tracker — mobile, ${mode} mode`,
              },
              {
                src: mobileSrc('completion-quote', mode, '3'),
                alt: `Mobile ${mode} mode completion screen with all-time stats and course quote`,
                caption: `Course Quote — mobile, ${mode} mode`,
              },
            ]}
          />

        </div>
      </section>

      <Divider label="Outcomes" id="section-outcomes" />

      {/* ── OUTCOMES ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Launch Status"
            heading="This project shipped during the summer. We’ll measure the impact this fall."
            body="Since this project launched in July (2026), when most students are out of school and classroom usage is naturally lower, we do not have enough data to draw any conclusions yet. To determine if we successfully improved the end of session experience, I set up clear goals to track performance for the Fall semester."
          >
            <div className="flex flex-col gap-8">
              <IndicatorGroup label="Leading Indicators — early usability & engagement" indicators={LEADING_INDICATORS} />
              <IndicatorGroup label="Lagging Indicators — core retention metrics" indicators={LAGGING_INDICATORS} />
            </div>
          </Section>
        </div>
      </section>

      <Divider label="Takeaways" id="section-reflection" />

      {/* ── TAKEAWAYS ── */}
      <section className={SECTION}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {TAKEAWAYS.map(takeaway => (
            <div
              key={takeaway.eyebrow}
              className="rounded-[24px] p-7 flex flex-col gap-3 bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <Eyebrow label={takeaway.eyebrow} color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">{takeaway.title}</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">{takeaway.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-20">
        <ClosingCTA />
      </section>

    </div>
  );
}
