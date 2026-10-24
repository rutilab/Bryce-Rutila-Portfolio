'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import CircuitBackground from '@/components/CircuitBackground';
import HalftoneFly from '@/components/HalftoneFly';
import { HomeHeader } from '@/components/home/HomeHeader';
import ChipSplash from '@/components/home/ChipSplash';
import { WordChips } from '@/components/home/WordChip';
import ProbeCursor from '@/components/home/ProbeCursor';
import { WorkCard } from '@/components/home/WorkCard';
import { HOME_PROJECTS } from '@/data/projects';
import { IridescentEyebrow } from '@/components/IridescentEyebrow';
import CaterpillarFooter from '@/components/CaterpillarFooter';
import { registerBrFlyRefill } from '@/lib/brFlyRefill';

const BR_FLY_SRCS = [
  '/butterflies/updated-br-fly-1.svg',
  '/butterflies/updated-br-fly-2.svg',
  '/butterflies/updated-br-fly-3.svg',
] as const;

/** Groups the home projects into rows of one, two, one, two… */
function chunkWork<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0, wide = true; i < items.length; wide = !wide) {
    const n = wide ? 1 : 2;
    rows.push(items.slice(i, i + n));
    i += n;
  }
  return rows;
}

/** Accent for net glow — keyed to the fly art, not the slot index */
function colorForFlySrc(src: string): string {
  if (src.includes('fly-1')) return '#12B4FF';
  if (src.includes('fly-2')) return '#31E300';
  if (src.includes('fly-3')) return '#FF12F7';
  return '#12B4FF';
}

/**
 * Whether this page load opened on the home page. The splash introduces the
 * site, so it plays when someone arrives here, not when they click back to
 * Home from another page.
 */
function landedOnHome(): boolean {
  const nav = performance.getEntriesByType('navigation')[0];
  return !nav || new URL(nav.name).pathname === '/';
}

/**
 * Whether the splash has had its chance this page load. Module-level, so it
 * survives the home page unmounting and remounting as you navigate away and
 * back.
 *
 * Only ever written from an effect, which never runs during SSR — so the server
 * always renders the pre-splash state and hydration matches.
 */
let _loaderHasRun = false;

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
  /**
   * Read straight from the flag rather than settling it in an effect. An effect
   * runs after paint, so coming back to this page from anywhere else painted a
   * frame of the blocker below with the content still at opacity 0 — a blank
   * cream flash on every return home, which is what the splash looked like it
   * was doing.
   */
  const [loaderState, setLoaderState] = useState<LoaderState>(() =>
    _loaderHasRun ? 'done' : 'checking',
  );

  const [splash, setSplash] = useState(false);
  const handOff = useCallback(() => setLoaderState('done'), []);
  const splashDone = useCallback(() => setSplash(false), []);

  useEffect(() => {
    if (_loaderHasRun) return;
    _loaderHasRun = true;

    if (!landedOnHome()) {
      setLoaderState('done');
      return;
    }
    // They came in the front door: open from inside BR1
    setSplash(true);
  }, []);

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
      {loaderState !== 'done' && !splash && (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#f9fafb', pointerEvents: 'none' }} />
      )}
      {splash && <ChipSplash onHandoff={handOff} onDone={splashDone} />}
      <HomeHeader />
      <ProbeCursor />

      <main className="landing-main landing-main--framed">
        <CircuitBackground ready={loaderState === 'done'} />

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
        <section className="home-hero">

          <h1 className="home-hero-title">I design with the whole product in mind</h1>
          <p className="home-hero-desc">
            Every design decision sits within a larger context: what led to it, who it affects, and
            what happens after it ships. I carry that context throughout my design process,
            considering the broader product, its users, and the systems each decision touches.
          </p>
        </section>

        {/* ── Selected work ─────────────────────────────────────────────── */}
        <section className="home-section" id="work">

          <IridescentEyebrow
            label="SELECTED WORK"
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

          {/* Wide, a pair, wide again — the rhythm repeats if more are added */}
          <ul className="work-list">
            {chunkWork(HOME_PROJECTS).map((row, r) => (
              <li key={r} className={row.length === 2 ? 'work-row work-row--pair' : 'work-row'}>
                {row.map((p) => <WorkCard key={p.title} project={p} wide={row.length === 1} />)}
              </li>
            ))}
          </ul>
        </section>

        {/* ── About preview ─────────────────────────────────────────────── */}
        <section className="home-section home-about" aria-labelledby="home-about-label">
          <IridescentEyebrow
            label="ABOUT ME"
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
          <div className="home-about-grid">
            <img src="/about/portrait-2.jpg" alt="Bryce out on a hike" className="home-about-photo" />
            <div>
              <p id="home-about-label" className="home-about-lede">
                I’ve always been curious about how things work, why they work the way they do, and
                how people experience them. That curiosity is what drew me to product design, where
                I get to understand people, untangle complex problems, and turn what I learn into
                thoughtful experiences.
              </p>
              <p className="home-about-edu">
                <span className="home-about-school">University of Florida 🐊</span>
                <span className="home-about-sep" aria-hidden="true">✦</span>
                <span>B.S. Psychology</span>
                <span className="home-about-sep" aria-hidden="true">✦</span>
                <span>Behavior Analysis</span>
              </p>
              <a href="/about" className="home-about-cta">
                About me <span className="home-about-cta-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── In their own words / Endorsements ─────────────────────────── */}
        <section className="endorsements-section">

          {/* Heading */}
          <div className="endorsements-heading-wrap">
            <h2 className="endorsements-heading">
              <span className="endorsements-heading-text">In their own</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                <WordChips />
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
