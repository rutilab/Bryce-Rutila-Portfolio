'use client';

import { useState, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import UpdateIcon from '@mui/icons-material/Update';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import {
  CaseStudyMediaPlaceholder,
  NorthStarAnimatedIcon,
} from '@/components/case-study';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

/** Section eyebrows, MUI icons, diagram labels — near-black, matches the sibling case studies */
const EYEBROW_ICON_COLOR = '#272727';
/** Finding Focus blue — the accent used across all Finding Focus case studies */
const ACCENT = '#006efe';
const ACCENT_DARK = '#0057c2';
/** Hairline border on white cards (TL;DR, Callout, Takeaways) */
const BORDER = '#e6ecf4';
/** Solid light container for content cards (Project Goals, Edge Cases) */
const CARD_LIGHT = '#f5f7fa';
/** Blue media well behind case study visuals */
const BLOCK_BG = 'rgba(220, 232, 248, 0.45)';
/** Red wash + red used for the drop-off evidence cards */
const DANGER = '#fe0000';
const DANGER_BG = '#fceaea';
/** Muted brick red for the pre-redesign manual flow — softer than DANGER, which is reserved for stats */
const MANUAL_RED = '#b0392f';
/** Near-black used for inverted surfaces — flowchart terminals, the stat strip */
const INK = '#1c1e1f';
const SUCCESS = '#2a8a50';
const SUCCESS_BG = '#eafaf1';
/**
 * Sign-up edge cases — warm rather than red, so these read as "exception" not
 * "error". The orange lives only in the accent bar and wash, which carry no text
 * and so can run at the portfolio's full-strength orange; the label stays near-black.
 */
const EDGE_BAR = '#ff9c12';
const EDGE_BG = 'rgba(255, 156, 18, 0.08)';

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

// ── Utility components ───────────────────────────────────────────────────────

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
  heading: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
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

/** Accent bar + wash per tone. Neutral is the only one that stays white. */
const CALLOUT_TONE = {
  neutral: { bar: ACCENT_DARK, label: ACCENT_DARK, bg: undefined },
  danger: { bar: DANGER, label: DANGER, bg: DANGER_BG },
  success: { bar: SUCCESS, label: SUCCESS, bg: SUCCESS_BG },
  // Only tone that splits the two — the orange lives entirely in the bar.
  edge: { bar: EDGE_BAR, label: EYEBROW_ICON_COLOR, bg: EDGE_BG },
} as const;

/** Left accent-bar callout — neutral (blue), danger (red), success (green), edge (orange). */
function Callout({
  label,
  heading,
  body,
  compactBody,
  variant = 'neutral',
}: {
  label: string;
  heading: string;
  body?: string;
  compactBody?: boolean;
  variant?: keyof typeof CALLOUT_TONE;
}) {
  const tone = CALLOUT_TONE[variant];
  const bg = tone.bg;
  return (
    <div
      className={`flex max-w-[760px] items-stretch gap-4 sm:gap-5 rounded-[16px] p-4 sm:p-6 ${bg ? '' : 'bg-white'}`}
      style={bg ? { background: bg } : { border: `1px solid ${BORDER}` }}
    >
      <div style={{ width: 2, borderRadius: 2, background: tone.bar, flexShrink: 0 }} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: tone.label }}>
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

/** Visual container — blue media well with optional caption. */
function VisualCard({
  children,
  caption,
  pad,
  background = BLOCK_BG,
}: {
  children: ReactNode;
  caption?: string;
  /** Padding class for grouped media; omit when children bring their own padding. */
  pad?: string;
  /** Override the blue well — used where the asset supplies its own surface. */
  background?: string;
}) {
  return (
    <div>
      <div className="rounded-[24px] overflow-clip" style={{ background }}>
        {pad ? <div className={pad}>{children}</div> : children}
      </div>
      {caption && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-[13px] text-[#999] text-center">{caption}</span>
        </div>
      )}
    </div>
  );
}

function PlaceholderVisual({ description, minHeight = 320 }: { description: string; minHeight?: number }) {
  return <CaseStudyMediaPlaceholder description={description} minHeight={minHeight} />;
}

/** Blue media well wrapping a to-be-supplied asset. */
function PlaceholderCard({ description, caption, minHeight }: { description: string; caption?: string; minHeight?: number }) {
  return (
    <VisualCard caption={caption} pad="p-4 sm:p-6">
      <PlaceholderVisual description={description} minHeight={minHeight} />
    </VisualCard>
  );
}

// ── StatRow: headline numbers with a blue underline tick ──────────────────────
function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.45);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-[820px]">
      {stats.map((s, i) => (
        <div key={i}>
          <div className="flex flex-col w-fit">
            <p className="text-[24px] font-semibold text-[#1a1a1a] leading-[32px]">{s.value}</p>
            <div
              style={{
                // Full width of the value above it — the parent is `w-fit`, so
                // the rule underlines the whole number rather than ticking it.
                width: '100%',
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

// ── SmallStatRow: two evidence stats, danger or neutral treatment ─────────────
function SmallStatRow({
  stats,
  variant = 'danger',
}: {
  stats: { value: string; label: string }[];
  variant?: 'danger' | 'neutral';
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const isDanger = variant === 'danger';

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-[20px] p-6"
          style={{
            background: isDanger ? DANGER_BG : CARD_LIGHT,
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
              background: isDanger ? DANGER : ACCENT,
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

// ── ProductivityStrip: one divided strip, final segment flagged ──────────────
/**
 * A single strip rather than three cards: the three figures are one argument
 * (cost → volume → ceiling), and the last segment carries the danger wash to
 * land the conclusion. Dividers come from a 1px gap over a BORDER-coloured
 * backing, which draws correctly whether the segments sit in a row or stack.
 */
const PRODUCTIVITY_STATS = [
  { title: 'Individual Cost', value: '8 min', caption: 'Average hands-on labor per sign-up.' },
  { title: 'Peak Volume', value: '10+/hr', caption: 'Sign-up volume during peak hours.' },
  { title: 'System Bottleneck', value: '80+ min', caption: 'Of labor generated every 60 minutes.', highlight: true },
];

function ProductivityStrip() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div
      ref={ref}
      className="overflow-clip rounded-[20px]"
      style={{
        border: `1px solid ${BORDER}`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      <div className="flex flex-col gap-px md:flex-row" style={{ background: BORDER }}>
        {PRODUCTIVITY_STATS.map(s => (
          <div
            key={s.title}
            className="flex-1 px-6 py-7"
            style={{ background: s.highlight ? DANGER_BG : '#ffffff' }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[1.5px]"
              style={{ color: s.highlight ? DANGER : '#8a97a8' }}
            >
              {s.title}
            </p>
            <p className="mt-2.5 text-[30px] font-semibold leading-[38px] tracking-[-0.5px] text-[#1a1a1a]">
              {s.value}
            </p>
            <p className="mt-1.5 text-[14px] leading-[160%] text-[#666]">{s.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NumberedCards: 01 / 02 / 03 with a mono numeral ───────────────────────────
function NumberedCards({ items }: { items: { n: string; title: string; body: string }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="grid gap-3 grid-cols-1 lg:grid-cols-3">
      {items.map((g, i) => (
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

// ── SignupFlowSequence: hero animation ────────────────────────────────────────
/**
 * The four screens a teacher moves through, activating one at a time on a loop.
 * The final card is the payoff — the account exists before anyone has reviewed it —
 * so it holds twice as long as the three steps that lead to it.
 */
const SIGNUP_STEPS = [
  {
    step: '01',
    title: 'Account Type',
    lines: ['Educator', 'Student', 'Administrator'],
    kind: 'choice' as const,
  },
  {
    step: '02',
    title: 'Workplace',
    lines: ['K-8 School', 'High School', 'College', 'District / County'],
    kind: 'choice' as const,
  },
  {
    step: '03',
    title: 'Create Account',
    lines: ['Full name', 'Email address', 'Password'],
    kind: 'form' as const,
  },
  {
    step: '',
    title: "You're in",
    lines: ['Account active', 'Class creation locked'],
    kind: 'done' as const,
  },
];

const SIGNUP_HOLD_MS = 1500;

function SignupCard({ item, active }: { item: (typeof SIGNUP_STEPS)[number]; active: boolean }) {
  const done = item.kind === 'done';
  return (
    <div
      className="flex flex-col gap-3 rounded-[16px] p-4 sm:p-5 bg-white"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        boxShadow: active ? '0 10px 26px rgba(0,110,254,0.16)' : '0 1px 2px rgba(0,13,38,0.04)',
        opacity: active ? 1 : 0.55,
        transform: active ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium tracking-[1px]"
          style={{ color: done ? SUCCESS : ACCENT_DARK, fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
        >
          {done ? 'DONE' : item.step}
        </span>
      </div>
      <p className="text-[14px] font-semibold text-[#1a1a1a] leading-[130%]">{item.title}</p>
      <div className="flex flex-col gap-1.5">
        {item.lines.map((line, i) => (
          <div key={line} className="flex items-center gap-2">
            <span
              aria-hidden
              style={{
                width: item.kind === 'choice' ? 9 : 6,
                height: item.kind === 'choice' ? 9 : 6,
                borderRadius: item.kind === 'form' ? 2 : '50%',
                flexShrink: 0,
                background: active && i === 0 ? (done ? SUCCESS : ACCENT) : 'transparent',
                border: `1.5px solid ${active && i === 0 ? (done ? SUCCESS : ACCENT) : '#c8d4e4'}`,
                transition: 'background 0.4s ease, border-color 0.4s ease',
              }}
            />
            <span
              className="text-[12px] leading-[150%]"
              style={{ color: active && i === 0 ? '#1a1a1a' : '#8a97a8' }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupFlowSequence() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // The final card is the point of the whole flow — hold it longer than the steps.
    const hold = active === SIGNUP_STEPS.length - 1 ? SIGNUP_HOLD_MS * 2 : SIGNUP_HOLD_MS;
    const t = window.setTimeout(
      () => setActive(i => (i + 1) % SIGNUP_STEPS.length),
      hold,
    );
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <VisualCard>
      <div className="px-4 py-8 sm:px-8 sm:py-12">
        {/* Four abreast once there's room; below that the cards are unreadable
            side by side, so the sequence plays one card at a time instead. */}
        <div className="mx-auto hidden w-full max-w-[900px] items-stretch gap-2 sm:flex sm:gap-3">
          {SIGNUP_STEPS.map((item, i) => (
            <SignupCard key={item.title} item={item} active={i === active} />
          ))}
        </div>
        <div className="mx-auto flex w-full max-w-[320px] sm:hidden">
          <SignupCard item={SIGNUP_STEPS[active]} active />
        </div>
        <div className="mx-auto mt-6 flex max-w-[900px] items-center justify-center gap-2" aria-hidden>
          {SIGNUP_STEPS.map((item, i) => (
            <span
              key={item.title}
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? ACCENT : '#c8d4e4',
                transition: 'width 0.4s ease, background 0.4s ease',
              }}
            />
          ))}
        </div>
      </div>
    </VisualCard>
  );
}

// ── StepChain: a vertical run of numbered steps, used by both workflow diagrams ─
function StepChain({
  steps,
  tone,
  startAt = 1,
}: {
  steps: string[];
  tone: 'old' | 'new';
  startAt?: number;
}) {
  const isOld = tone === 'old';
  const dot = isOld ? '#b0392f' : ACCENT;
  const bg = isOld ? DANGER_BG : '#ffffff';

  return (
    <ol className="flex flex-col" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s, i) => (
        <li key={s} className="flex flex-col">
          <div
            className="flex items-start gap-3 rounded-[12px] px-3.5 py-3"
            style={{ background: bg, border: isOld ? 'none' : `1px solid ${BORDER}` }}
          >
            <span
              className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ width: 20, height: 20, background: dot, marginTop: 1 }}
            >
              {startAt + i}
            </span>
            <span className="text-[13px] leading-[160%] text-[#444]">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="self-start"
              style={{ width: 1.5, height: 12, marginLeft: 24, background: '#c8d4e4' }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

const OLD_STEPS_BEFORE_BRANCH = [
  'Google the person to confirm they are a real high school teacher',
  'Search the admin portal for their school, checking near-matches so we do not create duplicates',
];
const OLD_STEPS_AFTER_BRANCH = [
  'Type their name, email, and role into an invite form',
  'Compose and send a welcome email from the team shared Gmail',
  'Log the teacher in a tracking spreadsheet',
];

/** Branch chip used where the old flow forks on whether the school already exists. */
function BranchNote({ label, body }: { label: string; body: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-[12px] px-3.5 py-3"
      style={{ background: '#ffffff', border: `1px dashed #c8b0ae` }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[1.2px]" style={{ color: '#b0392f' }}>
        {label}
      </span>
      <span className="text-[13px] leading-[160%] text-[#444]">{body}</span>
    </div>
  );
}

function OldWorkflowDiagram() {
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3">
      <p className="text-[11px] font-medium uppercase tracking-[1.5px]" style={{ color: MANUAL_RED }}>
        Before · 6 steps · ~8 min
      </p>
      <StepChain steps={OLD_STEPS_BEFORE_BRANCH} tone="old" />
      <BranchNote
        label="Step 3 · Branch"
        body="If the school does not exist yet, create it by hand before going any further."
      />
      <StepChain steps={OLD_STEPS_AFTER_BRANCH} tone="old" startAt={4} />
    </div>
  );
}

const NEW_STEPS = [
  'Open the notification and follow its pre-built search link to confirm the teacher',
  'Find them in the Pending Teachers tab and select their school (or create it inline)',
  'Confirm. Nothing to re-type — signup already captured it, and the decision is reversible',
];

function WorkflowComparison() {
  return (
    <VisualCard
      caption="The same job, before and after. Both branches — school exists and school does not — collapse into one select-and-confirm step."
      pad="p-5 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <OldWorkflowDiagram />
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[1.5px]" style={{ color: ACCENT_DARK }}>
            After · 3 steps · ~2 min
          </p>
          <StepChain steps={NEW_STEPS} tone="new" />
        </div>
      </div>
    </VisualCard>
  );
}

// ── VerificationFlowchart: the pre-2023 review, drawn to flowchart convention ──
/**
 * Standard symbols: stadium = start/end, rectangle = process, diamond = decision,
 * circle = on-page connector.
 *
 * Two layout decisions worth recording, both conventional:
 *   1. The source flow is a single 13-node chain, which draws ~1200px tall at a
 *      readable node size. It's split across two columns joined by connector "A"
 *      so the figure stays close to square and scales down without collapsing.
 *   2. The source duplicated "Invite New Teacher" on both sides of the school
 *      branch. Identical process nodes get a single box with the branches merging
 *      into it, so the diagram shows one action rather than implying two.
 *
 * Fixed viewBox + width:100% means it scales to any container; the surrounding
 * figure supplies a magnifier because at phone widths the type gets small.
 */
const FLOW_VB = { w: 1050, h: 760 };

const FLOW_STYLE = {
  terminal: { fill: INK, stroke: 'none', strokeWidth: 0, text: '#ffffff' },
  system: { fill: '#6b7a8f', stroke: 'none', strokeWidth: 0, text: '#ffffff' },
  manual: { fill: MANUAL_RED, stroke: 'none', strokeWidth: 0, text: '#ffffff' },
  clock: { fill: '#7c2d12', stroke: '#5f2210', strokeWidth: 2, text: '#ffffff' },
  decision: { fill: ACCENT_DARK, stroke: 'none', strokeWidth: 0, text: '#ffffff' },
  // Outlined rather than filled: these are the teacher's own steps, and the
  // point of the diagram is that the team doesn't control them.
  teacher: { fill: '#ffffff', stroke: '#1c1e1f', strokeWidth: 1.5, text: '#1c1e1f' },
} as const;

type FlowKind = keyof typeof FLOW_STYLE;

type FlowNode = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  kind: FlowKind;
  lines: string[];
};

const FLOW_NODES: FlowNode[] = [
  // ── Column 1: the request, then the two checks that could end it ──
  { cx: 370, cy: 44, w: 240, h: 48, kind: 'terminal', lines: ['Teacher submits a', 'request form'] },
  { cx: 370, cy: 130, w: 240, h: 52, kind: 'system', lines: ['Request posts to', '#teacher-signups'] },
  { cx: 370, cy: 218, w: 240, h: 52, kind: 'system', lines: ['Reviewer on shift', 'is notified'] },
  { cx: 370, cy: 306, w: 240, h: 52, kind: 'clock', lines: ['Act within 5 minutes'] },
  { cx: 370, cy: 394, w: 240, h: 52, kind: 'manual', lines: ['Google the lead to confirm', 'they teach, and what grade'] },
  { cx: 370, cy: 496, w: 210, h: 80, kind: 'decision', lines: ['A real teacher?'] },
  { cx: 370, cy: 612, w: 210, h: 80, kind: 'decision', lines: ['A K-8 teacher?'] },
  // Both dead ends hang off the left gutter — neither results in an account.
  { cx: 120, cy: 496, w: 190, h: 52, kind: 'manual', lines: ['No invite — account', 'rejection email sent'] },
  { cx: 120, cy: 612, w: 200, h: 66, kind: 'manual', lines: ['No invite — send email', 'template explaining', 'our audience'] },
  // ── Column 2: provisioning, then the teacher's own half ──
  { cx: 680, cy: 142, w: 220, h: 80, kind: 'decision', lines: ['School already', 'in the database?'] },
  { cx: 930, cy: 142, w: 190, h: 52, kind: 'manual', lines: ['Create new', 'school entry'] },
  { cx: 680, cy: 251, w: 240, h: 66, kind: 'manual', lines: ['Manually add teacher to', 'school — type name,', 'email, and role'] },
  { cx: 680, cy: 346, w: 240, h: 52, kind: 'system', lines: ['Adding them generates', 'a unique invite link'] },
  { cx: 680, cy: 434, w: 240, h: 52, kind: 'manual', lines: ['Send welcome email', 'template with invite link'] },
  { cx: 680, cy: 522, w: 240, h: 52, kind: 'teacher', lines: ['Teacher opens the email', 'and clicks the link'] },
  { cx: 680, cy: 617, w: 250, h: 66, kind: 'teacher', lines: ['Teacher creates their account:', 'confirming email and', 'setting a password'] },
  { cx: 680, cy: 710, w: 250, h: 48, kind: 'terminal', lines: ['Account created — full access'] },
];

/** Straight and elbowed connectors. Every polyline ends in an arrowhead. */
const FLOW_EDGES: { points: [number, number][] }[] = [
  { points: [[370, 68], [370, 104]] },     // request → posts
  { points: [[370, 156], [370, 192]] },    // posts → notified
  { points: [[370, 244], [370, 280]] },    // notified → act within 5 min
  { points: [[370, 332], [370, 368]] },    // 5 min → google
  { points: [[370, 420], [370, 456]] },    // google → real teacher?
  { points: [[265, 496], [217, 496]] },    // real teacher? → No, rejection email
  { points: [[370, 536], [370, 572]] },    // real teacher? → Yes, K-8?
  { points: [[265, 612], [222, 612]] },    // K-8? → Yes, audience email, no account
  // The column jump, routed rather than broken by a connector symbol: down out of
  // column 1, up the channel between the columns, then into the school decision.
  { points: [[370, 652], [370, 700], [525, 700], [525, 66], [680, 66], [680, 102]] },
  { points: [[790, 142], [833, 142]] },    // school? → No, create it
  { points: [[680, 182], [680, 218]] },    // school? → Yes, add the teacher
  { points: [[930, 168], [930, 251], [802, 251]] }, // new school → merge into adding them
  { points: [[680, 284], [680, 320]] },    // added → link generated
  { points: [[680, 372], [680, 408]] },    // link → welcome email
  { points: [[680, 460], [680, 496]] },    // email → teacher opens it
  { points: [[680, 548], [680, 584]] },    // opens → creates account
  { points: [[680, 650], [680, 686]] },    // creates → access
];

const FLOW_EDGE_LABELS: { x: number; y: number; text: string; anchor: 'start' | 'middle' }[] = [
  { x: 241, y: 486, text: 'No', anchor: 'middle' },
  { x: 382, y: 562, text: 'Yes', anchor: 'start' },
  { x: 243, y: 602, text: 'Yes', anchor: 'middle' },
  { x: 382, y: 678, text: 'No', anchor: 'start' },
  { x: 811, y: 132, text: 'No', anchor: 'middle' },
  { x: 692, y: 205, text: 'Yes', anchor: 'start' },
];

function FlowNodeShape({ node, idPrefix }: { node: FlowNode; idPrefix: string }) {
  const { cx, cy, w, h, kind, lines } = node;
  const style = FLOW_STYLE[kind];
  const x = cx - w / 2;
  const y = cy - h / 2;
  // Two lines straddle the centre; one line sits on it.
  const firstY = cy - (lines.length - 1) * 9;

  return (
    <g>
      {kind === 'decision' ? (
        <polygon
          points={`${cx},${y} ${cx + w / 2},${cy} ${cx},${y + h} ${cx - w / 2},${cy}`}
          fill={style.fill}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={kind === 'terminal' ? h / 2 : 7}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
        />
      )}
      <text
        x={cx}
        y={firstY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={style.text}
        fontSize={14}
        fontWeight={500}
        fontFamily="var(--font-inter), Inter, sans-serif"
      >
        {lines.map((line, i) => (
          <tspan key={`${idPrefix}-${cx}-${cy}-${i}`} x={cx} dy={i === 0 ? 0 : 18}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function VerificationFlowchart({ idPrefix, minWidth }: { idPrefix: string; minWidth?: number }) {
  const arrowId = `${idPrefix}-arrow`;

  return (
    <svg
      viewBox={`0 0 ${FLOW_VB.w} ${FLOW_VB.h}`}
      role="img"
      aria-labelledby={`${idPrefix}-title ${idPrefix}-desc`}
      style={{ width: '100%', height: 'auto', display: 'block', minWidth }}
    >
      <title id={`${idPrefix}-title`}>
        Teacher verification workflow before the April 2023 redesign
      </title>
      <desc id={`${idPrefix}-desc`}>
        A teacher submits a request form, which posts to the #teacher-signups Slack channel and notifies
        whoever is on shift, who must act within five minutes. They Google the lead to confirm the person
        teaches and at what grade level. Two outcomes end there with no account: if they are not a real
        teacher, an account rejection email is sent; if they are a K-8 teacher, they are sent an email
        template explaining our audience. Otherwise the reviewer checks whether the school is already in
        the database, creating a new school entry if not, then manually adds the teacher to that school by
        typing their name, email, and role, which generates a unique invite link. The reviewer sends the
        welcome email template containing that link. Only then can the teacher open the email, click the
        link, and create their account by confirming their email and setting a password.
      </desc>

      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#8a97a8" />
        </marker>
      </defs>

      {FLOW_EDGES.map((edge, i) => (
        <polyline
          key={i}
          points={edge.points.map(([px, py]) => `${px},${py}`).join(' ')}
          fill="none"
          stroke="#8a97a8"
          strokeWidth={1.5}
          markerEnd={`url(#${arrowId})`}
        />
      ))}

      {FLOW_EDGE_LABELS.map(label => (
        <text
          key={`${label.x}-${label.y}`}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor}
          fill="#6b7280"
          fontSize={12}
          fontWeight={500}
          fontFamily="var(--font-inter), Inter, sans-serif"
        >
          {label.text}
        </text>
      ))}

      {FLOW_NODES.map(node => (
        <FlowNodeShape key={`${node.cx}-${node.cy}`} node={node} idPrefix={idPrefix} />
      ))}
    </svg>
  );
}

// ── Flowchart legend ─────────────────────────────────────────────────────────
const FLOW_LEGEND: { kind: FlowKind; label: string }[] = [
  { kind: 'terminal', label: 'Start / end' },
  { kind: 'system', label: 'Automatic — no person involved' },
  { kind: 'manual', label: 'Hands-on step' },
  { kind: 'clock', label: 'Time-boxed constraint' },
  { kind: 'decision', label: 'Decision' },
  { kind: 'teacher', label: "Teacher's own action" },
];

/** Legend swatches echo the symbol each category uses in the chart. */
function LegendSwatch({ kind }: { kind: FlowKind }) {
  if (kind === 'decision') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden style={{ flexShrink: 0 }}>
        <polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill={FLOW_STYLE.decision.fill} />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden style={{ flexShrink: 0 }}>
      <rect
        x="1"
        y="4"
        width="14"
        height="8"
        rx={kind === 'terminal' ? 4 : 2}
        fill={FLOW_STYLE[kind].fill}
        stroke={FLOW_STYLE[kind].stroke}
        strokeWidth={FLOW_STYLE[kind].strokeWidth === 0 ? 0 : 1.5}
      />
    </svg>
  );
}

function FlowchartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {FLOW_LEGEND.map(item => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11.5px] text-[#6b7280]">
          <LegendSwatch kind={item.kind} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ── ZoomPanViewport: fit-to-view, click to zoom, drag or scroll to pan ───────
const DIAGRAM_SCALE_MAX = 4;

/**
 * Scroll-based rather than transform-based on purpose: overflowing a scroll
 * container gives real scrollbars, so it's visible that there's more to see.
 * Dragging just moves scroll position, which keeps the two in sync for free.
 */
function ZoomPanViewport({
  intrinsic,
  panelStyle,
  children,
}: {
  /** The figure's own viewBox size — the target when zoomed in. */
  intrinsic: { w: number; h: number };
  panelStyle?: CSSProperties;
  children: ReactNode;
}) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, chromeY: 0 });
  /** Multiplier on the fitted width. 1 = fully visible. */
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  /** Set once a drag passes the slop threshold, so releasing doesn't also toggle zoom. */
  const movedRef = useRef(false);

  const aspect = intrinsic.w / intrinsic.h;

  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const measure = () => {
      // clientWidth includes padding, so subtract it or the panel's own padding
      // pushes the fitted diagram into horizontal overflow.
      const cs = getComputedStyle(vp);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      // `height` sets the border box under Tailwind's border-box default, so the
      // borders count toward it too.
      const chromeY =
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth);
      const w = vp.clientWidth - padX;
      if (w <= 0) return;
      const maxH = Math.min(window.innerHeight * 0.62, 560);
      // Sit a little inside the frame rather than edge to edge.
      const fitW = Math.min(w, maxH * aspect) * 0.92;
      setBox({ w: fitW, h: fitW / aspect, chromeY });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [aspect]);

  const contentW = box.w * scale;
  const zoomed = scale > 1;
  /** What a plain click jumps to — the diagram's own size, within reason. */
  const clickScale = box.w ? Math.min(DIAGRAM_SCALE_MAX, Math.max(1.75, intrinsic.w / box.w)) : 1.75;

  // Ctrl/Cmd + wheel, the Figma convention. Registered natively because it must
  // preventDefault to stop the browser's own page zoom, which React's passive
  // wheel listener cannot do. Trackpad pinch arrives as ctrl+wheel too, so this
  // gives pinch-to-zoom for free. Plain scrolling is left alone to pan.
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setScale(s => {
        const next = s * Math.exp(-e.deltaY * 0.0025);
        return Math.min(DIAGRAM_SCALE_MAX, Math.max(1, next));
      });
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    const vp = vpRef.current;
    if (!zoomed || !vp) return;
    movedRef.current = false;
    dragRef.current = { x: e.clientX, y: e.clientY, left: vp.scrollLeft, top: vp.scrollTop };
    setDragging(true);
    vp.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    const vp = vpRef.current;
    if (!d || !vp) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    vp.scrollLeft = d.left - dx;
    vp.scrollTop = d.top - dy;
  }

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  return (
    <div
      ref={vpRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => {
        if (movedRef.current) return;
        setScale(s => (s > 1 ? 1 : clickScale));
      }}
      className="cs-zoom-viewport"
      data-mode={dragging ? 'dragging' : zoomed ? 'pan' : 'fit'}
      style={{
        ...panelStyle,
        height: box.h ? box.h + box.chromeY : undefined,
        overflow: 'auto',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        scrollbarColor: '#b9c6d8 transparent',
        cursor: dragging ? 'grabbing' : zoomed ? 'grab' : 'zoom-in',
      }}
    >
      <div
        style={{
          width: contentW || '100%',
          height: contentW ? contentW / aspect : undefined,
          margin: '0 auto',
          transition: dragging ? 'none' : 'width 0.2s ease, height 0.2s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── MagnifiableFigure: shared click-to-enlarge wrapper ───────────────────────
/**
 * Both diagrams scale down to unreadable type on a phone, so both need the same
 * magnifier. `renderContent` receives the mode because the two copies must not
 * share SVG element ids, and the zoomed copy needs a min-width — without one it
 * simply refits the viewport and nothing gets bigger.
 */
function MagnifiableFigure({
  ariaLabel,
  title,
  panelStyle,
  footer,
  intrinsic,
  renderContent,
}: {
  ariaLabel: string;
  title?: ReactNode;
  panelStyle?: CSSProperties;
  footer?: ReactNode;
  /** The figure's own viewBox size, used to fit and zoom it when magnified. */
  intrinsic: { w: number; h: number };
  renderContent: (mode: 'inline' | 'zoom') => ReactNode;
}) {
  // No mounted flag needed: `open` only ever flips on a click, so the portal
  // never renders during SSR where `document.body` would be missing.
  const [open, setOpen] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-5">
        {title}
        <div className="group relative">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={ariaLabel}
            className="block w-full"
            style={{ ...panelStyle, cursor: 'zoom-in' }}
          >
            {renderContent('inline')}
          </button>
          {/* Hover/focus only — tapping the figure still works on touch. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-2 right-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4a5568] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <ZoomInIcon sx={{ fontSize: 15 }} />
            Magnify
          </span>
        </div>
        {footer}
      </div>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${ariaLabel}, magnified`}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(8, 10, 16, 0.82)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(16px, 4vw, 48px)',
                cursor: 'zoom-out',
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                className="flex w-full flex-col gap-5 rounded-[20px] bg-white"
                style={{
                  maxWidth: 1240,
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  padding: 'clamp(20px, 3vw, 36px)',
                  cursor: 'default',
                }}
              >
                {title}
                <ZoomPanViewport intrinsic={intrinsic} panelStyle={panelStyle}>
                  {renderContent('zoom')}
                </ZoomPanViewport>
                {footer}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the magnified diagram"
                className="cs-lightbox-chip"
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

// ── ManualWorkflowFigure: titled flowchart + legend ──────────────────────────
/** FigJam-style canvas the chart sits on — white with a fine dot grid. */
const FLOW_PANEL: CSSProperties = {
  background: '#ffffff',
  backgroundImage: 'radial-gradient(circle, #d5dde9 1px, transparent 1px)',
  backgroundSize: '18px 18px',
  borderRadius: 16,
  padding: '22px 16px',
};

const FLOW_TITLE = 'Old Teacher Verification Workflow';
const FLOW_SUBTITLE = '8 minutes hands-on per sign-up';

function ManualWorkflowFigure() {
  return (
    <MagnifiableFigure
      ariaLabel="Magnify the verification workflow diagram"
      intrinsic={FLOW_VB}
      panelStyle={{ ...FLOW_PANEL, border: `1px solid ${BORDER}` }}
      footer={<FlowchartLegend />}
      title={
        <div className="flex flex-col gap-1 text-center">
          <p className="text-[15px] font-semibold text-[#1a1a1a]">{FLOW_TITLE}</p>
          <p className="text-[12.5px] text-[#8a97a8]">{FLOW_SUBTITLE}</p>
        </div>
      }
      renderContent={mode => <VerificationFlowchart idPrefix={`ffia-flow-${mode}`} />}
    />
  );
}

// ── FlowChip / FlowArrow: inline step pills, used by the Rolling Registration steps ──
function FlowChip({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3.5 py-2 text-[13px] leading-[130%]"
      style={{ background: '#ffffff', border: `1px solid ${BORDER}`, color: '#1a1a1a', whiteSpace: 'nowrap' }}
    >
      {text}
    </span>
  );
}

function FlowArrow() {
  return (
    <span aria-hidden className="shrink-0 text-[13px]" style={{ color: '#c8d4e4' }}>
      →
    </span>
  );
}

/**
 * Two tracks drawn as one SVG rather than wrapping HTML chips. The whole point of
 * the diagram is the shape of each path, and reflowing chips destroys that at
 * narrow widths — a fixed viewBox scales the layout down intact instead.
 *
 * `w` values are hand-tuned to the rendered text; if a label changes, re-measure.
 */
const BA_VB = { w: 860, h: 262 };

type BAChip = { text: string; x: number; w: number; tone?: 'blocking'; detached?: boolean };

const BA_BEFORE: BAChip[] = [
  { text: 'Sign-up', x: 24, w: 81 },
  { text: 'Request account', x: 137, w: 135 },
  { text: 'Wait for review', x: 304, w: 125, tone: 'blocking' },
  { text: 'Receive invite email', x: 461, w: 153 },
  { text: 'Accept & create account', x: 646, w: 183 },
];

const BA_AFTER: BAChip[] = [
  { text: 'Sign-up', x: 24, w: 81 },
  { text: 'Create account', x: 137, w: 126 },
  { text: 'Access account (restricted)', x: 295, w: 202 },
  { text: 'Restriction lifted', x: 537, w: 131, detached: true },
];

/** Muted green so the off-path branch reads as one system without shouting. */
const BRANCH_DASH = 'rgba(42, 138, 80, 0.5)';

const BEFORE_CY = 62;
const AFTER_CY = 166;
const CHIP_H = 34;
const BRANCH_CY = 220;
/** Drop out of Create account, return up into Restriction lifted — both centres. */
const BRANCH_FROM = BA_AFTER[1].x + BA_AFTER[1].w / 2;
const BRANCH_TO = BA_AFTER[3].x + BA_AFTER[3].w / 2;
const BRANCH_PILL_W = 218;
const BRANCH_PILL_X = (BRANCH_FROM + BRANCH_TO) / 2 - BRANCH_PILL_W / 2;

function BAChipShape({ chip, cy }: { chip: BAChip; cy: number }) {
  const blocking = chip.tone === 'blocking';
  return (
    <g>
      <rect
        x={chip.x}
        y={cy - CHIP_H / 2}
        width={chip.w}
        height={CHIP_H}
        rx={CHIP_H / 2}
        fill={blocking ? DANGER_BG : '#ffffff'}
        stroke={blocking ? 'none' : BORDER}
        strokeWidth={1}
      />
      <text
        x={chip.x + chip.w / 2}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={blocking ? MANUAL_RED : '#1a1a1a'}
        fontSize={13}
        fontStyle={blocking ? 'italic' : 'normal'}
        fontWeight={blocking ? 500 : 400}
        fontFamily="var(--font-inter), Inter, sans-serif"
      >
        {chip.text}
      </text>
    </g>
  );
}

function BATrackLabel({ label, sub, y, color }: { label: string; sub: string; y: number; color: string }) {
  return (
    <g>
      <text
        x={24}
        y={y}
        fill={color}
        fontSize={11}
        fontWeight={500}
        letterSpacing={1.5}
        fontFamily="var(--font-inter), Inter, sans-serif"
      >
        {label.toUpperCase()}
      </text>
      <text x={96} y={y} fill="#8a97a8" fontSize={12.5} fontFamily="var(--font-inter), Inter, sans-serif">
        {sub}
      </text>
    </g>
  );
}

function BeforeAfterChart({ idPrefix, minWidth }: { idPrefix: string; minWidth?: number }) {
  const arrowId = `${idPrefix}-arrow`;

  const renderTrack = (chips: BAChip[], cy: number) =>
    chips.map((chip, i) => {
      const prev = chips[i - 1];
      return (
        <g key={chip.text}>
          {prev && !chip.detached && (
            <line
              x1={prev.x + prev.w + 8}
              y1={cy}
              x2={chip.x - 8}
              y2={cy}
              stroke="#c8d4e4"
              strokeWidth={1.5}
              markerEnd={`url(#${arrowId})`}
            />
          )}
          <BAChipShape chip={chip} cy={cy} />
        </g>
      );
    });

  return (
    <svg
      viewBox={`0 0 ${BA_VB.w} ${BA_VB.h}`}
      role="img"
      aria-label="Before, a teacher signed up, requested an account, waited for review, received an invite email, and only then accepted and created an account. After, a teacher signs up, creates an account, and accesses it immediately in a restricted state, while the team verifies asynchronously and the restriction lifts on its own."
      style={{ width: '100%', height: 'auto', display: 'block', minWidth }}
    >
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 8 8"
              refX="7.5"
              refY="4"
              markerWidth="8"
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M 0.5 1 L 7.5 4 L 0.5 7 z" fill="#c8d4e4" />
            </marker>
          </defs>

          <BATrackLabel label="Before" sub="No account access until manual review" y={30} color={MANUAL_RED} />
          {renderTrack(BA_BEFORE, BEFORE_CY)}

          <line x1={0} y1={104} x2={BA_VB.w} y2={104} stroke={BORDER} strokeWidth={1} />

          <BATrackLabel label="After" sub="Instant access to account after sign-up" y={134} color={ACCENT_DARK} />
          {renderTrack(BA_AFTER, AFTER_CY)}

          {/* Off-path branch: drops out of Create account, runs beneath the track,
              and turns back up into Restriction lifted. */}
          <path
            d={`M ${BRANCH_FROM} ${AFTER_CY + CHIP_H / 2} V ${BRANCH_CY - 8} Q ${BRANCH_FROM} ${BRANCH_CY} ${BRANCH_FROM + 8} ${BRANCH_CY} H ${BRANCH_PILL_X}`}
            fill="none"
            stroke={BRANCH_DASH}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <path
            d={`M ${BRANCH_PILL_X + BRANCH_PILL_W} ${BRANCH_CY} H ${BRANCH_TO - 8} Q ${BRANCH_TO} ${BRANCH_CY} ${BRANCH_TO} ${BRANCH_CY - 8} V ${AFTER_CY + CHIP_H / 2}`}
            fill="none"
            stroke={BRANCH_DASH}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <rect
            x={BRANCH_PILL_X}
            y={BRANCH_CY - 16}
            width={BRANCH_PILL_W}
            height={32}
            rx={16}
            fill={SUCCESS_BG}
            stroke={SUCCESS}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text
            x={BRANCH_PILL_X + BRANCH_PILL_W / 2}
            y={BRANCH_CY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={SUCCESS}
            fontSize={13}
            fontWeight={500}
            fontFamily="var(--font-inter), Inter, sans-serif"
          >
        Team verifies asynchronously
      </text>
    </svg>
  );
}

function BeforeAfterFlow() {
  return (
    <MagnifiableFigure
      ariaLabel="Magnify the before and after sign-up comparison"
      intrinsic={BA_VB}
      panelStyle={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden' }}
      footer={
        <p className="text-center text-[13px] text-[#999]">
          Review stops standing between the teacher and the product
        </p>
      }
      renderContent={mode => <BeforeAfterChart idPrefix={`ffia-ba-${mode}`} />}
    />
  );
}

// ── SystemsMap: one decision, three surfaces ─────────────────────────────────
const SYSTEM_BRANCHES = [
  {
    title: 'Signup flow',
    body: 'Confirm email in-session with a 4-digit code, and capture workplace so the system knows who is K-8 before anyone reviews.',
  },
  {
    title: 'Admin review',
    body: 'A Pending Teachers queue, select-and-confirm instead of re-typing, an auto-search link, and reversible decisions.',
  },
  {
    title: 'Teacher account',
    body: 'A new pending state, one gated feature, and three messaging states — pending, verified, restricted — with matching emails.',
  },
];

function SystemsMap() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <VisualCard caption="One decision, three surfaces. None of them worked without the other two." pad="p-5 sm:p-10">
      <div ref={ref} className="mx-auto flex w-full max-w-[900px] flex-col items-center">
        {/* Central node */}
        <div
          className="rounded-full px-6 py-3 text-center"
          style={{
            background: ACCENT,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <span className="text-[14px] font-semibold text-white">Let teachers in immediately</span>
        </div>

        {/* Connectors — an elbow rail rather than an SVG, so nothing distorts as
            the well changes width. The rail row mirrors the card grid (same
            columns, same gap), so every drop lands dead-centre on its card at any
            width. Half-gap overhangs bridge the 12px gutters. */}
        <div className="w-full" aria-hidden>
          {/* Stem out of the node */}
          <div className="flex justify-center">
            <span
              style={{
                width: 1.5, height: 20, background: '#a9c2e8',
                transformOrigin: 'top center',
                transform: inView ? 'scaleY(1)' : 'scaleY(0)',
                transition: 'transform 0.3s ease 250ms',
              }}
            />
          </div>
          {/* One cell per card: a centred drop, plus the rail segment above it.
              Stacked cards (below sm) need neither rail nor outer drops. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(col => (
              <div
                key={col}
                className={`relative ${col === 1 ? '' : 'hidden sm:block'}`}
                style={{ height: 36 }}
              >
                <span
                  className="hidden sm:block absolute"
                  style={{
                    top: 0, height: 1.5, background: '#a9c2e8',
                    left: col === 0 ? '50%' : -6,
                    right: col === 2 ? '50%' : -6,
                    transformOrigin: col === 0 ? 'right center' : col === 2 ? 'left center' : 'center',
                    transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'transform 0.45s ease 550ms',
                  }}
                />
                <span
                  className="absolute"
                  style={{
                    left: '50%', top: 0, width: 1.5, height: 36, marginLeft: -0.75,
                    background: '#a9c2e8',
                    transformOrigin: 'top center',
                    transform: inView ? 'scaleY(1)' : 'scaleY(0)',
                    transition: `transform 0.3s ease ${950 + col * 90}ms`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Branch cards */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {SYSTEM_BRANCHES.map((b, i) => (
            <div
              key={b.title}
              className="flex flex-col gap-2 rounded-[16px] bg-white p-5"
              style={{
                border: `1px solid ${BORDER}`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 0.5s ease ${500 + i * 200}ms, transform 0.5s ease ${500 + i * 200}ms`,
              }}
            >
              <p className="text-[15px] font-semibold text-[#1a1a1a]">{b.title}</p>
              <p className="text-[14px] leading-[165%] text-[#666]">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </VisualCard>
  );
}

// ── InfoCards: two-up light cards — shared by Why Manual Review Existed and Edge Cases ──
function InfoCards({ items }: { items: { title: string; body: string }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((c, i) => (
        <div
          key={c.title}
          className="flex flex-col gap-2 rounded-[20px] p-6"
          style={{
            background: CARD_LIGHT,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(14px)',
            transition: `opacity 0.5s ease ${i * 130}ms, transform 0.5s ease ${i * 130}ms`,
          }}
        >
          <p className="text-[16px] font-semibold text-[#1a1a1a]">{c.title}</p>
          <p className="text-[15px] leading-[170%] text-[#555]">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

/** The two things a person reading the request was there to catch. */
const REVIEW_REASONS = [
  {
    title: 'Students signing up as teachers',
    body: 'Every now and then students would sign-up as teachers by mistake. Since an educator account gives access to tools meant for their teacher, manual review helped prevent accidental student sign-ups from getting teacher level accounts.',
  },
  {
    title: 'K-8 teachers and COPPA',
    body: "The Children's Online Privacy Protection Act requires parental consent before collecting data from students under 13. Finding Focus was built for high school, but K-8 teachers signed up anyway. Verification allowed the team to flag these requests and send manual emails explaining our high school focus and legal constraints.",
  },
];

const EDGE_CASES = [
  {
    title: 'The school does not exist yet',
    body: 'Reviewers can still create a school on the spot, then add the pending teacher to it in the same select-and-confirm step. No re-typing on either branch.',
  },
  {
    title: 'Someone gets rejected by mistake',
    body: 'A Move to Pending button undoes a restriction at any time. Review decisions are reversible, so the team does not need to be nervous about making them.',
  },
  {
    title: 'A K-8 teacher signs up',
    body: 'They get the same instant access as everyone else. The Workplace step flags them, and the restriction on classroom creation stays until their school authorization is confirmed.',
  },
  {
    title: 'An unverified teacher logs in on mobile',
    body: 'The native app login was reworked to route unverified teachers straight to the verification step, so the two platforms behaved the same way.',
  },
];

// ── AccountStateTabs: pending / verified / restricted ─────────────────────────
const ACCOUNT_STATES = [
  {
    label: 'Pending',
    description:
      'The Add New Class page in its pending state, beside the email a teacher receives while review is still outstanding.',
    caption: 'Pending — the account works; classroom creation is the one thing waiting on review.',
  },
  {
    label: 'Verified',
    description:
      'The Add New Class page once review clears, beside the validated-account email.',
    caption: 'Verified — the gate lifts and the message confirms it, in-product and by email.',
  },
  {
    label: 'Restricted',
    description:
      'The Add New Class page for an account that was not approved, beside the restricted-account email.',
    caption: 'Restricted — the one state that had to explain itself without sounding like a rejection.',
  },
];

function AccountStateTabs() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const t = ACCOUNT_STATES[active];

  useEffect(() => () => {
    if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full justify-center overflow-hidden">
        <div
          className="inline-flex flex-nowrap items-center gap-1 rounded-full bg-white p-1"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {ACCOUNT_STATES.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => switchTab(i)}
              data-active={i === active}
              className="cs-toggle-pill shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-[12px] sm:text-[13px]"
            >
              {tab.label}
            </button>
          ))}
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
        <PlaceholderCard description={t.description} caption={t.caption} minHeight={360} />
      </div>
    </div>
  );
}

// ── ActivationChart: the signature visual ─────────────────────────────────────
/**
 * Share of new teachers who were sent a verification code and never came back,
 * by half-year cohort. Instant Access shipped in April 2023, so Spring 2023 is
 * the first cohort that saw it.
 *
 * TODO(bryce): swap in the real per-cohort figures from the tracking sheet. These
 * average to the reported 38% before / 7% after, but the individual bars are
 * stand-ins until the actual numbers are pulled.
 */
const COHORTS = [
  // `short` keeps the axis on one line at phone widths, where the full label wraps.
  { label: 'Fall 2021', short: 'F21', value: 41, era: 'before' as const },
  { label: 'Spring 2022', short: 'S22', value: 36, era: 'before' as const },
  { label: 'Fall 2022', short: 'F22', value: 37, era: 'before' as const },
  { label: 'Spring 2023', short: 'S23', value: 11, era: 'after' as const, launch: true },
  { label: 'Fall 2023', short: 'F23', value: 6, era: 'after' as const },
  { label: 'Spring 2024', short: 'S24', value: 4, era: 'after' as const },
];

const CHART_MAX = 45;

function ActivationChart() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div
      ref={ref}
      className="rounded-[20px] bg-white p-4 sm:p-8 flex flex-col gap-8"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow label="Invited, never validated" />
          <p className="mt-1.5 text-[16px] font-semibold text-[#1a1a1a]">
            Teachers who were invited and never activated
          </p>
        </div>
        <p className="shrink-0 text-[13px] text-[#888]">By half-year cohort</p>
      </div>

      <div className="flex items-end gap-2 sm:gap-4" style={{ height: 220 }}>
        {COHORTS.map((c, i) => (
          <div key={c.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span
              className="text-[13px] font-semibold text-[#1a1a1a]"
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 0.4s ease ${400 + i * 110}ms`,
              }}
            >
              {c.value}%
            </span>
            <div
              className="w-full rounded-t-[6px]"
              style={{
                height: inView ? `${(c.value / CHART_MAX) * 100}%` : 0,
                maxWidth: 72,
                background: c.era === 'before' ? '#a9c2e8' : ACCENT,
                transition: `height 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 110}ms`,
              }}
              role="presentation"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-4" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
        {COHORTS.map(c => (
          <div key={c.label} className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="text-[11px] leading-[140%] text-[#888]">
              <span className="sm:hidden">{c.short}</span>
              <span className="hidden sm:inline">{c.label}</span>
            </span>
            {c.launch && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.5px]"
                style={{ background: 'rgba(0,110,254,0.12)', color: ACCENT_DARK }}
              >
                Launch
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QuoteCard ─────────────────────────────────────────────────────────────────
function QuoteCard({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <div
      className="flex max-w-[760px] flex-col gap-3 rounded-[16px] bg-white p-4 sm:p-6"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <p className="text-[16px] font-normal leading-[165%] text-[#333]">{`“${quote}”`}</p>
      <p className="text-[13px] font-medium text-[#555]">{`— ${attribution}`}</p>
    </div>
  );
}

// ── ClosingCTA ────────────────────────────────────────────────────────────────
function ClosingCTA() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);

  return (
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
        <p className="text-[22px] font-semibold text-[#1a1a1a]">See the signup flow for yourself</p>
        <p className="text-[16px] font-normal text-[#555]">
          {'Shipped April 2023 — live at '}
          <a href="https://findingfocus.app" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: ACCENT }}>
            findingfocus.app
          </a>
        </p>
      </div>
      <a
        href="https://findingfocus.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-4 text-[16px] font-semibold text-white transition-opacity hover:opacity-85"
        style={{ background: '#111113' }}
      >
        Create an educator account
      </a>
    </div>
  );
}

// ── SectionNav ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'section-intro',          label: 'Intro' },
  { id: 'section-overview',       label: 'Overview' },
  { id: 'section-research',       label: 'Research' },
  { id: 'section-design',         label: 'The Redesign' },
  { id: 'section-where-this-led', label: 'Where This Led' },
  { id: 'section-impact',         label: 'Impact' },
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
      top of the footer links and copy. */
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

  useEffect(() => {
    const footer = document.querySelector('.landing-footer');
    if (!footer) return;
    const obs = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting), { threshold: 0 });
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

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
      width: 140, alignItems: 'flex-end', paddingRight: 16,
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

// ── Content constants ────────────────────────────────────────────────────────

const PROJECT_GOALS = [
  { n: '01', title: 'Instant access', body: 'Let teachers enter the product and start exploring the second they finish signing up.' },
  { n: '02', title: 'Uncompromised compliance', body: 'Keep K-8 COPPA checks intact without forcing every single teacher into a manual queue.' },
  { n: '03', title: 'Asynchronous review', body: 'Eliminate real-time sign-up monitoring by shifting verification to an asynchronous workflow.' },
];

const REDESIGN_PIECES = [
  { n: '01', title: 'The signup flow', body: 'Collecting what the system needs up front so nobody has to ask later.' },
  { n: '02', title: 'Team verification', body: 'Ending the need for someone to be on call every business hour, waiting for signups.' },
  { n: '03', title: 'The teacher account', body: 'What a new teacher can do before they are verified, and what they see when they hit the one locked feature.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FindingFocusInstantAccessCaseStudy() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] min-[600px]:pr-[100px]">

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(0,110,254,0.12)] to-[#fcfcfc] to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-0">

          {/* Company branding */}
          <div className="flex items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/case-studies/finding-focus-instant-access/finding-focus-logo.svg"
              alt="Finding Focus logo"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
            <span className="text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus • EdTech • Product Design</span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[110%] tracking-[-1px] text-[#1a1a1a] mb-10 max-w-[760px]">
            Fixing the Biggest Drop-Off in Finding Focus&apos;s Growth Funnel
          </h1>

          {/* Hero illustration */}
          <SignupFlowSequence />

          {/* Team / Timeline / My Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 mt-10 text-center">
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Team</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">
                Mike & Alissa Mrazek, Co-founders<br />
                Thomas Kennedy, Project Manager<br />
                Matthew Gaba, SWE
              </p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Timeline</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Feb – Sept 2023</p>
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
                Teachers who signed up for Finding Focus couldn&apos;t get in until a team member reviewed the request
                and manually emailed them an invite. A large number never made it that far: they requested an account,
                hit a wall, and never came back. I put together the case for flipping the model and pitched it to our co-founders:
                let every teacher in the moment they sign up, and move verification into the background. It cut drop-off
                dramatically, and retired an operational burden the team had carried for years.
              </p>
              <div className="flex flex-col gap-3">
                <StatRow
                  stats={[
                    { value: '↓82%', label: 'decrease in teachers who never activated their account (38% → 7%)' },
                    { value: '↑12%', label: 'increase in teachers who created a classroom (26% → 29%)' },
                    { value: '↓75%', label: 'decrease in average time needed to verify a teacher (8 min → 2 min)' },
                  ]}
                />
                <p className="text-[13px] italic text-[#999]">
                  *Based on the three semesters before and after the update.
                </p>
              </div>

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

            {/* A note on timing — sits below the card, not inside it */}
            <div
              className="flex items-center gap-3 rounded-[12px] px-4 py-3.5 mt-6"
              style={{ background: CARD_LIGHT, width: '50%' }}
            >
              <UpdateIcon sx={{ fontSize: 28, color: ACCENT, flexShrink: 0 }} />
              <div className="flex flex-col gap-1.5">
                <p className="text-[13px] font-semibold text-[#555]">A note on timing</p>
                <p className="text-[13px] leading-[165%] text-[#888]">
                  This project shipped in 2023. Finding Focus has evolved since, so some screens and details here may not
                  match the live product today.
                </p>
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
          heading="Finding Focus is an edtech company building attention-training tools for high school classrooms."
          body="Teachers use our tools through a dedicated teacher interface where they can share courses with students, facilitate classroom activities, and track progress over time. The product was built for high school classrooms, and our marketing and outreach targeted high school teachers."
        >
          <PlaceholderCard
            description="The Finding Focus teacher interface, ideally a 2023-era screenshot."
            caption="The Finding Focus teacher interface"
          />
        </Section>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="The Problem"
          heading="An outdated approval process was stopping teachers at the door."
          body="When teachers requested an educator account, they had to wait for someone on the Finding Focus team to manually verify them before they could create an account. Teachers were prevented from gaining access at the exact moment they were most interested."
        >
          <div className="flex flex-col gap-10">
            <PlaceholderCard
              description="The post-signup waiting screen from 2023 — the please wait for verification state."
              caption="What a new teacher saw after signing up"
            />
            <SmallStatRow
              stats={[
                { value: '267', label: 'number of teachers over the course of one school year who did not activate their account after being manually verified' },
                { value: '8 min', label: 'average time it took for team members to verify an account' },
              ]}
            />
          </div>
        </Section>
      </section>

      {/* ── WHY MANUAL REVIEW EXISTED ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="Why Manual Review Existed"
          heading="Manual review helped catch sign-up edge cases."
          body="While manually reviewing teacher sign-ups did add friction, it served an important role in helping address two edge cases:"
        >
          <div className="flex flex-col gap-3">
            {REVIEW_REASONS.map((reason, i) => (
              <Callout
                key={reason.title}
                variant="edge"
                label={`Edge Case ${String(i + 1).padStart(2, '0')}`}
                heading={reason.title}
                body={reason.body}
                compactBody
              />
            ))}
          </div>
        </Section>
      </section>

      {/* ── HOW IT STARTED ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="Project Origin"
          heading="Spotting a long-standing issue and taking initiative."
          body="When I took over as the product designer at Finding Focus, teacher drop-off from sign-up was already a known issue. Earlier attempts to solve it had stalled on the roadmap. Both sides of the product were paying the price of this outdated process: an ongoing operational drain on our end, and delayed access for teachers on theirs."
        >
          <div className="flex flex-col gap-6 max-w-[820px]">
            <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555]">
              I knew there was a better way to handle sign-ups and verification. But in order to build a case for
              changing a core product flow, I needed to gather data to quantify the internal productivity loss, proving
              that fixing the sign-up flow was worth prioritizing.
            </p>
          </div>
        </Section>
      </section>

      {/* ── PROJECT GOALS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="Project Goals"
            heading="Any proposal I brought had to get three things right."
          >
            <NumberedCards items={PROJECT_GOALS} />
          </Section>

          <div
            className="rounded-[24px] px-8 py-10 flex flex-col items-center text-center gap-4 bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <NorthStarAnimatedIcon className="block size-14 shrink-0" />
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>North Star</p>
            <p className="text-[24px] font-semibold leading-[145%] tracking-[-0.3px] text-[#1a1a1a] max-w-[680px]">
              Let every teacher start using Finding Focus the moment they sign up. Verification should happen in the
              background.
            </p>
          </div>

        </div>
      </section>

      <Divider label="Research" id="section-research" />

      {/* ── RESEARCH ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          {/* Building the case */}
          <Section
            eyebrow="Building the Case"
            heading="Every signup started a five-minute countdown for the team."
            body="I began with the operational cost because nobody had ever calculated what manual verification actually required. Manual review was a continuous operational commitment rather than a simple task. Team members rotated shifts throughout the day, keeping Slack alerts active on their phones and laptops to treat incoming signups as immediate action tasks."
          >
            <div className="flex flex-col gap-8">
              <QuoteCard
                quote="The goal is to address the request within less than 5 minutes... if there is a long gap between when they request and when they get invited, they lose motivation, and sometimes never end up accepting."
                attribution="Internal process note, 2022"
              />
              <PlaceholderCard
                description="The New Leads Schedule — a full weekday grid with 5–7 people covering slots."
                caption="The verification shift schedule"
              />
            </div>
          </Section>

          {/* Six manual steps */}
          <Section
            eyebrow="Productivity Cost"
            heading="Auditing the manual verification workflow."
            body="To measure the productivity cost, I conducted an internal time study, tracking team members through every step of the verification workflow."
          >
            <div className="flex flex-col gap-8">
              <VisualCard pad="p-5 sm:p-8">
                <ManualWorkflowFigure />
              </VisualCard>
              <ProductivityStrip />
              <div className="max-w-[820px]">
                <p className="text-[15px] leading-[175%] text-[#555]">
                  <strong className="font-semibold" style={{ color: MANUAL_RED }}>
                    A workflow that scaled directly against our growth.
                  </strong>{' '}
                  Manual review meant the productivity cost scaled 1:1 with success — during peak windows, incoming
                  signups immediately surpassed team capacity, capping how fast Finding Focus could onboard new users.
                </p>
              </div>
            </div>
          </Section>

          {/* The solution */}
          <Section
            eyebrow="The Solution"
            heading="Going from requiring teachers to request accounts to giving them instant access."
            body="Rather than trying to make manual reviews faster, I proposed decoupling account creation from verification. Teachers could create their account during sign-up and land inside the product immediately."
          >
            <div className="flex flex-col gap-8">
              <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555] max-w-[820px]">
                Verification wouldn&rsquo;t go away, instead it could move into the background and become more
                automated. Upon signing up, teachers would land in a &ldquo;sandbox&rdquo; version of an educator
                account that had certain features restricted &ndash; allowing us to stay COPPA compliant without
                blocking teachers at the front door.
              </p>
              <BeforeAfterFlow />
              <Callout
                label="Added Benefit"
                heading="It let us say yes to K-8 teachers for the first time."
                body="Under the old model, K-8 teachers were turned away with an explanatory email and never received an account at all. Because the new model restricted accounts at creation, we could let them in on the same terms as everyone else and simply leave their account restricted."
              />
            </div>
          </Section>

          {/* The response */}
          <Section
            eyebrow="The Response"
            heading="It was greenlit that week and became the team's next priority."
            body="Mike credited the idea and looped in Thomas to help spec it the same day. Within two weeks it was slotted in as the next project after the feature already in flight. That single change touched three parts of the system at once: what the teacher sees, how the signup flow collects information, and how the team reviews. Each one had to be redesigned for the others to work, and I owned the design for all three."
          >
            <SystemsMap />
          </Section>

        </div>
      </section>

      <Divider label="The Redesign" id="section-design" />

      {/* ── THE REDESIGN ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="The Approach"
            heading="Instant access wasn't one screen. It was three pieces that had to work together."
          >
            <NumberedCards items={REDESIGN_PIECES} />
          </Section>

          {/* 01 Signup flow */}
          <Section
            eyebrow="01 · Rolling Registration"
            heading="Signup had to do three jobs a reviewer used to do by hand."
            body="The old flow collected an email, sent a link, and waited. For teachers to land inside the product immediately, signup had to confirm the email in-session, separate students from educators before an account was ever created, and identify K-8 teachers up front so the COPPA question could be settled without anyone Googling. I restructured it into three steps, ending with a 4-digit code entered right in the flow."
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-2">
                <FlowChip text="1. Account Type" />
                <FlowArrow />
                <FlowChip text="2. Workplace" />
                <FlowArrow />
                <FlowChip text="3. Create Account" />
              </div>
              <PlaceholderCard
                description="The three signup steps plus the 4-digit code screen, with the Workplace options (K-8, High School, College, District/County) and the country-adaptive fields visible."
                caption="Rolling Registration, end to end"
                minHeight={380}
              />
            </div>
          </Section>

          {/* 02 Team verification */}
          <Section
            eyebrow="02 · No One on the Clock"
            heading="Nobody had to be on call anymore."
            body="Because a new teacher already has a working account, nothing about their experience depends on how fast review happens. The five-minute clock disappeared, and with it the shift schedule. I redesigned the review itself to match: new signups collect in a Pending Teachers tab, and confirming one is now a matter of selecting the teacher and clicking, with no information to re-type because signup already captured it. The old Google-the-teacher step became a pre-built search link attached to every notification — an engineer's suggestion that saved a manual lookup on every review."
          >
            <div className="flex flex-col gap-8">
              <WorkflowComparison />
              <PlaceholderCard
                description="The old plain Slack notification beside the new one with the auto-search link, live by 2023-04-21."
                caption="Slack notification, before and after"
              />
            </div>
          </Section>

          {/* Edge cases */}
          <Section
            eyebrow="Edge Cases"
            heading="With no clock, review still had to handle the messy cases."
          >
            <InfoCards items={EDGE_CASES} />
          </Section>

          {/* 03 Teacher account */}
          <Section
            eyebrow="03 · Restricted, Not Blocked"
            heading="A new teacher lands inside the product, with one door locked."
            body="Teachers used to wait outside the product until a human let them in. Now they finish signing up and are immediately inside, free to explore, with classroom creation the only thing they cannot do yet. That one locked feature is where all the messaging lives: a teacher who reaches it should see that it is temporary, that nothing is wrong, and that there is nothing they need to do. I wrote its three states — pending, verified, and restricted — each with its own in-product message and email."
          >
            <AccountStateTabs />
          </Section>

          {/* SSO */}
          <Section
            eyebrow="Single Sign-On"
            heading="Five months later, Google sign-in dropped into the same flow without a redesign."
            body="While Instant Access was still being built, a school district told us they required single sign-on and would not allow self-created passwords. That fall I mocked up SSO for each account type. Because Rolling Registration had already organized signup around account type and workplace, Google sign-in slotted into the existing structure, with the 4-digit code flow as the fallback for anyone not using SSO. It launched in September 2023, and Clever was added on the same foundation later."
          >
            <PlaceholderCard
              description="The Google SSO signup mockups from August 2023, sent to #design."
              caption="Google SSO, slotted into the existing account-type structure"
            />
          </Section>

          {/* Launch */}
          <Section
            id="section-final-designs"
            eyebrow="Shipped"
            heading="Instant Access and the new signup flow launched together in April 2023."
          >
            <PlaceholderCard
              description="The final signup flow — a before/after carousel, or the mobile mockups with a light/dark toggle."
              caption="The signup flow a new teacher sees, from account type to their first minute inside the product."
              minHeight={400}
            />
          </Section>

        </div>
      </section>

      <Divider label="Where This Led" id="section-where-this-led" />

      {/* ── WHERE THIS LED ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="Phase Two"
          heading="The restriction itself turned out to be unnecessary friction, so we removed it too."
          body="At launch, every new teacher stayed restricted until a team member manually verified them by hand. That solved the friction of teachers waiting on nothing, but it still made the majority of teachers wait on something they did not need: manual review that mattered for exactly one group. Once that became clear, we removed the restriction for everyone else."
        >
          <div className="flex flex-col gap-10">
            <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555] max-w-[820px]">
              Today, only K-8 educators see an extra step before they can create a class: agreeing that their school has
              authorized sharing Finding Focus with students under 13. The Workplace step from Rolling Registration is
              what makes that possible. Because the system already knows who is K-8 at signup, the one question that ever
              needed a human answer became a single checkbox.
            </p>

            <div className="flex flex-col max-w-[760px]">
              <Callout
                variant="danger"
                label="At Launch (2023)"
                heading="Everyone restricted until reviewed"
                body="Instant access to the account, classroom creation locked for all new teachers until a human verified them."
                compactBody
              />
              <div className="flex items-center justify-center" style={{ height: 40 }} aria-hidden="true">
                <ArrowDownward sx={{ fontSize: 20, color: '#999' }} />
              </div>
              <Callout
                variant="success"
                label="Today"
                heading="Nobody waits, and K-8 answers one question"
                body="Classroom creation unlocked on signup for everyone. K-8 teachers confirm their school's authorization in-product. No manual review step at all."
                compactBody
              />
            </div>

            <PlaceholderCard
              description="The K-8 age and account creation pop-up, from the Unrestrict K-8 Sketch file."
              caption="The one question that still needs an answer, asked in-product"
            />
          </div>
        </Section>
      </section>

      <Divider label="Impact" id="section-impact" />

      {/* ── IMPACT ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-12 md:pb-20">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="Impact"
            heading="The new model paid off on both sides: for teachers, and for the team that used to chase them."
          >
            <div className="flex flex-col gap-10">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: '82%', unit: 'decrease', label: 'teachers who never activated their account (38% → 7%)' },
                    { value: '12%', unit: 'increase', label: 'teachers who created a classroom (26% → 29%)' },
                    { value: '75%', unit: 'drop', label: 'hands-on time to verify a teacher (8 min → 2 min)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-3" style={{ background: CARD_LIGHT }}>
                      <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: ACCENT_DARK }}>
                        {s.unit}
                      </p>
                      <p className="text-[44px] sm:text-[52px] font-semibold leading-none tracking-[-1.5px] text-[#1a1a1a]">
                        {s.value}
                      </p>
                      <p className="text-[15px] font-normal leading-[160%] text-[#555]">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] italic text-[#999] text-center mt-3">
                  Three semesters before vs. three semesters after the update.
                </p>
              </div>

              <div>
                <ActivationChart />
                <p className="text-[13px] text-[#999] text-center mt-3">
                  Share of new teachers who were invited and never activated their account, by half-year cohort.
                </p>
              </div>
            </div>
          </Section>

          <Section
            eyebrow="For Teachers"
            heading="More than nine in ten new teachers now activate their account."
            body="The number the team watched most closely was teachers who were invited and never validated. Before the update, nearly four in ten signups stalled at that step. After, fewer than one in ten. And the teachers who got in kept going: the share who went on to create a classroom rose as well."
          />

          <Section
            eyebrow="For the Team"
            heading="The verification shift schedule was retired."
            body="Review went from something that dictated the team's day to something they did on their own time. At the volume we were seeing, cutting six minutes from every verification freed up roughly a full workday each month, about two work-weeks a year. The bigger saving is harder to put a number on: nobody had to be on call and half-attentive for a shift block, waiting for a signup that might not come. The schedule that once took five to seven people to cover was down to two on sparse slots within a year, and then gone."
          >
            <QuoteCard
              quote="Unrestricted access for all educators is now live in prod! This means that fielding these leads immediately is no longer necessary."
              attribution="Mike Mrazek, Co-founder, announcing the change to the team"
            />
          </Section>

        </div>
      </section>

      <Divider id="section-reflection" label="Takeaways" />

      {/* ── TAKEAWAYS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-[24px] p-7 flex flex-col gap-3 bg-white" style={{ border: `1px solid ${BORDER}` }}>
              <Eyebrow label="Takeaway 01" color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">Remove the constraint. Don&apos;t optimize it.</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                The obvious fix was a faster review process. The real fix was asking why review needed to block access at
                all. Separating &quot;is this account real&quot; from &quot;is this person allowed to do this one
                thing&quot; solved the teacher&apos;s problem and the team&apos;s problem with the same decision.
              </p>
            </div>
            <div className="rounded-[24px] p-7 flex flex-col gap-3 bg-white" style={{ border: `1px solid ${BORDER}` }}>
              <Eyebrow label="Takeaway 02" color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">The first fix wasn&apos;t the last.</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                Restricted access was the right call in 2023. A year of data showed the restriction itself was friction
                for almost everyone, so we removed it and kept only the one gate that had ever mattered. Being willing to
                take apart your own design when the evidence says to is part of the job.
              </p>
            </div>
          </div>

          <ClosingCTA />
        </div>
      </section>

    </div>
  );
}
