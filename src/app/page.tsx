'use client';

import { useState, useRef, useEffect, useLayoutEffect, CSSProperties } from 'react';
import Link from 'next/link';
import HalftoneCanvas from '@/components/HalftoneCanvas';
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
  const [hovered, setHovered] = useState(false);
  const highlightBg = `${cardColor}61`;   // ≈38% opacity, matches subheader highlight

  return (
    <Link
      href={href}
      data-cursor-passthrough
      className="project-card-pair"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: 'none' }}
    >
      {/* Outer card — white by default, fills with card color on hover */}
      <div
        className="project-card-outer"
        style={{
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
        <h3 style={{
          fontFamily: "var(--font-battambang), sans-serif",
          fontWeight: 700,
          fontSize: '20px',
          lineHeight: '28px',
          color: '#000',
          margin: '0 0 8px 0',
        }}>
          <span style={{
            backgroundColor: hovered ? highlightBg : 'transparent',
            borderRadius: '3px',
            padding: hovered ? '0 2px' : '0',
            transition: 'background-color 0.18s ease, padding 0.18s ease',
          }}>
            {title}
          </span>
        </h3>
        <p style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '24px',
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

  // ── Typewriter / cycling subheader ────────────────────────────────────
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [phase,       setPhase]       = useState<AnimPhase>('typing');

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
      } else {
        if (phraseIndex === PHRASES.length - 1) {
          setPhase('done');
        } else {
          const t = setTimeout(() => setPhase('highlighted'), 600);
          return () => clearTimeout(t);
        }
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

  // Click to cycle after final phrase
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
                  padding: phase === 'highlighted' ? '0 2px' : '0',
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
