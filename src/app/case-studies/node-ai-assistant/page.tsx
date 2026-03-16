'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AI_ASSISTANT_CSS, AI_ASSISTANT_HTML } from './ai-assistant-modal';
import SmsIcon from '@mui/icons-material/Sms';
import ForumIcon from '@mui/icons-material/Forum';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import PlaceIcon from '@mui/icons-material/Place';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InboxIcon from '@mui/icons-material/Inbox';

// ── Asset paths ──────────────────────────────────────────────────────────────
const assets = {
  accessingNodeAi: '/case-studies/node-ai/accessing-node-ai.gif',
  typicalChatInterface: '/case-studies/node-ai/typical-chat-interface.png',
  chatgptTextOutput: '/case-studies/node-ai/chatgpt-text-output.gif',
  geminiTextOutput: '/case-studies/node-ai/gemini-text-output.gif',
  geminiLayout: '/case-studies/node-ai/gemini-layout.png',
  metaAiLayout: '/case-studies/node-ai/meta-ai-layout.png',
  claudePageBehavior: '/case-studies/node-ai/claude-page-behavior.gif',
  geminiPageBehavior: '/case-studies/node-ai/gemini-page-behavior.gif',
  openingChatInterface: '/case-studies/node-ai/GIFs/Opening%20Chat%20Interface.gif',
  emptyStateExample: '/case-studies/node-ai/GIFs/Empty%20State%20Example%20Question.gif',
  alwaysVisible: '/case-studies/node-ai/GIFs/Always%20Visible.gif',
  ideationNavDrawerWireframe: '/case-studies/node-ai/ideation-nav-drawer-wireframe.png',
  ideationNavDrawerComparison: '/case-studies/node-ai/ideation-nav-drawer-comparison.png',
  ideationFabWireframe: '/case-studies/node-ai/ideation-fab-wireframe.png',
  ideationFabComparison: '/case-studies/node-ai/ideation-fab-comparison.png',
  ideationDisplayFullscreenWireframe: '/case-studies/node-ai/ideation-display-fullscreen-wireframe.png',
  ideationDisplayFullscreenComparison: '/case-studies/node-ai/ideation-display-fullscreen-comparison.png',
  ideationDisplayAnchoredWireframe: '/case-studies/node-ai/ideation-display-anchored-wireframe.png',
  ideationDisplayAnchoredComparison: '/case-studies/node-ai/ideation-display-anchored-comparison.png',
  ideationDisplaySplitWireframe: '/case-studies/node-ai/ideation-display-split-wireframe.png',
  ideationDisplaySplitComparison: '/case-studies/node-ai/ideation-display-split-comparison.png',
  ideationEmptyBlankWireframe: '/case-studies/node-ai/ideation-empty-blank-wireframe.png',
  ideationEmptyBlankComparison: '/case-studies/node-ai/ideation-empty-blank-comparison.png',
  ideationEmptyTilesWireframe: '/case-studies/node-ai/ideation-empty-tiles-wireframe.png',
  ideationEmptyTilesComparison: '/case-studies/node-ai/ideation-empty-tiles-comparison.png',
  ideationEmptyProactiveWireframe: '/case-studies/node-ai/ideation-empty-proactive-wireframe.png',
  ideationEmptyProactiveComparison: '/case-studies/node-ai/ideation-empty-proactive-comparison.png',
  finalDesignsHero: '/case-studies/node-ai/GIFs/final-designs-hero.gif',
  emptyStateDesign: '/case-studies/node-ai/empty-state-design.png',
  iPhoneMockup: '/case-studies/node-ai/iphone-mockup.png',
  iMacMockup: '/case-studies/node-ai/imac-mockup.png',
};

// ── Text scale (explicit, not relying on cs-* classes) ───────────────────────
// Section heading:    30px semibold
// Section body:       18px normal 180%
// Card title:         17px semibold
// Card body:          16px normal 175%
// Caption:            13px normal #888
// Eyebrow:            11px medium tracking-wide blue

// ── Utility components ───────────────────────────────────────────────────────

function StopPlayButton({ stopped, onClick }: { stopped: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 2 }}>
      {/* Tooltip */}
      <div style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)', color: 'white',
        fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
        whiteSpace: 'nowrap', pointerEvents: 'none',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s ease',
      }}>
        {stopped ? 'Play' : 'Stop'}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: hovered ? '#f0f0f0' : 'white',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#555', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {stopped
          ? /* Play */ <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 2.2l6.5 3.8L3 9.8V2.2z" fill="currentColor"/></svg>
          : /* Stop */ <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
        }
      </button>
    </div>
  );
}

function Eyebrow({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#27b4ff]">
      {label}
    </p>
  );
}

function Section({
  eyebrow,
  heading,
  body,
  children,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="max-w-[720px]">
          {eyebrow && <Eyebrow label={eyebrow} />}
          <h2 className="text-[30px] font-semibold leading-[125%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
            {heading}
          </h2>
        </div>
        {body && (
          <p className="text-[18px] font-normal leading-[180%] text-[#555] max-w-[920px]">{body}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Callout({
  accentColor,
  label,
  heading,
  body,
  compactBody,
}: {
  accentColor: string;
  label: string;
  heading: string;
  body?: string;
  compactBody?: boolean;
}) {
  return (
    <div
      className="pl-6 flex flex-col gap-3 max-w-[760px] bg-white rounded-[16px] py-6 pr-6"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `2px solid ${accentColor}` }}
    >
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: accentColor }}>
          {label}
        </p>
        <p className="text-[20px] font-semibold leading-[135%] text-[#1a1a1a]">{heading}</p>
        {body && (
          <p className={compactBody ? 'text-[14px] font-normal leading-[170%] text-[#666]' : 'text-[17px] font-normal leading-[175%] text-[#666]'}>{body}</p>
        )}
      </div>
    </div>
  );
}

function DecisionPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex self-start items-center gap-2 bg-[rgba(39,180,255,0.08)] border border-[rgba(39,180,255,0.2)] rounded-full px-4 py-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#27b4ff] flex-shrink-0" />
      <span className="text-[13px] font-medium text-[#27b4ff]">{children}</span>
    </div>
  );
}

// Visual container — light grey card with optional caption
function VisualCard({
  children,
  caption,
  pill,
}: {
  children: React.ReactNode;
  caption?: string;
  pill?: string;
}) {
  return (
    <div>
      <div className="rounded-[24px] overflow-hidden" style={{ background: 'rgba(220,232,248,0.45)' }}>
        {children}
      </div>
      {caption && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-[13px] text-[#999] text-center">{caption}</span>
          {pill && (
            <span className="cs-pill"><span className="cs-pill-text">{pill}</span></span>
          )}
        </div>
      )}
    </div>
  );
}

// ── IdeationViewer: image carousel with auto-advance dots (no lightbox) ───────
function IdeationViewer({ items }: {
  items: { src: string; alt: string; secondSrc?: string; secondAlt?: string; label: string; caption: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [dotProgress, setDotProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const DURATION = 20000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inViewport) { setDotProgress(0); return; }
    const startTime = Date.now();
    setDotProgress(0);
    let rafId: number;
    function tick() {
      const p = Math.min(100, ((Date.now() - startTime) / DURATION) * 100);
      setDotProgress(p);
      if (p < 100) { rafId = requestAnimationFrame(tick); }
      else { setCurrent(c => (c + 1) % itemsRef.current.length); }
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [current, inViewport]);

  const item = items[current];

  return (
    <div ref={containerRef}>
      {/* Full-width container — taller on mobile for stacked layout, shorter on desktop for side-by-side */}
      <div className="rounded-[24px] overflow-hidden relative h-[500px] md:h-[380px]" style={{ background: 'rgba(220,232,248,0.45)' }}>
        {items.map((it, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center p-8 gap-6 ${it.secondSrc ? 'flex-col md:flex-row' : ''}`}
            style={{ opacity: i === current ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src} alt={it.alt}
              className={it.secondSrc
                ? 'max-h-[44%] md:max-h-full md:max-w-[52%] max-w-full w-auto h-auto block flex-shrink-0'
                : 'max-h-full max-w-full w-auto h-auto block'
              }
            />
            {it.secondSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.secondSrc} alt={it.secondAlt ?? ''}
                className="max-h-[44%] md:max-h-full md:max-w-[44%] max-w-full w-auto h-auto block flex-shrink-0"
              />
            )}
          </div>
        ))}
        {/* Arrows inside the container */}
        <button
          onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
          style={{ visibility: current > 0 ? 'visible' : 'hidden', position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', cursor: 'pointer', zIndex: 2 }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % items.length)}
          style={{ visibility: current < items.length - 1 ? 'visible' : 'hidden', position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', cursor: 'pointer', zIndex: 2 }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Label + progress dots */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-[13px] text-[#999]">{item.label}</p>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ height: 5, borderRadius: 3, width: i === current ? 48 : 5, transition: 'width 0.25s', background: 'rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer', padding: 0, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              {i === current && <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${dotProgress}%`, background: '#27b4ff' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Side-by-side image comparison inside a VisualCard
function ComparisonGrid({
  left,
  right,
}: {
  left: { src: string; alt: string; label: string; caption: string };
  right: { src: string; alt: string; label: string; caption: string };
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 p-6">
        <div className="rounded-xl overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={left.src} alt={left.alt} className="w-full h-auto block" />
        </div>
        <div className="rounded-xl overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={right.src} alt={right.alt} className="w-full h-auto block" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 pb-6">
        <div>
          <p className="text-[14px] font-semibold text-[#1a1a1a]">{left.label}</p>
          <p className="text-[14px] font-normal leading-[165%] text-[#777] mt-0.5">{left.caption}</p>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#1a1a1a]">{right.label}</p>
          <p className="text-[14px] font-normal leading-[165%] text-[#777] mt-0.5">{right.caption}</p>
        </div>
      </div>
    </div>
  );
}

// ── MediaViewer: full-width media viewer with auto-advance, lightbox, progress dots ──
const MEDIA_ADVANCE_MS: Record<'GIF' | 'Image', number> = { GIF: 20000, Image: 20000 };

function MediaViewer({
  items,
  constrained = true,
  active = true,
}: {
  items: { src: string; alt: string; label: string; caption: string; type: 'GIF' | 'Image' }[];
  constrained?: boolean;
  /** When false (e.g. card is behind in deck), timer pauses and resets. */
  active?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [dotProgress, setDotProgress] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [gifStopped, setGifStopped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const gifImgRef = useRef<HTMLImageElement | null>(null);
  const frame0CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const savedProgressRef = useRef(0);

  // Capture frame 0 when a GIF loads (before animation starts).
  // Draw scaled+centered into the canvas so it matches objectFit:contain.
  function handleGifLoad(img: HTMLImageElement) {
    const canvas = frame0CanvasRef.current;
    if (!canvas || img.naturalWidth === 0) return;
    const parent = canvas.parentElement;
    const cw = parent?.clientWidth || img.naturalWidth;
    const ch = parent?.clientHeight || img.naturalHeight;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
  }

  function closeLightbox() { setLightboxOpen(false); }

  // Mark as client-mounted so createPortal can safely target document.body
  useEffect(() => { setMounted(true); }, []);

  // Track viewport visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset GIF stopped state when switching slides; restore src in case it was cleared
  useEffect(() => {
    setGifStopped(false);
    savedProgressRef.current = 0;
    const item = itemsRef.current[current];
    if (item?.type === 'GIF' && gifImgRef.current) {
      gifImgRef.current.src = item.src;
    }
  }, [current]);

  // ── Auto-advance timer ────────────────────────────────────────────────────
  const shouldAdvance = inViewport && active && !lightboxOpen && !gifStopped;

  useEffect(() => {
    if (!shouldAdvance) return; // stop RAF but keep savedProgressRef as-is
    const duration = MEDIA_ADVANCE_MS[itemsRef.current[current].type];
    const startP = savedProgressRef.current;
    const remaining = duration * (1 - startP / 100);
    const startTime = Date.now();
    let rafId: number;
    function tick() {
      const p = Math.min(100, startP + ((Date.now() - startTime) / remaining) * (100 - startP));
      savedProgressRef.current = p;
      setDotProgress(p);
      if (p < 100) { rafId = requestAnimationFrame(tick); }
      else { savedProgressRef.current = 0; setCurrent(c => (c + 1) % itemsRef.current.length); }
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [current, shouldAdvance]);

  const item = items[current];
  const maxH = constrained ? 'min(460px, calc(100vh - 500px))' : '460px';

  return (
    <div ref={containerRef}>
      {/* Row: left-arrow | image (clickable → lightbox) | right-arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Left arrow */}
        <button
          onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
          style={{
            visibility: current > 0 ? 'visible' : 'hidden',
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555', cursor: 'pointer', transition: 'background 0.15s',
          }}
          className="bg-white hover:bg-[#f0f0f0]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Image container — entire area is click-to-expand with zoom-in cursor */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLightboxOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setLightboxOpen(true)}
          style={{
            flex: 1, position: 'relative', aspectRatio: '16/9',
            maxHeight: maxH, minHeight: constrained ? 160 : 0,
            borderRadius: 16, overflow: 'hidden',
            background: 'rgba(220,232,248,0.45)',
            cursor: 'zoom-in',
          }}
        >
          {items.map((it, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              opacity: i === current ? 1 : 0, transition: 'opacity 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={i === current && it.type === 'GIF' ? gifImgRef : undefined}
                src={it.src} alt={it.alt}
                onLoad={it.type === 'GIF' && i === current ? e => handleGifLoad(e.currentTarget) : undefined}
                style={{
                  width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none',
                  display: gifStopped && i === current && it.type === 'GIF' ? 'none' : undefined,
                }}
              />
            </div>
          ))}

          {/* Frame 0 canvas — shown when stopped, hidden when playing */}
          {item.type === 'GIF' && (
            <canvas
              ref={frame0CanvasRef}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none',
                display: gifStopped ? 'block' : 'none',
              }}
            />
          )}

          {/* Media type badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
            {item.type}
          </div>

          {/* GIF stop/play button */}
          {item.type === 'GIF' && (
            <StopPlayButton
              stopped={gifStopped}
              onClick={() => {
                if (!gifStopped) {
                  if (gifImgRef.current) gifImgRef.current.src = '';
                  savedProgressRef.current = 0;
                  setDotProgress(0);
                  setGifStopped(true);
                } else {
                  if (gifImgRef.current) gifImgRef.current.src = item.src;
                  setGifStopped(false);
                }
              }}
            />
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => setCurrent(c => (c + 1) % items.length)}
          style={{
            visibility: current < items.length - 1 ? 'visible' : 'hidden',
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555', cursor: 'pointer', transition: 'background 0.15s',
          }}
          className="bg-white hover:bg-[#f0f0f0]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div className="mt-3 flex flex-col gap-0.5 text-center">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.label}</p>
        <p className="text-[13px] text-[#888] leading-[160%]">{item.caption}</p>
      </div>

      {/* Progress-bar dots */}
      {items.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                height: 5, borderRadius: 3, flexShrink: 0,
                width: i === current ? 52 : 5,
                transition: 'width 0.25s',
                background: 'rgba(0,0,0,0.12)',
                border: 'none', cursor: 'pointer', padding: 0,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {i === current && (
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${dotProgress}%`, background: '#27b4ff' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      {lightboxOpen && mounted && createPortal(
        /* Outer overlay: zoom-out cursor + click-outside-to-close */
        <div
          onClick={() => closeLightbox()}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(8,8,8,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 32px',
            cursor: 'zoom-out',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => closeLightbox()}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', cursor: 'pointer', transition: 'background 0.15s',
            }}
            className="hover:bg-white/20"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Content panel — click inside does NOT close */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'min(88vw, 1280px)', width: '100%', cursor: 'default' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src} alt={item.alt}
              style={{ width: '100%', maxHeight: '74vh', objectFit: 'contain', borderRadius: 14, display: 'block' }}
            />

            {/* Caption + navigation row */}
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              {items.length > 1 && (
                <button
                  onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
                  style={{
                    visibility: current > 0 ? 'visible' : 'hidden',
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  className="hover:bg-white/20"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 15, margin: 0 }}>{item.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 5, lineHeight: 1.6 }}>{item.caption}</p>
                {items.length > 1 && (
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 8 }}>{current + 1} / {items.length}</p>
                )}
              </div>

              {items.length > 1 && (
                <button
                  onClick={() => setCurrent(c => (c + 1) % items.length)}
                  style={{
                    visibility: current < items.length - 1 ? 'visible' : 'hidden',
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  className="hover:bg-white/20"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Hero Illustration — AI assistant modal inside a light container ───────────
function HeroIllustration() {
  return (
    // Outer container — frosted tint so page background bleeds through
    <div className="w-full rounded-[24px] flex items-center justify-center py-11 px-8" style={{ background: 'rgba(220,232,248,0.45)', backdropFilter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none', cursor: 'default' }}>
      {/* Modal — max 725px, white bg + shadow applied via CSS override */}
      <div className="w-full max-w-[725px]">
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: AI_ASSISTANT_CSS }} />
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: AI_ASSISTANT_HTML }} />
      </div>
    </div>
  );
}

// ── ChatbotFlowDiagram ───────────────────────────────────────────────────────
function ChatbotFlowDiagram() {
  return (
    <svg viewBox="0 0 620 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[620px]">
      {/* Node 1: User question */}
      <rect x="10" y="80" width="116" height="50" rx="12" fill="#F0F0F0" stroke="#DEDEDE" strokeWidth="1.5"/>
      <text x="68" y="101" textAnchor="middle" fontSize="11" fill="#555" fontFamily="Inter, sans-serif" fontWeight="400">User question</text>
      <text x="68" y="117" textAnchor="middle" fontSize="10" fill="#888" fontFamily="Inter, sans-serif">&quot;How do I log in?&quot;</text>
      {/* Arrow 1 */}
      <line x1="126" y1="105" x2="170" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="170,100 180,105 170,110" fill="#CACACA"/>
      {/* Node 2: Decision */}
      <rect x="180" y="77" width="118" height="56" rx="12" fill="#EEF6FF" stroke="#B8D8F8" strokeWidth="1.5"/>
      <text x="239" y="101" textAnchor="middle" fontSize="11" fill="#3A7EC0" fontFamily="Inter, sans-serif" fontWeight="500">Is it in the</text>
      <text x="239" y="117" textAnchor="middle" fontSize="11" fill="#3A7EC0" fontFamily="Inter, sans-serif" fontWeight="500">decision tree?</text>
      {/* Down arrow: YES */}
      <line x1="239" y1="133" x2="239" y2="170" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="234,170 239,180 244,170" fill="#CACACA"/>
      <text x="239" y="158" textAnchor="middle" fontSize="9.5" fill="#27B4FF" fontFamily="Inter, sans-serif" fontWeight="500">YES</text>
      {/* Scripted reply — pushed down */}
      <rect x="189" y="180" width="100" height="36" rx="10" fill="#EAFAF1" stroke="#A8DFBC" strokeWidth="1.5"/>
      <text x="239" y="203" textAnchor="middle" fontSize="10.5" fill="#2A8A50" fontFamily="Inter, sans-serif" fontWeight="400">Scripted reply ✓</text>
      {/* Arrow NO */}
      <line x1="298" y1="105" x2="348" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="348,100 358,105 348,110" fill="#CACACA"/>
      <text x="323" y="96" textAnchor="middle" fontSize="9.5" fill="#E03030" fontFamily="Inter, sans-serif" fontWeight="500">NO</text>
      {/* Node 3: Input not recognized */}
      <rect x="358" y="77" width="118" height="56" rx="12" fill="#FFF3F3" stroke="#F5C0C0" strokeWidth="1.5"/>
      <text x="417" y="101" textAnchor="middle" fontSize="11" fill="#C03030" fontFamily="Inter, sans-serif" fontWeight="500">Input not</text>
      <text x="417" y="117" textAnchor="middle" fontSize="11" fill="#C03030" fontFamily="Inter, sans-serif" fontWeight="500">recognized</text>
      {/* Arrow 3 */}
      <line x1="476" y1="105" x2="520" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="520,100 530,105 520,110" fill="#CACACA"/>
      {/* Node 4: Stuck */}
      <rect x="530" y="80" width="72" height="50" rx="12" fill="#F5F5F5" stroke="#DEDEDE" strokeWidth="1.5"/>
      <text x="566" y="103" textAnchor="middle" fontSize="18" fill="#AAAAAA" fontFamily="Inter, sans-serif">?</text>
      <text x="566" y="119" textAnchor="middle" fontSize="9" fill="#AAAAAA" fontFamily="Inter, sans-serif">stuck</text>
    </svg>
  );
}

// ── APIComparisonDiagram ─────────────────────────────────────────────────────
function APIComparisonDiagram() {
  return (
    <svg viewBox="0 0 560 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[560px]">
      <text x="110" y="18" textAnchor="middle" fontSize="11" fill="#888" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="1">RULE-BASED</text>
      <rect x="62" y="26" width="96" height="36" rx="9" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
      <text x="110" y="49" textAnchor="middle" fontSize="10" fill="#555" fontFamily="Inter, sans-serif">Input</text>
      <line x1="110" y1="62" x2="110" y2="78" stroke="#C8C8C8" strokeWidth="1.5"/>
      <line x1="110" y1="78" x2="44" y2="78" stroke="#C8C8C8" strokeWidth="1.5"/>
      <line x1="110" y1="78" x2="176" y2="78" stroke="#C8C8C8" strokeWidth="1.5"/>
      <line x1="44" y1="78" x2="44" y2="92" stroke="#C8C8C8" strokeWidth="1.5"/>
      <line x1="110" y1="78" x2="110" y2="92" stroke="#C8C8C8" strokeWidth="1.5"/>
      <line x1="176" y1="78" x2="176" y2="92" stroke="#C8C8C8" strokeWidth="1.5"/>
      {[14, 80, 146].map((x, i) => (
        <g key={i}>
          <rect x={x} y="92" width="60" height="28" rx="7" fill={i === 1 ? '#EAFAF1' : '#F9FAFB'} stroke={i === 1 ? '#A8DFBC' : '#D1D5DB'} strokeWidth="1.4"/>
          <text x={x + 30} y="111" textAnchor="middle" fontSize="9.5" fill={i === 1 ? '#2A8A50' : '#9CA3AF'} fontFamily="Inter, sans-serif">
            {i === 1 ? 'Match ✓' : '???'}
          </text>
        </g>
      ))}
      <line x1="110" y1="120" x2="110" y2="134" stroke="#C8C8C8" strokeWidth="1.3"/>
      <line x1="110" y1="134" x2="80" y2="134" stroke="#C8C8C8" strokeWidth="1.3"/>
      <line x1="110" y1="134" x2="140" y2="134" stroke="#C8C8C8" strokeWidth="1.3"/>
      <line x1="80" y1="134" x2="80" y2="144" stroke="#C8C8C8" strokeWidth="1.3"/>
      <line x1="140" y1="134" x2="140" y2="144" stroke="#C8C8C8" strokeWidth="1.3"/>
      {[55, 115].map((x, i) => (
        <rect key={i} x={x} y="144" width="50" height="24" rx="6" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1.3"/>
      ))}
      <text x="110" y="186" textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter, sans-serif">Rigid decision paths</text>
      <text x="110" y="200" textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter, sans-serif">Limited to known inputs</text>
      <line x1="270" y1="10" x2="270" y2="210" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 3"/>
      <text x="270" y="214" textAnchor="middle" fontSize="9" fill="#C0C0C0" fontFamily="Inter, sans-serif">VS</text>
      <text x="415" y="18" textAnchor="middle" fontSize="11" fill="#27B4FF" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="1">LLM API</text>
      <circle cx="415" cy="110" r="32" fill="#EEF9FF" stroke="#B0E0FF" strokeWidth="1.8"/>
      <text x="415" y="106" textAnchor="middle" fontSize="10" fill="#27B4FF" fontFamily="Inter, sans-serif" fontWeight="600">LLM</text>
      <text x="415" y="120" textAnchor="middle" fontSize="9" fill="#60BFEF" fontFamily="Inter, sans-serif">model</text>
      {[
        { cx: 310, cy: 60, label: 'Query A', color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
        { cx: 310, cy: 110, label: 'Query B', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
        { cx: 310, cy: 160, label: 'Query C', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
        { cx: 520, cy: 60, label: 'Reply A', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
        { cx: 520, cy: 110, label: 'Reply B', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
        { cx: 520, cy: 160, label: 'Reply C', color: '#34D399', bg: '#ECFDF5', border: '#A7F3D0' },
      ].map(({ cx, cy, label, color, bg, border }, i) => (
        <g key={i}>
          <line x1={cx < 415 ? cx + 36 : cx - 36} y1={cy} x2={cx < 415 ? 383 : 447} y2={110 + (cy - 110) * 0.6} stroke={border} strokeWidth="1.4"/>
          <rect x={cx - 28} y={cy - 14} width="56" height="28" rx="8" fill={bg} stroke={border} strokeWidth="1.4"/>
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9.5" fill={color} fontFamily="Inter, sans-serif" fontWeight="500">{label}</text>
        </g>
      ))}
      <text x="415" y="186" textAnchor="middle" fontSize="10" fill="#60BFEF" fontFamily="Inter, sans-serif">Understands any input</text>
      <text x="415" y="200" textAnchor="middle" fontSize="10" fill="#60BFEF" fontFamily="Inter, sans-serif">Generates contextual responses</text>
    </svg>
  );
}

// ── NumberSticker ────────────────────────────────────────────────────────────
const numberStickers = {
  1: {
    pillPath: 'M35.3331 11.4413C38.8347 9.25994 43.4324 8.65749 47.548 10.6639C51.946 12.8083 54.4212 17.2945 54.1984 22.1073L54.1974 22.1141C54.0885 24.4247 54.0489 27.2687 54.0489 30.2205V46.9569C59.9347 49.4602 61.9595 55.4914 61.006 60.2713C59.9678 65.475 55.4484 69.9625 49.0607 70.0028L49.0616 70.0038C47.3378 70.0173 37.2553 70.0306 32.1193 70.0174H32.1085C25.4422 69.9922 21.1276 65.0658 20.1612 60.1336C19.2048 55.2509 21.3367 49.2412 27.2423 46.7918V39.9539C23.9269 38.7918 21.2912 36.199 20.0558 32.9461C17.9574 27.4206 20.1913 21.5256 25.0216 18.2498C29.6521 15.1101 32.2783 13.3525 35.3194 11.45L35.3263 11.4461L35.3331 11.4413Z',
    numberPath: 'M32.1426 61.0171C28.6489 61.0039 27.6074 56.0732 31.0352 54.979C35.5571 53.542 36.2427 52.8828 36.2427 48.4663V32.936C36.2427 30.9321 35.8604 30.5234 34.3443 30.9189C33.7114 31.0903 33.2237 31.2617 31.8789 31.5386C28.6358 32.2241 26.6319 28.0317 30.0728 25.6982C34.7002 22.5605 37.2051 20.8862 40.0923 19.0801C42.5049 17.5771 45.3394 18.8428 45.2075 21.6904C45.0889 24.2085 45.0493 27.2144 45.0493 30.2202V48.4399C45.0493 52.6982 45.814 53.4365 50.3755 55.1768C53.3682 56.3105 52.6563 60.9907 48.9912 61.0039C47.3169 61.0171 37.271 61.0303 32.1426 61.0171Z',
    filter: { x: '14.7668', y: '4.94012', width: '50.9646', height: '69.5827' },
  },
  2: {
    pillPath: 'M39.3682 9.35449C51.6451 9.35449 60.0098 18.9846 60.0098 30.1152C60.0097 33.8905 59.0387 37.5539 57.1465 41.3438C61.3461 44.1098 63.4085 49.2314 62.3086 54.4688L62.3067 54.4775C61.8995 56.4068 61.2456 58.5684 60.6387 60.2803L60.6377 60.2822C59.9499 62.2207 58.6743 64.9915 55.9473 67.1338C53.102 69.3688 49.8837 69.9931 47.1465 70.0293C43.0703 70.0828 34.8354 70.1231 28.3223 70.0293C23.3407 69.9579 18.7356 66.9175 17.0196 61.9639C15.2609 56.8868 17.1453 51.9113 20.3516 48.5996L20.3545 48.5967C23.0561 45.8093 25.2095 43.4702 26.9268 41.501C26.6207 41.4262 26.3162 41.3418 26.0157 41.2422C20.2874 39.3444 16.5918 33.3449 18.2041 26.7207L18.2071 26.7109L18.209 26.7012C20.9173 15.6819 29.8143 9.35452 39.3682 9.35449Z',
    numberPath: 'M28.4521 61.0303C25.6308 60.9907 24.0092 57.7607 26.8173 54.8604C40.1064 41.1494 42.2026 36.3242 42.2026 32.3955C42.2026 28.7964 40.3042 26.7266 37.6411 26.7266C35.624 26.7266 33.7124 27.8867 32.5522 30.8135C31.1152 34.4521 25.9736 32.8569 26.9492 28.8491C28.6762 21.8223 33.9892 18.355 39.3681 18.355C46.3291 18.355 51.0092 23.6021 51.0092 30.1147C51.0092 34.9399 48.3066 40.6616 39.0913 50.6152C38.0893 51.6963 38.5771 52.6455 39.645 52.6455H44.5361C45.9204 52.6323 46.5136 52.1313 47.2783 50.9712L48.0825 49.7451C49.9414 46.9106 54.3315 48.6641 53.5009 52.6191C53.1977 54.0562 52.6704 55.8228 52.1562 57.2729C51.2861 59.7251 50.0205 60.9907 47.0278 61.0303C43.0068 61.083 34.8593 61.1226 28.4521 61.0303Z',
    filter: { x: '11.8457', y: '4.85449', width: '55.2555', height: '69.731' },
  },
  3: {
    pillPath: 'M40.2113 9.35449C49.8242 9.35464 59.8773 15.9284 59.8773 27.3594C59.8773 30.2148 59.2189 32.7648 58.1839 35.0488C60.7584 38.6186 61.6703 42.6695 61.6703 46.3047C61.6701 55.6566 56.0556 62.525 50.0296 66.3594C44.2071 70.0642 36.3239 72.0432 29.2747 70.0059C25.0099 68.7764 21.1694 66.158 19.1488 61.9209C17.1773 57.7866 17.5836 53.422 19.1576 50.0527C20.3648 47.4687 22.4426 45.0675 25.2581 43.5576C25.156 43.2154 25.0661 42.8676 24.9945 42.5137C24.8655 41.8768 24.7923 41.2413 24.7669 40.6123C22.8846 39.6894 21.1588 38.2383 19.9173 36.2461C18.1833 33.4631 17.7542 30.2077 18.4447 27.1377L18.4466 27.1279L18.4496 27.1182C20.6462 17.4534 28.9294 9.35449 40.2113 9.35449Z',
    numberPath: 'M31.7734 61.3599C22.0571 58.5649 28.5698 47.2007 34.832 52.2368C39.1299 55.6909 43.5332 53.5156 43.5332 48.8354C43.5332 45.3682 40.9756 43.562 36.625 43.1401C33.54 42.8369 32.5381 38.9478 35.6626 37.3262C40.4614 34.8345 41.9775 32.6724 41.9775 30.4575C41.9775 28.1899 40.4087 26.7134 38.0488 26.7529C35.8208 26.7925 33.9619 28.2163 32.9336 30.8003C31.5098 34.373 26.3682 32.9229 27.2251 29.1128C28.6094 23.022 33.6455 18.355 40.2109 18.355C46.3149 18.355 50.8765 22.2441 50.8765 27.3594C50.8765 29.8643 49.8745 32.145 47.9365 34.6104C46.8159 36.0342 47.0005 36.9307 48.5562 38.0381C51.6675 40.2529 52.6694 43.272 52.6694 46.3042C52.6694 57.1675 39.71 63.6538 31.7734 61.3599Z',
    filter: { x: '13.3191', y: '4.85449', width: '52.8511', height: '70.4686' },
  },
} as const;

function NumberSticker({ number }: { number: 1 | 2 | 3 }) {
  const data = numberStickers[number];
  const filterId = `filter0_d_380_34375_${number}`;
  return (
    <svg className="h-[67px] w-auto" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter={`url(#${filterId})`}>
        <path fillRule="evenodd" clipRule="evenodd" d={data.pillPath} fill="#111111" />
      </g>
      <path d={data.numberPath} fill="#FFFFFF" />
      <defs>
        <filter id={filterId} x={data.filter.x} y={data.filter.y} width={data.filter.width} height={data.filter.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="2.25" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

// ── ResearchCard: same white card + NumberSticker used in competitive analysis ─
function ResearchCard({
  number,
  icon,
  title,
  body,
  children,
}: {
  number: 1 | 2 | 3;
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-5 relative">
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
        <NumberSticker number={number} />
      </div>
      <div className="bg-white rounded-[24px] border border-[#e8e8e8] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-8 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-4">
            {icon}
            <h3 className="text-[19px] font-semibold text-[#1a1a1a]">{title}</h3>
          </div>
          <p className="text-[16px] font-normal leading-[175%] text-[#555]">{body}</p>
        </div>
        <div className="mx-8 h-px bg-[#eeeeee]" />
        {/* Visual content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Scroll-driven deck animation ─────────────────────────────────────────────
const SCROLL_PER_CARD = 600;

function getCardStyle(i: number, progress: number): {
  transform: string; opacity: number; zIndex: number; pointerEvents: 'auto' | 'none';
} {
  if (progress >= i + 1) {
    return { transform: 'translateY(-130%) scale(0.92)', opacity: 0, zIndex: 0, pointerEvents: 'none' };
  }
  if (progress > i) {
    const t = progress - i;
    const eased = t * t; // ease-in: starts slow, accelerates away
    return {
      transform: `translateY(${eased * -130}%) scale(${1 - eased * 0.08})`,
      // Stays fully visible for first 40%, then fades over remaining 60%
      opacity: Math.max(0, 1 - Math.max(0, (t - 0.4) / 0.6)),
      zIndex: 30, pointerEvents: 'none',
    };
  }
  // At rest in the deck — peek from below with 36px per depth step
  const depth = i - progress;
  return {
    transform: `translateY(${depth * 36}px) scale(${1 - depth * 0.04})`,
    opacity: depth > 2 ? 0 : 1,
    zIndex: Math.max(0, 20 - i * 10),
    pointerEvents: depth < 0.05 ? 'auto' : 'none',
  };
}

// Below this viewport height the cards won't fit, so fall back to a simple stack.
const MIN_DECK_HEIGHT = 680;
// Dead zone at the start: this many px of scroll do nothing, acting as a "bumper"
// so users who arrive while mid-scroll don't blast right past card 1.
const FIRST_CARD_DEAD_ZONE = 300;

function ResearchDeck() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [deckDisabled, setDeckDisabled] = useState(false);
  const [deckInView, setDeckInView] = useState(false);
  const aniState = useRef({ scrollP: 0, displayP: 0, animating: false, animTarget: 0, animStartP: 0, animStartTime: 0, animId: 0 });

  // Track whether the deck section is visible at all (gates MediaViewer auto-advance)
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDeckInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Enable/disable deck based on viewport height
  useEffect(() => {
    function checkSize() {
      setDeckDisabled(window.innerHeight < MIN_DECK_HEIGHT);
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    if (deckDisabled) return;
    const state = aniState.current;

    function animateTo(target: number) {
      if (state.animating && state.animTarget === target) return;
      state.animating = true;
      state.animTarget = target;
      state.animStartP = state.displayP;
      state.animStartTime = Date.now();
    }

    // Persistent tick loop — only does work when animating
    function tick() {
      if (state.animating) {
        const t = Math.min(1, (Date.now() - state.animStartTime) / 700);
        const eased = t * t * (3 - 2 * t); // smoothstep
        const newP = state.animStartP + (state.animTarget - state.animStartP) * eased;
        state.displayP = newP;
        setDisplayProgress(newP);
        if (t >= 1) {
          state.animating = false;
          state.displayP = state.animTarget;
          setDisplayProgress(state.animTarget);
        }
      }
      state.animId = requestAnimationFrame(tick);
    }

    // snappedTo: which card is currently committed (0, 1, or 2).
    // Transitions are fully automatic — any scroll past a boundary triggers the full snap.
    let snappedTo = 0;
    let prevRawP = -1;

    function onScroll() {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      // FIRST_CARD_DEAD_ZONE: first 300px of scroll does nothing — bumper so users
      // can arrive at the deck without momentum-scrolling past card 1.
      const rawP = Math.max(0, Math.min(2, (-rect.top - FIRST_CARD_DEAD_ZONE) / SCROLL_PER_CARD));
      const scrollingForward = prevRawP < 0 || rawP >= prevRawP;
      prevRawP = rawP;
      state.scrollP = rawP;

      if (state.animating) {
        // Cancel snap and reverse if user scrolls significantly backward
        if (!scrollingForward && rawP < state.animTarget - 0.5) {
          state.animating = false;
          snappedTo = state.animTarget - 1;
          animateTo(snappedTo);
        }
        return;
      }

      // Forward: snap immediately on any scroll past the current card boundary
      if (scrollingForward && rawP > snappedTo && snappedTo < 2) {
        snappedTo++;
        animateTo(snappedTo);
      }
      // Backward: snap back when user scrolls 50%+ past the previous card boundary
      else if (!scrollingForward && rawP < snappedTo - 0.5 && snappedTo > 0) {
        snappedTo--;
        animateTo(snappedTo);
      }
    }

    state.animId = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(state.animId);
    };
  }, [deckDisabled]);

  const layoutIndex = Math.min(Math.round(displayProgress), 2);

  const cards = [
    {
      number: 1 as const,
      icon: <SmsIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'Text Output Behavior',
      body: 'How text is displayed in responses — letter-by-letter, word-by-word, or all at once. Pacing and visual feedback directly impact how responsive and fast the AI feels.',
      media: [
        { src: assets.chatgptTextOutput, alt: 'ChatGPT text output', label: 'ChatGPT', caption: 'Streams text letter-by-letter, with a cursor dot as a visual reference', type: 'GIF' as const },
        { src: assets.geminiTextOutput, alt: 'Gemini text output', label: 'Gemini', caption: 'Displays the entire message almost instantaneously with a skeleton loading state', type: 'GIF' as const },
      ],
    },
    {
      number: 2 as const,
      icon: <ForumIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'Message Structure and Layout',
      body: "The visual organization and differentiation of user and AI messages. Clear hierarchy helps users easily follow the conversation and distinguish between their messages and the AI's responses.",
      media: [
        { src: assets.geminiLayout, alt: 'Gemini layout', label: 'Gemini', caption: 'User messages and LLM responses both appear on the left, differentiated by icons', type: 'Image' as const },
        { src: assets.metaAiLayout, alt: 'Meta AI layout', label: 'Meta AI', caption: 'User messages appear on the right in bubbles; LLM responses on the left', type: 'Image' as const },
      ],
    },
    {
      number: 3 as const,
      icon: <VerticalAlignTopIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'Dynamic Page Behavior',
      body: 'How the interface adapts to new messages — scrolling, anchoring, and focus management. Smooth, stable behavior ensures users can follow the conversation without losing their place.',
      media: [
        { src: assets.claudePageBehavior, alt: 'Claude page behavior', label: 'Claude', caption: 'Responses push content upward as text streams in, disrupting mid-read', type: 'GIF' as const },
        { src: assets.geminiPageBehavior, alt: 'Gemini page behavior', label: 'Gemini', caption: 'Each new message appears in a fixed section, keeping the page stable', type: 'GIF' as const },
      ],
    },
  ];

  // Fallback for short viewports: regular stacked cards, no animation, no viewport-relative image sizing
  if (deckDisabled) {
    return (
      <div className="flex flex-col gap-16">
        {cards.map((card, i) => (
          <ResearchCard key={i} number={card.number} icon={card.icon} title={card.title} body={card.body}>
            <MediaViewer items={card.media} constrained={false} />
          </ResearchCard>
        ))}
      </div>
    );
  }

  return (
    // Outer height: 100vh + 2 card exits + dead zone bumper at start
    <div ref={outerRef} style={{ height: `calc(100vh + ${SCROLL_PER_CARD * 2 + FIRST_CARD_DEAD_ZONE}px)` }}>
      {/* Sticky viewport — fills 100vh, overflow hidden clips peeking cards at viewport bottom */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        paddingTop: 80,
        paddingBottom: 48,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        {/* Card stack — relative so absolute cards are positioned against it */}
        <div style={{ position: 'relative', flex: 1 }}>
          {cards.map((card, i) => {
            const s = getCardStyle(i, displayProgress);
            return (
              <div key={i} style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: 0, left: 0, right: 0,
                willChange: 'transform, opacity',
                transform: s.transform,
                opacity: s.opacity,
                zIndex: s.zIndex,
                pointerEvents: s.pointerEvents,
              }}>
                <ResearchCard number={card.number} icon={card.icon} title={card.title} body={card.body}>
                  <MediaViewer items={card.media} active={deckInView && layoutIndex === i} />
                </ResearchCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── DesignDeck: same scroll-driven stack animation as ResearchDeck ────────────
function DesignDeck() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [deckDisabled, setDeckDisabled] = useState(false);
  const aniState = useRef({ scrollP: 0, displayP: 0, animating: false, animTarget: 0, animStartP: 0, animStartTime: 0, animId: 0 });

  useEffect(() => {
    function checkSize() { setDeckDisabled(window.innerHeight < MIN_DECK_HEIGHT); }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    if (deckDisabled) return;
    const state = aniState.current;

    function animateTo(target: number) {
      if (state.animating && state.animTarget === target) return;
      state.animating = true; state.animTarget = target;
      state.animStartP = state.displayP; state.animStartTime = Date.now();
    }

    function tick() {
      if (state.animating) {
        const t = Math.min(1, (Date.now() - state.animStartTime) / 700);
        const eased = t * t * (3 - 2 * t);
        const newP = state.animStartP + (state.animTarget - state.animStartP) * eased;
        state.displayP = newP; setDisplayProgress(newP);
        if (t >= 1) { state.animating = false; state.displayP = state.animTarget; setDisplayProgress(state.animTarget); }
      }
      state.animId = requestAnimationFrame(tick);
    }

    let snappedTo = 0, prevRawP = -1;
    function onScroll() {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const rawP = Math.max(0, Math.min(2, (-rect.top - FIRST_CARD_DEAD_ZONE) / SCROLL_PER_CARD));
      const scrollingForward = prevRawP < 0 || rawP >= prevRawP;
      prevRawP = rawP; state.scrollP = rawP;
      if (state.animating) {
        if (!scrollingForward && rawP < state.animTarget - 0.5) {
          state.animating = false; snappedTo = state.animTarget - 1; animateTo(snappedTo);
        }
        return;
      }
      if (scrollingForward && rawP > snappedTo && snappedTo < 2) { snappedTo++; animateTo(snappedTo); }
      else if (!scrollingForward && rawP < snappedTo - 0.5 && snappedTo > 0) { snappedTo--; animateTo(snappedTo); }
    }

    state.animId = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(state.animId); };
  }, [deckDisabled]);

  const cards = [
    {
      number: 1 as const,
      icon: <PlaceIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'Where should teachers access the assistant?',
      body: "If the assistant requires multiple steps to reach, it stays undiscovered. Placement determines whether the feature becomes a daily habit or a buried tool teachers forget exists.",
      decision: 'Persistent entry point in the main nav',
      decisionBody: 'Placing the assistant in the primary navigation means teachers can reach it from anywhere in the platform with a single click — no hunting, no interruption to their workflow.',
      gifSrc: assets.alwaysVisible,
      gifAlt: 'Assistant always visible in the navigation',
    },
    {
      number: 2 as const,
      icon: <ViewModuleIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'Modal overlay or dedicated page experience?',
      body: "A modal risks feeling temporary and constrained — ill-suited to the back-and-forth of a real conversation. The container shape needs to match the nature of the interaction.",
      decision: 'Dedicated full page, accessible from the primary nav',
      decisionBody: 'A full-page experience signals that the AI assistant is a first-class feature, and gives teachers the uninterrupted space they need for longer, multi-turn conversations.',
      gifSrc: assets.openingChatInterface,
      gifAlt: 'Opening the chat interface',
    },
    {
      number: 3 as const,
      icon: <InboxIcon sx={{ fontSize: 32, color: '#27b4ff' }} />,
      title: 'What should teachers see when they first open it?',
      body: "A blank text field with no context is intimidating. If teachers don't immediately understand what to ask, they'll close it without engaging — the empty state is a critical conversion moment.",
      decision: 'Personalized greeting with contextual example questions',
      decisionBody: "Greeting teachers by name and surfacing relevant starter questions makes the first interaction feel personal and immediately useful, lowering the barrier to that first message.",
      gifSrc: assets.emptyStateExample,
      gifAlt: 'Empty state with example questions',
    },
  ];

  const maxGifH = 'min(320px, calc(100vh - 560px))';

  function CardChildren({ gifSrc, gifAlt, decision, decisionBody }: { gifSrc: string; gifAlt: string; decision: string; decisionBody: string }) {
    return (
      <div>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(220,232,248,0.45)', maxHeight: deckDisabled ? '380px' : maxGifH }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gifSrc} alt={gifAlt} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eeeeee' }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8 }}>Decision</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{decision}</p>
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: '170%', color: '#777' }}>{decisionBody}</p>
        </div>
      </div>
    );
  }

  if (deckDisabled) {
    return (
      <div className="flex flex-col gap-16">
        {cards.map((card, i) => (
          <ResearchCard key={i} number={card.number} icon={card.icon} title={card.title} body={card.body}>
            <CardChildren gifSrc={card.gifSrc} gifAlt={card.gifAlt} decision={card.decision} decisionBody={card.decisionBody} />
          </ResearchCard>
        ))}
      </div>
    );
  }

  return (
    <div ref={outerRef} style={{ height: `calc(100vh + ${SCROLL_PER_CARD * 2 + FIRST_CARD_DEAD_ZONE}px)` }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', paddingTop: 80, paddingBottom: 48, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          {cards.map((card, i) => {
            const s = getCardStyle(i, displayProgress);
            return (
              <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0, willChange: 'transform, opacity', transform: s.transform, opacity: s.opacity, zIndex: s.zIndex, pointerEvents: s.pointerEvents }}>
                <ResearchCard number={card.number} icon={card.icon} title={card.title} body={card.body}>
                  <CardChildren gifSrc={card.gifSrc} gifAlt={card.gifAlt} decision={card.decision} decisionBody={card.decisionBody} />
                </ResearchCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SectionNav ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'section-intro',      label: 'Intro' },
  { id: 'section-overview',   label: 'Overview' },
  { id: 'section-research',   label: 'Research' },
  { id: 'section-design',     label: 'Design' },
  { id: 'section-reflection', label: 'Reflection' },
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

function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('section-intro');

  // Show once hero scrolls out of view
  useEffect(() => {
    const hero = document.getElementById('section-intro');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // Track active section by scroll position
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY + 80;
      let current = 'section-intro';
      NAV_SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      });
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 40);
  }

  return (
    <nav className="hidden min-[600px]:flex flex-col" style={{
      position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
      width: 100, alignItems: 'flex-end', paddingRight: 16,
      gap: 4, zIndex: 100, pointerEvents: visible ? 'auto' : 'none',
    }}>
      {NAV_SECTIONS.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => goTo(id)}
          style={{
            background: 'none', border: 'none', padding: '5px 0',
            textAlign: 'right', cursor: 'pointer',
            fontSize: 13,
            fontWeight: active === id ? 600 : 400,
            color: active === id ? '#1a1a1a' : '#aaa',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(12px)',
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

// ── MacBezel ─────────────────────────────────────────────────────────────────
function MacBezel({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Monitor body */}
      <div style={{
        background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 100%)',
        borderRadius: 14,
        padding: '10px 10px 20px',
        boxShadow: '0 2px 0 rgba(255,255,255,0.06) inset, 0 30px 80px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)',
        position: 'relative',
      }}>
        {/* Camera dot */}
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#3a3a3c',
          margin: '0 auto 8px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        }} />
        {/* Screen */}
        <div style={{
          borderRadius: 4,
          overflow: 'hidden',
          lineHeight: 0,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5) inset',
        }}>
          <img
            src={src}
            alt={alt}
            style={{ display: 'block', width: '100%', maxWidth: 760 }}
          />
        </div>
      </div>
      {/* Stand neck */}
      <div style={{
        width: 56,
        height: 38,
        background: 'linear-gradient(to bottom, #c8c8ca, #a8a8aa)',
        clipPath: 'polygon(28% 0%, 72% 0%, 82% 100%, 18% 100%)',
      }} />
      {/* Stand base */}
      <div style={{
        width: 200,
        height: 10,
        background: 'linear-gradient(to bottom, #b8b8ba, #a0a0a2)',
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }} />
    </div>
  );
}

// ── CyclingGif ───────────────────────────────────────────────────────────────
type GifItem = { src: string; alt: string; duration: number };

function CyclingGif({ items }: { items: GifItem[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [stopped, setStopped] = useState(false);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-advance timer — use GIF duration minus 300ms to prevent frame-0 flash before fade
  useEffect(() => {
    if (stopped) return;
    const t = setTimeout(() => {
      const next = (current + 1) % items.length;
      setPrev(current);
      setCurrent(next);
      // Clear prev after transition completes
      clearTimeout(prevTimerRef.current);
      prevTimerRef.current = setTimeout(() => setPrev(null), 800);
    }, items[current].duration - 300);
    return () => clearTimeout(t);
  }, [current, stopped, items]);

  // Restart current GIF on advance; clear hidden ones
  useEffect(() => {
    items.forEach((item, i) => {
      const img = imgRefs.current[i];
      if (!img) return;
      if (i === current) { img.src = ''; img.src = item.src; }
      else if (i !== prev) img.src = '';
    });
  }, [current, prev, items]);

  function captureFrame0(img: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas || img.naturalWidth === 0) return;
    const dw = img.clientWidth || img.naturalWidth;
    const dh = img.clientHeight || img.naturalHeight;
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(img, 0, 0, dw, dh);
  }

  function handleStop() {
    const img = imgRefs.current[current];
    if (img) { captureFrame0(img); img.src = ''; }
    setStopped(true);
  }

  function handlePlay() {
    const img = imgRefs.current[current];
    if (img) img.src = items[current].src;
    setStopped(false);
  }

  function getTransform(i: number) {
    if (i === current) return 'translateY(0px)';
    if (i === prev) return 'translateY(-20px)';   // exits upward
    return 'translateY(24px)';                     // waits below, ready to enter
  }

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'rgba(220,232,248,0.45)', minHeight: 660 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
          opacity: i === current ? 1 : 0,
          transform: getTransform(i),
          transition: 'opacity 0.75s ease, transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          pointerEvents: 'none',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={el => { imgRefs.current[i] = el; }}
            src={item.src}
            alt={item.alt}
            onLoad={i === current ? e => captureFrame0(e.currentTarget) : undefined}
            style={{
              display: stopped && i === current ? 'none' : 'block',
              maxWidth: '100%', maxHeight: 580,
              objectFit: 'contain', borderRadius: 10,
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            }}
          />
          {i === current && (
            <canvas ref={canvasRef} style={{
              display: stopped ? 'block' : 'none',
              maxWidth: '100%', borderRadius: 10,
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            }} />
          )}
        </div>
      ))}

      {/* GIF badge */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(0,0,0,0.5)', color: 'white',
        fontSize: 11, fontWeight: 500, letterSpacing: '0.05em',
        padding: '2px 8px', borderRadius: 6, pointerEvents: 'none',
      }}>GIF</div>

      <StopPlayButton stopped={stopped} onClick={stopped ? handlePlay : handleStop} />
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label, id }: { label?: string; id?: string }) {
  return (
    <div id={id} className="max-w-[1200px] mx-auto flex items-center h-[84px] px-10">
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NodeAIAssistantCaseStudy() {
  const ideationSentinelRef = useRef<HTMLDivElement>(null);
  const ideationWrapperRef = useRef<HTMLDivElement>(null);
  const ideationMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function check() {
      const sentinel = ideationSentinelRef.current;
      const wrapper = ideationWrapperRef.current;
      const mask = ideationMaskRef.current;
      if (!sentinel || !wrapper || !mask) return;
      const stuck = sentinel.getBoundingClientRect().top < 48
        && wrapper.getBoundingClientRect().bottom > 48;
      mask.style.display = stuck ? 'block' : 'none';
    }
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#444444] min-[600px]:pr-[100px]">

      {/* Fixed white bar — DOM-controlled (no React state) to stay in sync with scroll */}
      <div ref={ideationMaskRef} style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: 'white', zIndex: 50, pointerEvents: 'none',
      }} />

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(38,179,255,0.12)] to-white to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-0">

          {/* Company branding */}
          <div className="flex items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/case-studies/node-ai/finding-focus-logo.svg" alt="Finding Focus logo" className="h-7 w-auto" style={{ filter: 'brightness(0)' }} />
            <span className="text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '40px', fontWeight: 600, lineHeight: '110%', letterSpacing: '-1px', color: '#1a1a1a', marginBottom: '16px', maxWidth: '680px' }}>
            Finding Focus Assistant
          </h1>

          {/* Description */}
          <p className="text-[18px] font-normal leading-[170%] text-[#555] max-w-[800px] mb-10">
            My team and I designed an LLM-powered AI assistant to provide our teachers with on-demand, personalized support directly from within their interface.
          </p>

          {/* Hero illustration */}
          <HeroIllustration />

          {/* My Role / Team / Timeline */}
          <div className="grid grid-cols-3 gap-10 mt-10 pb-16 text-center">
            <div>
              <p className="text-[20px] font-semibold text-[#1a1a1a] mb-2">My Role</p>
              <p className="text-[17px] font-normal leading-[175%] text-[#555]">UX Lead</p>
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#1a1a1a] mb-2">Team</p>
              <p className="text-[17px] font-normal leading-[175%] text-[#555]">
                Mike Mrazek, Co-founder<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#1a1a1a] mb-2">Timeline</p>
              <p className="text-[17px] font-normal leading-[175%] text-[#555]">Aug – Nov 2024</p>
            </div>
          </div>

        </div>
      </header>

      <Divider label="Overview" id="section-overview" />

      {/* ── CONTEXT ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <Section
          eyebrow="Context"
          heading="Turning a grant requirement into an opportunity for personalized support."
          body="Our most successful teachers shared one common thread — direct support from our team during implementation. With grant requirements pushing us toward AI integration, we recognized that an LLM-powered assistant could provide that same hands-on support to every teacher at scale."
        >
          <VisualCard caption="Clearly we needed a way to scale our support">
            <div className="flex items-center justify-center py-12 px-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/case-studies/node-ai/teacher-reach-diagram.png" alt="Teacher reach diagram" className="w-full max-w-[520px] h-auto block" />
            </div>
          </VisualCard>
        </Section>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="User Insight"
            heading="Teachers don't like chatbots."
            body="The teachers we talked to were burned out from previous experiences with other chatbots — and for good reason. Traditional chatbots run on rigid decision trees. So when a teacher's question didn't match a pre-defined path, the conversation simply stalled — leaving them frustrated."
          >
            {/* Chatbot flow diagram */}
            <VisualCard caption="Simplified diagram showing how a traditional chatbot handles user queries">
              <div className="p-10 md:p-14 flex items-center justify-center">
                <ChatbotFlowDiagram />
              </div>
            </VisualCard>

            {/* Three failure modes — side by side, light red */}
            <div className="flex flex-col gap-3 mt-6">
              <p className="text-[12px] font-medium text-[#aaa] uppercase tracking-[1.5px] mb-1">
                Painpoints with traditional chatbots:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/image.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-[#e03030] mb-1.5">Limited Responses</p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">Reliance on decision trees creates a rigid conversational flow. If a user&apos;s input doesn&apos;t fit the pre-defined options, the chatbot gets stuck or provides unhelpful responses.</p>
                  </div>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/svg11884258658.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-[#e03030] mb-1.5">Lack of Context</p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">Chatbots struggle to grasp the overall meaning or intent behind a message, especially when the language is complex or not straightforward.</p>
                  </div>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/svg11845331731.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-[#e03030] mb-1.5">Inefficiency</p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">Users end up resorting to other options — like messaging the support team directly — which is time-consuming for everyone involved.</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Challenge callout — width capped at ~2 columns */}
          <div style={{ maxWidth: '690px' }}>
            <Callout
              accentColor="#ff8826"
              label="Our North Star"
              heading="Create a genuinely helpful assistant that provides relevant answers to any teacher question."
            />
          </div>

        </div>
      </section>

      <Divider label="Research" id="section-research" />

      {/* ── RESEARCH ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <div className="flex flex-col gap-24">

          {/* Unit 1: Two options */}
          <Section
            eyebrow="Evaluation"
            heading="Two options. One clear winner."
            body="Before anything else, Finding Focus had to decide on the 'brain' of our chat interface — the core technology that would understand and respond to user requests. I evaluated two main approaches: Rule-Based NLU systems and Large Language Model (LLM) APIs."
          >
            {/* Comparison card */}
            <div className="rounded-[24px] overflow-hidden" style={{ background: 'rgba(220,232,248,0.45)' }}>
              <div className="grid grid-cols-2 divide-x divide-[rgba(150,170,210,0.3)]">

                {/* Left: NLU */}
                <div className="p-8 flex flex-col gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/NLU.svg" alt="" className="w-8 h-8" />
                  <div>
                    <p className="text-[17px] font-semibold text-[#1a1a1a]">Rule-Based NLU APIs</p>
                    <p className="text-[13px] text-[#999] mt-0.5">Diagflow, Amazon Lex, Rasa</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#2a8a50] mb-2">Pros</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Fast', 'Accurate', 'Predictable', 'Cost Effective'].map(t => (
                          <span key={t} className="text-[13px] font-medium bg-[rgba(13,186,79,0.08)] text-[#2a8a50] rounded-full px-3 py-1">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#c03030] mb-2">Cons</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Robotic', 'Less Flexible', 'Knowledge Gaps', 'Context Blind'].map(t => (
                          <span key={t} className="text-[13px] font-medium bg-[rgba(186,13,13,0.05)] text-[#c03030] rounded-full px-3 py-1">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[15px] font-normal leading-[170%] text-[#666]">
                    Excels with well-defined interactions and predictable inputs — fast, accurate, and cost-effective. But rigid.
                  </p>
                </div>

                {/* Right: LLM — winner */}
                <div className="p-8 flex flex-col gap-5 relative">
                  <div className="absolute top-6 right-6">
                    <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-[rgba(39,180,255,0.12)] text-[#27b4ff] rounded-full px-3 py-1">Winner</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/openai.svg" alt="" className="w-8 h-8" />
                  <div>
                    <p className="text-[17px] font-semibold text-[#1a1a1a]">LLM APIs</p>
                    <p className="text-[13px] text-[#999] mt-0.5">OpenAI (GPT), Anthropic (Claude), Gemini</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#2a8a50] mb-2">Pros</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Versatile', 'Generative', 'Contextually Aware', 'Natural'].map(t => (
                          <span key={t} className="text-[13px] font-medium bg-[rgba(13,186,79,0.08)] text-[#2a8a50] rounded-full px-3 py-1">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#c03030] mb-2">Cons</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Cost', 'Less Control', 'Hallucinations', 'High Maintenance'].map(t => (
                          <span key={t} className="text-[13px] font-medium bg-[rgba(186,13,13,0.05)] text-[#c03030] rounded-full px-3 py-1">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[15px] font-normal leading-[170%] text-[#666]">
                    Provides dynamic, contextually aware responses that adapt to any query — at the cost of predictability.
                  </p>
                </div>

              </div>
            </div>
          </Section>

          {/* Winning choice */}
          <div style={{ maxWidth: '690px' }}>
            <Callout
              accentColor="#27b4ff"
              label="The Winning Choice"
              heading="LLM Powered API"
              body="OpenAI's Assistants API was the clear choice — its ability to truly understand queries, respond naturally, and connect directly to our external knowledge base made it the right fit."
              compactBody
            />
          </div>

          {/* Unit 2: Competitive analysis */}
          <Section
            eyebrow="Comparative Analysis"
            heading="Before designing anything, we did our homework."
            body="I conducted a comprehensive comparative analysis of leading LLM chat interfaces — Gemini, Claude, Meta AI, and ChatGPT — focusing on three key areas that would shape our design direction."
          />

          <ResearchDeck />

          {/* Key Insights — three ingredients */}
          <div className="flex flex-col gap-6 -mt-10">
            <div className="flex flex-col gap-3">
              <Eyebrow label="Key Insights" />
              <h2 className="text-[30px] font-semibold text-[#1a1a1a] leading-[120%]">Three ingredients for a great LLM chat experience.</h2>
              <p className="text-[18px] font-normal leading-[180%] text-[#555]">The comparative analysis of leading AI chat products revealed consistent patterns that separate frustrating experiences from genuinely effective ones — three design decisions that every LLM chat interface should get right.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
              <div className="bg-white rounded-[20px] border border-[#e8e8e8] p-6 flex flex-col gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#27b4ff]/10 flex items-center justify-center flex-shrink-0">
                  <SmsIcon sx={{ fontSize: 20, color: '#27b4ff' }} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1a1a1a] mb-2">Implement letter-by-letter text streaming</p>
                  <p className="text-[15px] font-normal leading-[170%] text-[#666]">Streaming text as it generates provides immediate visual feedback, making the assistant feel faster and more responsive than waiting for a complete response.</p>
                </div>
              </div>
              <div className="bg-white rounded-[20px] border border-[#e8e8e8] p-6 flex flex-col gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#27b4ff]/10 flex items-center justify-center flex-shrink-0">
                  <ForumIcon sx={{ fontSize: 20, color: '#27b4ff' }} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1a1a1a] mb-2">Use distinctive styling for user vs. AI messages</p>
                  <p className="text-[15px] font-normal leading-[170%] text-[#666]">Left/right message layout with user bubbles follows conventions teachers already know, making it effortless to follow the conversation without learning new patterns.</p>
                </div>
              </div>
              <div className="bg-white rounded-[20px] border border-[#e8e8e8] p-6 flex flex-col gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#27b4ff]/10 flex items-center justify-center flex-shrink-0">
                  <VerticalAlignTopIcon sx={{ fontSize: 20, color: '#27b4ff' }} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1a1a1a] mb-2">Anchor each message in a fixed section</p>
                  <p className="text-[15px] font-normal leading-[170%] text-[#666]">Keeping each exchange in its own stable container prevents the layout from shifting as text streams in — so teachers can read without losing their place.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Divider label="Design" id="section-design" />

      {/* ── DESIGN PHASE ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <div className="flex flex-col gap-12">

          <Section
            eyebrow="UX Considerations"
            heading="Designing for a teacher's first 30 seconds."
            body="With research and key insights in hand, I focused on the decisions that would define a teacher's first impression — where the assistant lives, how it opens, and what they see before typing a single word."
          />

          {/* Design iterate image container */}
          <div>
            <div className="rounded-[24px] overflow-hidden relative h-[500px] md:h-[380px] flex items-center justify-center p-8 pb-10" style={{ background: 'rgba(220,232,248,0.45)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/case-studies/node-ai/design-iterate.png" alt="Design iteration" style={{ width: '60%', height: 'auto', display: 'block' }} />
            </div>
            <div className="mt-3 flex justify-center">
              <p className="text-[13px] text-[#999]">Time to wireframe and explore different ideas</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── IDEATION: sections 1 & 2 share a sticky eyebrow; eyebrow releases at section 3 ── */}
      <div ref={ideationWrapperRef} style={{ position: 'relative' }}>

        {/* Sentinel: 0-height element at the wrapper top. The IntersectionObserver
            above detects when this scrolls within 48px of the viewport top and
            triggers the fixed white bar to fill the gap above the sticky eyebrow. */}
        <div ref={ideationSentinelRef} style={{ height: 0 }} />

        {/* Sticky "Ideation" eyebrow */}
        <div style={{
          position: 'sticky', top: 48, zIndex: 20, pointerEvents: 'none',
          background: 'white',
        }}>
          <div className="max-w-[1200px] mx-auto px-20" style={{ paddingTop: 0, paddingBottom: 16 }}>
            <Eyebrow label="Ideation" />
          </div>
        </div>

        {/* ── IDEATION: ACCESS POINT ── */}
        <section className="max-w-[1200px] mx-auto px-20 pb-28" style={{ marginTop: -16 }}>
          <div className="flex flex-col gap-12">

            <Section
              heading="Where should teachers access the assistant from?"
              body="Entry point placement shapes everything — it determines how often teachers reach for the tool, and whether it feels like a core part of the platform or an afterthought. Getting this wrong means the assistant goes unused, no matter how good the experience inside it is."
            />

            <IdeationViewer items={[
              { src: assets.ideationNavDrawerWireframe, alt: 'Dedicated tab in the nav drawer wireframe', secondSrc: assets.ideationNavDrawerComparison, secondAlt: 'Nav drawer pros and cons', label: 'Option 1 — Dedicated Tab in the Nav Drawer', caption: '' },
              { src: assets.ideationFabWireframe, alt: 'Floating action button wireframe', secondSrc: assets.ideationFabComparison, secondAlt: 'FAB pros and cons', label: 'Option 2 — Floating Action Button (FAB)', caption: '' },
            ]} />

            <Callout
              accentColor="#27b4ff"
              label="The Winning Choice"
              heading="Floating Action Button"
              body="Always reachable without pulling teachers away from what they're doing."
              compactBody
            />

          </div>
        </section>

        {/* ── IDEATION: DISPLAY FORMAT ── */}
        <section className="max-w-[1200px] mx-auto px-20 pb-28">
          <div className="flex flex-col gap-12">

            <Section
              heading="How should the assistant appear when launched?"
              body="How the assistant appears on launch had real stakes — would it feel like an interruption, could teachers easily dismiss it without losing progress, and would it give the experience enough room to work?"
            />

            <IdeationViewer items={[
              { src: assets.ideationDisplayFullscreenWireframe, alt: 'Full screen modal wireframe', secondSrc: assets.ideationDisplayFullscreenComparison, secondAlt: 'Full screen modal pros and cons', label: 'Option 1 — Full Screen Modal', caption: '' },
              { src: assets.ideationDisplayAnchoredWireframe, alt: 'Anchored modal overlay wireframe', secondSrc: assets.ideationDisplayAnchoredComparison, secondAlt: 'Anchored modal pros and cons', label: 'Option 2 — Anchored Modal Overlay', caption: '' },
              { src: assets.ideationDisplaySplitWireframe, alt: 'Split view wireframe', secondSrc: assets.ideationDisplaySplitComparison, secondAlt: 'Split view pros and cons', label: 'Option 3 — Split View', caption: '' },
            ]} />

            <Callout
              accentColor="#27b4ff"
              label="The Winning Choice"
              heading="Anchored Modal Overlay"
              body="Stays present without taking over — enough screen space to have a real conversation, without losing sight of where you are."
              compactBody
            />

          </div>
        </section>

      </div>{/* sticky eyebrow releases here — section 3 scrolls freely */}

      {/* ── IDEATION: EMPTY STATE ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <div className="flex flex-col gap-12">

          <Section
            heading="What does a teacher see before the conversation starts?"
            body="The empty state is the assistant's first impression. Get it wrong and teachers either don't know where to start, or worse — don't trust the tool enough to try. The goal was to give just enough guidance without making the experience feel scripted."
          />

          <IdeationViewer items={[
            { src: assets.ideationEmptyBlankWireframe, alt: 'Blank input wireframe', secondSrc: assets.ideationEmptyBlankComparison, secondAlt: 'Blank input pros and cons', label: 'Option 1 — Blank Input · No Suggested Questions', caption: '' },
            { src: assets.ideationEmptyTilesWireframe, alt: 'Suggested question tiles wireframe', secondSrc: assets.ideationEmptyTilesComparison, secondAlt: 'Suggested question tiles pros and cons', label: 'Option 2 — Suggested Question Tiles', caption: '' },
            { src: assets.ideationEmptyProactiveWireframe, alt: 'Proactive greeting wireframe', secondSrc: assets.ideationEmptyProactiveComparison, secondAlt: 'Proactive greeting pros and cons', label: 'Option 3 — Proactive Greeting & Response Prompts', caption: '' },
          ]} />

          <Callout
            accentColor="#27b4ff"
            label="The Winning Choice"
            heading="Suggested Question Tiles"
            body="Question tiles give teachers a clear starting point — and signal what the assistant is actually capable of from the moment it opens."
            compactBody
          />

        </div>
      </section>

      {/* ── FINAL DESIGNS ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-20">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Final Design"
            heading="Putting it all together."
            body="The three big decisions shown above — access point, display format, empty state — shaped the core design direction; however, this project also included dozens of smaller decisions that don't each merit their own section, but collectively helped shape the final experience."
          />
          {/* Hero — full width */}
          <div className="rounded-[20px] overflow-hidden bg-[rgba(220,232,248,0.45)]">
            <CyclingGif items={[
              { src: assets.openingChatInterface, alt: 'Opening the chat interface', duration: 6870 },
              { src: assets.finalDesignsHero, alt: 'Final design in use', duration: 16350 },
            ]} />
          </div>
          {/* Two-column row — 1:2 ratio, both columns scale together */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
            {/* Left — iPhone mockup (narrower) */}
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[20px] flex items-center justify-center py-12 px-6 overflow-hidden">
              <img
                src={assets.iPhoneMockup}
                alt="Mobile view of the AI assistant"
                style={{ maxHeight: 420, objectFit: 'contain', transform: 'rotate(-5deg)' }}
              />
            </div>
            {/* Right — iMac mockup (wider) */}
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[20px] flex items-end justify-center overflow-hidden px-10 pt-10">
              <img
                src={assets.iMacMockup}
                alt="Desktop view of the AI assistant"
                style={{ width: '88%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-20">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Outcomes"
            heading="What happened after launch."
            body="We didn't approach this project with explicit success metrics — the original driver was grant competitiveness. That said, the results were still meaningful: since implementing the assistant, support ticket volume has decreased by 12% compared to previous semesters. The assistant has helped teachers get answers without needing to directly reach out to our team — which was the core promise of the tool."
          />
          {/* Stat card */}
          <div className="flex">
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8 flex items-center gap-5">
              {/* Down arrow icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[rgba(79,160,230,0.12)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="#4FA0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[36px] font-bold text-[#1a1a1a] leading-none">12%</p>
                <p className="text-[14px] text-[#666] mt-1">decrease in support tickets</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider id="section-reflection" label="Reflection" />

      {/* ── REFLECTION ── */}
      <section className="max-w-[1200px] mx-auto px-20 pb-28">
        <div className="flex flex-col gap-12">

          <Section
            eyebrow="Key Takeaways"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#27b4ff] mb-3">Design Landscape</p>
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">LLM chat interfaces are still early — design around your use case, not conventions</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">There&apos;s no settled playbook for LLM chat UI yet. Patterns that work for ChatGPT don&apos;t automatically translate to a tool teachers use mid-workflow.</p>
            </div>
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#27b4ff] mb-3">What I Learned</p>
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">The depth of what goes into making an LLM actually useful surprised me</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">Working hands-on with the Assistants API — vector storage, context windows, system prompt design — gave me a much more grounded picture of what&apos;s actually happening under the hood.</p>
            </div>
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#27b4ff] mb-3">Honest Takeaway</p>
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">The assistant helps — but it doesn&apos;t replace a person</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">Teachers who onboard with a team member still see higher implementation success than those who don&apos;t. The assistant is a support layer, not a replacement for human connection.</p>
            </div>
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#27b4ff] mb-3">If I Could Do It Again</p>
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">I would have invested more in user testing — but it wasn&apos;t in the cards</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">Early-stage startup work rarely has runway for structured usability testing before shipping. It made the competitive research more load-bearing — when you can&apos;t test with users, understanding what established products got right becomes your best available signal.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <div className="h-20" />
    </div>
  );
}
