'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export type CaseStudyMediaType = 'Image' | 'GIF';

export type CaseStudyMediaItem = {
  src: string;
  alt: string;
  caption?: string;
};

function inferType(src: string, type?: CaseStudyMediaType): CaseStudyMediaType {
  if (type) return type;
  const path = src.split('?')[0].toLowerCase();
  return path.endsWith('.gif') ? 'GIF' : 'Image';
}

/** Mark image visible for the mobile fade-in system (self + CaseStudyRouteChrome). */
function useCaseStudyImgReveal(src: string) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const show = () => {
      img.classList.add('case-study-img-visible');
      img.dataset.csReveal = '1';
    };
    if (img.complete) show();
    else {
      img.addEventListener('load', show, { once: true });
      img.addEventListener('error', show, { once: true });
    }
    const t = window.setTimeout(show, 2500);
    return () => window.clearTimeout(t);
  }, [src]);
  return ref;
}

function MediaTypeBadge({ type }: { type: CaseStudyMediaType }) {
  return (
    <div
      className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
    >
      {type}
    </div>
  );
}

export { MediaTypeBadge };

/** Overlay tint for all lightboxes — dark enough for legible captions sitting directly on the backdrop. */
const LIGHTBOX_OVERLAY = 'rgba(6, 6, 9, 0.96)';

/** True below `sm` — used so lightbox chrome doesn't steal width from the image. */
function useNarrowLightbox(breakpoint = 640) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);
  return narrow;
}

/** Horizontal room for side arrows — tight on mobile so the asset can use the screen. */
function lightboxOverlayPadding(narrow: boolean) {
  return narrow ? '56px 12px 32px' : '64px 84px 40px';
}

/**
 * Standardized circular media-control button, matching the white icon buttons used
 * across the case study page (carousel arrows, theme toggle). Fixed-positioned via `position`.
 */
export function LightboxIconButton({
  label,
  onClick,
  position,
  children,
  size = 44,
}: {
  label: string;
  onClick: () => void;
  position: CSSProperties;
  children: ReactNode;
  /** Button diameter. Prefer ~32 on narrow viewports so arrows don't dwarf the image. */
  size?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        width: size,
        height: size,
        borderRadius: '50%',
        background: hover ? '#e9e9ec' : '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3f3f46',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        zIndex: 2,
        ...position,
      }}
    >
      {children}
    </button>
  );
}

/** Bare close control — no container; a larger, high-contrast X sitting directly on the backdrop. */
export function LightboxCloseButton({ onClose }: { onClose: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        top: 20,
        right: 24,
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: hover ? '#ffffff' : 'rgba(255,255,255,0.92)',
        transform: hover ? 'scale(1.08)' : 'scale(1)',
        transition: 'color 0.15s ease, transform 0.15s ease',
        zIndex: 2,
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function LightboxNavButton({
  direction,
  onClick,
  visible,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  visible: boolean;
}) {
  const narrow = useNarrowLightbox();
  const inset = narrow ? 6 : 20;
  const size = narrow ? 32 : 44;
  const icon = narrow ? 13 : 16;
  const position: CSSProperties =
    direction === 'prev'
      ? { top: '50%', transform: 'translateY(-50%)', left: inset, visibility: visible ? 'visible' : 'hidden' }
      : { top: '50%', transform: 'translateY(-50%)', right: inset, visibility: visible ? 'visible' : 'hidden' };
  return (
    <LightboxIconButton
      label={direction === 'prev' ? 'Previous' : 'Next'}
      onClick={onClick}
      position={position}
      size={size}
    >
      <svg width={icon} height={icon} viewBox="0 0 14 14" fill="none">
        {direction === 'prev' ? (
          <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </LightboxIconButton>
  );
}

/**
 * Case-study media with Image/GIF type badge and click-to-expand lightbox.
 * Matches the pattern used across Finding Focus case studies.
 */
export function CaseStudyMedia({
  src,
  alt,
  type,
  className,
  style,
  maxWidth,
  caption,
  rounded = 'rounded-lg',
  showBadge = false,
}: {
  src: string;
  alt: string;
  type?: CaseStudyMediaType;
  className?: string;
  style?: CSSProperties;
  /** Optional max width for the inline preview (centered). */
  maxWidth?: number | string;
  /** Optional caption shown under the image in the lightbox. */
  caption?: string;
  rounded?: string;
  /** Prefer putting the badge on the blue VisualCard; off by default. */
  showBadge?: boolean;
}) {
  const mediaType = inferType(src, type);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imgRef = useCaseStudyImgReveal(src);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open && mounted);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const preview = (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Expand ${mediaType.toLowerCase()}: ${alt}`}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      }}
      className={`relative overflow-hidden ${rounded}`}
      style={{ cursor: 'zoom-in', ...style }}
    >
      {showBadge ? <MediaTypeBadge type={mediaType} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-auto block pointer-events-none select-none ${className ?? ''}`}
        draggable={false}
      />
    </div>
  );

  return (
    <>
      {maxWidth != null ? (
        <div className="mx-auto w-full" style={{ maxWidth }}>
          {preview}
        </div>
      ) : (
        preview
      )}

      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: LIGHTBOX_OVERLAY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px 40px',
            boxSizing: 'border-box',
            cursor: 'zoom-out',
            overflow: 'hidden',
          }}
        >
          <LightboxCloseButton onClose={() => setOpen(false)} />

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 'min(88vw, 1280px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'default',
              maxHeight: 'calc(100vh - 80px)',
              overflow: 'auto',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: caption ? 'min(74vh, calc(100vh - 200px))' : 'min(82vh, calc(100vh - 120px))',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 14,
                display: 'block',
              }}
            />
            {caption ? (
              <p
                style={{
                  marginTop: 18,
                  maxWidth: 'min(760px, 90vw)',
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {caption}
              </p>
            ) : null}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/**
 * Multi-image preview. Clicking any image opens a lightbox with prev/next arrows.
 * Stacks to 1 column below `sm` by default (2-col → 1, 3-col → 1).
 */
export function CaseStudyMediaGallery({
  items,
  maxWidth,
  columns = 3,
  gapClassName = 'gap-2 sm:gap-3',
  rounded = 'rounded-md',
  /** When true, always use `columns` — no single-column stack at narrow viewports. */
  preventStack = false,
}: {
  items: CaseStudyMediaItem[];
  /** Kept for API compatibility; badge belongs on VisualCard. */
  type?: CaseStudyMediaType;
  maxWidth?: number | string;
  columns?: 2 | 3 | 4;
  gapClassName?: string;
  rounded?: string;
  preventStack?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const narrow = useNarrowLightbox();

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open && mounted);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % items.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items.length]);

  function openAt(index: number) {
    setCurrent(index);
    setOpen(true);
  }

  const item = items[current];
  const colClass = preventStack
    ? columns === 2
      ? 'grid-cols-2'
      : columns === 4
        ? 'grid-cols-4'
        : 'grid-cols-3'
    : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-3';

  return (
    <>
      <div className={maxWidth != null ? 'mx-auto w-full' : undefined} style={maxWidth != null ? { maxWidth } : undefined}>
        <div className={`grid ${colClass} ${gapClassName}`}>
          {items.map((mockup, i) => (
            <GalleryThumb
              key={mockup.src}
              mockup={mockup}
              rounded={rounded}
              onOpen={() => openAt(i)}
            />
          ))}
        </div>
      </div>

      {open && mounted && item && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: LIGHTBOX_OVERLAY,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: lightboxOverlayPadding(narrow),
            boxSizing: 'border-box',
            cursor: 'zoom-out',
            overflow: 'hidden',
          }}
        >
          <LightboxCloseButton onClose={() => setOpen(false)} />
          {items.length > 1 ? (
            <>
              <LightboxNavButton
                direction="prev"
                visible={current > 0}
                onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
              />
              <LightboxNavButton
                direction="next"
                visible={current < items.length - 1}
                onClick={() => setCurrent((c) => (c + 1) % items.length)}
              />
            </>
          ) : null}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default', maxWidth: 'min(88vw, 1200px)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              style={{
                maxWidth: '100%',
                maxHeight: item.caption ? 'min(72vh, calc(100vh - 210px))' : 'min(82vh, calc(100vh - 150px))',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 14,
                display: 'block',
              }}
            />
            {item.caption ? (
              <p style={{ marginTop: 18, maxWidth: 'min(760px, 90vw)', textAlign: 'center', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
                {item.caption}
              </p>
            ) : null}
            {items.length > 1 ? (
              <p style={{ marginTop: item.caption ? 8 : 14, fontSize: 12, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.4)' }}>
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

const CAROUSEL_ARROW: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'white',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#555',
  cursor: 'pointer',
  zIndex: 2,
  padding: 0,
};

function CarouselArrowButton({
  direction,
  visible,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        ...CAROUSEL_ARROW,
        position: 'relative',
        top: 'auto',
        transform: 'none',
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        {direction === 'prev' ? (
          <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function CarouselDots({
  count,
  current,
  onSelect,
  labelPrefix = 'Go to slide',
}: {
  count: number;
  current: number;
  onSelect: (index: number) => void;
  labelPrefix?: string;
}) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${labelPrefix} ${i + 1}`}
          onClick={() => onSelect(i)}
          style={{
            height: 5,
            borderRadius: 3,
            width: i === current ? 20 : 5,
            transition: 'width 0.25s',
            background: i === current ? '#272727' : 'rgba(0,0,0,0.12)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Content-Ideas-style carousel for arbitrary slides (arrows beside, dots below).
 * No frosted stage by default — pass `background` only when a plate is needed.
 */
export function SlideCarousel({
  slides,
  background,
  caption,
  className,
}: {
  slides: { key: string; content: ReactNode }[];
  /** Optional plate behind the slide row. Omit for no container. */
  background?: string;
  caption?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + slides.length) % slides.length);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % slides.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  const slide = slides[Math.min(current, slides.length - 1)];
  if (!slide) return null;

  return (
    <div className={className}>
      <div
        className={background != null ? 'relative overflow-hidden rounded-[24px]' : undefined}
        style={background != null ? { background } : undefined}
      >
        <div className="flex items-center gap-1 px-1 py-1">
          <div className="flex w-8 shrink-0 items-center justify-center">
            {slides.length > 1 ? (
              <CarouselArrowButton
                direction="prev"
                label="Previous slide"
                visible={current > 0}
                onClick={() => setCurrent((c) => c - 1)}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">{slide.content}</div>
          <div className="flex w-8 shrink-0 items-center justify-center">
            {slides.length > 1 ? (
              <CarouselArrowButton
                direction="next"
                label="Next slide"
                visible={current < slides.length - 1}
                onClick={() => setCurrent((c) => c + 1)}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2 px-2">
        {caption ? <p className="text-center text-[13px] text-[#999]">{caption}</p> : null}
        <CarouselDots count={slides.length} current={current} onSelect={setCurrent} />
      </div>
    </div>
  );
}

/**
 * Content-Ideas-style carousel for XS: frosted stage with arrows beside the
 * media (not overlaid on it), caption + pagination dots below outside the stage.
 */
export function MediaCarouselStage({
  items,
  caption,
  maxWidth = 260,
  background = 'rgba(220, 232, 248, 0.45)',
  topRight,
  rounded = 'rounded-md',
}: {
  items: CaseStudyMediaItem[];
  /** Descriptive text shown below the stage, above the dots. */
  caption: string;
  /** Phone / asset max width inside the stage. */
  maxWidth?: number;
  background?: string;
  /** Optional control (e.g. theme toggle) in the stage’s top-right. */
  topRight?: ReactNode;
  rounded?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const narrow = useNarrowLightbox();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the current slide when light/dark srcs swap; only clamp if length shrinks.
  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, items.length - 1)));
  }, [items.length]);

  useBodyScrollLock(open && mounted);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (open && e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % items.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items.length]);

  const item = items[Math.min(current, items.length - 1)] ?? items[0];
  if (!item) return null;

  return (
    <>
      <div>
        <div className="relative rounded-[24px] overflow-hidden" style={{ background }}>
          {topRight ? (
            <div className="absolute z-10" style={{ top: 16, right: 16 }}>
              {topRight}
            </div>
          ) : null}
          {/* Arrow columns sit beside the asset — never overlaid on it (Content Ideas pattern). */}
          <div className="flex items-center py-4 px-3 gap-1">
            <div className="w-8 shrink-0 flex items-center justify-center">
              {items.length > 1 ? (
                <CarouselArrowButton
                  direction="prev"
                  label="Previous image"
                  visible={current > 0}
                  onClick={() => setCurrent((c) => c - 1)}
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0 flex justify-center">
              <div className="w-full" style={{ maxWidth }}>
                <GalleryThumb
                  mockup={item}
                  rounded={rounded}
                  onOpen={() => setOpen(true)}
                />
              </div>
            </div>
            <div className="w-8 shrink-0 flex items-center justify-center">
              {items.length > 1 ? (
                <CarouselArrowButton
                  direction="next"
                  label="Next image"
                  visible={current < items.length - 1}
                  onClick={() => setCurrent((c) => c + 1)}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 px-2">
          <p className="text-[13px] text-[#999] text-center">{caption}</p>
          <CarouselDots
            count={items.length}
            current={current}
            onSelect={setCurrent}
            labelPrefix="Go to image"
          />
        </div>
      </div>

      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: LIGHTBOX_OVERLAY,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: lightboxOverlayPadding(narrow),
            boxSizing: 'border-box',
            cursor: 'zoom-out',
            overflow: 'hidden',
          }}
        >
          <LightboxCloseButton onClose={() => setOpen(false)} />
          {items.length > 1 ? (
            <>
              <LightboxNavButton
                direction="prev"
                visible={current > 0}
                onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
              />
              <LightboxNavButton
                direction="next"
                visible={current < items.length - 1}
                onClick={() => setCurrent((c) => (c + 1) % items.length)}
              />
            </>
          ) : null}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default', maxWidth: 'min(88vw, 1200px)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              style={{
                maxWidth: '100%',
                maxHeight: item.caption ? 'min(72vh, calc(100vh - 210px))' : 'min(82vh, calc(100vh - 150px))',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 14,
                display: 'block',
              }}
            />
            {item.caption ? (
              <p style={{ marginTop: 18, maxWidth: 'min(760px, 90vw)', textAlign: 'center', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
                {item.caption}
              </p>
            ) : null}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function GalleryThumb({
  mockup,
  rounded,
  onOpen,
}: {
  mockup: CaseStudyMediaItem;
  rounded: string;
  onOpen: () => void;
}) {
  const imgRef = useCaseStudyImgReveal(mockup.src);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Expand image: ${mockup.alt}`}
      className={`overflow-hidden ${rounded} p-0 border-0 bg-transparent`}
      style={{ cursor: 'zoom-in' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={mockup.src}
        alt={mockup.alt}
        className="w-full h-auto block pointer-events-none select-none"
        draggable={false}
      />
    </button>
  );
}

/**
 * Placeholder slot that mirrors CaseStudyMedia badge styling so future assets
 * drop in with the same container language.
 */
export function CaseStudyMediaPlaceholder({
  type = 'Image',
  description,
  minHeight = 320,
  style,
  children,
  showBadge = false,
}: {
  type?: CaseStudyMediaType;
  description: string;
  minHeight?: number;
  style?: CSSProperties;
  children?: ReactNode;
  /** Prefer putting the badge on the blue VisualCard; off by default. */
  showBadge?: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-3 rounded-[16px] text-center px-8 py-10 overflow-hidden"
      style={{ minHeight, border: '2px dashed #a9c2e8', background: 'rgba(255,255,255,0.65)', ...style }}
    >
      {showBadge ? <MediaTypeBadge type={type} /> : null}
      <p className="text-[14px] font-normal leading-[165%] text-[#7a8aa0] max-w-[460px]">{description}</p>
      {children}
    </div>
  );
}
