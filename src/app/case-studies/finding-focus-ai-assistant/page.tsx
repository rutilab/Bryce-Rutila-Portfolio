'use client';

import { useState, useEffect, useRef, type ReactNode, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AI_ASSISTANT_CSS, AI_ASSISTANT_HTML } from './ai-assistant-modal';
import SmsIcon from '@mui/icons-material/Sms';
import ForumIcon from '@mui/icons-material/Forum';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import {
  CaseStudyMedia,
  CaseStudyMediaGallery,
  MediaCarouselStage,
  NorthStarAnimatedIcon,
  WinningChoiceScrollStars,
} from '@/components/case-study';
import type { CaseStudyMediaItem } from '@/components/case-study';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

/** Section eyebrows, MUI icons, diagram labels — near-black, matches the Focus Coach Achievements template */
const EYEBROW_ICON_COLOR = '#272727';
/** Finding Focus blue — the accent used across all Finding Focus case studies */
const ACCENT = '#006efe';
const ACCENT_DARK = '#0057c2';
/** Hairline border on white cards (TL;DR, Callout, Takeaways) */
const BORDER = '#e6ecf4';
/** Solid light container for content cards (Project Goals) */
const CARD_LIGHT = '#f5f7fa';
/** Blue media well behind case study visuals */
const BLOCK_BG = 'rgba(220, 232, 248, 0.45)';
/** Intrinsic size of the chat widget inside the prototype iframe */
const PROTOTYPE_WIDTH = 725;
const PROTOTYPE_HEIGHT = 928;

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

// ── StatRow: headline numbers with a blue underline tick ──────────────────────
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

// ── GoalCards: numbered, one sentence each ────────────────────────────────────
const PROJECT_GOALS = [
  { n: '01', title: 'Truly understand queries', body: 'The assistant should understand what teachers are actually asking, with contextual awareness.' },
  { n: '02', title: 'Provide relevant responses', body: 'Teachers should get a real answer to any question about Finding Focus, without being boxed into a limited set of scripted responses.' },
  { n: '03', title: 'Win over skeptics', body: 'Teachers have been burned by rigid, unhelpful chatbots before. This assistant had to feel meaningfully better from the very first message.' },
];

function GoalCards() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="grid gap-3 grid-cols-1 lg:grid-cols-3">
      {PROJECT_GOALS.map((g, i) => (
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

/** Outcomes Looking Ahead cards — same chip pattern as Focus Coach Achievements IndicatorCard */
const LOOKING_AHEAD = [
  {
    title: 'Engagement & ticket volume',
    body: 'Repeat usage of the assistant and year-over-year support ticket volume, semester over semester.',
    status: 'Monitoring',
  },
  {
    title: 'Answer accuracy',
    body: 'Periodic spot checks of response accuracy as the knowledge base grows.',
    status: 'Monitoring',
  },
  {
    title: 'Follow-up research',
    body: 'Follow-up interviews with the original ten teachers from discovery, plus lightweight in-product feedback (thumbs up/down on responses) as a continuous signal.',
    status: 'Next',
  },
  {
    title: 'Escalation & source linking',
    body: "A handoff path to human support when the assistant can't answer confidently, and direct links to relevant help docs within answers.",
    status: 'Next',
  },
] as const;

function OutcomeCard({ title, body, status }: { title: string; body: string; status: string }) {
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

/** Single-image lightbox copy — matches VisualCard on case study pages (#999 / #bbb). */
const LB_CAP_PRIMARY: CSSProperties = {
  color: '#999',
  fontSize: 13,
  lineHeight: 1.6,
  fontWeight: 400,
  margin: 0,
  textAlign: 'center',
};
const LB_CAP_SECONDARY: CSSProperties = {
  color: '#bbb',
  fontSize: 13,
  lineHeight: 1.6,
  fontWeight: 400,
  margin: 0,
  marginTop: 4,
  fontStyle: 'italic',
  textAlign: 'center',
};

// ── Asset paths ──────────────────────────────────────────────────────────────
const assets = {
  accessingAssistant: '/case-studies/finding-focus-ai-assistant/accessing-assistant.gif',
  fabCalloutZoom: '/case-studies/finding-focus-ai-assistant/fab-callout-zoom.gif',
  modalOverlay: '/case-studies/finding-focus-ai-assistant/modal-overlay.jpg',
  typicalChatInterface: '/case-studies/finding-focus-ai-assistant/typical-chat-interface.png',
  chatgptTextOutput: '/case-studies/finding-focus-ai-assistant/chatgpt-text-output.gif',
  geminiTextOutput: '/case-studies/finding-focus-ai-assistant/gemini-text-output.gif',
  geminiLayout: '/case-studies/finding-focus-ai-assistant/gemini-layout.png',
  metaAiLayout: '/case-studies/finding-focus-ai-assistant/meta-ai-layout.png',
  claudePageBehavior: '/case-studies/finding-focus-ai-assistant/claude-page-behavior.gif',
  geminiPageBehavior: '/case-studies/finding-focus-ai-assistant/gemini-page-behavior.gif',
  ideationNavDrawerWireframe: '/case-studies/finding-focus-ai-assistant/ideation-nav-drawer-wireframe.png',
  ideationNavDrawerComparison: '/case-studies/finding-focus-ai-assistant/ideation-nav-drawer-comparison.png',
  ideationFabWireframe: '/case-studies/finding-focus-ai-assistant/ideation-fab-wireframe.png',
  ideationFabComparison: '/case-studies/finding-focus-ai-assistant/ideation-fab-comparison.png',
  ideationDisplayFullscreenWireframe: '/case-studies/finding-focus-ai-assistant/ideation-display-fullscreen-wireframe.png',
  ideationDisplayFullscreenComparison: '/case-studies/finding-focus-ai-assistant/ideation-display-fullscreen-comparison.png',
  ideationDisplayAnchoredWireframe: '/case-studies/finding-focus-ai-assistant/ideation-display-anchored-wireframe.png',
  ideationDisplayAnchoredComparison: '/case-studies/finding-focus-ai-assistant/ideation-display-anchored-comparison.png',
  ideationDisplaySplitWireframe: '/case-studies/finding-focus-ai-assistant/ideation-display-split-wireframe.png',
  ideationDisplaySplitComparison: '/case-studies/finding-focus-ai-assistant/ideation-display-split-comparison.png',
  ideationEmptyBlankWireframe: '/case-studies/finding-focus-ai-assistant/ideation-empty-blank-wireframe.png',
  ideationEmptyBlankComparison: '/case-studies/finding-focus-ai-assistant/ideation-empty-blank-comparison.png',
  ideationEmptyTilesWireframe: '/case-studies/finding-focus-ai-assistant/ideation-empty-tiles-wireframe.png',
  ideationEmptyTilesComparison: '/case-studies/finding-focus-ai-assistant/ideation-empty-tiles-comparison.png',
  ideationEmptyProactiveWireframe: '/case-studies/finding-focus-ai-assistant/ideation-empty-proactive-wireframe.png',
  ideationEmptyProactiveComparison: '/case-studies/finding-focus-ai-assistant/ideation-empty-proactive-comparison.png',
  emptyStateDesign: '/case-studies/finding-focus-ai-assistant/empty-state-design.png',
  iPhoneMockup: '/case-studies/finding-focus-ai-assistant/iphone-mockup.png',
  iMacMockup: '/case-studies/finding-focus-ai-assistant/imac-mockup.png',
  errorUnableToRespond: '/case-studies/finding-focus-ai-assistant/error-unable-to-respond.png?v=4',
  errorApiConnection: '/case-studies/finding-focus-ai-assistant/error-api-connection.png?v=4',
  errorNetwork: '/case-studies/finding-focus-ai-assistant/error-network.png?v=3',
};

// ── Text scale (explicit, not relying on cs-* classes) ───────────────────────
// Section heading:    30px semibold
// Section body:       18px normal 180%
// Card title:         17px semibold
// Card body:          16px normal 175%
// Caption:            13px normal #888
// Eyebrow:            11px medium tracking-wide #272727

// ── Utility components ───────────────────────────────────────────────────────

function Eyebrow({ label, color = EYEBROW_ICON_COLOR }: { label: string; color?: string }) {
  return (
    <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color }}>
      {label}
    </p>
  );
}

/** Underlined inline term with a hover/focus tooltip — for glossary-style call-outs inside headings. */
function TermTooltip({ children, tip }: { children: ReactNode; tip: string }) {
  const [active, setActive] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <span
        tabIndex={0}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        className="underline"
        style={{ textDecorationStyle: 'dotted', textDecorationColor: 'rgba(0,0,0,0.4)', textUnderlineOffset: 3, cursor: 'help' }}
      >
        {children}
      </span>
      <span
        role="tooltip"
        aria-hidden={!active}
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: 0,
          width: 260,
          whiteSpace: 'normal',
          background: '#111113',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.5,
          padding: '10px 12px',
          borderRadius: 10,
          pointerEvents: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          opacity: active ? 1 : 0,
          transform: active ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          zIndex: 20,
        }}
      >
        {tip}
      </span>
    </span>
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
  heading: ReactNode;
  body?: ReactNode;
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="max-w-[760px]">
          {eyebrow && <Eyebrow label={eyebrow} />}
          <h2 className="text-[22px] md:text-[30px] font-semibold leading-[130%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
            {heading}
          </h2>
        </div>
        {body && (
          <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555] max-w-[820px]">{body}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Decision-summary callout — left accent-bar construction matching the Achievements
 * template's Callout. Neutral (blue), danger (red wash), or success (green wash).
 */
function Callout({
  label,
  heading,
  body,
  compactBody,
  icon,
  variant = 'neutral',
}: {
  label: string;
  heading: string;
  body?: string;
  compactBody?: boolean;
  icon?: ReactNode;
  variant?: 'neutral' | 'danger' | 'success';
}) {
  const bar = variant === 'danger' ? '#fe0000' : variant === 'success' ? '#2a8a50' : ACCENT_DARK;
  const bg = variant === 'danger' ? '#fceaea' : variant === 'success' ? '#eafaf1' : undefined;
  return (
    <div
      className={`flex max-w-[760px] items-stretch gap-4 sm:gap-5 rounded-[16px] p-4 sm:p-6 ${bg ? '' : 'bg-white'}`}
      style={bg ? { background: bg } : { border: `1px solid ${BORDER}` }}
    >
      <div style={{ width: 2, borderRadius: 2, background: bar, flexShrink: 0 }} />
      {icon && (
        <div className="flex shrink-0 items-center justify-center" aria-hidden>
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: bar }}>
          {label}
        </p>
        <p className="text-[19px] font-semibold leading-[135%] text-[#1a1a1a]">{heading}</p>
        {body && (
          <p className={compactBody ? 'text-[14px] font-normal leading-[170%] text-[#666]' : 'text-[17px] font-normal leading-[175%] text-[#666]'}>{body}</p>
        )}
      </div>
    </div>
  );
}

/** Old-style winning-choice card: stars icon + gray eyebrow, no left accent bar. */
function WinningChoiceCallout({ heading, body }: { heading: string; body: string }) {
  return (
    <div
      className="flex max-w-[760px] items-center gap-4 sm:gap-5 bg-white rounded-[16px] p-4 sm:p-6"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <WinningChoiceScrollStars className="block size-[72px] shrink-0 md:size-20" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#999]">
          The Winning Choice
        </p>
        <p className="text-[19px] font-semibold leading-[135%] text-[#1a1a1a]">{heading}</p>
        <p className="text-[14px] font-normal leading-[170%] text-[#666]">{body}</p>
      </div>
    </div>
  );
}

function DecisionPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex self-start items-center gap-2 bg-[rgba(39,39,39,0.08)] border border-[rgba(39,39,39,0.2)] rounded-full px-4 py-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#272727] flex-shrink-0" />
      <span className="text-[13px] font-medium text-[#272727]">{children}</span>
    </div>
  );
}

// Visual container — light grey card with optional caption
function VisualCard({
  children,
  caption,
  pill,
  pad,
}: {
  children: React.ReactNode;
  caption?: string;
  pill?: string;
  /** Padding class for grouped media; omit when children bring their own padding. */
  pad?: string;
}) {
  return (
    <div>
      <div className="rounded-[24px] overflow-clip" style={{ background: BLOCK_BG }}>
        {pad ? <div className={pad}>{children}</div> : children}
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

/**
 * Assets stay side by side until the row no longer fits, then switch to the
 * carousel (arrows beside the asset, caption + dots below) — the same pattern
 * the Achievements case study uses for its grouped final-design mockups.
 */
function useSideBySide(minWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [sideBySide, setSideBySide] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSideBySide(el.clientWidth >= minWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minWidth]);

  return [ref, sideBySide] as const;
}

/**
 * Prototype embed. The iframe scales its chat widget to the space available, so the
 * frame height has to track the same scale to avoid clipping or dead space.
 */
function PrototypeEmbed({ caption }: { caption: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(690);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const scale = Math.min(0.7, Math.max(0.25, (el.clientWidth - 40) / PROTOTYPE_WIDTH));
      setHeight(Math.round(PROTOTYPE_HEIGHT * scale) + 40);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef}>
      <VisualCard caption={caption}>
        <iframe
          src="/case-studies/finding-focus-ai-assistant/prototype/index.html?embed=1"
          title="Finding Focus AI Assistant interactive prototype"
          className="w-full border-0 block"
          scrolling="no"
          style={{ height }}
        />
      </VisualCard>
    </div>
  );
}

/** Phone + desktop mockups sharing one well. Column ratio keeps both renders the same height. */
function BreakpointMockups({ caption, items }: { caption: string; items: CaseStudyMediaItem[] }) {
  const [wrapRef, sideBySide] = useSideBySide(560);

  return (
    <div ref={wrapRef} className="w-full">
      {sideBySide ? (
        <VisualCard caption={caption} pad="p-4 sm:p-6">
          <div className="mx-auto w-full" style={{ maxWidth: 860 }}>
            <div className="grid items-center gap-3 sm:gap-4" style={{ gridTemplateColumns: '1fr 2.4fr' }}>
              {items.map((item) => (
                <CaseStudyMedia
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  caption={item.caption}
                />
              ))}
            </div>
          </div>
        </VisualCard>
      ) : (
        <MediaCarouselStage items={items} caption={caption} maxWidth={260} background={BLOCK_BG} />
      )}
    </div>
  );
}

const ERROR_STATES: CaseStudyMediaItem[] = [
  {
    src: assets.errorNetwork,
    alt: 'Assistant showing a network error with a regenerate action',
    caption: 'Network error',
  },
  {
    src: assets.errorApiConnection,
    alt: 'Assistant showing a server connection error with a regenerate action',
    caption: 'API connection error',
  },
  {
    src: assets.errorUnableToRespond,
    alt: 'Assistant declining to answer an inappropriate request',
    caption: 'Query refusal',
  },
];

function ErrorStateDesigns() {
  const [wrapRef, sideBySide] = useSideBySide(640);
  const groupCaption = 'Error state designs — Network error, API connection error, Query refusal';

  return (
    <div ref={wrapRef} className="w-full">
      {sideBySide ? (
        <VisualCard caption={groupCaption} pad="p-4 sm:p-6">
          <CaseStudyMediaGallery
            columns={3}
            maxWidth={936}
            gapClassName="gap-3 sm:gap-4"
            preventStack
            items={ERROR_STATES}
          />
        </VisualCard>
      ) : (
        <MediaCarouselStage
          items={ERROR_STATES}
          caption={(item) => `Error state designs — ${item.caption ?? item.alt}`}
          maxWidth={312}
          background={BLOCK_BG}
        />
      )}
    </div>
  );
}

// ── IdeationToggle: pill tabs for UX consideration options (wireframe + comparison) ──
/**
 * Same pill-toggle chrome as ToggleMedia / comparative analysis. Each tab shows a
 * wireframe + pros/cons pair. The winning option is listed first and marked with a
 * Winner tag in the media well's top-right corner.
 */
function IdeationToggle({
  items,
}: {
  items: {
    src: string;
    alt: string;
    secondSrc?: string;
    secondAlt?: string;
    label: string;
    winner?: boolean;
  }[];
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  function switchTab(i: number) {
    if (i === active) return;
    setVisible(false);
    if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 160);
  }

  const item = items[active];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex justify-center">
        <div
          className="inline-flex flex-nowrap items-center gap-1 rounded-full bg-white p-1"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {items.map((it, i) => {
            const on = i === active;
            return (
              <button
                key={it.label}
                onClick={() => switchTab(i)}
                data-active={on}
                className="cs-toggle-pill shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px]"
              >
                {it.label}
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
        <div
          className={`w-full rounded-[24px] overflow-clip flex items-center justify-center p-8 gap-6 h-[500px] md:h-[380px] ${item.secondSrc ? 'flex-col md:flex-row' : ''}`}
          style={{ position: 'relative', background: 'rgba(220,232,248,0.45)' }}
        >
          {item.winner && (
            <span
              className="text-[11px] font-semibold uppercase tracking-[1px] rounded-full px-3 py-1 pointer-events-none"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                background: 'rgba(0,110,254,0.12)',
                color: ACCENT_DARK,
              }}
            >
              Winner
            </span>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            className={
              item.secondSrc
                ? 'max-h-[44%] md:max-h-full md:max-w-[52%] max-w-full w-auto h-auto block flex-shrink-0'
                : 'max-h-full max-w-full w-auto h-auto block'
            }
          />
          {item.secondSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.secondSrc}
              src={item.secondSrc}
              alt={item.secondAlt ?? ''}
              className="max-h-[44%] md:max-h-full md:max-w-[44%] max-w-full w-auto h-auto block flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MediaViewer: full-width media viewer with auto-advance, lightbox, progress dots ──
/**
 * ToggleMedia — pill-tab switcher for per-source assets (ChatGPT / Gemini / etc.), matching the
 * Achievements template's SegmentedMedia pill design. Replaces the old timed carousel: switching
 * tabs mounts a fresh <img>, so a GIF simply loops for as long as it stays the active tab — no
 * timer, no stop/play control needed.
 */
function ToggleMedia({
  items,
  constrained = true,
}: {
  items: { src: string; alt: string; label: string; caption: string; type: 'GIF' | 'Image' }[];
  constrained?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useBodyScrollLock(lightboxOpen && mounted);

  useEffect(() => {
    return () => {
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  function switchTab(i: number) {
    if (i === active) return;
    setVisible(false);
    if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 160);
  }

  const item = items[active];
  const maxH = constrained ? 'min(460px, calc(100vh - 500px))' : '460px';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Toggle — below the card's dividing line, one pill per source */}
      <div className="w-full flex justify-center">
        <div
          className="inline-flex flex-nowrap items-center gap-1 rounded-full bg-white p-1"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {items.map((it, i) => {
            const on = i === active;
            return (
              <button
                key={it.label}
                onClick={() => switchTab(i)}
                data-active={on}
                className="cs-toggle-pill shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px]"
              >
                {it.label}
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
        {/* Asset — click to expand; GIFs loop natively for as long as they're mounted.
            width:100% keeps the well full-bleed when maxHeight would otherwise shrink it via
            aspect-ratio (that left-aligned the blue box). Height still caps at maxH so
            ResearchDeck sticky card sizes stay stable. overflow:clip (not hidden) avoids
            creating a scroll container. Image fills the well and object-fit:contain centers it. */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLightboxOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setLightboxOpen(true)}
          className="cs-expandable"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: maxH, minHeight: constrained ? 160 : 0,
            borderRadius: 16, overflow: 'clip',
            background: 'rgba(220,232,248,0.45)',
            cursor: 'zoom-in',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={item.src}
            src={item.src} alt={item.alt}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center',
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
            {item.type}
          </div>
        </div>

        {/* Caption */}
        <p className="mt-3 text-[13px] text-[#888] leading-[160%] text-center">{item.caption}</p>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && mounted && createPortal(
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
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
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'fixed', top: 20, right: 20,
              width: 36, height: 36, borderRadius: '50%',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            className="cs-lightbox-chip"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 'min(88vw, 1280px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'none',
              maxHeight: 'calc(100vh - 80px)',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 8px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src} alt={item.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'min(74vh, calc(100vh - 200px))',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 14,
                  display: 'block',
                }}
              />
            </div>
            <div style={{ marginTop: 12, width: '100%', maxWidth: 'min(720px, 92vw)' }}>
              <p style={LB_CAP_PRIMARY}>{item.label}</p>
              {item.caption ? <p style={LB_CAP_SECONDARY}>{item.caption}</p> : null}
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
      {/* Step 1: User question */}
      <rect x="10" y="80" width="116" height="50" rx="12" fill="#F0F0F0" stroke="#DEDEDE" strokeWidth="1.5"/>
      <text x="68" y="101" textAnchor="middle" fontSize="11" fill="#555" fontFamily="Inter, sans-serif" fontWeight="400">User question</text>
      <text x="68" y="117" textAnchor="middle" fontSize="10" fill="#888" fontFamily="Inter, sans-serif">&quot;How do I log in?&quot;</text>
      {/* Arrow 1 */}
      <line x1="126" y1="105" x2="170" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="170,100 180,105 170,110" fill="#CACACA"/>
      {/* Step 2: Decision */}
      <rect x="180" y="77" width="118" height="56" rx="12" fill="#EEF6FF" stroke="#B8D8F8" strokeWidth="1.5"/>
      <text x="239" y="101" textAnchor="middle" fontSize="11" fill="#3A7EC0" fontFamily="Inter, sans-serif" fontWeight="500">Is it in the</text>
      <text x="239" y="117" textAnchor="middle" fontSize="11" fill="#3A7EC0" fontFamily="Inter, sans-serif" fontWeight="500">decision tree?</text>
      {/* Down arrow: YES */}
      <line x1="239" y1="133" x2="239" y2="170" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="234,170 239,180 244,170" fill="#CACACA"/>
      <text x="239" y="158" textAnchor="middle" fontSize="9.5" fill="#272727" fontFamily="Inter, sans-serif" fontWeight="500">YES</text>
      {/* Scripted reply — pushed down */}
      <rect x="189" y="180" width="100" height="36" rx="10" fill="#EAFAF1" stroke="#A8DFBC" strokeWidth="1.5"/>
      <text x="239" y="203" textAnchor="middle" fontSize="10.5" fill="#2A8A50" fontFamily="Inter, sans-serif" fontWeight="400">Scripted reply ✓</text>
      {/* Arrow NO */}
      <line x1="298" y1="105" x2="348" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="348,100 358,105 348,110" fill="#CACACA"/>
      <text x="323" y="96" textAnchor="middle" fontSize="9.5" fill="#E03030" fontFamily="Inter, sans-serif" fontWeight="500">NO</text>
      {/* Step 3: Input not recognized */}
      <rect x="358" y="77" width="118" height="56" rx="12" fill="#FFF3F3" stroke="#F5C0C0" strokeWidth="1.5"/>
      <text x="417" y="101" textAnchor="middle" fontSize="11" fill="#C03030" fontFamily="Inter, sans-serif" fontWeight="500">Input not</text>
      <text x="417" y="117" textAnchor="middle" fontSize="11" fill="#C03030" fontFamily="Inter, sans-serif" fontWeight="500">recognized</text>
      {/* Arrow 3 */}
      <line x1="476" y1="105" x2="520" y2="105" stroke="#CACACA" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points="520,100 530,105 520,110" fill="#CACACA"/>
      {/* Step 4: Stalled */}
      <rect x="530" y="80" width="72" height="50" rx="12" fill="#F5F5F5" stroke="#DEDEDE" strokeWidth="1.5"/>
      <line x1="560" y1="87" x2="572" y2="99" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round"/>
      <line x1="572" y1="87" x2="560" y2="99" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round"/>
      <text x="566" y="112" textAnchor="middle" fontSize="9" fill="#AAAAAA" fontFamily="Inter, sans-serif">conversation</text>
      <text x="566" y="123" textAnchor="middle" fontSize="9" fill="#AAAAAA" fontFamily="Inter, sans-serif">stalls</text>
    </svg>
  );
}

// ── RetrievalFlowDiagram ─────────────────────────────────────────────────────
function RetrievalFlowDiagram() {
  const viewW = 640;
  const contentW = 600;
  const left = (viewW - contentW) / 2; // center the block in the viewBox
  const setup = [
    { x: left, label: ['Help center', 'content'] },
    { x: left + 225, label: ['Compiled into one', 'knowledge base'] },
    { x: left + 450, label: ['Uploaded to a', 'vector store'] },
  ];
  const perQ = [
    { x: left, label: ['Teacher asks', 'question'] },
    { x: left + 152, label: ['Assistant searches', 'the knowledge base'] },
    { x: left + 304, label: ['Retrieves the most', 'relevant chunks'] },
    { x: left + 456, label: ['Answers', 'from them'] },
  ];
  const setupW = 150;
  const perQW = 128;
  const nodeH = 48;
  // Same baseline→node gap for both rows (matches Achievements gap-3 feel)
  const labelGap = 16;
  const setupY = 40;
  const perQY = 176;
  const setupLastCx = setup[2].x + setupW / 2;
  const searchCx = perQ[1].x + perQW / 2;
  const midY = perQY - 40;
  const bottom = perQY + nodeH;
  const viewH = bottom + 20;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[640px]">
      {/* Row labels — same style as Achievements EndOfSessionFlowDiagram */}
      <text x={left} y={setupY - labelGap} fontSize="15" fill="#4a4a4a" fontFamily="Inter, sans-serif" fontWeight="600">Setup</text>
      {setup.map((n, i) => (
        <g key={`s-${i}`}>
          <rect x={n.x} y={setupY} width={setupW} height={nodeH} rx="8" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.4" />
          {n.label.map((line, li) => (
            <text
              key={li}
              x={n.x + setupW / 2}
              y={setupY + 20 + li * 14}
              textAnchor="middle"
              fontSize="10"
              fill="#555"
              fontFamily="Inter, sans-serif"
            >
              {line}
            </text>
          ))}
          {i < setup.length - 1 && (
            <>
              <line x1={n.x + setupW} y1={setupY + nodeH / 2} x2={setup[i + 1].x - 6} y2={setupY + nodeH / 2} stroke="#C8C8C8" strokeWidth="1.4" />
              <polygon
                points={`${setup[i + 1].x - 6},${setupY + nodeH / 2 - 4} ${setup[i + 1].x},${setupY + nodeH / 2} ${setup[i + 1].x - 6},${setupY + nodeH / 2 + 4}`}
                fill="#C8C8C8"
              />
            </>
          )}
        </g>
      ))}

      {/* Connector: vector store → assistant searches */}
      <line x1={setupLastCx} y1={setupY + nodeH} x2={setupLastCx} y2={midY} stroke="#C8C8C8" strokeWidth="1.4" />
      <line x1={setupLastCx} y1={midY} x2={searchCx} y2={midY} stroke="#C8C8C8" strokeWidth="1.4" />
      <line x1={searchCx} y1={midY} x2={searchCx} y2={perQY} stroke="#C8C8C8" strokeWidth="1.4" />
      <polygon
        points={`${searchCx - 4},${perQY} ${searchCx},${perQY + 6} ${searchCx + 4},${perQY}`}
        fill="#C8C8C8"
      />
      <text
        x={(setupLastCx + searchCx) / 2}
        y={midY - 6}
        textAnchor="middle"
        fontSize="10"
        fill="#888"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        searches
      </text>

      <text x={left} y={perQY - labelGap} fontSize="15" fill="#4a4a4a" fontFamily="Inter, sans-serif" fontWeight="600">Every Question</text>
      {perQ.map((n, i) => (
        <g key={`q-${i}`}>
          <rect x={n.x} y={perQY} width={perQW} height={nodeH} rx="8" fill="#EEF6FF" stroke="#BFDBFE" strokeWidth="1.4" />
          {n.label.map((line, li) => (
            <text
              key={li}
              x={n.x + perQW / 2}
              y={perQY + 20 + li * 14}
              textAnchor="middle"
              fontSize="9.5"
              fill="#006efe"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {line}
            </text>
          ))}
          {i < perQ.length - 1 && (
            <>
              <line x1={n.x + perQW} y1={perQY + nodeH / 2} x2={perQ[i + 1].x - 6} y2={perQY + nodeH / 2} stroke="#C8C8C8" strokeWidth="1.4" />
              <polygon
                points={`${perQ[i + 1].x - 6},${perQY + nodeH / 2 - 4} ${perQ[i + 1].x},${perQY + nodeH / 2} ${perQ[i + 1].x - 6},${perQY + nodeH / 2 + 4}`}
                fill="#C8C8C8"
              />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── ChunkAnatomyDiagram: before/after chunk sizing ───────────────────────────
const CHUNK_TRACK = '#e2e7ee';
const CHUNK_TRACK_TEXT = '#6b7280';

function ChunkAnatomyDiagram() {
  const viewW = 616;
  const viewH = 250;
  const barX = 13;
  const barH = 35;
  const inset = 7;
  const fullW = 396; // the 750-token chunk
  const scale = (fullW - inset) / 750;
  const answerW = 142 * scale;
  const chipW = 128;
  const chipH = 22;
  const chipX = viewW - 13 - chipW;
  const legendY = viewH - 16; // 16px above the bottom of the container

  // Row y is the bar top; its label sits 11 above the bar.
  // y 61 → label top ~40px below the container top.
  // 40px from targeted-bar bottom (185) to legend top (legendY - 9 = 225).
  const rows = [
    { label: 'Oversized Chunk', total: '750 tokens', unrelated: 608, chip: 'Relevancy Rank: 3', tone: 'danger' as const, y: 61, trimmed: 0 },
    { label: 'Semantic Chunk', total: '300 tokens', unrelated: 158, chip: 'Relevancy Rank: 1', tone: 'success' as const, y: 150, trimmed: 450 },
  ];

  const answerX = barX + inset;
  const connectorX = [answerX, answerX + answerW];
  const gapTop = rows[0].y + barH;
  const gapBottom = rows[1].y;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ maxWidth: viewW }}>
      {/* Dashed guides showing the answer is the same size in both chunks */}
      {connectorX.map((x, i) => (
        <g key={`c-${i}`} stroke="#ccd4de" strokeWidth="1.1" strokeDasharray="3 3">
          <line x1={x} y1={gapTop} x2={x} y2={gapTop + 26} />
          <line x1={x} y1={gapBottom - 7} x2={x} y2={gapBottom} />
        </g>
      ))}

      {rows.map(row => {
        const barW = inset + answerW + row.unrelated * scale;
        const unrelatedX = answerX + answerW;
        const unrelatedW = barX + barW - unrelatedX;

        return (
          <g key={row.label}>
            <text x={barX} y={row.y - 11} fontSize="13" fill="#1a1a1a" fontFamily="Inter, sans-serif" fontWeight="600">
              {row.label}:
              <tspan dx="4" fill="#999" fontWeight="400">{row.total}</tspan>
            </text>

            <rect x={barX} y={row.y} width={barW} height={barH} rx="9" fill={CHUNK_TRACK} />
            <rect x={answerX} y={row.y} width={answerW} height={barH} rx="2" fill={ACCENT} />
            <text x={answerX + answerW / 2} y={row.y + barH / 2 + 4} textAnchor="middle" fontSize="11" fill="#ffffff" fontFamily="Inter, sans-serif" fontWeight="600">
              142
            </text>
            <text x={unrelatedX + unrelatedW / 2} y={row.y + barH / 2 + 4} textAnchor="middle" fontSize="11" fill={CHUNK_TRACK_TEXT} fontFamily="Inter, sans-serif" fontWeight="500">
              {row.unrelated}
            </text>

            {row.trimmed > 0 && (
              <>
                <rect
                  x={barX + barW + 9}
                  y={row.y}
                  width={fullW - barW - 9}
                  height={barH}
                  rx="9"
                  fill="none"
                  stroke="#c9d0da"
                  strokeWidth="1.1"
                  strokeDasharray="4 3"
                />
                <text
                  x={barX + barW + 9 + (fullW - barW - 9) / 2}
                  y={row.y + barH / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#a8b0bb"
                  fontFamily="Inter, sans-serif"
                >
                  trimmed · {row.trimmed} tokens
                </text>
              </>
            )}

            <rect
              x={chipX}
              y={row.y + (barH - chipH) / 2}
              width={chipW}
              height={chipH}
              rx={chipH / 2}
              fill={row.tone === 'success' ? '#eafaf1' : '#fceaea'}
            />
            <text
              x={chipX + chipW / 2}
              y={row.y + barH / 2 + 4}
              textAnchor="middle"
              fontSize="11"
              fill={row.tone === 'success' ? '#2a8a50' : '#fe0000'}
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {row.chip}
            </text>
          </g>
        );
      })}

      {/* Legend — 16px above the bottom of the container; 40px below the assets */}
      <rect x="200" y={legendY - 9} width="9" height="9" rx="1.5" fill={ACCENT} />
      <text x="214" y={legendY} fontSize="11" fill="#666" fontFamily="Inter, sans-serif">Relevant answer</text>
      <rect x="325" y={legendY - 9} width="9" height="9" rx="1.5" fill={CHUNK_TRACK} />
      <text x="339" y={legendY} fontSize="11" fill="#666" fontFamily="Inter, sans-serif">Unrelated text</text>
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
      <div className="bg-white rounded-[24px] border border-[#e8e8e8] overflow-clip shadow-sm">
        {/* Header */}
        <div className="px-8 pt-12 pb-5">
          <div className="flex items-center gap-4 mb-3">
            {icon}
            <h3 className="text-[19px] font-semibold text-[#1a1a1a] leading-[120%]">
              {title}
            </h3>
          </div>
          <p className="text-[16px] font-normal leading-[175%] text-[#555]">
            {body}
          </p>
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

function getCardStyle(i: number, progress: number, fadeStart = 0.4): {
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
      // Stays fully visible until fadeStart, then fades over the remaining range
      opacity: Math.max(0, 1 - Math.max(0, (t - fadeStart) / (1 - fadeStart))),
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
// Dead zone at the start: px of scroll after the deck sticks before raw progress ramps (bumper).
const RESEARCH_DECK_DEAD_ZONE = 160;
// Fast-scroll pass-through: above these thresholds, skip snap animation and follow raw progress.
// Tuned so deliberate scrolling never triggers; only clear trackpad/wheel flicks do.
const FAST_SCROLL_VELOCITY = 0.004; // |ΔrawP| / ms
const FAST_SCROLL_DELTA = 0.22; // single-event rawP jump

function ResearchDeck() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [deckDisabled, setDeckDisabled] = useState(false);
  const aniState = useRef({ scrollP: 0, displayP: 0, animating: false, animTarget: 0, animStartP: 0, animStartTime: 0, animId: 0 });

  // Enable/disable deck based on viewport height AND width
  useEffect(() => {
    function checkSize() {
      setDeckDisabled(window.innerHeight < MIN_DECK_HEIGHT || window.innerWidth < 900);
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
    let prevTime = 0;

    function onScroll() {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const rawP = Math.max(0, Math.min(2, (-rect.top - RESEARCH_DECK_DEAD_ZONE) / SCROLL_PER_CARD));
      const now = performance.now();
      const dt = prevTime > 0 ? Math.max(1, now - prevTime) : 16;
      const delta = prevRawP < 0 ? 0 : rawP - prevRawP;
      const velocity = Math.abs(delta) / dt;
      const scrollingForward = prevRawP < 0 || rawP >= prevRawP;
      prevRawP = rawP;
      prevTime = now;
      state.scrollP = rawP;

      // Fast flick: skip snap sequencing so the user passes through at scroll speed
      if (velocity >= FAST_SCROLL_VELOCITY || Math.abs(delta) >= FAST_SCROLL_DELTA) {
        state.animating = false;
        state.displayP = rawP;
        setDisplayProgress(rawP);
        snappedTo = Math.max(0, Math.min(2, Math.round(rawP)));
        return;
      }

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

  const cards = [
    {
      number: 1 as const,
      icon: <SmsIcon sx={{ fontSize: 32, color: '#272727' }} />,
      title: 'Text Output Behavior',
      body: 'How text is displayed in responses — letter-by-letter, word-by-word, or all at once. Pacing and visual feedback directly impact how responsive and fast the AI feels.',
      media: [
        { src: assets.chatgptTextOutput, alt: 'ChatGPT text output', label: 'ChatGPT', caption: 'Streams text letter-by-letter, with a cursor dot as a visual reference', type: 'GIF' as const },
        { src: assets.geminiTextOutput, alt: 'Gemini text output', label: 'Gemini', caption: 'Displays the entire message almost instantaneously with a skeleton loading state', type: 'GIF' as const },
      ],
    },
    {
      number: 2 as const,
      icon: <ForumIcon sx={{ fontSize: 32, color: '#272727' }} />,
      title: 'Message Structure and Layout',
      body: "The visual organization and differentiation of user and AI messages. Clear hierarchy helps users easily follow the conversation and distinguish between their messages and the AI's responses.",
      media: [
        { src: assets.geminiLayout, alt: 'Gemini layout', label: 'Gemini', caption: 'User messages and LLM responses both appear on the left, differentiated by icons', type: 'Image' as const },
        { src: assets.metaAiLayout, alt: 'Meta AI layout', label: 'Meta AI', caption: 'User messages appear on the right in bubbles; LLM responses on the left', type: 'Image' as const },
      ],
    },
    {
      number: 3 as const,
      icon: <VerticalAlignTopIcon sx={{ fontSize: 32, color: '#272727' }} />,
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
            <ToggleMedia items={card.media} constrained={false} />
          </ResearchCard>
        ))}
      </div>
    );
  }

  return (
    // Outer height: 100vh + 2 card exits + dead zone bumper at start
    <div ref={outerRef} style={{ height: `calc(100vh + ${SCROLL_PER_CARD * 2 + RESEARCH_DECK_DEAD_ZONE}px)` }}>
      {/* Sticky viewport — fills 100vh; overflow:clip clips peeking cards without creating a
          scroll container (overflow:hidden would), so position:sticky keeps pinning to the
          viewport — same rule as html/body overflow-x: clip in globals.css. */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        paddingTop: 64,
        paddingBottom: 48,
        overflow: 'clip',
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
                  <ToggleMedia items={card.media} />
                </ResearchCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── InsightsDeck: same scroll-snap stack as ResearchDeck, wireframe HTML embeds ──
/**
 * Blue media well sized to match ToggleMedia’s overall block (pills + 16:9 media +
 * caption) so insight cards land at the same height as comparative-analysis cards.
 * Extra height absorbs shorter body copy (often one line vs two).
 */
function WireframeEmbed({
  src,
  title,
  constrained = true,
  fill = false,
}: {
  src: string;
  title: string;
  constrained?: boolean;
  fill?: boolean;
}) {
  // Same viewport formula as ToggleMedia, plus headroom so insight cards match
  // comparative height (missing pills/caption + often one fewer body line).
  const maxH = constrained ? 'min(520px, calc(100vh - 440px))' : '520px';
  return (
    <div
      className={fill ? 'w-full h-full min-h-0' : 'w-full'}
      style={{
        position: 'relative',
        width: '100%',
        ...(fill
          ? { flex: '1 1 auto', minHeight: 280 }
          : { height: maxH, minHeight: constrained ? 240 : 320 }),
        borderRadius: 16,
        overflow: 'clip',
        background: 'rgba(220,232,248,0.45)',
      }}
    >
      <iframe
        src={`${src}?embed=1`}
        title={title}
        className="absolute inset-0 w-full h-full border-0 block"
        scrolling="no"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}

/** Equal-height card shell so stacked peeks stay evenly spaced at 36px. */
function InsightsCard({
  number,
  icon,
  title,
  body,
  embed,
  embedTitle,
  shellHeight,
}: {
  number: 1 | 2 | 3;
  icon: React.ReactNode;
  title: string;
  body: string;
  embed: string;
  embedTitle: string;
  shellHeight: number;
}) {
  return (
    <div className="pt-5 relative h-full box-border">
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
        <NumberSticker number={number} />
      </div>
      <div
        className="bg-white rounded-[24px] border border-[#e8e8e8] overflow-clip shadow-sm flex flex-col"
        style={{ height: shellHeight }}
      >
        <div className="px-8 pt-12 pb-5 flex-shrink-0">
          <div className="flex items-center gap-4 mb-3">
            {icon}
            <h3 className="text-[19px] font-semibold text-[#1a1a1a] leading-[120%]">{title}</h3>
          </div>
          <p className="text-[16px] font-normal leading-[175%] text-[#555]">{body}</p>
        </div>
        <div className="mx-8 h-px bg-[#eeeeee] flex-shrink-0" />
        <div className="p-8 flex-1 min-h-0 flex flex-col">
          <WireframeEmbed fill src={embed} title={embedTitle} />
        </div>
      </div>
    </div>
  );
}

function InsightsDeck() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [deckDisabled, setDeckDisabled] = useState(false);
  // Equal shell height for even peeks — sized from the sticky viewport like ToggleMedia
  const [shellHeight, setShellHeight] = useState(640);
  const aniState = useRef({ scrollP: 0, displayP: 0, animating: false, animTarget: 0, animStartP: 0, animStartTime: 0, animId: 0 });

  const wireBase = '/case-studies/finding-focus-ai-assistant/wireframes';
  const cards = [
    {
      number: 1 as const,
      icon: <SmsIcon sx={{ fontSize: 32, color: '#272727' }} />,
      title: 'Letter-by-letter streaming',
      body: 'Streaming text as it generates provides immediate visual feedback, making the assistant feel faster and more responsive.',
      embed: `${wireBase}/01-letter-by-letter-streaming.html`,
      embedTitle: 'Letter-by-letter streaming wireframe',
    },
    {
      number: 2 as const,
      icon: <ForumIcon sx={{ fontSize: 32, color: '#272727' }} />,
      title: 'Distinctive styling for user vs AI messages',
      body: "Left/right message layout with user's messages in text bubbles makes it easy to follow the conversation.",
      embed: `${wireBase}/02-distinctive-message-styling.html`,
      embedTitle: 'Distinctive message styling wireframe',
    },
    {
      number: 3 as const,
      icon: <VerticalAlignTopIcon sx={{ fontSize: 32, color: '#272727' }} />,
      title: 'Auto-scroll and anchor',
      body: 'Auto-scrolling and anchoring to each new message keeps the layout stable as text streams in, making it easier to follow without disrupting the reading experience.',
      embed: `${wireBase}/03-auto-scroll-and-anchor.html`,
      embedTitle: 'Auto-scroll and anchor wireframe',
    },
  ];

  useEffect(() => {
    function checkSize() {
      setDeckDisabled(window.innerHeight < MIN_DECK_HEIGHT || window.innerWidth < 900);
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Mirror ToggleMedia / ResearchDeck vertical budget: card fits in the sticky
  // viewport (100vh − top/bottom pads − peek strips) and shrinks on shorter screens.
  useEffect(() => {
    function updateShell() {
      const stickyTopPad = 64;
      const stickyBottomPad = 48;
      const stickerPad = 20;
      const peekRoom = 72; // 36px × 2 stacked peeks
      const avail = window.innerHeight - stickyTopPad - stickyBottomPad - stickerPad - peekRoom;
      // Header (~150) + divider/padding (~72) + media matching ToggleMedia block
      const mediaH = Math.min(460, window.innerHeight - 500) + 100;
      const target = 150 + 72 + mediaH;
      setShellHeight(Math.max(420, Math.min(avail, target)));
    }
    updateShell();
    window.addEventListener('resize', updateShell);
    return () => window.removeEventListener('resize', updateShell);
  }, [deckDisabled]);

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

    function tick() {
      if (state.animating) {
        const t = Math.min(1, (Date.now() - state.animStartTime) / 700);
        const eased = t * t * (3 - 2 * t);
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

    let snappedTo = 0;
    let prevRawP = -1;
    let prevTime = 0;

    function onScroll() {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const rawP = Math.max(0, Math.min(2, (-rect.top - RESEARCH_DECK_DEAD_ZONE) / SCROLL_PER_CARD));
      const now = performance.now();
      const dt = prevTime > 0 ? Math.max(1, now - prevTime) : 16;
      const delta = prevRawP < 0 ? 0 : rawP - prevRawP;
      const velocity = Math.abs(delta) / dt;
      const scrollingForward = prevRawP < 0 || rawP >= prevRawP;
      prevRawP = rawP;
      prevTime = now;
      state.scrollP = rawP;

      if (velocity >= FAST_SCROLL_VELOCITY || Math.abs(delta) >= FAST_SCROLL_DELTA) {
        state.animating = false;
        state.displayP = rawP;
        setDisplayProgress(rawP);
        snappedTo = Math.max(0, Math.min(2, Math.round(rawP)));
        return;
      }

      if (state.animating) {
        if (!scrollingForward && rawP < state.animTarget - 0.5) {
          state.animating = false;
          snappedTo = state.animTarget - 1;
          animateTo(snappedTo);
        }
        return;
      }

      if (scrollingForward && rawP > snappedTo && snappedTo < 2) {
        snappedTo++;
        animateTo(snappedTo);
      } else if (!scrollingForward && rawP < snappedTo - 0.5 && snappedTo > 0) {
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

  if (deckDisabled) {
    return (
      <div className="flex flex-col gap-16">
        {cards.map((card, i) => (
          <ResearchCard key={i} number={card.number} icon={card.icon} title={card.title} body={card.body}>
            <WireframeEmbed src={card.embed} title={card.embedTitle} constrained={false} />
          </ResearchCard>
        ))}
      </div>
    );
  }

  // Same sticky chrome + scroll runway as ResearchDeck (vertical responsiveness)
  return (
    <div ref={outerRef} style={{ height: `calc(100vh + ${SCROLL_PER_CARD * 2 + RESEARCH_DECK_DEAD_ZONE}px)` }}>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        paddingTop: 64,
        paddingBottom: 48,
        overflow: 'clip',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          {cards.map((card, i) => {
            const s = getCardStyle(i, displayProgress, 0.72);
            return (
              <div key={i} style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: 0, left: 0, right: 0,
                // Match card-0 height so peek strips stay evenly spaced
                height: i === 0 ? undefined : '100%',
                willChange: 'transform, opacity',
                transform: s.transform,
                opacity: s.opacity,
                zIndex: s.zIndex,
                pointerEvents: s.pointerEvents,
                backfaceVisibility: 'hidden',
              }}>
                <InsightsCard
                  number={card.number}
                  icon={card.icon}
                  title={card.title}
                  body={card.body}
                  embed={card.embed}
                  embedTitle={card.embedTitle}
                  shellHeight={shellHeight}
                />
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
  { id: 'section-intro',          label: 'Intro' },
  { id: 'section-overview',       label: 'Overview' },
  { id: 'section-research',       label: 'Research' },
  { id: 'section-design',         label: 'Design' },
  { id: 'section-under-the-hood', label: 'Technical' },
  { id: 'section-outcomes',       label: 'Outcomes' },
  { id: 'section-reflection',     label: 'Takeaways' },
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
  const [pastHero, setPastHero] = useState(false);
  /** The footer is on screen. The rail is fixed, so without this it parks on
      top of the footer's links and copy. */
  const [atFooter, setAtFooter] = useState(false);
  const visible = pastHero && !atFooter;
  const [active, setActive] = useState('section-intro');

  // Show once hero scrolls out of view
  useEffect(() => {
    const hero = document.getElementById('section-intro');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );
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
      width: 120, alignItems: 'flex-end', paddingRight: 16,
      gap: 4, zIndex: 100, pointerEvents: visible ? 'auto' : 'none',
    }}>
      {NAV_SECTIONS.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => goTo(id)}
          className="cs-toc-btn"
          data-active={active === id}
          style={{
            background: 'none', border: 'none', padding: '5px 0',
            textAlign: 'right', cursor: 'pointer',
            fontSize: 13,
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

// ── ExpandableImage: click-to-lightbox wrapper for static images ──────────────
function ExpandableImage({ src, alt, style, className }: { src: string; alt: string; style?: React.CSSProperties; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useBodyScrollLock(open && mounted);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src} alt={alt} style={{ ...style, cursor: 'zoom-in' }}
        className={`cs-expandable-img ${className ?? ''}`}
        onClick={() => setOpen(true)}
      />
      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(8,8,8,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 32px', cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 36, height: 36, borderRadius: '50%',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            className="cs-lightbox-chip"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src} alt={alt}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'min(88vw, 1280px)', maxHeight: '82vh', objectFit: 'contain', borderRadius: 14, cursor: 'none', display: 'block' }}
          />
        </div>,
        document.body
      )}
    </>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FindingFocusAiAssistantCaseStudy() {
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
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] min-[600px]:pr-[100px]">

      {/* Fixed white bar — DOM-controlled (no React state) to stay in sync with scroll */}
      <div ref={ideationMaskRef} style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: '#fcfcfc', zIndex: 50, pointerEvents: 'none',
      }} />

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(0,110,254,0.12)] to-[#fcfcfc] to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-0">

          {/* Company branding */}
          <div className="flex items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/case-studies/finding-focus-ai-assistant/finding-focus-logo.svg" alt="Finding Focus logo" className="h-7 w-auto" style={{ filter: 'brightness(0)' }} />
            <span className="text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus • Edtech • UX Design</span>
          </div>

          {/* Title */}
          <h1 className="text-[26px] sm:text-[30px] md:text-[36px] font-semibold leading-[110%] tracking-[-1px] text-[#1a1a1a] mb-4 max-w-[680px]">
            Finding Focus AI Assistant
          </h1>

          <p className="text-[15px] md:text-[18px] font-normal leading-[170%] text-[#555] max-w-[800px] mb-10">
            Leveraging OpenAI&apos;s Chat Completions API to build an AI Assistant that scales 1:1 support across our
            entire teacher base.
          </p>

          {/* Hero illustration */}
          <HeroIllustration />

          {/* Team / Timeline / My Role */}
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
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Aug – Nov 2024</p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">My Role</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">UX Lead</p>
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
                Finding Focus&apos;s most successful teachers all had one thing in common — hands-on support from
                our team. With fewer than 5% of sign-ups ever getting that, we designed an LLM-powered assistant to
                bring the same personalized help to every teacher, on demand. It shipped in 2024 and cut support
                tickets by 12% year-over-year.
              </p>
              <StatRow
                stats={[
                  { value: '18%', label: 'of first-time users clicked into the assistant' },
                  { value: '62%', label: 'of users who opened it went on to ask a question' },
                  { value: '12%', label: 'fewer support tickets year-over-year' },
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

      {/* ── CONTEXT ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="Context"
          heading="Finding Focus is an edtech company building attention-training tools for classrooms."
          body="Teachers use our tools through a dedicated teacher interface where they can share courses with students, facilitate classroom activities, and track progress over time."
        >
          <VisualCard caption="The Classroom Dashboard within the teacher interface">
            <div className="flex items-center justify-center p-4 sm:p-8">
              <ExpandableImage
                src="/case-studies/finding-focus-ai-assistant/focus-tab-bezel.png"
                alt="The Classroom Dashboard within the Finding Focus teacher interface"
                className="w-full max-w-[720px] h-auto block"
              />
            </div>
          </VisualCard>
        </Section>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="The Problem"
          heading="Our most successful teachers all received hands-on support, but that support didn't scale."
          body="One-on-one support was the difference-maker during implementation, but between our team's limited bandwidth and teachers not knowing how to reach us, fewer than 5% of sign-ups ever received it."
        >
          <VisualCard caption="Less than 5% of all of Finding Focus's sign-ups received one-on-one support">
            <div className="flex items-center justify-center py-12 px-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/case-studies/finding-focus-ai-assistant/teacher%20reach%20diagram.png" alt="Teacher reach diagram" className="w-full max-w-[520px] h-auto block" />
            </div>
          </VisualCard>
        </Section>
      </section>

      {/* ── HYPOTHESIS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Hypothesis"
            heading="An AI assistant could deliver hands-on support at scale."
            body="Our only self-serve option was a dense Zendesk help center teachers had to search on their own — something busy teachers rarely have time for. Hands-on support worked because we answered questions directly and anticipated the ones teachers hadn't thought to ask. An AI assistant could bridge that gap between a static help center and a real person."
          >
            <VisualCard caption="What users see when navigating Finding Focus' Zendesk site">
              <div className="flex items-center justify-center p-4 sm:p-8">
                <div style={{ width: '100%', maxWidth: 720, overflow: 'hidden', borderRadius: 12 }}>
                  <ExpandableImage
                    src="/case-studies/finding-focus-ai-assistant/zendesk-help-center.png"
                    alt="Finding Focus' Zendesk help center, showing the Facilitating with Students article category"
                    className="w-full h-auto block"
                    style={{ marginBottom: -4 }}
                  />
                </div>
              </div>
            </VisualCard>
          </Section>

          <div style={{ maxWidth: '690px' }}>
            <Callout
              label="Added Motivation"
              heading="Building this also kept us competitive for edtech grants."
              body="As a non-profit, Finding Focus relies on grant funding, and demonstrating that we could meaningfully incorporate AI made us more competitive for grants."
            />
          </div>
        </div>
      </section>

      {/* ── PROJECT GOALS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="Project Goals"
            heading="Before designing anything, I defined what a great assistant needed to do."
          >
            <GoalCards />
          </Section>

          {/* North Star — centered, bordered container matching the Achievements template */}
          <div
            className="rounded-[24px] px-8 py-10 flex flex-col items-center text-center gap-4 bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <NorthStarAnimatedIcon className="block size-14 shrink-0" />
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>North Star</p>
            <p className="text-[24px] font-semibold leading-[145%] tracking-[-0.3px] text-[#1a1a1a] max-w-[680px]">
              Create a genuinely helpful assistant that provides relevant answers to any question about Finding Focus.
            </p>
          </div>

        </div>
      </section>

      <Divider label="Research" id="section-research" />

      {/* ── RESEARCH ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          {/* User Interviews */}
          <Section
            eyebrow="User Interviews"
            heading="Teachers were skeptical of chatbots."
            body="I began by interviewing teachers about their support needs. A clear pattern emerged: 6 of the 10 were wary of an in-product chatbot, with 4 citing past experiences with chatbots that did not answer their questions as well as a human would have."
          >
            <div className="flex flex-col gap-6">
              <VisualCard>
                <div className="pt-8 sm:pt-10 pb-10 md:pb-14 px-10 md:px-14 flex flex-col items-center gap-6">
                  <p className="text-[15px] font-semibold text-[#1a1a1a]">Traditional Chatbot Experience</p>
                  <ChatbotFlowDiagram />
                </div>
              </VisualCard>
              <div className="pain-point-grid grid gap-3 grid-cols-1 lg:grid-cols-3">
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

          {/* Unit 1: Two options */}
          <Section
            eyebrow="Evaluation"
            heading="Two options. One clear winner."
            body="Before anything else, Finding Focus had to decide on the 'brain' of our chat interface — the core technology that would understand and respond to user requests. I evaluated two main approaches: Rule-Based NLU systems and Large Language Model (LLM) APIs."
          >
            {/* Comparison cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Left: NLU */}
                <div className="rounded-[24px] bg-white p-8 flex flex-col gap-5" style={{ border: `1px solid ${BORDER}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/case-studies/NLU.svg" alt="" className="w-8 h-8" />
                  <div>
                    <p className="text-[17px] font-semibold text-[#1a1a1a]">Rule-Based NLU APIs</p>
                    <p className="text-[13px] text-[#999] mt-0.5">Dialogflow, Amazon Lex, Rasa</p>
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
                <div className="rounded-[24px] bg-white p-8 flex flex-col gap-5 relative" style={{ border: `1px solid ${BORDER}` }}>
                  <div className="absolute top-6 right-6">
                    <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-[rgba(0,110,254,0.12)] rounded-full px-3 py-1" style={{ color: ACCENT_DARK }}>Winner</span>
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
          </Section>

          {/* Unit 2: Competitive analysis + scroll deck — gap-20 (80px) between intro copy and deck only */}
          <div className="flex flex-col gap-20">
            <Section
              eyebrow="Comparative Analysis"
              heading={
                <>
                  Following{' '}
                  <TermTooltip tip="Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.">
                    Jakob&apos;s Law
                  </TermTooltip>
                  , I collected and compared patterns from the most popular LLMs
                </>
              }
              body={<>The LLM chat interfaces I focused on were: <strong className="font-semibold">Gemini, Claude, Meta AI, and ChatGPT</strong>. There were three key patterns that I compared:</>}
            />
            <ResearchDeck />
          </div>

          {/* Key Insights — scroll deck matching comparative analysis */}
          <div className="flex flex-col gap-20">
            <div className="flex flex-col gap-3">
              <Eyebrow label="Key Insights" />
              <h2 className="text-[22px] md:text-[30px] font-semibold text-[#1a1a1a] leading-[120%]">Three patterns emerged as the UX fundamentals to get right.</h2>
              <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555]">From the leading LLM chat interfaces, three patterns rose to the top. Together they made the difference between a chat experience that felt clunky and one that felt enjoyable.</p>
            </div>
            <InsightsDeck />
          </div>

        </div>
      </section>

      <Divider label="Design" id="section-design" />

      {/* ── IDEATION: sections 1 & 2 share a sticky eyebrow; eyebrow releases at section 3 ── */}
      <div ref={ideationWrapperRef} style={{ position: 'relative' }}>

        {/* Sentinel: 0-height element at the wrapper top. The IntersectionObserver
            above detects when this scrolls within 48px of the viewport top and
            triggers the fixed white bar to fill the gap above the sticky eyebrow. */}
        <div ref={ideationSentinelRef} style={{ height: 0 }} />

        {/* Sticky "Ideation" eyebrow */}
        <div style={{
          position: 'sticky', top: 48, zIndex: 20, pointerEvents: 'none',
          background: '#fcfcfc',
        }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20" style={{ paddingTop: 0, paddingBottom: 16 }}>
            <Eyebrow label="UX Considerations" />
          </div>
        </div>

        {/* ── IDEATION: ACCESS POINT ── */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28" style={{ marginTop: -16 }}>
          <div className="flex flex-col gap-12">

            <Section
              heading="How these decisions got made"
              body="We didn't have the budget for formal user testing, and waiting for it would have meant not shipping. Instead, I anchored each decision to patterns teachers already knew from the products they use every day and made the call with my best judgement. The launch data would tell us quickly if a bet wasn't landing. For a team our size, that was the right trade."
            />

            <Section
              heading="Where should teachers access the assistant from?"
              body="Where teachers reach the assistant from shapes how often they actually use it. Put it somewhere prominent and it reads as a core part of the platform; bury it and it feels like an afterthought they'll forget is there."
            />

            <IdeationToggle items={[
              { src: assets.ideationFabWireframe, alt: 'Floating action button wireframe', secondSrc: assets.ideationFabComparison, secondAlt: 'FAB pros and cons', label: 'FAB', winner: true },
              { src: assets.ideationNavDrawerWireframe, alt: 'Dedicated tab in the nav drawer wireframe', secondSrc: assets.ideationNavDrawerComparison, secondAlt: 'Nav drawer pros and cons', label: 'Nav Bar' },
            ]} />

            <WinningChoiceCallout
              heading="Floating Action Button"
              body="Always reachable without pulling teachers away from what they're doing."
            />

            <VisualCard caption="The FAB design we implemented along with a callout to draw attention to the assistant">
              <div className="relative flex items-center justify-center p-4 sm:p-8">
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  GIF
                </div>
                <ExpandableImage
                  src={assets.fabCalloutZoom}
                  alt="Floating action button with a callout prompting teachers to message the AI assistant"
                  className="w-full max-w-[720px] h-auto block rounded-xl"
                />
              </div>
            </VisualCard>

          </div>
        </section>

        {/* ── IDEATION: DISPLAY FORMAT ── */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
          <div className="flex flex-col gap-12">

            <Section
              heading="How should the assistant show up when a teacher opens it?"
              body="The layout sets the tone for the whole interaction. I wanted to ensure the conversation had enough room to breathe, but also create a design that made it easy for teachers to open and close the conversation without losing their place in the interface."
            />

            <IdeationToggle items={[
              { src: assets.ideationDisplayAnchoredWireframe, alt: 'Anchored modal overlay wireframe', secondSrc: assets.ideationDisplayAnchoredComparison, secondAlt: 'Anchored modal pros and cons', label: 'Modal', winner: true },
              { src: assets.ideationDisplaySplitWireframe, alt: 'Split view wireframe', secondSrc: assets.ideationDisplaySplitComparison, secondAlt: 'Split view pros and cons', label: 'Split View' },
              { src: assets.ideationDisplayFullscreenWireframe, alt: 'Full screen modal wireframe', secondSrc: assets.ideationDisplayFullscreenComparison, secondAlt: 'Full screen modal pros and cons', label: 'Full Screen' },
            ]} />

            <WinningChoiceCallout
              heading="Anchored Modal Overlay"
              body="Stays present without taking over — enough screen space to have a real conversation, without losing sight of where you are."
            />

            <VisualCard caption="The assistant lives inside a modal that is anchored to the right side of the screen">
              <div className="relative flex items-center justify-center p-4 sm:p-8">
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  Image
                </div>
                <ExpandableImage
                  src={assets.modalOverlay}
                  alt="Finding Focus AI Assistant modal anchored to the right side of the screen"
                  className="w-full max-w-[720px] h-auto block rounded-xl"
                />
              </div>
            </VisualCard>

          </div>
        </section>

      </div>{/* sticky eyebrow releases here — section 3 scrolls freely */}

      {/* ── IDEATION: EMPTY STATE ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">

          <Section
            heading="What should teachers see before the conversation starts?"
            body="The empty state carries a lot of weight as the first thing teachers see. Too little direction and they don't know what to ask; too much and it feels scripted. I was looking for the middle ground that gave them a starting point without making the assistant feel rigid."
          />

          <IdeationToggle items={[
            { src: assets.ideationEmptyTilesWireframe, alt: 'Suggested question tiles wireframe', secondSrc: assets.ideationEmptyTilesComparison, secondAlt: 'Suggested question tiles pros and cons', label: 'Suggested Questions', winner: true },
            { src: assets.ideationEmptyProactiveWireframe, alt: 'Proactive greeting wireframe', secondSrc: assets.ideationEmptyProactiveComparison, secondAlt: 'Proactive greeting pros and cons', label: 'Proactive Greeting' },
            { src: assets.ideationEmptyBlankWireframe, alt: 'Blank input wireframe', secondSrc: assets.ideationEmptyBlankComparison, secondAlt: 'Blank input pros and cons', label: 'Blank Input' },
          ]} />

          <WinningChoiceCallout
            heading="Suggested Question Tiles"
            body="Question tiles give teachers a clear starting point — and signal what the assistant is actually capable of from the moment it opens."
          />

          <VisualCard caption="The empty state teachers see before sending their first message">
            <div className="relative flex items-center justify-center p-4 sm:p-8">
              <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                GIF
              </div>
              <ExpandableImage
                src={assets.accessingAssistant}
                alt="Empty state of the Finding Focus AI Assistant before the first message"
                className="w-full max-w-[720px] h-auto block rounded-xl"
              />
            </div>
          </VisualCard>

        </div>
      </section>

      {/* ── FINAL DESIGNS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-12 md:pb-20">
        <div className="flex flex-col gap-10">
          <Section
            id="section-final-designs"
            eyebrow="Final Design"
            heading="Putting all of the findings and design decisions together."
          />

          <PrototypeEmbed caption="What it looks like to chat with the Finding Focus AI Assistant." />

          <BreakpointMockups
            caption="Mobile and Web breakpoints"
            items={[
              {
                src: assets.iPhoneMockup,
                alt: 'Mobile breakpoint of the AI assistant',
                caption: 'Mobile breakpoint',
              },
              {
                src: assets.iMacMockup,
                alt: 'Web breakpoint of the AI assistant',
                caption: 'Web breakpoint',
              },
            ]}
          />

          <ErrorStateDesigns />
        </div>
      </section>

      <Divider label="Technical" id="section-under-the-hood" />

      {/* ── TECHNICAL ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          {/* Opener */}
          <Section
            eyebrow="Under the Hood"
            heading="A well-designed assistant that gives wrong answers is worse than no assistant at all."
            body="I spent a lot of time designing the assistant and deciding where it lives and how it presents itself. But none of that matters if the assistant did not accurately respond to queries. Teachers didn't lose trust in chatbots because they looked bad, but because they were confidently unhelpful. Once QA started, that stopped being a research finding and became my problem to fix."
          />

          <Callout
            label="My Role"
            heading="I didn't build the backend, but I helped make sure the assistant was accurate."
            body="Our SWE, Thomas, built and configured the assistant. My job was to define what a good answer looked like from the teacher's side, pressure-test the responses in QA, and flag where they fell short before they reached a classroom."
            compactBody
          />

          {/* The Knowledge Base */}
          <Section
            eyebrow="The Knowledge Base"
            heading="For the assistant to be useful, it had to actually know Finding Focus."
            body="So we built a knowledge base out of our help center content and connected it to the assistant. The idea was simple — before answering a teacher, the assistant searches that knowledge base for the most relevant material and responds from what it finds, rather than from whatever it happened to learn in training."
          >
            <VisualCard caption="How a teacher's question becomes an answer grounded in our documentation">
              <div className="flex items-center justify-center py-12 px-8">
                <RetrievalFlowDiagram />
              </div>
            </VisualCard>
          </Section>

          {/* The Catch */}
          <Section
            eyebrow="Hallucination Mitigation"
            heading="The flow only works if the assistant actually searches. Often, it didn't."
            body="When we started testing the assistant, we found that it was giving very generic answers that were not accurate to Finding Focus. This was because the LLM was skipping the search step entirely and answering from its own general knowledge instead of our documentation."
          >
            <div className="flex flex-col max-w-[760px]">
              <Callout
                variant="danger"
                label="The Problem"
                heading="Confidently deciding not to search"
                body="By default, the model decides for itself whether a question needs a knowledge base search before answering. More often than not, it assumed it already knew enough and answered without ever checking our documentation."
                compactBody
              />
              <div
                className="flex items-center justify-center"
                style={{ height: 40 }}
                aria-hidden="true"
              >
                <ArrowDownward sx={{ fontSize: 20, color: '#999' }} />
              </div>
              <Callout
                variant="success"
                label="The Solution"
                heading="Making the search mandatory"
                body="At the API level we were able to require a knowledge base search on every query before the assistant answered. This solution uses more tokens per response, but it ensures the model views the documentation before responding."
                compactBody
              />
            </div>
          </Section>

          {/* Retrieval quality */}
          <Section
            eyebrow="Retrieval Quality"
            heading="Forcing search was part of the solution, but not the entire one."
            body="Because OpenAI's search mechanics offered zero visibility into what it was retrieving, we built a Slack channel that logged the exact knowledge base snippets (chunks) the assistant retrieved for every query. Reviewing these logs uncovered a core issue: the assistant was consistently ranking broadly related snippets as more relevant than the specific snippets that actually answered the query. This resulted in responses that were only partially accurate."
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col max-w-[760px]">
                <Callout
                  variant="danger"
                  label="The Problem"
                  heading="Oversized Chunks"
                  body="By default, OpenAI split our documentation into large, 750-token chunks. Because our docs cover different topics, a brief, highly accurate answer often shared a chunk with unrelated text. This irrelevant text dragged down the chunk’s overall relevance score, often leading to chunks with the correct answer being ranked below chunks that lacked the right answer entirely, but contained more broadly related keywords."
                  compactBody
                />
                <div
                  className="flex items-center justify-center"
                  style={{ height: 40 }}
                  aria-hidden="true"
                >
                  <ArrowDownward sx={{ fontSize: 20, color: '#999' }} />
                </div>
                <Callout
                  variant="success"
                  label="The Solution"
                  heading="Semantic Chunking"
                  body="Rather than relying on default character splits, we converted our knowledge base PDFs into clean Markdown and used headers and HTML tags to enforce natural document boundaries. Each chunk was capped at 400 tokens and focused on a single topic, ensuring relevance scores reflected precise answers."
                  compactBody
                />
              </div>

              <VisualCard caption="Real retrieval logs for one query, before and after the chunking changes.">
                <div className="flex items-center justify-center px-6">
                  <ChunkAnatomyDiagram />
                </div>
              </VisualCard>
            </div>
          </Section>

          {/* The Result */}
          <Section
            eyebrow="The Result"
            heading="With these updates, the assistant went from educated guesses to precise answers."
            body="Mandating a search step got the model to open our knowledge base, but switching to semantic chunking made sure it actually pulled the right information. Together, these two updates became our core hallucination mitigation and greatly improved the assistant's output."
          >
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-3"
                  style={{ background: '#fceaea' }}
                >
                  <p
                    className="text-[11px] font-medium tracking-[1.5px] uppercase"
                    style={{ color: '#fe0000' }}
                  >
                    Before Retrieval Tuning
                  </p>
                  <p className="text-[48px] sm:text-[56px] font-semibold leading-none tracking-[-1.5px] text-[#1a1a1a]">
                    42%
                  </p>
                  <p className="text-[15px] font-normal leading-[160%] text-[#555]">
                    Response Accuracy Rate
                  </p>
                </div>
                <div
                  className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-3"
                  style={{ background: '#eafaf1' }}
                >
                  <p
                    className="text-[11px] font-medium tracking-[1.5px] uppercase"
                    style={{ color: '#2a8a50' }}
                  >
                    After Retrieval Tuning
                  </p>
                  <p className="text-[48px] sm:text-[56px] font-semibold leading-none tracking-[-1.5px] text-[#1a1a1a]">
                    88%
                  </p>
                  <p className="text-[15px] font-normal leading-[160%] text-[#555]">
                    Response Accuracy Rate
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-[#999] text-center mt-3">
                Based on 100 test queries, graded with an LLM-as-a-judge evaluation before and after the retrieval changes
              </p>
            </div>
          </Section>

        </div>
      </section>

      <Divider label="Outcomes" id="section-outcomes" />

      {/* ── OUTCOMES ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-12 md:pb-20">
        <div className="flex flex-col gap-16">
          {/* 5a Launch Impact — benchmarks + teacher reaction */}
          <Section
            eyebrow="Launch Impact"
            heading="The first signals we were able to track."
            body="After launch, we tracked how teachers engaged with the assistant during onboarding. These are the first numbers we were able to capture, and they set the baseline we'll measure future iterations against."
          >
            <div className="flex flex-col gap-8">
              <StatRow
                stats={[
                  { value: '18%', label: 'of first-time users clicked into the assistant' },
                  { value: '62%', label: 'of users who opened it went on to ask a question' },
                  { value: '12%', label: 'fewer support tickets, Spring + Fall 2025 vs. the same semesters in 2024' },
                ]}
              />
              <div
                className="rounded-[16px] p-4 sm:p-6 flex flex-col gap-3 bg-white max-w-[760px]"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <Eyebrow label="Post-Launch Reaction" />
                <p className="text-[16px] font-normal leading-[165%] text-[#333]">
                  &ldquo;It was easy to talk to the assistant, I liked that I could ask all of the questions I had about getting set up. It was a lot more convenient than emailing support and waiting for a response.&rdquo;
                </p>
                <p className="text-[13px] font-medium text-[#555]">
                  — Caro Middle School Teacher
                </p>
              </div>
            </div>
          </Section>

          {/* 5b Looking Ahead — monitoring + next steps */}
          <Section
            eyebrow="Looking Ahead"
            heading="What we're watching, and what comes next."
            body="The launch numbers were a starting point, not a conclusion. Here is what we are continuing to monitor, and what we plan to build next."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOOKING_AHEAD.map((card) => (
                <OutcomeCard key={card.title} {...card} />
              ))}
            </div>
          </Section>
        </div>
      </section>

      <Divider id="section-reflection" label="Takeaways" />

      {/* ── TAKEAWAYS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-[24px] p-7 flex flex-col gap-3 bg-white" style={{ border: `1px solid ${BORDER}` }}>
              <Eyebrow label="What I Learned" color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">Most of the work is invisible.</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">Before this project, an AI assistant was just a chat window to me. Building one meant learning about RAG, vector stores, tool calling, chunking, hallucination mitigation, and a whole lot more. This project greatly increased my understanding and appreciation of LLMs.</p>
            </div>
            <div className="rounded-[24px] p-7 flex flex-col gap-3 bg-white" style={{ border: `1px solid ${BORDER}` }}>
              <Eyebrow label="What Matters Most" color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">Good design can&apos;t save bad answers.</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">I could get the entry point, layout, and empty state exactly right, and none of it would matter if the answers weren&apos;t accurate. Getting the assistant to respond accurately was the most important part of the UX.</p>
            </div>
          </div>
      </section>

    </div>
  );
}
