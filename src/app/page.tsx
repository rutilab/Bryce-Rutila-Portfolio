'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import HalftoneCanvas from '@/components/HalftoneCanvas';
import HalftoneFly from '@/components/HalftoneFly';
import { AIAssistantThumbnail } from '@/components/AIAssistantThumbnail';
import { MilestoneThumbnail } from '@/components/MilestoneThumbnail';
import { IdeationChip } from '@/components/IdeationChip';
import { IridescentText } from '@/components/IridescentText';
import { IridescentEyebrow } from '@/components/IridescentEyebrow';
import Loader from '@/components/Loader';
import CaterpillarFooter from '@/components/CaterpillarFooter';
import { registerBrFlyRefill } from '@/lib/brFlyRefill';
import { Toast } from '@/components/Toast';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

const BR_FLY_SRCS = [
  '/butterflies/updated-br-fly-1.svg',
  '/butterflies/updated-br-fly-2.svg',
  '/butterflies/updated-br-fly-3.svg',
] as const;

/** Accent for net glow — keyed to the fly art, not the slot index */
function colorForFlySrc(src: string): string {
  if (src.includes('fly-1')) return '#12B4FF';
  if (src.includes('fly-2')) return '#31E300';
  if (src.includes('fly-3')) return '#FF12F7';
  return '#12B4FF';
}

// Module-level flag: resets on real page reload (module re-imported), persists across SPA remounts
let _loaderHasRun = false;

// ── Blend a hex color at given opacity onto a solid background ─────────────
function solidHighlight(hex: string, alpha: number, bg = '#faf7f2'): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [fr, fg, fb] = parse(hex);
  const [br, bg_g, bb] = parse(bg);
  const blend = (f: number, b: number) => Math.round(b * (1 - alpha) + f * alpha);
  return `#${[blend(fr, br), blend(fg, bg_g), blend(fb, bb)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/** BRYCE hover wash — shared across all project cards so colors rotate in order */
const PROJECT_HOVER_COLORS = [
  '#FF9C12', // orange
  '#12B4FF', // blue
  '#FFF712', // yellow
  '#FF12F7', // pink
  '#31E300', // green
] as const;

/** Last color index shown on any card; -1 so the first hover starts at orange */
let lastProjectHoverColorIdx = -1;

function nextProjectHoverColor(): string {
  lastProjectHoverColorIdx =
    (lastProjectHoverColorIdx + 1) % PROJECT_HOVER_COLORS.length;
  return PROJECT_HOVER_COLORS[lastProjectHoverColorIdx];
}

// ── Project data ───────────────────────────────────────────────────────────
interface Project {
  title: string;
  eyebrow?: string;
  description: string;
  tags: string[];
  readTime: string;
  cardColor: string;
  /** Omitted for projects with nothing to link to yet — see `comingSoon`. */
  href?: string;
  thumbnailContent: React.ReactNode;
  /**
   * Marks a card with no case study behind it. Such a card drops every hover
   * affordance — it must not look pressable — and says so on contact instead:
   * a tag on the cursor where there is a pointer, a toast on tap where there
   * isn't.
   */
  comingSoon?: boolean;
}

/** Shown by the cursor tag and the touch toast alike, so both say one thing. */
const COMING_SOON_LABEL = 'Coming Soon 👀';

const PROJECTS: Project[] = [
  {
    title: 'Focus Coach End-of-Session Flow',
    eyebrow: 'FINDING FOCUS • 2026',
    description:
      "Redesigning a study tool's end-of-session flow to celebrate progress and turn first-time users into daily habit-builders.",
    tags: ['UX DESIGN', 'GAMIFICATION', 'ANIMATION'],
    readTime: '10-12 MIN READ',
    cardColor: '#31e300',
    href: '/case-studies/focus-coach-achievements',
    thumbnailContent: <MilestoneThumbnail />,
  },
  {
    title: 'Finding Focus AI Assistant',
    eyebrow: 'FINDING FOCUS • 2024',
    description:
      "Leveraging OpenAI's Chat Completions API to build an AI Assistant that scales 1:1 support across our entire teacher base.",
    tags: ['AI', 'UX DESIGN', 'UX RESEARCH'],
    readTime: '12-15 MIN READ',
    cardColor: '#ff9c12',
    href: '/case-studies/finding-focus-ai-assistant',
    thumbnailContent: <AIAssistantThumbnail />,
  },
];

// ── Scrabble tiles with shuffle animation ──────────────────────────────────
const SCRABBLE_LETTERS = ['W', 'O', 'R', 'D', 'S'] as const;
const TILE_W = 64;
const TILE_GAP = 3;
const TILE_STRIDE = TILE_W + TILE_GAP;
// slots[i] = which visual slot letter[i] occupies
const WORDS_SLOTS = [0, 1, 2, 3, 4];          // W-O-R-D-S in order
const SWORD_SLOTS = [1, 2, 3, 4, 0];           // S-W-O-R-D (S steals slot 0)

function fisher_yates(): number[] {
  const arr = [0, 1, 2, 3, 4];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type TilePhase = 'init' | 'reveal' | 'hover' | 'return';

function ScrabbleTiles() {
  const [slots, setSlots]         = useState<number[]>(WORDS_SLOTS);
  const [rotations, setRotations] = useState<number[]>([0, 0, 0, 0, 0]);
  const [phase, setPhase]         = useState<TilePhase>('init');
  const [revealed, setRevealed]   = useState(false);
  const hoverCount  = useRef(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const totalW = SCRABBLE_LETTERS.length * TILE_W + (SCRABBLE_LETTERS.length - 1) * TILE_GAP;

  // On mount: jump instantly to a random scramble (below the fold — no flash)
  useEffect(() => {
    setSlots(fisher_yates());
    setRotations([...Array(5)].map(() => (Math.random() - 0.5) * 18));
  }, []);

  // When the tiles scroll into view → cascade into correct W-O-R-D-S order
  useEffect(() => {
    const el = containerRef.current;
    if (!el || revealed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          setPhase('reveal');
          setSlots(WORDS_SLOTS);
          setRotations([0, 0, 0, 0, 0]);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  const onEnter = () => {
    if (!revealed) return;
    hoverCount.current += 1;
    setPhase('hover');
    // Exactly the 3rd hover: spell SWORD; all others (including beyond 3) are random
    const newSlots = hoverCount.current === 3 ? [...SWORD_SLOTS] : fisher_yates();
    setSlots(newSlots);
    setRotations([...Array(5)].map(() => (Math.random() - 0.5) * 24));
  };

  const onLeave = () => {
    setPhase('return');
    setSlots(WORDS_SLOTS);
    setRotations([0, 0, 0, 0, 0]);
  };

  return (
    <span
      ref={containerRef}
      className="endorsements-tiles"
      style={{ position: 'relative', display: 'inline-block', width: totalW, height: TILE_W }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {SCRABBLE_LETTERS.map((letter, i) => {
        const homeX   = i * TILE_STRIDE;
        const targetX = slots[i] * TILE_STRIDE;
        const dx = targetX - homeX;

        let transition: string;
        if (phase === 'init') {
          transition = 'none';                                                               // instant scramble on mount
        } else if (phase === 'reveal') {
          transition = `transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 70}ms`;    // W first → S last
        } else if (phase === 'hover') {
          transition = `transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 45}ms`;    // cascade left → right
        } else {
          transition = `transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) ${(4 - i) * 30}ms`; // snap back right → left
        }

        return (
          <img
            key={letter}
            src={`/scrabble-tiles/${letter}.svg`}
            alt={letter}
            draggable={false}
            style={{
              position: 'absolute',
              top: 0,
              left: homeX,
              width: TILE_W,
              height: TILE_W,
              transform: `translateX(${dx}px) rotate(${rotations[i]}deg)`,
              transition,
              willChange: 'transform',
            }}
          />
        );
      })}
    </span>
  );
}

// ── Endorsement data ───────────────────────────────────────────────────────
interface Endorsement {
  name: string;
  role: string;
  company: string;
  quote: string;
  fullQuote?: string[];
  initials: string;
  avatarColor: string;
  avatarImg?: string;
  linkedIn: string;
  highlightPhrases: string[];
  highlightColor: string; // pre-blended opaque hex — no stacking artifacts
  /** Accent the card's background gradient fades to. From the Figma
   *  "Aug 18th Updates" frame: green / blue / pink in card order. */
  gradientAccent: string;
}

const ENDORSEMENTS: Endorsement[] = [
  {
    name: 'Mike Mrazek',
    role: 'Co-Founder',
    company: 'Finding Focus',
    quote: 'Bryce is a deeply thoughtful designer who truly cares about creating great experiences for users. After working with him, nearly every aspect of our product has significantly improved. And beyond his considerable UX/UI skills, he is also a kind and principled person.',
    initials: 'MM',
    avatarColor: '#ff9c12',
    avatarImg: '/endorsements/mike-mrozak.png',
    linkedIn: 'https://www.linkedin.com/in/michael-mrazek-32209b61/',
    // #FFF712 yellow at 0.35 alpha blended onto #faf7f2
    highlightColor: '#fcf7a4',
    gradientAccent: '#31E300',
    highlightPhrases: [
      'deeply thoughtful designer',
      'nearly every aspect of our product has significantly improved',
      'kind and principled person',
    ],
  },
  {
    name: 'Yaning Zhu',
    role: 'UX Researcher',
    company: 'Finding Focus',
    quote: "As the solo UX designer on the team, Bryce meticulously designed every aspect of Finding Focus, ensuring a responsive, cohesive, and user-friendly experience. Bryce's dedication, expertise, and collaborative spirit make him an outstanding UX designer with excellent UX research craft.",
    initials: 'YZ',
    avatarColor: '#12b4ff',
    avatarImg: '/endorsements/yanting-zhu.png',
    linkedIn: 'https://www.linkedin.com/in/yaningzhuyolo/',
    fullQuote: [
      "It was my pleasure to work closely with Bryce at UT's Applied Psychology Lab for the Finding Focus product. As a solo UX designer on our team, Bryce's contributions were instrumental in shaping the success of our projects.",
      "I had the opportunity to collaborate with Bryce on several projects. When I took notes for him during focus groups and user interviews, his active listening and insightful follow-up questions demonstrated his exceptional interviewing skills.",
      "As the solo UX designer on the team, Bryce meticulously designed every aspect of the Finding Focus, ensuring a responsive, cohesive, and user-friendly experience. This required a deep understanding of technical aspects and UX design principles. Also, he skillfully navigated differing opinions from the product manager and software engineer, always advocating for the users. His ability to balance these dynamics with product thinking was impressive and critical to our success. When we encountered challenges while designing the teacher resources page, Bryce's creativity and determination led to a successful outcome.",
      "Bryce's dedication, expertise, and collaborative spirit make him an outstanding UX designer with excellent UX research craft. I highly recommend him for any future endeavors and am confident that he will continue to excel and make significant contributions in his field.",
    ],
    // #FF12F7 pink at 0.35 alpha blended onto #faf7f2
    highlightColor: '#fca7f4',
    gradientAccent: '#12B4FF',
    highlightPhrases: [
      'meticulously designed every aspect of Finding Focus',
      'responsive, cohesive, and user-friendly experience',
      'dedication, expertise, and collaborative spirit',
    ],
  },
  {
    name: 'Nathan Godderis',
    role: 'Director of Outreach',
    company: 'Finding Focus',
    quote: "Bryce is easily one of the most talented UX designers I've ever met. He is attuned to the needs of the user and grounds his designs in a deep understanding of psychology and behavioral science. He is incredibly skilled in infusing the company's ethos, the user's needs, and his own creative vision into one amazing end product.",
    initials: 'NG',
    avatarColor: '#31E300',
    avatarImg: '/endorsements/nathan-godderis.jpeg',
    linkedIn: 'https://www.linkedin.com/in/nathan-godderis/?skipRedirect=true',
    fullQuote: [
      "Bryce is easily one of the most talented UX designers I've ever met. When we worked together, I was amazed by the creativity behind every design he proposed to me, and I would love to come to his desk to see what he was working on. Whenever he showed me his drafts, I often told him \"this is the one!\", not imagining the design could get any better, until he approached me later with a revision that would blow me away. He has the mind of an ambitious professional with the heart of an artist, and he devotes himself deeply to the project he is a part of.",
      "He is also very attuned to the needs of the user, and grounds his designs in a deep understanding of psychology and behavioral science. He is incredibly skilled in infusing the company's ethos, the user's needs, and his own creative vision into one amazing end product. In our case, we were working on a new feature called \"focus sesh\", and throughout its many iterations, Bryce was highly flexible, timely, and innovative, creating a final product that was better than the team could've anticipated.",
    ],
    // #31E300 green at 0.35 alpha blended onto #faf7f2
    highlightColor: '#b4f09d',
    gradientAccent: '#FF12F7',
    highlightPhrases: [
      'most talented UX designers',
      'attuned to the needs of the user',
      'deep understanding of psychology and behavioral science',
      "infusing the company's ethos, the user's needs, and his own creative vision",
    ],
  },
];

/* Bottom padding of an endorsement card. Cards with a full quote grow to the
   hover value to make room for the "View full quote" button; the height
   equalizer reserves that larger value up front so hovering never reflows the
   page (which would push the footer down). */
const CARD_PAD_BOTTOM = '24px';
const CARD_PAD_BOTTOM_HOVER = '52px';


// ── Endorsement card ───────────────────────────────────────────────────────
function EndorsementCard({ name, role, company, quote, fullQuote, initials, avatarColor, avatarImg, linkedIn, gradientAccent }: Endorsement) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = 'hidden';
    document.body.dataset.modalOpen = 'true';
    const preventScroll = (e: Event) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'clip';
      delete document.body.dataset.modalOpen;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', onKey);
      setCloseHovered(false);
    };
  }, [modalOpen]);

  const avatarEl = (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      backgroundColor: avatarImg ? 'transparent' : avatarColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {avatarImg ? (
        <img src={avatarImg} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', letterSpacing: '0.01em' }}>{initials}</span>
      )}
    </div>
  );

  const nameRowEl = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {avatarEl}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
        <span className="endorsement-name-wrap">
          <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="endorsement-name-link">{name}</a>
        </span>
        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 400, fontStyle: 'italic', fontSize: '12px', lineHeight: '18px', color: '#383b2e' }}>{role} · {company}</span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="endorsement-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative', paddingBottom: fullQuote && hovered ? CARD_PAD_BOTTOM_HOVER : CARD_PAD_BOTTOM, transition: 'padding-bottom 0.2s ease', ['--endorsement-accent' as string]: gradientAccent } as React.CSSProperties}
      >
        {/* Hover emoji — pops in at top-right */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, lineHeight: 1,
          transform: hovered ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-20deg)',
          opacity: hovered ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
          pointerEvents: 'none', userSelect: 'none',
        }}>🙌</div>

        {nameRowEl}

        {/* Quote with animated highlights */}
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 400, fontSize: '16px', lineHeight: '24px', letterSpacing: '-0.48px', color: '#141510', margin: 0 }}>
          {quote}
        </p>

        {/* View full quote button — appears on hover */}
        {fullQuote && (
          <button
            onClick={e => { e.stopPropagation(); setModalOpen(true); }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              position: 'absolute', bottom: 16, right: 16,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease, background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: '11px',
              color: buttonHovered ? '#fff' : '#141510',
              backgroundColor: buttonHovered ? '#141510' : 'transparent',
              border: '1px solid #141510',
              borderRadius: '20px',
              padding: '5px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            View full quote
          </button>
        )}
      </div>

      {/* Full quote modal — portaled to <body>. .landing-main is
          position:relative + z-index:1, which makes it a stacking context, so a
          modal rendered inside it can never paint above the sibling .landing-footer
          no matter how high its z-index. Portaling lifts it out to the root
          stacking context where zIndex 300 actually wins. */}
      {modalOpen && fullQuote && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(20, 21, 16, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="endorsement-card"
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '560px', width: '100%' }}
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 28, height: 28,
                background: closeHovered ? '#141510' : 'transparent',
                border: '1px solid #141510',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px',
                color: closeHovered ? '#fff' : '#141510',
                padding: 0, flexShrink: 0,
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >✕</button>

            {nameRowEl}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fullQuote.map((para, i) => (
                <p key={i} style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 400, fontSize: '16px', lineHeight: '24px', letterSpacing: '-0.48px', color: '#141510', margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Tag chip ───────────────────────────────────────────────────────────────
function Tag({ label, hovered, cardColor }: { label: string; hovered: boolean; cardColor: string }) {
  const highlightBg = solidHighlight(cardColor, 0.38);
  return (
    <span
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: '14px',
        lineHeight: '24px',
        letterSpacing: '-0.012em',
        color: '#141510',
        backgroundColor: hovered ? highlightBg : 'transparent',
        border: `1px ${hovered ? 'solid' : 'dashed'} ${hovered ? cardColor : '#141510'}`,
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
function ProjectCard({ title, eyebrow, description, tags, readTime, href, thumbnailContent, comingSoon }: Project) {
  /** Mirrors `hovered` for the handlers, which run outside React's render pass. */
  const hoveredRef = useRef(false);
  /** Pending un-hover, cancelled if the pointer lands on the card's other half. */
  const leaveTimer = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [hoverColor, setHoverColor] = useState<string>(PROJECT_HOVER_COLORS[0]);
  const [toastOpen, setToastOpen] = useState(false);
  const canHover = useCanPrimaryHover();
  const highlightBg = solidHighlight(hoverColor, 0.38);

  useEffect(() => () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
  }, []);

  const enter = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = 0;
    }
    // Only advance the colour on a fresh hover, never when crossing between the
    // artwork and the copy — a re-roll mid-card is the flicker this avoids.
    if (hoveredRef.current) return;
    hoveredRef.current = true;
    setHoverColor(nextProjectHoverColor());
    setHovered(true);
  };
  const leave = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    // Deferred by a beat: leaving one half fires before entering the other, so an
    // immediate un-hover would blink the highlight off between them.
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = 0;
      hoveredRef.current = false;
      setHovered(false);
    }, 90);
  };

  // A coming-soon card is inert: no navigation, and none of the hover wiring
  // below, so `hovered` stays false and every hover style resolves to its
  // resting value. The tag on the cursor is what tells you where you are.
  const hoverProps = comingSoon ? {} : { onMouseEnter: enter, onMouseLeave: leave };

  /**
   * The artwork alone answers for a coming-soon card. The copy beneath it is
   * plain text — no tag on the cursor, no toast on tap — so nothing below the
   * card behaves like a link.
   */
  const comingSoonProps = comingSoon
    ? {
        'data-cursor-label': COMING_SOON_LABEL,
        // Touch has no hover to read the tag, so the same message arrives after
        // the tap instead. On a mouse the tag has already said it.
        onClick: canHover ? undefined : () => setToastOpen(true),
      }
    : {};

  const body = (
    <>
      {/* Outer card — white by default, fills with rotating BRYCE color on hover */}
      <div
        className="project-card-outer"
        {...hoverProps}
        {...comingSoonProps}
        style={{
          pointerEvents: 'auto',
          backgroundColor: hovered ? hoverColor : '#fdfbf9',
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
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '2px solid #000',
          overflow: 'hidden',
        }}>
          {thumbnailContent}
        </div>
      </div>

      {/* Text */}
      <div className="project-card-text">
        <div className="project-card-copy" {...hoverProps} style={{ pointerEvents: 'auto' }}>
          {eyebrow && (
            <p style={{
              fontFamily: "var(--font-battambang), sans-serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 'normal',
              letterSpacing: '-0.168px',
              color: '#141510',
              margin: '0 0 8px 0',
            }}>
              <span style={{
                backgroundColor: hovered ? highlightBg : 'transparent',
                borderRadius: '3px',
                padding: '0 2px',
                transition: 'background-color 0.18s ease',
              }}>
                {eyebrow}
              </span>
            </p>
          )}
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
            <Tag key={tag} label={tag} hovered={hovered} cardColor={hoverColor} />
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
    </>
  );

  if (comingSoon) {
    return (
      <>
        <div className="project-card-pair" style={{ pointerEvents: 'none' }}>
          {body}
        </div>
        <Toast
          message={COMING_SOON_LABEL}
          open={toastOpen}
          onDismiss={() => setToastOpen(false)}
        />
      </>
    );
  }

  return (
    <Link
      href={href ?? '#'}
      className="project-card-pair"
      style={{ textDecoration: 'none', pointerEvents: 'none' }}
    >
      {body}
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  // ── Endorsement card height equalization ─────────────────────────────
  // Measures the tallest card at natural (un-hovered) size and locks that
  // as min-height on every card. align-items:start means only the hovered
  // card grows beyond min-height — siblings stay pinned.
  // We use a window resize listener (not ResizeObserver on the grid) so
  // hover-driven growth never triggers a re-measurement.
  const endorsementsGridRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const equalize = () => {
      const grid = endorsementsGridRef.current;
      if (!grid) return;
      // `:scope >` restricts this to the real grid cards. The full-quote modal
      // reuses .endorsement-card for its styling and is a DOM descendant of the
      // grid, so an unscoped query would measure it too and lock every card to
      // the modal's height.
      const cards = Array.from(grid.querySelectorAll<HTMLElement>(':scope > .endorsement-card'));
      if (!cards.length) return;

      // padding-bottom is transitioned, so both measurements have to be taken
      // with transitions off — otherwise offsetHeight reports the pre-transition
      // height and we'd read the resting size twice.
      const prevPad = cards.map(c => c.style.paddingBottom);
      const prevTransition = cards.map(c => c.style.transition);
      // Both padding values are forced explicitly rather than read from the
      // current state — a card being hovered while this runs (e.g. the user
      // resizes mid-hover) would otherwise be measured at its expanded padding
      // and inflate the resting baseline.
      cards.forEach(c => {
        c.style.transition = 'none';
        c.style.minHeight = '';
        c.style.paddingBottom = CARD_PAD_BOTTOM;
      });

      // 1. Resting height — tallest card at its normal (tight) padding. Applied
      //    to every card so the row reads as one even band at rest.
      const restH = cards.reduce((m, c) => Math.max(m, c.offsetHeight), 0);
      cards.forEach(c => { c.style.minHeight = restH + 'px'; });

      // 2. Hovered height — the same cards at the padding they grow to for the
      //    "View full quote" button.
      cards.forEach(c => {
        if (c.querySelector('button')) c.style.paddingBottom = CARD_PAD_BOTTOM_HOVER;
      });
      const hoverH = cards.reduce((m, c) => Math.max(m, c.offsetHeight), 0);

      cards.forEach((c, i) => {
        c.style.paddingBottom = prevPad[i];
        void c.offsetHeight; // flush the restore before transitions come back
        c.style.transition = prevTransition[i];
      });

      // Reserve the hover growth on the grid *row*, not on the cards: the cards
      // stay tight at rest (align-items:start keeps them top-aligned) and a
      // hovered card expands into row space that already existed, so the grid
      // never changes height and the footer never moves. Touch devices can't
      // hover, so they get no reserve and no extra whitespace.
      const canHover = window.matchMedia('(hover: hover)').matches;
      grid.style.gridAutoRows = canHover && hoverH > 0 ? hoverH + 'px' : '';
    };
    equalize();
    window.addEventListener('resize', equalize);
    return () => window.removeEventListener('resize', equalize);
  }, []);

  // ── Loader state ──────────────────────────────────────────────────────
  type LoaderState = 'checking' | 'showing' | 'done';
  const [loaderState, setLoaderState] = useState<LoaderState>('checking');
  const [animReady, setAnimReady] = useState(false);
  const heroSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (_loaderHasRun) {
      setLoaderState('done');
      setAnimReady(true);
      return;
    }
    _loaderHasRun = true;
    setLoaderState('showing');
  }, []);

  // Delay idle letter animations 3.5s after loader ends
  useEffect(() => {
    if (loaderState !== 'done') return;
    const t = setTimeout(() => setAnimReady(true), 3500);
    return () => clearTimeout(t);
  }, [loaderState]);

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
  /** Per-slot art — can change when a slingshot fly fills a vacant spot */
  const [flySrcs, setFlySrcs] = useState<string[]>([...BR_FLY_SRCS]);
  const [justFilledFly, setJustFilledFly] = useState<number | null>(null);
  const [shakingFly, setShakingFly] = useState<number | null>(null);
  const [overNet, setOverNet] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; id: number } | null>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const flySlotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const flyMousePos = useRef({ x: 0, y: 0 });
  const confettiId = useRef(0);
  const flyAlphaMaps = useRef<Map<string, { data: Uint8Array; w: number; h: number }>>(new Map());
  const collectedFliesRef = useRef(collectedFlies);
  const flyDraggingRef = useRef(flyDragging);
  const lastShookFlyRef = useRef<number | null>(null);
  collectedFliesRef.current = collectedFlies;
  flyDraggingRef.current = flyDragging;

  const triggerConfetti = (x: number, y: number) => {
    confettiId.current += 1;
    const id = confettiId.current;
    setConfetti({ x, y, id });
    window.setTimeout(() => {
      setConfetti((cur) => (cur?.id === id ? null : cur));
    }, 1000);
  };
  const triggerConfettiRef = useRef(triggerConfetti);
  triggerConfettiRef.current = triggerConfetti;

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
        triggerConfetti(mx, my);
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

  // Occasional attention shake — one fly at a time, 3.5–6.5s apart
  useEffect(() => {
    if (loaderState !== 'done') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let waitTimer = 0;
    let clearTimer = 0;
    let cancelled = false;

    const schedule = () => {
      const delay = 3500 + Math.random() * 3000; // 3.5–6.5s
      waitTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (flyDraggingRef.current !== null) {
          schedule();
          return;
        }

        const mobile = window.matchMedia('(max-width: 799px)').matches;
        const available = [0, 1, 2].filter((i) => {
          if (collectedFliesRef.current.has(i)) return false;
          if (mobile && i === 0) return false; // blue fly hidden on small screens
          return true;
        });
        if (available.length === 0) return;

        let pool = available;
        if (available.length > 1 && lastShookFlyRef.current != null) {
          const withoutLast = available.filter((i) => i !== lastShookFlyRef.current);
          if (withoutLast.length) pool = withoutLast;
        }

        const pick = pool[Math.floor(Math.random() * pool.length)];
        lastShookFlyRef.current = pick;
        setShakingFly(pick);

        clearTimer = window.setTimeout(() => {
          if (!cancelled) setShakingFly(null);
          if (!cancelled) schedule();
        }, 700);
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(waitTimer);
      window.clearTimeout(clearTimer);
    };
  }, [loaderState]);

  // Register vacant hero slots so slingshot flies can refill them
  useEffect(() => {
    registerBrFlyRefill({
      getVacantSlots: () => {
        const slots: { index: number; cx: number; cy: number }[] = [];
        collectedFliesRef.current.forEach((index) => {
          const el = flySlotRefs.current[index];
          if (!el) return;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          slots.push({
            index,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
          });
        });
        return slots;
      },
      fillSlot: (index, src) => {
        const el = flySlotRefs.current[index];
        let cx = window.innerWidth / 2;
        let cy = window.innerHeight / 3;
        if (el) {
          const r = el.getBoundingClientRect();
          cx = r.left + r.width / 2;
          cy = r.top + r.height / 2;
        }

        setFlySrcs((prev) => {
          const next = [...prev];
          next[index] = src;
          return next;
        });
        setCollectedFlies((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        // Reset drag offset so the fly sits cleanly in-slot
        setFlyOffsets((prev) => prev.map((o, i) => (i === index ? { x: 0, y: 0 } : o)));
        setJustFilledFly(index);
        window.setTimeout(() => {
          setJustFilledFly((cur) => (cur === index ? null : cur));
        }, 450);

        triggerConfettiRef.current(cx, cy);
      },
    });
    return () => registerBrFlyRefill(null);
  }, []);

  return (
    <>
      {/* White screen blocks flash during SSR→hydration before loader mounts */}
      {loaderState !== 'done' && (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#faf7f2', pointerEvents: 'none' }} />
      )}
      {loaderState === 'showing' && (
        <Loader heroRef={heroSvgRef} onComplete={() => setLoaderState('done')} />
      )}
      <HalftoneCanvas cursorMode="magnet" />

      <main className="landing-main">
        {/* ── Butterfly Net (visible during drag) ─────────────────────── */}
        {flyDragging !== null && (() => {
          const c = colorForFlySrc(flySrcs[flyDragging] ?? BR_FLY_SRCS[flyDragging]);
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

        {/* ── Collection confetti (portaled so it sits above hero chrome) ─ */}
        {confetti &&
          createPortal(
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
            </div>,
            document.body,
          )}

        {/* ── BR Flies ─────────────────────────────────────────────────── */}
        <div className="br-flies-container">
          {BR_FLY_SRCS.map((_, i) => (
            <div
              key={i}
              ref={(el) => { flySlotRefs.current[i] = el; }}
              className={`br-fly br-fly-${i + 1}${collectedFlies.has(i) ? ' br-fly-collected' : ''}${flyDragging === i ? ' is-dragging' : ''}${shakingFly === i ? ' br-fly-shake' : ''}${justFilledFly === i ? ' br-fly-just-filled' : ''}`}
            >
              <HalftoneFly src={flySrcs[i]} collected={collectedFlies.has(i)} />
              {!collectedFlies.has(i) && (
                <img
                  src={flySrcs[i]}
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
                    // 'none' over the transparent part of the sprite so the drawn
                    // cursor shows there instead of a stray system arrow
                    e.currentTarget.style.cursor = hit ? 'grab' : 'none';
                  }}
                  style={{
                    cursor: flyDragging === i ? 'grabbing' : 'none',
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

          <h1 className="howdy-heading">Hello, I'm</h1>

          <svg
            ref={heroSvgRef}
            width="604"
            height="152"
            viewBox="0 0 604 152"
            fill="none"
            overflow="visible"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="BRYCE"
            role="img"
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
              userSelect: 'none',
              opacity: loaderState !== 'done' ? 0 : 1,
            }}
          >
            <style>{`
              .letter {
                transform-box: fill-box;
                transform-origin: center bottom;
              }
              @keyframes bryce-b {
                0%   { transform: translateY(0) rotate(0deg); }
                8%   { transform: translateY(-4px) rotate(-0.8deg); }
                18%  { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(0) rotate(0deg); }
              }
              @keyframes bryce-r {
                0%   { transform: rotate(0deg); }
                6%   { transform: rotate(1.5deg); }
                12%  { transform: rotate(-1deg); }
                18%  { transform: rotate(0deg); }
                100% { transform: rotate(0deg); }
              }
              @keyframes bryce-y {
                0%   { transform: translateY(0) scale(1); }
                10%  { transform: translateY(-3px) scale(1.02); }
                20%  { transform: translateY(0) scale(1); }
                100% { transform: translateY(0) scale(1); }
              }
              @keyframes bryce-c {
                0%   { transform: translateY(0) rotate(0deg); }
                8%   { transform: translateY(-5px) rotate(0.6deg); }
                18%  { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(0) rotate(0deg); }
              }
              @keyframes bryce-e {
                0%   { transform: scale(1) rotate(0deg); }
                10%  { transform: scale(1.025) rotate(-0.7deg); }
                20%  { transform: scale(1) rotate(0deg); }
                100% { transform: scale(1) rotate(0deg); }
              }
              ${animReady ? `
              #letter-b { animation: bryce-b 7s   ease-in-out 0s    infinite; }
              #letter-r { animation: bryce-r 6s   ease-in-out 2.3s  infinite; }
              #letter-y { animation: bryce-y 8s   ease-in-out 4.1s  infinite; }
              #letter-c { animation: bryce-c 6.5s ease-in-out 1.2s  infinite; }
              #letter-e { animation: bryce-e 7s   ease-in-out 5.5s  infinite; }
              ` : ''}
            `}</style>

            {/* E — drawn first so it sits below overlapping letters */}
            <g className="letter" id="letter-e">
              <path d="M549.923 1.5L443.967 1.5L427.334 38.4371L478.464 147.996H585.036L601.668 111.685L590.58 94.1557L524.05 94.1557L515.425 77.2523L564.707 77.2523L553.619 55.3405H507.417L498.793 35.3068H564.707L549.923 1.5Z" fill="#31E300" stroke="black" strokeWidth="3"/>
              <path d="M445.668 6L495.715 111.059L600.439 111.059L586.887 147.996H480.315L426.721 38.4365L445.668 6Z" fill="#31E300"/>
              <path d="M480.315 147.996H586.887L600.439 111.059L495.715 111.059L445.668 6L426.721 38.4365L480.315 147.996ZM495.715 111.059L480.315 147.996" stroke="black" strokeWidth="3"/>
            </g>

            {/* C */}
            <g className="letter" id="letter-c">
              <path d="M445.204 6.50781L339.248 6.50781L320.768 44.071L374.98 147.369L480.933 147.996L495.104 112.31L479.704 77.2511L407.011 77.8778L392.842 40.3146L460.168 39L445.204 6.50781Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
              <path d="M390.374 112.937L495.717 111.059L479.7 77.2523L414.402 77.2523L397.153 39.6892L461.168 39L443.352 1.5L337.396 1.5L390.374 112.937Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
            </g>

            {/* Y */}
            <g className="letter" id="letter-y">
              <path d="M265.941 144.867L282.573 105.425L265.325 69.1143L248.076 107.929L265.941 144.867Z" fill="#FFF712" stroke="black" strokeWidth="3"/>
              <path d="M336.07 1.5L389.454 110.885L376.209 147.37H268.405L283.913 109.628L235.756 4.63026L266.557 4.00421L281.459 37.333L317.048 37.333L300.481 1.5L336.07 1.5Z" fill="#FFF712"/>
              <path d="M283.913 109.628L268.405 147.37H376.209L389.454 110.885L336.07 1.5L300.481 1.5L317.048 37.333L281.459 37.333L266.557 4.00421L235.756 4.63026L283.913 109.628ZM389.454 110.885L283.913 109.628" stroke="black" strokeWidth="3"/>
              <path d="M233.91 4.00439L265.943 70.992H334.322" stroke="black" strokeWidth="3"/>
            </g>

            {/* R */}
            <g className="letter" id="letter-r">
              <path d="M202.491 148.622H160.602L177.85 114.188L211.115 115.441L202.491 148.622Z" fill="#12B4FF"/>
              <path d="M160.602 148.622L159.26 147.95L158.173 150.122H160.602V148.622ZM202.491 148.622V150.122H203.651L203.943 148.999L202.491 148.622ZM211.115 115.441L212.567 115.818C212.682 115.378 212.59 114.91 212.319 114.545C212.048 114.181 211.626 113.959 211.172 113.942L211.115 115.441ZM177.85 114.188L177.907 112.69L176.942 112.653L176.509 113.517L177.85 114.188ZM160.602 148.622V150.122H202.491V148.622V147.122H160.602V148.622ZM202.491 148.622L203.943 148.999L212.567 115.818L211.115 115.441L209.664 115.063L201.039 148.245L202.491 148.622ZM211.115 115.441L211.172 113.942L177.907 112.69L177.85 114.188L177.794 115.687L211.059 116.94L211.115 115.441ZM177.85 114.188L176.509 113.517L159.26 147.95L160.602 148.622L161.943 149.294L179.191 114.86L177.85 114.188Z" fill="black"/>
              <path d="M270.253 147.37L234.523 146.744L248.076 112.312H283.805L270.253 147.37Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
              <path d="M211.114 114.189H177.233L126.719 4.00439L233.907 4.62984L254.851 52.2104L235.139 62.2273L266.556 75.3744L281.956 111.685L247.459 112.311L230.827 75.3744H195.713L211.114 114.189Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
              <path d="M209.267 22.7856H177.85L179.082 29.6722H211.115L209.267 22.7856Z" fill="white" stroke="black" strokeWidth="3"/>
              <path d="M224.054 132.345L233.294 146.744L248.078 111.686L230.214 75.3745H217.277L233.294 109.181L224.054 132.345Z" fill="#12B4FF"/>
              <path d="M233.294 146.744L232.032 147.554C232.332 148.023 232.868 148.286 233.422 148.238C233.977 148.191 234.46 147.84 234.676 147.327L233.294 146.744ZM224.054 132.345L222.66 131.789L222.374 132.506L222.791 133.155L224.054 132.345ZM233.294 109.181L234.687 109.737L234.929 109.13L234.649 108.539L233.294 109.181ZM217.277 75.3745V73.8745H214.907L215.922 76.0167L217.277 75.3745ZM230.214 75.3745L231.56 74.7123L231.148 73.8745H230.214V75.3745ZM248.078 111.686L249.461 112.268L249.727 111.638L249.424 111.023L248.078 111.686ZM233.294 146.744L234.556 145.934L225.316 131.535L224.054 132.345L222.791 133.155L232.032 147.554L233.294 146.744ZM224.054 132.345L225.447 132.901L234.687 109.737L233.294 109.181L231.901 108.626L222.66 131.789L224.054 132.345ZM233.294 109.181L234.649 108.539L218.633 74.7323L217.277 75.3745L215.922 76.0167L231.938 109.824L233.294 109.181ZM217.277 75.3745V76.8745H230.214V75.3745V73.8745H217.277V75.3745ZM230.214 75.3745L228.868 76.0367L246.733 112.348L248.078 111.686L249.424 111.023L231.56 74.7123L230.214 75.3745ZM248.078 111.686L246.696 111.103L231.912 146.161L233.294 146.744L234.676 147.327L249.461 112.268L248.078 111.686Z" fill="black"/>
            </g>

            {/* B — drawn last so it sits on top */}
            <g className="letter" id="letter-b">
              <path d="M158.138 70.3666L177.85 112.938L167.994 148.622L54.0299 149.249L1.66797 46.5766L21.3807 4.00439L125.489 4.00439L147.665 52.8371L129.185 63.48L158.138 70.3666Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
              <path d="M1.66797 46.5752L15.8365 15.8986L20.7647 6.50781L70.6625 114.189L53.4139 148.622L1.66797 46.5752Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
              <path d="M167.993 148.622L54.0293 150.5L71.2779 114.189H177.545L167.993 148.622Z" fill="#FF9C12" stroke="black" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M97.7648 22.1597H66.3477L67.5797 29.0462H99.6129L97.7648 22.1597Z" fill="white" stroke="black" strokeWidth="3"/>
              <path d="M121.791 84.1382H92.8379L96.534 91.0248H126.103L121.791 84.1382Z" fill="white" stroke="black" strokeWidth="3"/>
            </g>
          </svg>

          <p className="subheader-text">
            <IridescentText text="A systems-thinking UX designer building end-to-end experiences from research & " />
            <span className="subheader-inline-chips" style={{ whiteSpace: 'nowrap' }}>
              <IdeationChip />{' '}
              <IridescentText text="to" />{' '}
              <span className="subheader-prod">[PROD]</span>
            </span>
          </p>
        </section>

        {/* ── Featured Projects ──────────────────────────────────────────── */}
        <section className="projects-section">

          <IridescentEyebrow
            label="FEATURED PROJECTS"
            iconPathD={[
              'M8 0L9.16938 5.17688L13.6569 2.34315L10.8231 6.83062L16 8L10.8231 9.16938L13.6569 13.6569L9.16938 10.8231L8 16L6.83062 10.8231L2.34315 13.6569L5.17688 9.16938L0 8L5.17688 6.83062L2.34315 2.34315L6.83062 5.17688L8 0Z',
              'M8 4L8.58469 6.58844L10.8284 5.17157L9.41156 7.41531L12 8L9.41156 8.58469L10.8284 10.8284L8.58469 9.41156L8 12L7.41531 9.41156L5.17157 10.8284L6.58844 8.58469L4 8L6.58844 7.41531L5.17157 5.17157L7.41531 6.58844L8 4Z',
            ]}
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M8 0L9.16938 5.17688L13.6569 2.34315L10.8231 6.83062L16 8L10.8231 9.16938L13.6569 13.6569L9.16938 10.8231L8 16L6.83062 10.8231L2.34315 13.6569L5.17688 9.16938L0 8L5.17688 6.83062L2.34315 2.34315L6.83062 5.17688L8 0Z" fill="#141510"/>
                <path d="M8 4L8.58469 6.58844L10.8284 5.17157L9.41156 7.41531L12 8L9.41156 8.58469L10.8284 10.8284L8.58469 9.41156L8 12L7.41531 9.41156L5.17157 10.8284L6.58844 8.58469L4 8L6.58844 7.41531L5.17157 5.17157L7.41531 6.58844L8 4Z" fill="#FAF7F2"/>
              </svg>
            }
          />

          <div className="projects-grid">
            {PROJECTS.map((p, i) => <ProjectCard key={i} {...p} />)}
          </div>
        </section>

        {/* ── In their own words / Endorsements ─────────────────────────── */}
        <section className="endorsements-section">

          {/* Heading */}
          <div className="endorsements-heading-wrap">
            <h2 className="endorsements-heading">
              <span className="endorsements-heading-text">In their own</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                <ScrabbleTiles />
                <span className="endorsements-heading-text">.</span>
              </span>
            </h2>
          </div>

          <IridescentEyebrow
            label="ENDORSEMENTS"
            iconPathD={[
              'M8 0L10.1607 5.83927L16 8L10.1607 10.1607L8 16L5.83927 10.1607L0 8L5.83927 5.83927L8 0Z',
              'M8 4L9.08036 6.91964L12 8L9.08036 9.08036L8 12L6.91964 9.08036L4 8L6.91964 6.91964L8 4Z',
            ]}
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M8 0L10.1607 5.83927L16 8L10.1607 10.1607L8 16L5.83927 10.1607L0 8L5.83927 5.83927L8 0Z" fill="#141510"/>
                <path d="M8 4L9.08036 6.91964L12 8L9.08036 9.08036L8 12L6.91964 9.08036L4 8L6.91964 6.91964L8 4Z" fill="#FAF7F2"/>
              </svg>
            }
          />

          {/* Cards */}
          <div className="endorsements-grid" ref={endorsementsGridRef}>
            {ENDORSEMENTS.map((e, i) => <EndorsementCard key={i} {...e} />)}
          </div>

        </section>
      </main>

      <CaterpillarFooter />
    </>
  );
}
