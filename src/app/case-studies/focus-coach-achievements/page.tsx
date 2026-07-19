'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import KeyboardDoubleArrowDownOutlined from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import { CaseStudyMedia, CaseStudyMediaGallery, CaseStudyMediaPlaceholder, CompletionQuoteScreen, CompletionWeekTrackerScreen, EndOfSessionFlow, FocusStreakScreen, MilestoneHeroScreen, NorthStarAnimatedIcon, PersonalBestScreen, ReflectionScreen } from '@/components/case-study';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

/** Section eyebrows */
const EYEBROW_ICON_COLOR = '#272727';
/** Finding Focus blue — the accent used across all Finding Focus case studies */
const ACCENT = '#006efe';
const ACCENT_DARK = '#0057c2';
/** Frosted block behind visuals + reflection cards + flow diagram (#dce8f8 @ 45%) */
const BLOCK_BG = 'rgba(220, 232, 248, 0.45)';
/** Solid light container for content cards (goal cards, anatomy cards) */
const CARD_LIGHT = '#f5f7fa';
/** Hairline border on white cards (TL;DR, callout, flow-step cards, segmented control) */
const BORDER = '#e6ecf4';
/** Problem-stat + dark-pattern accent */
const DANGER_BG = '#fceaea';
const DANGER = '#fe0000';

// ── Utility components ───────────────────────────────────────────────────────

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

/** Italic emphasis inside headings — same typeface, marks the operative words. */
function Em({ children }: { children: ReactNode }) {
  return <em className="italic">{children}</em>;
}

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
}: {
  eyebrow?: string;
  heading?: ReactNode;
  body?: string | string[];
  children?: ReactNode;
}) {
  const bodies = body == null ? [] : Array.isArray(body) ? body : [body];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="max-w-[760px]">
          {eyebrow && <Eyebrow label={eyebrow} />}
          {heading && (
            <h2 className="text-[22px] md:text-[30px] font-semibold leading-[130%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
              {heading}
            </h2>
          )}
        </div>
        {bodies.length > 0 && (
          <div className="flex flex-col gap-4 max-w-[820px]">
            {bodies.map((b, i) => (
              <p key={i} className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555]">
                {b}
              </p>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function VisualCard({
  children,
  caption,
  pad = 'p-4 sm:p-8',
}: {
  children: ReactNode;
  caption?: string;
  pad?: string;
}) {
  return (
    <div>
      <div className="relative rounded-[24px] overflow-hidden" style={{ background: BLOCK_BG }}>
        <div className={pad}>{children}</div>
      </div>
      {caption && <p className="text-[13px] text-[#999] text-center mt-3">{caption}</p>}
    </div>
  );
}

/** Placeholder slot for an image/GIF to be added later. */
function PlaceholderVisual({
  description,
  minHeight = 320,
  style,
}: {
  description: string;
  minHeight?: number;
  style?: CSSProperties;
}) {
  return (
    <CaseStudyMediaPlaceholder description={description} minHeight={minHeight} style={style} />
  );
}

// Ported from the Focus Coach HTML prototype's live week-card implementation.
function FocusStreakWeekCard() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [run, setRun] = useState(0);
  const [entered, setEntered] = useState(false);
  const [flamePhase, setFlamePhase] = useState<'idle' | 'pop' | 'spin' | 'slam'>('idle');
  const [completedDays, setCompletedDays] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Kick off / continue the loop while the card is in view.
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setRun((value) => value + 1), 0);
    return () => clearTimeout(timer);
  }, [inView]);

  useEffect(() => {
    if (run === 0 || !inView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    // Reset → play → hold on the expanded state → loop
    later(() => {
      setEntered(false);
      setFlamePhase('idle');
      setCompletedDays(0);
      setExpanded(false);
    }, 0);
    later(() => setEntered(true), 120);
    later(() => setFlamePhase('pop'), 850);
    later(() => setFlamePhase('spin'), 1070);
    later(() => setFlamePhase('slam'), 1770);
    later(() => {
      for (let day = 1; day <= 5; day += 1) {
        later(() => setCompletedDays(day), (day - 1) * 112);
      }
    }, 1910);
    later(() => setFlamePhase('idle'), 2190);
    later(() => setExpanded(true), 2850);
    // Pause on the final expanded frame, then restart
    later(() => setRun((value) => value + 1), 5200);

    return () => timers.forEach(clearTimeout);
  }, [run, inView]);

  const days = ['M', 'Tu', 'W', 'Th', 'F'];
  const sparkles = [
    { x: -24, y: -24, color: '#ff6a00', size: 5 },
    { x: 24, y: -24, color: '#ffb830', size: 6 },
    { x: -28, y: 6, color: '#ffd700', size: 4 },
    { x: 28, y: 6, color: '#ff6a00', size: 5 },
    { x: 0, y: -32, color: '#fe9f00', size: 4 },
    { x: 14, y: -28, color: '#ffd700', size: 3 },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center py-4 sm:py-7">
      {/* Fixed-height stage so expand/collapse never shifts page layout */}
      <div className="relative flex w-full max-w-[408px] items-start justify-center" style={{ height: 180 }}>
        <div
          className="focus-streak-card relative w-full overflow-hidden bg-white"
          data-entered={entered}
          data-expanded={expanded}
          aria-label="Focus Streak week container animation"
        >
        <div className="flex h-[96px] items-center justify-center">
          <div className="flex items-center gap-3">
            {days.map((day, index) => {
              const wasDone = index < 4;
              const impacted = index < completedDays;
              const isFriday = index === 4;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span
                    className="text-[14px] font-bold transition-colors duration-300"
                    style={{ color: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#c0c0c0' }}
                  >
                    {day}
                  </span>
                  <div
                    className={`focus-streak-day relative flex size-10 shrink-0 items-center justify-center rounded-full ${
                      impacted ? 'focus-streak-impact' : ''
                    }`}
                    style={{
                      background: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#d8d8d8',
                      transition: 'background 0.3s ease',
                    }}
                  >
                    {isFriday && !impacted ? (
                      <span className={`focus-streak-flame focus-streak-flame-${flamePhase}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M12,3 C12.6666667,5.66666667 14,7.83333333 16,9.5 C18,11.1666667 19,13 19,15 C19,18.8659932 15.8659932,22 12,22 C8.13400679,22 5,18.8659932 5,15 C5,13.9181489 5.35088936,12.8654809 6,12 C6,13.3807119 7.11928813,14.5 8.5,14.5 C9.88071187,14.5 11,13.3807119 11,12 C11,10 9.5,9 9.5,7 C9.5,5.66666667 10.3333333,4.33333333 12,3"
                            fill={flamePhase === 'idle' ? 'none' : '#ff6a00'}
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeOpacity={flamePhase === 'idle' ? 0.8 : 0}
                          />
                        </svg>
                      </span>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <polyline
                          stroke="#fff"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="20 6 9 17 4 12"
                        />
                      </svg>
                    )}
                    {impacted
                      ? sparkles.map((sparkle, sparkleIndex) => (
                          <span
                            key={`${run}-${sparkleIndex}`}
                            className="focus-streak-sparkle"
                            style={{
                              width: sparkle.size * 2,
                              height: sparkle.size * 2,
                              background: sparkle.color,
                              '--spark-x': `${sparkle.x}px`,
                              '--spark-y': `${sparkle.y}px`,
                              animationDelay: `${sparkleIndex * 28}ms`,
                            } as CSSProperties}
                          />
                        ))
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-stretch">
          <svg width="100%" height="12" viewBox="0 0 404 12" fill="none" preserveAspectRatio="none">
            <path
              d="M 0 11 L 291 11 L 306 1 L 321 11 L 404 11"
              stroke="#d8d8d8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex items-center justify-center px-5 py-4">
            <p className="w-[249px] text-center text-[14px] font-semibold leading-[1.4] text-[#666]">
              Nice job completing a session every day this week!
            </p>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        .focus-streak-card {
          height: 96px;
          border: 2px solid #d8d8d8;
          border-radius: 16px 16px 0 0;
          opacity: 0;
          transform: translateY(16px);
          transition:
            height 0.55s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.55s ease,
            opacity 0.45s ease,
            transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .focus-streak-card[data-entered='true'] {
          opacity: 1;
          transform: translateY(0);
        }
        .focus-streak-card[data-expanded='true'] {
          height: 180px;
          border-radius: 16px;
        }
        .focus-streak-flame {
          display: flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          transform-origin: center;
        }
        .focus-streak-flame-pop {
          animation: focus-streak-flame-pop 0.22s cubic-bezier(0.34, 1.8, 0.64, 1) forwards;
        }
        .focus-streak-flame-spin {
          animation: focus-streak-flame-spin 0.7s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        .focus-streak-flame-slam {
          animation: focus-streak-flame-slam 0.28s cubic-bezier(0.34, 1.5, 0.64, 1) forwards;
        }
        .focus-streak-impact {
          animation: focus-streak-impact 0.45s cubic-bezier(0.34, 1, 0.64, 1) forwards;
        }
        .focus-streak-sparkle {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          border-radius: 999px;
          pointer-events: none;
          animation: focus-streak-sparkle 0.62s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
        @keyframes focus-streak-flame-pop {
          from { transform: scale(1) translateY(0); }
          to { transform: scale(1.35) translateY(-8px); }
        }
        @keyframes focus-streak-flame-spin {
          from { transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(0deg); }
          to { transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(720deg); }
        }
        @keyframes focus-streak-flame-slam {
          0% { transform: scale(1.35) translateY(-8px); }
          50% { transform: scale(0.88) translateY(3px); }
          78% { transform: scale(1.07) translateY(-1px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes focus-streak-impact {
          0% { transform: scale(1); }
          30% { transform: scale(1.42); }
          100% { transform: scale(1); }
        }
        @keyframes focus-streak-sparkle {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--spark-x)),
              calc(-50% + var(--spark-y))
            ) scale(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .focus-streak-card,
          .focus-streak-flame,
          .focus-streak-day,
          .focus-streak-sparkle {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── StatRow: three headline numbers with a blue underline tick ────────────────
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

// ── SmallStatRow: evidence stats in filled danger cards ───────────────────────
function SmallStatRow({ stats }: { stats: { value: string; label: string }[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-10">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-[20px] p-6"
          style={{
            background: DANGER_BG,
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
              background: DANGER,
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

// ── GoalCards: numbered, one sentence each ────────────────────────────────────
const GOALS = [
  { n: '01', title: 'Feeling seen', body: 'The end of a session should acknowledge the effort users put in.' },
  { n: '02', title: 'Celebrating real progress', body: 'Sessions should acknowledge real progress users have built up, not empty praise.' },
  { n: '03', title: 'Quick honest reflection', body: 'Taking a moment to look back on how a session went shouldn’t require a lot of cognitive effort.' },
];

function GoalCards() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
      {GOALS.map((g, i) => (
        <div
          key={g.n}
          className="rounded-[20px] p-6 flex flex-col gap-3"
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

// ── Callout: left accent bar + eyebrow + heading + body (neutral / danger) ────
function Callout({
  variant,
  eyebrow,
  heading,
  body,
}: {
  variant: 'neutral' | 'danger';
  eyebrow: string;
  heading: string;
  body: string;
}) {
  const isDanger = variant === 'danger';
  const bg = isDanger ? DANGER_BG : '#ffffff';
  const bar = isDanger ? DANGER : ACCENT_DARK;
  return (
    <div
      className="flex items-stretch gap-5 rounded-[20px] p-6 max-w-[820px]"
      style={{ background: bg, ...(isDanger ? {} : { border: `1px solid ${BORDER}` }) }}
    >
      <div style={{ width: 2, borderRadius: 2, background: bar, flexShrink: 0 }} />
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: bar }}>{eyebrow}</p>
        <p className="text-[19px] font-semibold text-[#1a1a1a] leading-[135%]">{heading}</p>
        <p className="text-[15px] font-normal leading-[170%] text-[#555]">{body}</p>
      </div>
    </div>
  );
}

// ── FlowStepCards: Reflection → Achievement → Completion, colored accent bars ──
const FLOW_STEPS = [
  { n: '1', color: '#006efe', title: 'Reflection', tag: 'Always Shown', body: 'Confirms the session ended, shows its stats, and asks users to rate their focus.' },
  { n: '2', color: '#ea580c', title: 'Achievement', tag: 'Conditional', body: 'A full-screen celebration when a streak, milestone, or personal best is reached.' },
  { n: '3', color: '#0d9488', title: 'Completion', tag: 'Always Shown', body: 'All-time stats plus either the week tracker or a course quote.' },
];

function FlowStepCards() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <div ref={ref} className="flex flex-col md:flex-row md:items-stretch gap-3">
      {FLOW_STEPS.map((s, i) => (
        <div
          key={s.n}
          className="flex flex-col md:flex-1 md:flex-row md:items-center md:gap-3"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.55s ease ${i * 180}ms, transform 0.55s ease ${i * 180}ms`,
          }}
        >
          <div
            className="w-full md:flex-1 rounded-[16px] overflow-hidden bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div style={{ height: 6, background: s.color }} />
            <div className="flex flex-col gap-2 px-6 pt-5 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[26px] font-semibold leading-none" style={{ color: s.color }}>{s.n}</span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.5px] px-3 py-[5px] rounded-full"
                  style={{ background: `${s.color}1f`, color: s.color }}
                >
                  {s.tag}
                </span>
              </div>
              <p className="text-[20px] font-semibold text-[#1a1a1a]">{s.title}</p>
              <p className="text-[14px] font-normal leading-[150%] text-[#555]">{s.body}</p>
            </div>
          </div>
          {i < FLOW_STEPS.length - 1 && (
            <span className="hidden md:block text-[18px] text-[#8c8c8c] shrink-0">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── EndOfSessionFlowDiagram: three scenario rows of nodes ─────────────────────
type FlowNode = { title: string; sub?: string; tone: 'neutral' | 'milestone' | 'streak' };
const FLOW_SCENARIOS: { label: string; nodes: FlowNode[] }[] = [
  {
    label: 'First session of the day (no achievement)',
    nodes: [
      { title: 'Reflection', tone: 'neutral' },
      { title: 'Completion', sub: '(week tracker)', tone: 'neutral' },
    ],
  },
  {
    label: 'Achievement session (e.g. milestone reached)',
    nodes: [
      { title: 'Reflection', tone: 'neutral' },
      { title: 'Achievement', sub: '(milestone)', tone: 'milestone' },
      { title: 'Completion', sub: '(week tracker / quote)', tone: 'neutral' },
    ],
  },
  {
    label: 'Streak completed session',
    nodes: [
      { title: 'Reflection', tone: 'neutral' },
      { title: 'Achievement', sub: '(streak)', tone: 'streak' },
      { title: 'Completion', sub: '(quote)', tone: 'neutral' },
    ],
  },
];

function FlowNodeChip({ node }: { node: FlowNode }) {
  const bg =
    node.tone === 'milestone' ? 'rgba(0,110,254,0.12)'
      : node.tone === 'streak' ? 'rgba(249,115,22,0.15)'
        : '#ffffff';
  const subColor = node.tone === 'milestone' ? ACCENT_DARK : node.tone === 'streak' ? '#ea580c' : '#777777';
  const hasSub = Boolean(node.sub);
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[12px] px-6"
      style={{
        background: bg,
        minHeight: 62,
        minWidth: 117,
        border: node.tone === 'neutral' ? `1px solid ${BORDER}` : undefined,
      }}
    >
      <div className="flex flex-col items-center justify-center" style={{ minHeight: hasSub ? undefined : 32 }}>
        <span className="text-[14px] font-semibold text-[#1a1a1a] whitespace-nowrap leading-[17px]">{node.title}</span>
        {hasSub && (
          <span className="text-[12px] whitespace-nowrap leading-[15px] mt-0.5" style={{ color: subColor }}>{node.sub}</span>
        )}
      </div>
    </div>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="text-[16px] shrink-0"
      style={{
        color: active ? ACCENT : '#999999',
        transform: active ? 'translateX(1px)' : 'translateX(0)',
        transition: 'color 0.7s ease, transform 0.7s ease',
        fontWeight: 400,
      }}
    >
      →
    </span>
  );
}

function EndOfSessionFlowDiagram() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [pulseStep, setPulseStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      setPulseStep(step => (step + 1) % 3);
    }, 1600);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="rounded-[24px] flex flex-col items-start gap-7 px-6 sm:px-10 py-8"
      style={{ background: BLOCK_BG }}
    >
      {FLOW_SCENARIOS.map(sc => (
        <div key={sc.label} className="flex flex-col items-start gap-3">
          <span className="text-[15px] font-semibold text-[#4a4a4a]">{sc.label}</span>
          <div className="flex items-center gap-3 flex-wrap">
            {sc.nodes.map((node, i) => {
              // Arrow before node i becomes active when pulseStep matches i-1
              const arrowActive = inView && i > 0 && pulseStep === i - 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <FlowArrow active={arrowActive} />}
                  <FlowNodeChip node={node} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── StudentSurveyChart: Yes / Maybe / No response bars (n = 89) ───────────────
const SURVEY_RESPONSES = [
  { label: 'Yes', percent: 49.4, count: 44, color: ACCENT },
  { label: 'Maybe', percent: 34.8, count: 31, color: '#4fa0e6' },
  { label: 'No', percent: 15.7, count: 14, color: '#a9c2e8' },
] as const;

function StudentSurveyChart() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <div
      ref={ref}
      className="rounded-[20px] bg-white p-6 sm:p-8 flex flex-col gap-6"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>
            Survey responses
          </p>
          <p className="text-[16px] font-semibold text-[#1a1a1a] mt-1.5">
            Would badges or levels make you use Focus Coach more?
          </p>
        </div>
        <p className="text-[13px] text-[#888] shrink-0">n = 89 students</p>
      </div>

      <div className="flex flex-col gap-5">
        {SURVEY_RESPONSES.map((row, i) => (
          <div key={row.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold text-[#1a1a1a]">{row.label}</span>
              <span className="text-[14px] text-[#555]">
                <span className="font-semibold text-[#1a1a1a]">{row.percent}%</span>
                <span className="text-[#999]"> · n = {row.count}</span>
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: CARD_LIGHT }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: inView ? `${row.percent}%` : '0%',
                  background: row.color,
                  transition: `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 140}ms`,
                }}
                role="presentation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AnatomyCards: numbered circle badge + title + body ────────────────────────
const ANATOMY = [
  { n: '1', title: 'Acknowledge', body: 'A persistent checkmark and "Session Complete" title signal the end.' },
  { n: '2', title: 'Contextualize', body: 'Session stats show what was just accomplished: duration and check-ins answered.' },
  { n: '3', title: 'Reflect', body: 'One question about their focus, four options, less cognitive load.' },
];

function AnatomyCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ANATOMY.map(a => (
        <div key={a.n} className="rounded-[16px] p-4 flex flex-col gap-2" style={{ background: CARD_LIGHT }}>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ width: 22, height: 22, background: 'rgba(0,110,254,0.12)', color: ACCENT_DARK }}
            >
              {a.n}
            </span>
            <span className="text-[14px] font-semibold text-[#1a1a1a]">{a.title}</span>
          </div>
          <p className="text-[13px] font-normal leading-[160%] text-[#555]">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

// ── Outcomes: signals we’ll watch after launch ───────────────────────────────
const OUTCOME_SIGNALS = [
  {
    title: 'Second-session conversion',
    body: 'The percentage of first-time students who return for another Focus Session within 7 days.',
  },
  {
    title: 'Consecutive-day usage',
    body: 'Whether more students complete sessions on consecutive weekdays and work toward a full Focus Streak.',
  },
  {
    title: 'Usage concentration',
    body: 'Whether the top 1% account for a smaller share of sessions as more students return.',
  },
] as const;

const TAKEAWAYS = [
  {
    eyebrow: 'Restraint',
    title: 'The strongest product decision was what we chose not to ship.',
    body: 'Students asked for badges and levels, but a rewards economy would have made collecting the point. Streaks, milestones, and personal bests gave us celebration without turning focus into a currency.',
  },
  {
    eyebrow: 'Designing for context',
    title: 'An ethical mechanic starts with the reality of the people using it.',
    body: 'Students often do not control when classroom sessions happen. Focus Streaks are earned across a school week and never lost, replacing daily loss aversion with progress that fits their lives.',
  },
  {
    eyebrow: 'Changing my mind',
    title: 'A principle is useful until the work proves it wrong.',
    body: 'I began convinced that one completion page meant less friction. The milestone mockups showed that compression was underselling the moment, so I traded that principle for a guided flow where every screen earns its place.',
  },
] as const;

// ── SegmentedMedia: pill tabs that swap media + caption ───────────────────────
function SegmentedMedia({
  tabs,
}: {
  tabs: {
    label: string;
    type: 'Image' | 'GIF';
    description: string;
    caption: string;
    /** When provided, renders real media with lightbox. */
    src?: string;
    alt?: string;
    maxWidth?: number | string;
    /** Live interactive screen — takes precedence over src / placeholder. */
    content?: ReactNode;
  }[];
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const t = tabs[active];

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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="inline-flex items-center gap-1 rounded-full bg-white p-1" style={{ border: `1px solid ${BORDER}` }}>
        {tabs.map((tab, i) => {
          const on = i === active;
          return (
            <button
              key={tab.label}
              onClick={() => switchTab(i)}
              className="px-4 py-2 rounded-full text-[13px] transition-colors"
              style={
                on
                  ? { background: 'rgba(0,110,254,0.12)', color: ACCENT_DARK, fontWeight: 600 }
                  : { color: '#545454', fontWeight: 500 }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        className="w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        <VisualCard pad={t.content ? 'p-3 sm:p-5' : 'p-4'} caption={t.caption}>
          {t.content ? (
            t.content
          ) : t.src ? (
            <CaseStudyMedia
              src={t.src}
              alt={t.alt ?? t.label}
              caption={t.caption}
              maxWidth={t.maxWidth}
            />
          ) : (
            <PlaceholderVisual description={t.description} minHeight={320} />
          )}
        </VisualCard>
      </div>
    </div>
  );
}

// ── ClosingCTA ────────────────────────────────────────────────────────────────
const PROTOTYPE_SRC = '/case-studies/focus-coach-achievements/session-complete-prototype.html';

function ClosingCTA() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open && mounted);

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
      <div
        ref={ref}
        className="rounded-[24px] px-8 sm:px-14 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 28px rgba(0,13,38,0.08)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}
      >
        <div className="flex flex-col gap-2.5">
          <p className="text-[22px] font-semibold text-[#1a1a1a]">Try the end of session experience yourself</p>
          <p className="text-[16px] font-normal text-[#555]">
            Shipped to production in July 2026 — live at{' '}
            <a href="https://findingfocus.app" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: ACCENT }}>
              findingfocus.app
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 rounded-full px-7 py-4 text-[16px] font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: '#111113' }}
        >
          Try the Prototype
        </button>
      </div>

      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Focus Coach end of session prototype"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(8, 10, 16, 0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: 14,
                  flexShrink: 0,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    Interactive prototype
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                    End of session flow
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close prototype"
                  onClick={() => setOpen(false)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 22,
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#020101',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <iframe
                  key={open ? 'open' : 'closed'}
                  src={PROTOTYPE_SRC}
                  title="Focus Coach session complete prototype"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block',
                    background: '#020101',
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

// ── SectionNav ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'section-intro', label: 'Intro' },
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-research', label: 'Research' },
  { id: 'section-design', label: 'Design' },
  { id: 'section-outcomes', label: 'Outcomes' },
  { id: 'section-reflection', label: 'Takeaways' },
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

function sectionDocumentTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return Number.POSITIVE_INFINITY;
  return el.getBoundingClientRect().top + window.scrollY;
}

function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('section-intro');

  useEffect(() => {
    const hero = document.getElementById('section-intro');
    if (!hero) return;
    const obs = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Near the bottom, force the last section active so Outcomes/Takeaways can win
      if (scrollBottom >= docHeight - 24) {
        setActive(NAV_SECTIONS[NAV_SECTIONS.length - 1].id);
        return;
      }

      const marker = window.scrollY + Math.min(window.innerHeight * 0.28, 160);
      let current = NAV_SECTIONS[0].id;
      for (const { id } of NAV_SECTIONS) {
        if (sectionDocumentTop(id) <= marker) current = id;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 40);
  }

  return (
    <nav className="hidden min-[600px]:flex flex-col" style={{
      position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
      width: 100, alignItems: 'flex-end', paddingRight: 16, gap: 4, zIndex: 100,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {NAV_SECTIONS.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => goTo(id)}
          style={{
            background: 'none', border: 'none', padding: '5px 0', textAlign: 'right', cursor: 'pointer', fontSize: 13,
            fontWeight: active === id ? 600 : 400, color: active === id ? '#1a1a1a' : '#aaa',
            opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(12px)',
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

// ── Divider ───────────────────────────────────────────────────────────────────
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

const SECTION = 'max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FocusCoachAchievementsCaseStudy() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] min-[600px]:pr-[100px]">

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(0,110,254,0.12)] to-[#fcfcfc] to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-0">

          <div className="flex items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/case-studies/finding-focus-ai-assistant/finding-focus-logo.svg" alt="Finding Focus logo" className="h-7 w-auto" style={{ filter: 'brightness(0)' }} />
            <span className="text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus • Edtech • Product Design</span>
          </div>

          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[110%] tracking-[-1px] text-[#1a1a1a] mb-10 max-w-[680px]">
            Rebuilding the Focus Coach&rsquo;s End of Session Experience
          </h1>

          <MilestoneHeroScreen />

          {/* Meta row */}
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
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Jan – Jul 2026</p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">My Role</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Sole Product Designer</p>
            </div>
          </div>

          {/* ── TL;DR ── */}
          <div className="mt-14 pb-14 md:pb-28">
            <div className="rounded-[24px] p-8 md:p-10 flex flex-col gap-6" style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>
              <Eyebrow label="TL;DR" />
              <p className="text-[16px] font-normal leading-[150%] text-[#333] max-w-[880px]">
                Students weren&apos;t coming back to the Focus Coach — and the end of a session was where we lost them.
                I redesigned it into a guided flow with a simpler reflection, celebratory achievements, and a brand-new
                completion screen, built to motivate without manipulative gamification.
              </p>
              <StatRow
                stats={[
                  { value: '89', label: 'students surveyed on rewards and motivation' },
                  { value: '3', label: 'achievement types, each with its own animated screen' },
                  {
                    value: '22%',
                    label: 'time spent responding to the post-session reflection',
                    icon: <KeyboardDoubleArrowDownOutlined sx={{ fontSize: 24, color: ACCENT }} />,
                  },
                ]}
              />
            </div>
          </div>

        </div>
      </header>

      <Divider label="Overview" id="section-overview" />

      {/* ── OVERVIEW ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Context"
            heading="The Focus Coach is the flagship tool from Finding Focus, an edtech company building attention training tools for classrooms."
            body="It's a guided study timer that helps students stay on task while doing their work by periodically checking in on them."
          >
            <VisualCard caption="A Focus Coach check-in during an active Focus Session" pad="p-3 sm:p-6">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/focus-coach-check-in.gif"
                alt="A Focus Coach check-in during an active Focus Session"
                caption="A Focus Coach check-in during an active Focus Session"
              />
            </VisualCard>
          </Section>

          <Section
            eyebrow="The Problem"
            heading="Users were not coming back to the Focus Coach."
            body="39.3% of our users were one and done after completing their first session – meaning almost 2 in 5 of our users completed a single Focus Session and then abandoned the tool."
          >
            <SmallStatRow
              stats={[
                { value: '39.3%', label: 'of users only ever completed one Focus Session' },
                { value: '54.6%', label: 'of all sessions are completed by the top 1% of users' },
              ]}
            />
          </Section>

          <Section
            eyebrow="Hypothesis"
            heading="The end of session experience was where we lost users."
            body='Every session ended with a brief "session complete" animation, a 1–100 reflection slider, and an MVP-state completion screen built around a check-in graph. We&rsquo;d assumed students would rack up check-ins, but most sessions only had one or two, which meant the graph had little value.'
          >
            <VisualCard caption="The original end of session flow">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/old-session-flow.gif?v=2"
                alt="The original end of session flow, including the focus rating and completion screen"
                caption="The original end of session flow"
              />
            </VisualCard>
          </Section>

          <Section
            eyebrow="Project Goals"
            heading={<>Before designing anything, I mapped out what the end of session should be <Em>for</Em>.</>}
          >
            <GoalCards />
          </Section>

          {/* North Star — bordered container matching Figma */}
          <div
            className="rounded-[24px] px-8 py-10 flex flex-col items-center text-center gap-4 bg-white"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <NorthStarAnimatedIcon
              className="block size-14 shrink-0"
              blueFill={ACCENT}
              yellowFill="#FFF712"
            />
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: EYEBROW_ICON_COLOR }}>North Star</p>
            <p className="text-[24px] font-semibold leading-[145%] tracking-[-0.3px] text-[#1a1a1a] max-w-[680px]">
              Turn the end of every session into an opportunity to delight and engage users
            </p>
          </div>
        </div>
      </section>

      <Divider label="Research" id="section-research" />

      {/* ── RESEARCH ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Student Signal"
            heading="Students told us rewards would bring them back."
            body='A survey we sent out to students asked: "If you could earn badges or unlock levels by completing more sessions, would that make you want to use the Focus Coach more?" Roughly half said yes and another third said maybe.'
          >
            <StudentSurveyChart />
          </Section>

          <Section
            eyebrow="Competitive Audit"
            heading={<>Strong completions <Em>celebrate</Em>. Ours <Em>reported</Em>.</>}
            body="I audited the end-of-session experiences for Insight Timer, Balance, Oak, Forest, Focus Pomo, and Focus Keeper. The best experiences used the end of a session as an opportunity to celebrate the user and promote future engagement. Something ours failed to do."
          >
            <VisualCard>
              <PlaceholderVisual minHeight={320} description="Image: Comparison table of Finding Focus versus other apps" />
            </VisualCard>
          </Section>

          <Section
            eyebrow="Gamification Question"
            heading={<>We considered XP, badges, and collectibles.<br />We decided <Em>against</Em> all of them.</>}
            body="Students supported the idea of badges and rewards, and many similar applications were gamified. But our co-founder pushed back hard on full gamification: Finding Focus exists to help students genuinely improve their focus, not to complete sessions for rewards. The moment a badge becomes the reason a student starts a session, the tool is failing at its actual job."
          >
            <Callout
              variant="neutral"
              eyebrow="Behavioral Insight"
              heading="One student completed hundreds of one minute sessions just to win a teacher’s prize."
              body="This was a clear signal that attaching rewards to usage can lead to users gaming the system."
            />
          </Section>
        </div>
      </section>

      <Divider label="Design" id="section-design" />

      {/* ── DESIGN ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="Content Ideas"
            heading="I started by defining everything the completion page could include."
            body={[
              'Without wanting to lean too heavily into gamification, I proposed four kinds of content we could show: cumulative milestones, personal bests, streaks, and course quotes.',
              'My team was in full support so I got to work creating designs and a spec sheet of the full system – trigger logic, thresholds, priority rules, and the copy.',
            ]}
          >
            <VisualCard caption="Screenshot from a Slack canvas I created to document ideas for rules, logic, and copy. The example shown here is the Personal Best category." pad="p-4 sm:p-6">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/personal-best-spec.png"
                alt="Slack canvas screenshot documenting Personal Best achievement rules, logic, and copy"
                maxWidth={640}
                caption="Screenshot from a Slack canvas I created to document ideas for rules, logic, and copy. The example shown here is the Personal Best category."
              />
            </VisualCard>
          </Section>

          {/* Streaks Behavior — heading + body + dark-pattern callout, then a second heading + image */}
          <div className="flex flex-col gap-10">
            <Section
              eyebrow="Streaks Behavior"
              heading="Traditional streaks employ a dark pattern."
              body="The idea of streaks was something that my co-founder was staunchly against. The argument against streaks was that they make users return solely for the purpose of not losing their streak. It was a dark pattern that we wanted to avoid, especially since our target demographic is K-12 students."
            >
              <Callout
                variant="danger"
                eyebrow="Dark Pattern"
                heading="Streak Maintenance"
                body="Streaks can often be manipulative; exploiting psychological biases like loss aversion to coerce users into daily engagement."
              />
            </Section>

            <Section
              heading="Enter Focus Streaks: a more ethical take on streaks."
              body="My solution to the streaks dilemma was to make it something that users earned rather than maintained. As long as a user completed at least one session each weekday (Monday - Friday) they were able to earn a Focus Streak for that week. Once users earned one there was no risk of losing it, and they could earn as many as they wanted."
            >
              <VisualCard caption="The Focus Streak week container — earned, never lost" pad="p-6 sm:p-10">
                <FocusStreakWeekCard />
              </VisualCard>
            </Section>
          </div>

          <Section
            eyebrow="Early Mockups"
            heading="Now that we had Focus Streaks we had to think through how to show the rest of the content."
            body="The original idea was to rotate through different content on the completion screen and show whatever was relevant to the session a user just completed, so the page always had something fresh to show."
          >
            <VisualCard caption="Early rotating-content concepts for Milestones, Personal Bests, and Quotes" pad="p-4 sm:p-6">
              <CaseStudyMediaGallery
                maxWidth={520}
                items={[
                  {
                    src: '/case-studies/focus-coach-achievements/early-milestone-mockup.png',
                    alt: 'Early Milestone completion screen mockup',
                    caption: 'Early Milestone mockup',
                  },
                  {
                    src: '/case-studies/focus-coach-achievements/early-personal-best-mockup.png',
                    alt: 'Early Personal Best completion screen mockup',
                    caption: 'Early Personal Best mockup',
                  },
                  {
                    src: '/case-studies/focus-coach-achievements/early-quote-mockup.png',
                    alt: 'Early Quote completion screen mockup',
                    caption: 'Early Quote mockup',
                  },
                ]}
              />
            </VisualCard>
          </Section>

          <Section
            eyebrow="The Realization"
            heading="A guided experience is more engaging than a single page full of content."
            body={[
              'The idea for a completion page that rotated through different content worked in theory, but once I began creating mockups it became clear that the design wasn’t working.',
              'That’s when I realized that the best experience would be a guided end of session completion flow where each piece of content had its own super polished screen and animation.',
            ]}
          >
            <FlowStepCards />
          </Section>

          <Section
            eyebrow="End of Session Logic"
            heading="Simple logic decides which screens are included in the end of session flow."
          >
            <div className="flex flex-col gap-3">
              <EndOfSessionFlowDiagram />
              <p className="text-[13px] text-[#999] text-center">
                The shipped flow logic — the achievement screen is rare by design, which is exactly what makes it a special moment
              </p>
            </div>
          </Section>

          <Section
            eyebrow="Personal Reflection"
            heading="With the flow defined, I started re-designing the personal reflection screen."
            body="The redesign does three jobs in order: acknowledge the session has ended, provide context on what was accomplished, and ask users to reflect."
          >
            <div className="flex flex-col gap-10">
              <AnatomyCards />
              <VisualCard caption="The redesigned reflection screen — one question, four options, written to encourage honesty" pad="p-3 sm:p-5">
                <ReflectionScreen />
              </VisualCard>
            </div>
          </Section>

          <Section
            eyebrow="Achievement Screens"
            heading="Designing three kinds of achievements, each with its own unique animated illustration."
            body="In order to elevate the experience I created three different vector illustrations to distinguish the three different achievements. I was then able to animate the illustrations using CSS Keyframes with the help of Claude Code."
          >
            <SegmentedMedia
              tabs={[
                {
                  label: 'Milestone',
                  type: 'GIF',
                  description: 'Live milestone achievement screen with animated summit illustration',
                  caption: 'Milestones — one of three tracks users progress towards: total sessions, total time focused, and total check-ins answered',
                  content: <MilestoneHeroScreen />,
                },
                {
                  label: 'Focus Streak',
                  type: 'GIF',
                  description: 'Live Focus Streak achievement screen with flaming calendar and week tracker',
                  caption: 'Focus Streaks — shown when a user completes at least one session each weekday during a week',
                  content: <FocusStreakScreen />,
                },
                {
                  label: 'Personal Best',
                  type: 'GIF',
                  description: 'Live Personal Best achievement screen with rocket illustration',
                  caption: 'Personal Best — celebrates users beating their longest session record',
                  content: <PersonalBestScreen />,
                },
              ]}
            />
          </Section>

          <Section
            eyebrow="The Completion Screen"
            heading="A completion screen with progress you can see, and a nudge to come back."
            body="All-time stats count up odometer style, showing users how this session added to their all-time progress. Below the stats sits one of two containers: the week tracker or a course quote."
          >
            <SegmentedMedia
              tabs={[
                {
                  label: 'Week Tracker',
                  type: 'GIF',
                  description: 'Live completion screen with week tracker',
                  caption: 'Week Tracker — checks off each weekday a session is completed, gently encouraging a session every weekday',
                  content: <CompletionWeekTrackerScreen />,
                },
                {
                  label: 'Course Quote',
                  type: 'GIF',
                  description: 'Live completion screen with course quote',
                  caption: 'Course Quote — a rotating dose of motivation for every session after the first each day',
                  content: <CompletionQuoteScreen />,
                },
              ]}
            />
          </Section>

          <Section
            eyebrow="Team Presentation"
            heading="Showing off the new experience to my teammates"
            body={[
              'Since this was such a big project with so many interconnected updates, it was important to explain all the new designs in a meeting with my broader team and gather feedback.',
              'In order to give my team members as clear of a picture as possible, I created an HTML prototype that I was able to let them interact with.',
            ]}
          >
            <VisualCard caption="Presenting the design project to my broader team over Slack" pad="p-4 sm:p-6">
              <CaseStudyMedia
                src="/case-studies/focus-coach-achievements/team-meeting-huddle.png"
                alt="Slack huddle screenshot presenting the Focus Coach Milestones design to the broader team"
                maxWidth={720}
                caption="Presenting the design project to my broader team over Slack"
              />
            </VisualCard>
          </Section>

          <Section eyebrow="Final Design" heading="The complete end of session flow – all together.">
            <VisualCard caption="The end of session flow users see after completing their first session">
              <EndOfSessionFlow />
            </VisualCard>
          </Section>

          <VisualCard caption="Personal reflection — mobile, dark mode" pad="p-4 sm:p-8">
            <CaseStudyMedia
              src="/case-studies/focus-coach-achievements/mobile-dm-reflection.png"
              alt="Mobile dark mode personal reflection screen with Session Complete checkmark and four focus options"
              maxWidth={260}
              caption="Personal reflection — mobile, dark mode"
            />
          </VisualCard>

          <VisualCard caption="Achievement screens — mobile, dark mode" pad="p-4 sm:p-6">
            <CaseStudyMediaGallery
              columns={3}
              maxWidth={780}
              gapClassName="gap-3 sm:gap-4"
              items={[
                {
                  src: '/case-studies/focus-coach-achievements/mobile-dm-milestone.png',
                  alt: 'Mobile dark mode milestone screen with mountain illustration and progress to 25 sessions',
                  caption: 'Milestone — mobile, dark mode',
                },
                {
                  src: '/case-studies/focus-coach-achievements/mobile-dm-streak.png',
                  alt: 'Mobile dark mode Focus Streak screen with flaming calendar and weekday tracker',
                  caption: 'Focus Streak — mobile, dark mode',
                },
                {
                  src: '/case-studies/focus-coach-achievements/mobile-dm-personal-best.png',
                  alt: 'Mobile dark mode Personal Best screen with rocket and previous vs new best comparison',
                  caption: 'Personal Best — mobile, dark mode',
                },
              ]}
            />
          </VisualCard>

          <VisualCard caption="Completion screens — mobile, dark mode" pad="p-4 sm:p-6">
            <CaseStudyMediaGallery
              columns={2}
              maxWidth={520}
              gapClassName="gap-3 sm:gap-4"
              items={[
                {
                  src: '/case-studies/focus-coach-achievements/mobile-dm-completion-streak.png',
                  alt: 'Mobile dark mode completion screen with all-time stats and week tracker',
                  caption: 'Week Tracker — mobile, dark mode',
                },
                {
                  src: '/case-studies/focus-coach-achievements/mobile-dm-completion-quote.png',
                  alt: 'Mobile dark mode completion screen with all-time stats and course quote',
                  caption: 'Course Quote — mobile, dark mode',
                },
              ]}
            />
          </VisualCard>

        </div>
      </section>

      <Divider label="Outcomes" id="section-outcomes" />

      {/* ── OUTCOMES ── */}
      <section className={SECTION}>
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Launch Status"
            heading="It shipped during the summer. We’ll measure the impact this fall."
            body="The new experience launched in July, when most students are out of school and classroom usage is naturally lower. We haven’t collected enough post-launch data to draw conclusions yet. When students return this fall, we’ll monitor whether more first-time users come back and whether usage becomes less concentrated among a small group of students."
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {OUTCOME_SIGNALS.map((signal, index) => (
                  <div key={signal.title} className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: CARD_LIGHT }}>
                    <span className="text-[12px] font-medium tracking-[1px]" style={{ color: ACCENT_DARK, fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold text-[#1a1a1a]">{signal.title}</p>
                      <p className="text-[14px] leading-[165%] text-[#666] mt-1.5">{signal.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Callout
                variant="neutral"
                eyebrow="Early Result"
                heading="Reflection response time is already down 22%."
                body="Students are answering the redesigned reflection question faster — an early signal that simplifying the screen is reducing friction."
              />
            </div>
          </Section>
        </div>
      </section>

      <Divider label="Takeaways" id="section-reflection" />

      {/* ── TAKEAWAYS ── */}
      <section className={SECTION}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {TAKEAWAYS.map(takeaway => (
            <div
              key={takeaway.eyebrow}
              className="rounded-[24px] p-7 flex flex-col gap-3 bg-white"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <Eyebrow label={takeaway.eyebrow} color={ACCENT} />
              <h4 className="text-[18px] font-semibold leading-[145%] text-[#1a1a1a]">{takeaway.title}</h4>
              <p className="text-[15px] font-normal leading-[175%] text-[#555]">{takeaway.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-20">
        <ClosingCTA />
      </section>

    </div>
  );
}
