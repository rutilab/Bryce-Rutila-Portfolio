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

function LightboxCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
      }}
      className="hover:bg-white/20"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        visibility: visible ? 'visible' : 'hidden',
        width: 34,
        height: 34,
        borderRadius: '50%',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      className="hover:bg-white/20"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        {direction === 'prev' ? (
          <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
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
            background: 'rgba(8,8,8,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 24px 24px',
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
                  marginTop: 14,
                  maxWidth: 'min(720px, 92vw)',
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.72)',
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
            background: 'rgba(8,8,8,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 24px 24px',
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
              height: 'calc(100vh - 80px)',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'default',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 14,
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                flexShrink: 0,
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(8,8,8,0.85)',
                padding: '14px 16px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <LightboxNavButton
                  direction="prev"
                  visible={current > 0}
                  onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
                />
                <div style={{ textAlign: 'center', minWidth: 0, flex: '1 1 auto', maxWidth: 'min(720px, 86vw)' }}>
                  {item.caption ? (
                    <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                      {item.caption}
                    </p>
                  ) : null}
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: item.caption ? 8 : 0 }}>
                    {current + 1} / {items.length}
                  </p>
                </div>
                <LightboxNavButton
                  direction="next"
                  visible={current < items.length - 1}
                  onClick={() => setCurrent((c) => (c + 1) % items.length)}
                />
              </div>
            </div>
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
