'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
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

/**
 * Standardized circular media-control button, matching the white icon buttons used
 * across the case study page (carousel arrows, theme toggle). Fixed-positioned via `position`.
 */
export function LightboxIconButton({
  label,
  onClick,
  position,
  children,
}: {
  label: string;
  onClick: () => void;
  position: CSSProperties;
  children: ReactNode;
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
        width: 44,
        height: 44,
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
  const position: CSSProperties =
    direction === 'prev'
      ? { top: '50%', transform: 'translateY(-50%)', left: 20, visibility: visible ? 'visible' : 'hidden' }
      : { top: '50%', transform: 'translateY(-50%)', right: 20, visibility: visible ? 'visible' : 'hidden' };
  return (
    <LightboxIconButton label={direction === 'prev' ? 'Previous' : 'Next'} onClick={onClick} position={position}>
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
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
 * Multi-image preview with a single Image/GIF badge on the container.
 * Clicking any image opens a lightbox with prev/next arrows.
 */
export function CaseStudyMediaGallery({
  items,
  maxWidth,
  columns = 3,
  gapClassName = 'gap-2 sm:gap-3',
  rounded = 'rounded-md',
}: {
  items: CaseStudyMediaItem[];
  /** Kept for API compatibility; badge belongs on VisualCard. */
  type?: CaseStudyMediaType;
  maxWidth?: number | string;
  columns?: 2 | 3 | 4;
  gapClassName?: string;
  rounded?: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

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
  const colClass =
    columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <>
      <div className={maxWidth != null ? 'mx-auto w-full' : undefined} style={maxWidth != null ? { maxWidth } : undefined}>
        <div className={`grid ${colClass} ${gapClassName}`}>
          {items.map((mockup, i) => (
            <button
              key={mockup.src}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Expand image: ${mockup.alt}`}
              className={`overflow-hidden ${rounded} p-0 border-0 bg-transparent`}
              style={{ cursor: 'zoom-in' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mockup.src}
                alt={mockup.alt}
                className="w-full h-auto block pointer-events-none select-none"
                draggable={false}
              />
            </button>
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
            padding: '64px 84px 40px',
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
