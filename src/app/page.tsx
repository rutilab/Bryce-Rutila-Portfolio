'use client';

import { useState, useRef, useEffect, useLayoutEffect, CSSProperties } from 'react';
import Link from 'next/link';
import HalftoneCanvas from '@/components/HalftoneCanvas';
import HalftoneFly from '@/components/HalftoneFly';
import { AIAssistantThumbnail } from '@/components/AIAssistantThumbnail';

// ── Subheader typewriter ───────────────────────────────────────────────────
const PHRASES = [
  'turns user research into product strategy.',
  'designs for edge cases, not just the happy path.',
  'connects product decisions to user outcomes.',
  'translates ambiguity into clear product direction.',   // final
] as const;

const HIGHLIGHT_COLORS = [
  'rgba(137, 255,  18, 0.38)',
  'rgba(255, 156,  18, 0.38)',
  'rgba(255,  18, 251, 0.38)',
];

type AnimPhase = 'typing' | 'highlighted' | 'pre-typing' | 'done';

const SUBHEADER_PREFIX = 'A product designer who ';

// ── Project data ───────────────────────────────────────────────────────────
interface Project {
  title: string;
  description: string;
  tags: string[];
  readTime: string;
  cardColor: string;
  href: string;
  thumbnailContent: React.ReactNode;
}

const PROJECTS: Project[] = [
  {
    title: 'Finding Focus AI Assistant',
    description:
      "Leveraging Open AI's Chat Completions API to create an AI Assistant that ultimately helped reduce support ticket volume by 12%",
    tags: ['AI', 'UX DESIGN', 'UX RESEARCH'],
    readTime: '12 MIN READ',
    cardColor: '#ff9c12',
    href: '/case-studies/finding-focus-ai-assistant',
    thumbnailContent: <AIAssistantThumbnail />,
  },
  {
    title: 'Finding Focus Landing Page',
    description:
      "Redesigning the Finding Focus marketing site to improve conversion and communicate value across teacher and student personas",
    tags: ['UX DESIGN', 'VISUAL DESIGN', 'MARKETING'],
    readTime: '8 MIN READ',
    cardColor: '#12b4ff',
    href: '/case-studies/finding-focus-landing-page',
    thumbnailContent: (
      <img src="/case-studies/landing-page/header-and-hero.png" alt="" style={{
        position: 'absolute', inset: '8px',
        width: 'calc(100% - 16px)', height: 'calc(100% - 16px)',
        objectFit: 'cover', objectPosition: 'top center',
        display: 'block',
        borderRadius: '5px',
      }} />
    ),
  },
];

// ── Tag chip ───────────────────────────────────────────────────────────────
function Tag({ label, hovered, cardColor }: { label: string; hovered: boolean; cardColor: string }) {
  // highlight bg matches the heading/description highlight (≈38% opacity)
  const highlightBg = `${cardColor}61`;
  return (
    <span
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: '14px',
        lineHeight: '24px',
        letterSpacing: '-0.012em',
        color: hovered ? '#141510' : '#c800c2',
        backgroundColor: hovered ? highlightBg : 'transparent',
        border: `1px ${hovered ? 'solid' : 'dashed'} ${hovered ? cardColor : '#c800c2'}`,
        borderRadius: '4px',
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        transition: 'color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease',
      }}
    >
      {label}
    </span>
  );
}

// ── Clock icon ─────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8.25" stroke="#757575" strokeWidth="1.25" strokeDasharray="3.2 1.4" strokeLinecap="round" />
      <path d="M10 6v4l2.5 1.5" stroke="#757575" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Project card ───────────────────────────────────────────────────────────
function ProjectCard({ title, description, tags, readTime, cardColor, href, thumbnailContent }: Project) {
  const hoverCount = useRef(0);
  const [hovered, setHovered] = useState(false);
  const highlightBg = `${cardColor}61`;   // ≈38% opacity, matches subheader highlight

  const enter = () => { hoverCount.current++; setHovered(true); };
  const leave = () => { hoverCount.current--; if (hoverCount.current <= 0) { hoverCount.current = 0; setHovered(false); } };

  return (
    <Link
      href={href}
      className="project-card-pair"
      style={{ textDecoration: 'none', pointerEvents: 'none' }}
    >
      {/* Outer card — white by default, fills with card color on hover */}
      <div
        className="project-card-outer"
        onMouseEnter={enter}
        onMouseLeave={leave}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          backgroundColor: hovered ? cardColor : '#ffffff',
          transform: hovered ? 'scale(1.025)' : 'scale(1)',
          boxShadow: hovered
            ? '0px 6px 24px 0px rgba(0, 0, 0, 0.28)'
            : '0px 2px 12px 0px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #000',
          overflow: 'hidden',
        }}>
          {thumbnailContent}
        </div>
      </div>

      {/* Text */}
      <div className="project-card-text">
        <div onMouseEnter={enter} onMouseLeave={leave} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
          <h3 style={{
            fontFamily: "var(--font-battambang), sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '-0.04em',
            color: '#000',
            margin: '0 0 8px 0',
          }}>
            <span style={{
              backgroundColor: hovered ? highlightBg : 'transparent',
              borderRadius: '3px',
              padding: '0 2px',
              transition: 'background-color 0.18s ease',
            }}>
              {title}
            </span>
          </h3>
          <p style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.03em',
            color: '#141510',
            margin: '0 0 16px 0',
          }}>
            <span style={{
              backgroundColor: hovered ? highlightBg : 'transparent',
              borderRadius: '3px',
              transition: 'background-color 0.18s ease',
            }}>
              {description}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {tags.map(tag => (
            <Tag key={tag} label={tag} hovered={hovered} cardColor={cardColor} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClockIcon />
          <span style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '18px',
            color: '#757575',
          }}>
            {readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  // ── Hide system cursor ────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = ''; };
  }, []);

  // ── Draggable BRYCE SVG ────────────────────────────────────────────────
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setDragOffset({
        x: dragStart.current.ox + e.clientX - dragStart.current.mx,
        y: dragStart.current.oy + e.clientY - dragStart.current.my,
      });
    };
    const onUp = () => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // ── Draggable BR Flies ────────────────────────────────────────────────
  const [flyOffsets, setFlyOffsets] = useState([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ]);
  const [flyDragging, setFlyDragging] = useState<number | null>(null);
  const flyDragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const [collectedFlies, setCollectedFlies] = useState<Set<number>>(new Set());
  const [overNet, setOverNet] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; id: number } | null>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const flyMousePos = useRef({ x: 0, y: 0 });
  const confettiId = useRef(0);
  const flyAlphaMaps = useRef<Map<string, { data: Uint8Array; w: number; h: number }>>(new Map());

  const flyHitTest = (imgEl: HTMLImageElement, e: React.MouseEvent) => {
    const src = imgEl.src;
    const rect = imgEl.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    let map = flyAlphaMaps.current.get(src);
    if (!map) {
      const oc = document.createElement('canvas');
      oc.width = 100; oc.height = 100;
      const ctx = oc.getContext('2d');
      if (!ctx) return true;
      ctx.drawImage(imgEl, 0, 0, 100, 100);
      const id = ctx.getImageData(0, 0, 100, 100);
      const alpha = new Uint8Array(10000);
      for (let i = 0; i < 10000; i++) alpha[i] = id.data[i * 4 + 3];
      map = { data: alpha, w: 100, h: 100 };
      flyAlphaMaps.current.set(src, map);
    }
    if (x < 0 || x >= 100 || y < 0 || y >= 100) return false;
    return map.data[y * 100 + x] > 20;
  };

  const isOverNet = (mx: number, my: number) => {
    const netEl = netRef.current;
    if (!netEl) return false;
    const rect = netEl.getBoundingClientRect();
    return mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom;
  };

  useEffect(() => {
    if (flyDragging === null) { setOverNet(false); return; }
    const idx = flyDragging;
    const onMove = (e: MouseEvent) => {
      flyMousePos.current = { x: e.clientX, y: e.clientY };
      setOverNet(isOverNet(e.clientX, e.clientY));
      setFlyOffsets(prev => prev.map((o, i) =>
        i === idx
          ? { x: flyDragStart.current.ox + e.clientX - flyDragStart.current.mx,
              y: flyDragStart.current.oy + e.clientY - flyDragStart.current.my }
          : o
      ));
    };
    const onUp = () => {
      const mx = flyMousePos.current.x;
      const my = flyMousePos.current.y;
      if (isOverNet(mx, my)) {
        setCollectedFlies(prev => new Set(prev).add(idx));
        confettiId.current += 1;
        setConfetti({ x: mx, y: my, id: confettiId.current });
        setTimeout(() => setConfetti(null), 1000);
      }
      setFlyDragging(null);
      setOverNet(false);
      setFlyOffsets(prev => prev.map((o, i) => i === idx ? { x: 0, y: 0 } : o));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [flyDragging]);

  // ── Typewriter / cycling subheader ────────────────────────────────────
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [phase,       setPhase]       = useState<AnimPhase>('typing');
  const initialDone = useRef(false);

  // Min-height lock — prevents content below from jumping as phrases change
  const subtitleWrapRef    = useRef<HTMLDivElement>(null);
  const subtitleMeasureRef = useRef<HTMLDivElement>(null);
  const [subtitleMinH, setSubtitleMinH] = useState<number | null>(null);

  useLayoutEffect(() => {
    const wrap    = subtitleWrapRef.current;
    const measure = subtitleMeasureRef.current;
    if (!wrap || !measure) return;

    const run = () => {
      if (wrap.clientWidth < 16) return;
      let maxH = 0;
      for (const phrase of PHRASES) {
        measure.textContent = SUBHEADER_PREFIX + phrase;
        maxH = Math.max(maxH, measure.offsetHeight);
      }
      setSubtitleMinH(maxH);
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const phrase = PHRASES[phraseIndex];

    if (phase === 'typing') {
      if (charIndex < phrase.length) {
        const t = setTimeout(() => setCharIndex(c => c + 1), 45);
        return () => clearTimeout(t);
      } else if (initialDone.current) {
        const t = setTimeout(() => setPhase('done'), 600);
        return () => clearTimeout(t);
      } else if (phraseIndex === PHRASES.length - 1) {
        initialDone.current = true;
        setPhase('done');
      } else {
        const t = setTimeout(() => setPhase('highlighted'), 600);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'highlighted') {
      const t = setTimeout(() => {
        setCharIndex(0);
        setPhraseIndex(i => (i + 1) % PHRASES.length);
        setPhase('pre-typing');
      }, 700);
      return () => clearTimeout(t);
    }

    if (phase === 'pre-typing') {
      const t = setTimeout(() => setPhase('typing'), 200);
      return () => clearTimeout(t);
    }
  }, [phase, charIndex, phraseIndex]);

  // Click to cycle one phrase at a time (with highlight transition)
  const handleSubtitleClick = () => {
    if (phase !== 'done') return;
    setPhase('highlighted');
  };

  const subtitleStyle: CSSProperties = {
    fontFamily: "var(--font-inter), sans-serif",
    fontWeight: 500,
    fontSize: 'clamp(22px, 3vw, 36px)',
    lineHeight: 1.22,
    letterSpacing: '-0.06em',
    color: '#141510',
    margin: 0,
    maxWidth: '600px',
    userSelect: 'none',
  };

  return (
    <>
      <HalftoneCanvas />

      <main className="landing-main">
        {/* ── Butterfly Net (visible during drag) ─────────────────────── */}
        {flyDragging !== null && (() => {
          const flyColors = ['#12B4FF', '#31E300', '#FF12F7'];
          const c = flyColors[flyDragging] || '#12B4FF';
          return (
            <div
              ref={netRef}
              className={`butterfly-net-wrap${overNet ? ' in-zone' : ''}`}
              style={{
                '--net-glow': `${c}b3`,
                '--net-glow-soft': `${c}59`,
              } as React.CSSProperties}
            >
              <img
                src="/butterflies/butterfly-net.png"
                alt=""
                draggable={false}
                className="butterfly-net"
              />
            </div>
          );
        })()}

        {/* ── Collection confetti ──────────────────────────────────────── */}
        {confetti && (
          <div key={confetti.id} className="confetti-container" style={{ left: confetti.x, top: confetti.y }}>
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.5;
              const dist = 40 + Math.random() * 60;
              const colors = ['#12B4FF', '#31E300', '#FF12F7', '#FFD700', '#FF6B35'];
              return (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    backgroundColor: colors[i % colors.length],
                    '--cx': `${Math.cos(angle) * dist}px`,
                    '--cy': `${Math.sin(angle) * dist - 30}px`,
                    '--cr': `${Math.random() * 720 - 360}deg`,
                    animationDelay: `${Math.random() * 0.1}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}

        {/* ── BR Flies ─────────────────────────────────────────────────── */}
        <div className="br-flies-container">
          {[
            { src: '/butterflies/updated-br-fly-1.svg', cls: 'br-fly br-fly-1' },
            { src: '/butterflies/updated-br-fly-2.svg', cls: 'br-fly br-fly-2' },
            { src: '/butterflies/updated-br-fly-3.svg', cls: 'br-fly br-fly-3' },
          ].map((fly, i) => (
            <div key={i} className={`${fly.cls}${collectedFlies.has(i) ? ' br-fly-collected' : ''}`}>
              <HalftoneFly src={fly.src} collected={collectedFlies.has(i)} />
              {!collectedFlies.has(i) && (
                <img
                  src={fly.src}
                  alt=""
                  draggable={false}
                  onMouseDown={e => {
                    if (!flyHitTest(e.currentTarget, e)) return;
                    e.preventDefault();
                    flyDragStart.current = { mx: e.clientX, my: e.clientY, ox: flyOffsets[i].x, oy: flyOffsets[i].y };
                    setFlyDragging(i);
                  }}
                  onMouseMove={e => {
                    if (flyDragging === i) return;
                    const hit = flyHitTest(e.currentTarget, e);
                    e.currentTarget.style.cursor = hit ? 'grab' : 'default';
                  }}
                  style={{
                    cursor: flyDragging === i ? 'grabbing' : 'default',
                    transform: `translate(${flyOffsets[i].x}px, ${flyOffsets[i].y}px)`,
                    transition: flyDragging === i ? 'none' : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '64px' }}>

          <h1 className="howdy-heading">Howdy, I'm</h1>

          <img
            src="/name-block-together.svg"
            alt="BRYCE"
            draggable={false}
            className="bryce-svg"
            onMouseDown={e => {
              e.preventDefault();
              dragStart.current = { mx: e.clientX, my: e.clientY, ox: dragOffset.x, oy: dragOffset.y };
              setIsDragging(true);
            }}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              zIndex: isDragging ? 50 : undefined,
            }}
          />

          {/* Animated subheader — wrapper locks height so content below doesn't jump */}
          <div
            ref={subtitleWrapRef}
            style={{ position: 'relative', minHeight: subtitleMinH ?? undefined, maxWidth: '600px' }}
          >
            {/* Hidden measurement div */}
            <div
              ref={subtitleMeasureRef}
              aria-hidden
              style={{
                ...subtitleStyle,
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                top: 0,
                left: 0,
              }}
            />

            <p
              className="subheader-text"
              onClick={handleSubtitleClick}
              style={{ cursor: phase === 'done' ? 'pointer' : 'default' }}
            >
              {SUBHEADER_PREFIX}
              <span
                style={{
                  backgroundColor:
                    phase === 'highlighted'
                      ? HIGHLIGHT_COLORS[phraseIndex % HIGHLIGHT_COLORS.length]
                      : 'transparent',
                  borderRadius: '3px',
                  padding: '0 2px',
                  transition: 'background-color 0.08s ease',
                }}
              >
                {PHRASES[phraseIndex].slice(0, charIndex)}
              </span>
              {(phase === 'typing' || phase === 'pre-typing') && (
                <span
                  aria-hidden="true"
                  className="cursor-blink"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1em',
                    background: '#141510',
                    borderRadius: '1px',
                    marginLeft: '1px',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </p>
          </div>
        </section>

        {/* ── Featured Projects ──────────────────────────────────────────── */}
        <section className="projects-section">

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
              <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: '15px', lineHeight: '1', color: '#141510' }}>✳</span>
              <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: '14px', lineHeight: '24px', color: '#141510' }}>FEATURED PROJECTS</span>
            </div>
            <div style={{ borderBottom: '1px dashed rgba(0,0,0,0.3)' }} />
          </div>

          <div className="projects-grid">
            {PROJECTS.map((p, i) => <ProjectCard key={i} {...p} />)}
          </div>
        </section>
      </main>
    </>
  );
}
