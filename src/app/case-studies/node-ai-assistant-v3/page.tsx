'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Assets ──────────────────────────────────────────────────────────────────
const A = {
  accessingNodeAi: '/case-studies/node-ai/accessing-node-ai.gif',
  uiComponents:    '/case-studies/node-ai/ui-components.png',
  chatgptOutput:   '/case-studies/node-ai/chatgpt-text-output.gif',
  geminiOutput:    '/case-studies/node-ai/gemini-text-output.gif',
  geminiLayout:    '/case-studies/node-ai/gemini-layout.png',
  metaLayout:      '/case-studies/node-ai/meta-ai-layout.png',
  claudePage:      '/case-studies/node-ai/claude-page-behavior.gif',
  geminiPage:      '/case-studies/node-ai/gemini-page-behavior.gif',
  winningChoice:   '/case-studies/node-ai/The-Winning-Choice.png',
  highlightsIcon:  '/case-studies/node-ai/highlights-icon.png',
};

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#101010',
  surface:    '#181818',
  surfaceAlt: '#f2f2f20a',
  border:     '#252525',
  borderDim:  '#f2f2f21a',
  text:       '#f2f2f2',
  textMid:    'rgba(242,242,242,0.65)',
  textDim:    'rgba(242,242,242,0.4)',
  textFaint:  'rgba(242,242,242,0.2)',
  blue:       'rgb(39,180,255)',
  green:      'rgb(13,186,79)',
  red:        'rgb(255,61,61)',
};

// ── Primitives ───────────────────────────────────────────────────────────────

function GlareTop({ color = 'rgba(255,255,255,0.25)' }: { color?: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(to right, transparent 10%, ${color} 50%, transparent 90%)` }}
    />
  );
}

/** Consistent section header — eyebrow → headline → optional lead */
function SectionHeader({
  index,
  label,
  heading,
  lead,
}: {
  index: string;
  label: string;
  heading: string;
  lead?: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Eyebrow */}
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textFaint }}>{index}</span>
        <div className="w-px h-3" style={{ background: C.textFaint }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textDim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      {/* Heading */}
      <h2 style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.8px', color: C.text }}>
        {heading}
      </h2>
      {/* Lead */}
      {lead && (
        <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.75, color: C.textMid, maxWidth: 540 }}>
          {lead}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px" style={{ background: C.borderDim }} />;
}

function FigCaption({ num, label, type }: { num: string; label: string; type: string }) {
  return (
    <div className="flex items-center justify-between mt-2.5">
      <span style={{ fontSize: 12, color: C.textDim }}>
        <span style={{ color: C.textMid, fontWeight: 500 }}>{num}</span> — {label}
      </span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {type}
      </span>
    </div>
  );
}

function Tag({ children, type }: { children: React.ReactNode; type: 'pro' | 'con' }) {
  const isPro = type === 'pro';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{
        fontSize: 13,
        fontWeight: 400,
        background: isPro ? 'rgba(13,186,79,0.1)' : 'rgba(255,61,61,0.1)',
        color: isPro ? C.green : C.red,
        border: `1px solid ${isPro ? 'rgba(13,186,79,0.2)' : 'rgba(255,61,61,0.2)'}`,
      }}
    >
      {isPro ? '↑' : '↓'} {children}
    </span>
  );
}

function CalloutCard({
  gradient, glare, overline, heading, iconSrc, children,
}: {
  gradient: string; glare: string; overline: string; heading: string; iconSrc?: string; children?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-[20px] flex flex-col items-center text-center px-10 py-12 gap-4 overflow-hidden"
      style={{ backgroundColor: C.surfaceAlt, backgroundImage: `radial-gradient(ellipse at 50% 0, ${gradient}, transparent 70%)` }}
    >
      <GlareTop color={glare} />
      {iconSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconSrc} alt="" className="w-14 h-14 rounded-full object-cover" />
      )}
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textDim }}>{overline}</p>
      <h3 style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.4, color: C.text, maxWidth: 600 }}>{heading}</h3>
      {children}
    </div>
  );
}

// ── Animated Abstract Cards ──────────────────────────────────────────────────

function DecisionTreeViz() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="160" height="110" viewBox="0 0 160 110" fill="none">
        <circle cx="80" cy="14" r="7" fill="rgba(242,242,242,0.35)" />
        <line x1="80" y1="21" x2="32" y2="52" stroke={C.borderDim} strokeWidth="1.5" />
        <line x1="80" y1="21" x2="80" y2="52" stroke={C.borderDim} strokeWidth="1.5" />
        <line x1="80" y1="21" x2="128" y2="52" stroke={C.borderDim} strokeWidth="1.5" />
        <circle cx="32"  cy="58" r="6" fill="rgba(242,242,242,0.15)" />
        <circle cx="80"  cy="58" r="6" fill="rgba(242,242,242,0.15)" />
        <circle cx="128" cy="58" r="6" fill="rgba(242,242,242,0.15)" />
        <line x1="32"  y1="64" x2="32"  y2="82" stroke="rgba(255,61,61,0.2)" strokeWidth="1.5" />
        <line x1="80"  y1="64" x2="80"  y2="82" stroke="rgba(255,61,61,0.2)" strokeWidth="1.5" />
        <line x1="128" y1="64" x2="128" y2="82" stroke="rgba(255,61,61,0.2)" strokeWidth="1.5" />
        <g style={{ animation: 'v3-dead-end 2.4s ease-in-out infinite', animationDelay: '0s' }}>
          <line x1="25" y1="85" x2="39" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="39" y1="85" x2="25" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g style={{ animation: 'v3-dead-end 2.4s ease-in-out infinite', animationDelay: '0.8s' }}>
          <line x1="73" y1="85" x2="87" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="87" y1="85" x2="73" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g style={{ animation: 'v3-dead-end 2.4s ease-in-out infinite', animationDelay: '1.6s' }}>
          <line x1="121" y1="85" x2="135" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="135" y1="85" x2="121" y2="99" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="0" cy="0" r="4" fill={C.red} opacity="0.9">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M80,14 L32,58" />
        </circle>
      </svg>
    </div>
  );
}

function ContextBlindViz() {
  const words = ['Need', 'help', 'with', 'lesson', '3'];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.borderDim}` }}>
        {words.map((w, i) => (
          <span key={w} style={{ fontSize: 14, color: C.textMid, animation: 'v3-context-blur 3s ease-in-out infinite', animationDelay: `${i * 0.35}s` }}>
            {w}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.2)' }}>
          <span style={{ fontSize: 13, color: C.red }}>?</span>
        </div>
        <div className="rounded-lg" style={{ width: 90, height: 8, background: C.surfaceAlt, animation: 'v3-context-blur 2s ease-in-out infinite', animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}

function StuckLoopViz() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', animation: 'v3-spin-loop 2s linear infinite' }}>
          <circle cx="40" cy="40" r="32" stroke="rgba(255,61,61,0.15)" strokeWidth="2.5" fill="none" />
          <path d="M40 8 A32 32 0 0 1 72 40" stroke={C.red} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <div className="w-10 h-10 rounded-full z-10 flex items-center justify-center" style={{ background: '#252525', border: `1px solid ${C.borderDim}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StreamingTextViz() {
  const text = 'Yes, teachers can access Node AI from...';
  return (
    <div className="w-full h-full flex flex-col justify-end p-5 gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(39,180,255,0.15)' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.blue }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: C.textDim }}>Node AI</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 300, color: C.textMid, lineHeight: 1.6 }}>
        {text.split('').map((c, i) => (
          <span key={i} style={{ animation: 'v3-char-in 0.06s ease-out both', animationDelay: `${i * 0.05}s`, animationIterationCount: 'infinite', animationDirection: 'alternate', opacity: 0 }}>
            {c}
          </span>
        ))}
        <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle" style={{ background: C.blue, animation: 'typing 1s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

function MessageStructureViz() {
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2.5 p-5">
      <div className="flex justify-end" style={{ animation: 'v3-bubble-right 0.6s ease-out 0.3s both' }}>
        <div className="rounded-[14px_14px_3px_14px] px-3.5 py-2" style={{ background: '#2a2a2a', border: `1px solid ${C.border}`, maxWidth: '68%' }}>
          <span style={{ fontSize: 12, color: C.textMid }}>How do I start a lesson?</span>
        </div>
      </div>
      <div className="flex items-end gap-2" style={{ animation: 'v3-bubble-left 0.6s ease-out 0.9s both' }}>
        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(39,180,255,0.1)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(39,180,255,0.6)' }} />
        </div>
        <div className="rounded-[14px_14px_14px_3px] px-3.5 py-2" style={{ background: '#1e1e1e', border: `1px solid ${C.border}`, maxWidth: '80%' }}>
          <span style={{ fontSize: 12, color: C.textMid }}>Open the dashboard and tap &#34;New Lesson&#34;...</span>
        </div>
      </div>
      <div className="flex justify-end" style={{ animation: 'v3-bubble-right 0.6s ease-out 1.6s both' }}>
        <div className="rounded-[14px_14px_3px_14px] px-3.5 py-2" style={{ background: '#2a2a2a', border: `1px solid ${C.border}`, maxWidth: '50%' }}>
          <span style={{ fontSize: 12, color: C.textMid }}>Got it, thanks!</span>
        </div>
      </div>
    </div>
  );
}

function AnchoredSectionViz() {
  return (
    <div className="w-full h-full flex flex-col justify-between p-5 gap-2">
      <div className="flex flex-col gap-1.5">
        <div className="h-7 rounded-lg" style={{ background: '#1e1e1e', border: `1px solid ${C.border}` }} />
        <div className="h-7 rounded-lg" style={{ background: '#1e1e1e', border: `1px solid ${C.border}`, width: '80%' }} />
        <div className="h-7 rounded-lg" style={{ background: 'rgba(39,180,255,0.05)', border: '1px solid rgba(39,180,255,0.15)', animation: 'v3-section-rise 2.8s ease-in-out infinite' }} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#1e1e1e', border: `1px solid #2e2e2e` }}>
        <div className="flex-1 h-2 rounded" style={{ background: '#2a2a2a' }} />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(39,180,255,0.1)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Reusable shell for all abstract animated cards */
function AbstractCard({ label, desc, height = 160, children }: { label: string; desc: string; height?: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-[18px] overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="relative" style={{ height, borderBottom: `1px solid ${C.border}` }}>
        {children}
      </div>
      <div className="px-5 py-4 flex flex-col gap-1.5">
        <p style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 300, color: C.textDim, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Competitive Analysis Carousel ────────────────────────────────────────────

type CompSlide = {
  title: string;
  subtitle: string;
  whyItMatters: string;
  items: { src: string; name: string; finding: string }[];
};

const compSlides: CompSlide[] = [
  {
    title: 'Text Output Behavior',
    subtitle: 'How text is displayed — letter-by-letter, instant, or with a loading skeleton.',
    whyItMatters: 'Pacing and visual feedback shape the perceived responsiveness of the AI. Streaming feels alive; waiting for a complete response feels slow.',
    items: [
      { src: A.chatgptOutput, name: 'ChatGPT', finding: 'Streams letter-by-letter with a blinking dot indicator. Feels immediate and intelligent.' },
      { src: A.geminiOutput,  name: 'Gemini',  finding: 'Shows a text skeleton instantly, then fills in all at once. Faster but less natural.' },
    ],
  },
  {
    title: 'Message Structure & Layout',
    subtitle: 'The visual organization of user and AI messages within the conversation.',
    whyItMatters: 'Clear left/right differentiation reduces cognitive load — users shouldn\'t have to think about who said what.',
    items: [
      { src: A.geminiLayout, name: 'Gemini',  finding: 'Both messages appear on the left, differentiated only by icon. Harder to scan.' },
      { src: A.metaLayout,   name: 'Meta AI', finding: 'User messages right, AI messages left in distinct bubbles. Familiar and easy to follow.' },
    ],
  },
  {
    title: 'Dynamic Page Behavior',
    subtitle: 'How the interface adapts as new messages arrive — scrolling, layout shifts, focus.',
    whyItMatters: 'Content that shifts mid-read is disorienting. The interface should feel stable even as it\'s actively generating.',
    items: [
      { src: A.claudePage,  name: 'Claude', finding: 'Responses push content upward as text streams in. Disrupts reading mid-generation.' },
      { src: A.geminiPage,  name: 'Gemini', finding: 'Each exchange anchors in its own section. Page stays stable and readable.' },
    ],
  },
];

function CompAnalysisCarousel() {
  const [idx, setIdx] = useState(0);
  const n = compSlides.length;
  const slide = compSlides[idx];

  return (
    <div className="flex flex-col gap-4">

      {/* Slide header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {compSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-full transition-all"
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: idx === i ? 500 : 400,
                background: idx === i ? C.surface : 'transparent',
                border: `1px solid ${idx === i ? C.border : 'transparent'}`,
                color: idx === i ? C.text : C.textDim,
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIdx(i => (i === 0 ? n - 1 : i - 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f2f2f20d]"
            style={{ border: `1px solid ${C.borderDim}` }}
          >
            <ChevronLeft size={14} color={C.text} />
          </button>
          <button
            onClick={() => setIdx(i => (i === n - 1 ? 0 : i + 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f2f2f20d]"
            style={{ border: `1px solid ${C.borderDim}` }}
          >
            <ChevronRight size={14} color={C.text} />
          </button>
        </div>
      </div>

      {/* Slide body */}
      <div className="rounded-[20px] overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>

        {/* Context bar */}
        <div className="px-7 py-6 border-b" style={{ borderColor: C.borderDim }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: C.text, marginBottom: 6 }}>{slide.subtitle}</p>
          <p style={{ fontSize: 13, fontWeight: 300, color: C.textDim, lineHeight: 1.65 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint, marginRight: 8 }}>Why it matters</span>
            {slide.whyItMatters}
          </p>
        </div>

        {/* Media — full-width, stacked */}
        <div className="p-7 flex flex-col gap-6">
          {slide.items.map(item => (
            <div key={item.name} className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.name}
                className="w-full rounded-[12px]"
                style={{ border: `1px solid ${C.border}` }}
              />
              <div className="flex items-baseline gap-3">
                <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{item.name}</span>
                <span style={{ fontSize: 13, fontWeight: 300, color: C.textDim }}>— {item.finding}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Design Decisions ─────────────────────────────────────────────────────────

const decisions = [
  {
    num: '01',
    question: 'Where should teachers access the assistant from?',
    title: 'Assistant Access Point',
    answer: 'A persistent entry point in the main nav',
    why: 'The assistant needed to feel ever-present — available from anywhere in the platform, without taking over the screen.',
  },
  {
    num: '02',
    question: 'Should it appear as an overlay or be embedded in the page?',
    title: 'Modal vs. Inline Experience',
    answer: 'Slide-out panel anchored to the right edge',
    why: 'A modal blocks content and feels disruptive. An inline panel keeps context visible — teachers can reference the platform while chatting.',
  },
  {
    num: '03',
    question: 'How do we orient teachers on first launch?',
    title: 'Empty State Design',
    answer: 'Greeting + 4 curated suggested questions',
    why: 'Blank inputs create anxiety. Pre-populated suggestions show capability immediately and reduce the friction of that first message.',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NodeAIV3() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ background: C.bg, color: C.text }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center overflow-hidden pt-24"
        style={{ backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0, rgba(39,180,255,0.18), transparent)' }}
      >
        <GlareTop color="rgba(255,255,255,0.5)" />

        <div className="w-full max-w-[860px] mx-auto px-6 flex flex-col items-center gap-4 mb-14">
          <h1
            className="text-center"
            style={{
              fontSize: 'clamp(48px, 7vw, 68px)',
              fontWeight: 600,
              lineHeight: 1.06,
              letterSpacing: '-1.5px',
              backgroundImage: 'linear-gradient(to bottom, #f2f2f2 35%, rgba(242,242,242,0.45))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Node AI Assistant
          </h1>
          <p style={{ fontSize: 15, color: C.textDim }}>Finding Focus · Product Design · Aug 2024</p>

          {/* Meta pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
            {[
              { k: 'Role',     v: 'UX Lead'           },
              { k: 'Team',     v: 'Mrazek · Kennedy'  },
              { k: 'Duration', v: '2 months'          },
              { k: 'Shipped',  v: 'Nov 2024'          },
            ].map(({ k, v }) => (
              <div
                key={k}
                className="flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{ background: C.surfaceAlt, border: `1px solid ${C.borderDim}`, fontSize: 12 }}
              >
                <span style={{ color: C.textFaint }}>{k}</span>
                <div className="w-px h-3" style={{ background: C.borderDim }} />
                <span style={{ fontWeight: 500, color: C.textMid }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero GIF — full width */}
        <div className="w-full max-w-[860px] mx-auto px-6 relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={A.accessingNodeAi}
            alt="Node AI Assistant — accessing the product"
            className="w-full rounded-t-[20px]"
            style={{ border: `1px solid ${C.border}`, borderBottom: 'none' }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
      </section>

      {/* ═══ OVERVIEW ════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[860px] mx-auto px-6 py-20">
        <div className="grid grid-cols-[180px_1fr] gap-12 items-start">
          <div className="flex flex-col gap-3 pt-1">
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textFaint }}>Overview</p>
          </div>
          <div className="flex flex-col gap-5">
            <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.8, color: C.textMid }}>
              With educational grants pushing Finding Focus toward AI integration, we built an LLM-powered
              assistant that gives every teacher the same hands-on support our team had only been able to
              offer in person. It launched in November 2024 to overwhelmingly positive feedback — teachers
              describe it as having a knowledgeable colleague on call 24/7.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[860px] mx-auto px-6"><Divider /></div>

      {/* ═══ 01 · CONTEXT & PROBLEM ══════════════════════════════════════════ */}
      <section className="w-full max-w-[860px] mx-auto px-6 py-24 flex flex-col gap-16">

        <SectionHeader
          index="01"
          label="Context & Problem"
          heading="Traditional chatbots weren't good enough."
          lead="Our best teachers had one thing in common: direct support from our team. We needed to scale that support — but a generic chatbot would undermine trust in the product before it even got started."
        />

        {/* Three problem cards */}
        <div className="grid grid-cols-3 gap-3">
          <AbstractCard
            label="Limited Responses"
            desc="Decision trees dead-end the moment a user asks something unexpected."
            height={170}
          >
            <DecisionTreeViz />
          </AbstractCard>
          <AbstractCard
            label="No Context"
            desc="Rudimentary NLP can't grasp meaning behind complex or novel questions."
            height={170}
          >
            <ContextBlindViz />
          </AbstractCard>
          <AbstractCard
            label="Gets Stuck"
            desc="Users escalate to the human support team anyway — defeating the purpose."
            height={170}
          >
            <StuckLoopViz />
          </AbstractCard>
        </div>

        {/* The challenge callout */}
        <CalloutCard
          gradient="rgba(255,214,10,0.07)"
          glare="rgba(255,214,10,0.5)"
          iconSrc={A.highlightsIcon}
          overline="The Challenge"
          heading="Create a genuinely helpful assistant that understands teachers&#39; questions and provides relevant answers — without the limitations of traditional chatbots."
        />

        {/* Objectives — 3 clean tiles */}
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textFaint }}>Project Objectives</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { mark: '✦', title: 'Truly understand queries',    desc: 'Grasp what teachers are asking, regardless of how they phrase it.' },
              { mark: '◎', title: 'Provide relevant responses',  desc: 'Answer any question without limiting scope or forcing decision trees.' },
              { mark: '◈', title: 'Exceed expectations',        desc: 'Set the standard for EdTech virtual support agents.' },
            ].map(o => (
              <div key={o.title} className="flex flex-col gap-3 rounded-[16px] p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 20, color: C.textDim }}>{o.mark}</span>
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{o.title}</p>
                <p style={{ fontSize: 13, fontWeight: 300, color: C.textDim, lineHeight: 1.6 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      <div className="w-full max-w-[860px] mx-auto px-6"><Divider /></div>

      {/* ═══ 02 · RESEARCH ═══════════════════════════════════════════════════ */}
      <section className="w-full max-w-[860px] mx-auto px-6 py-24 flex flex-col gap-16">

        <SectionHeader
          index="02"
          label="Research"
          heading="Two paths. One clear answer."
          lead="Before any design work, we had to choose the technology powering the assistant. Two approaches existed — and the differences were fundamental."
        />

        {/* API comparison */}
        <div className="flex flex-col gap-3">
          {[
            {
              name: 'Rule-Based NLU', examples: 'Dialogflow · Amazon Lex · Rasa',
              pros: ['Fast', 'Predictable', 'Cost Effective'], proNote: 'Excel in structured, well-defined interactions.',
              cons: ['Robotic', 'Inflexible', 'Context Blind'], conNote: 'Fail at nuanced or open-ended questions.',
            },
            {
              name: 'LLM APIs', examples: 'OpenAI GPT · Anthropic Claude · Gemini',
              pros: ['Versatile', 'Context-Aware', 'Natural'], proNote: 'Generate dynamic, intelligent responses for virtually any query.',
              cons: ['Cost', 'Less Control', 'Hallucinations'], conNote: 'Require ongoing investment in quality and maintenance.',
            },
          ].map(api => (
            <div key={api.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between rounded-[14px] px-5 py-4" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{api.name}</p>
                <p style={{ fontSize: 12, color: C.textDim }}>{api.examples}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[14px] p-5 flex flex-col gap-3" style={{ background: 'rgba(13,186,79,0.05)', border: '1px solid rgba(13,186,79,0.12)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.green }}>Pros</p>
                  <div className="flex flex-wrap gap-1.5">{api.pros.map(p => <Tag key={p} type="pro">{p}</Tag>)}</div>
                  <p style={{ fontSize: 13, fontWeight: 300, color: C.textDim, lineHeight: 1.6 }}>{api.proNote}</p>
                </div>
                <div className="rounded-[14px] p-5 flex flex-col gap-3" style={{ background: 'rgba(255,61,61,0.05)', border: '1px solid rgba(255,61,61,0.12)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.red }}>Cons</p>
                  <div className="flex flex-wrap gap-1.5">{api.cons.map(c => <Tag key={c} type="con">{c}</Tag>)}</div>
                  <p style={{ fontSize: 13, fontWeight: 300, color: C.textDim, lineHeight: 1.6 }}>{api.conNote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Winner */}
        <CalloutCard
          gradient="rgba(39,180,255,0.07)"
          glare="rgba(39,180,255,0.4)"
          iconSrc={A.winningChoice}
          overline="The Winning Choice"
          heading="LLM-Powered API"
        >
          <p style={{ fontSize: 14, fontWeight: 300, color: C.textDim, maxWidth: 500 }}>
            The LLM&#39;s ability to truly understand context and respond naturally made it the clear choice.
            We chose OpenAI&#39;s Assistants API.
          </p>
        </CalloutCard>

        {/* Competitive analysis — large GIFs */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 style={{ fontSize: 24, fontWeight: 500, color: C.text }}>Learning from the best.</h3>
            <p style={{ fontSize: 15, fontWeight: 300, color: C.textDim, lineHeight: 1.7 }}>
              A comparative analysis of Gemini, Claude, Meta AI, and ChatGPT across three dimensions
              that directly inform how a chat interface should behave.
            </p>
          </div>
          <CompAnalysisCarousel />
        </div>

        {/* 3 design insights — animated cards */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 style={{ fontSize: 22, fontWeight: 500, color: C.text }}>Three ingredients for a great LLM chat experience.</h3>
            <p style={{ fontSize: 14, fontWeight: 300, color: C.textDim }}>These findings translated directly into design requirements.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <AbstractCard label="Stream text as it generates" desc="Letter-by-letter output feels immediate — waiting for a full response feels slow." height={160}>
              <StreamingTextViz />
            </AbstractCard>
            <AbstractCard label="Familiar left/right structure" desc="Matching existing chat conventions means zero learning curve for message hierarchy." height={160}>
              <MessageStructureViz />
            </AbstractCard>
            <AbstractCard label="Anchor each exchange" desc="Dedicated sections per message prevent content shifting mid-read during streaming." height={160}>
              <AnchoredSectionViz />
            </AbstractCard>
          </div>
        </div>

      </section>

      <div className="w-full max-w-[860px] mx-auto px-6"><Divider /></div>

      {/* ═══ 03 · DESIGN ═════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[860px] mx-auto px-6 py-24 flex flex-col gap-12">

        <SectionHeader
          index="03"
          label="Design"
          heading="Three decisions that shaped the experience."
          lead="With clear principles from research, I worked through three fundamental interface questions — each one directly shaping how the assistant would feel within Finding Focus."
        />

        <div className="flex flex-col gap-3">
          {decisions.map(d => (
            <div
              key={d.num}
              className="rounded-[20px] p-7 flex flex-col gap-5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {/* Decision header */}
              <div className="flex items-start gap-5">
                <div
                  className="flex-shrink-0 rounded-full w-9 h-9 flex items-center justify-center"
                  style={{ background: C.surfaceAlt, border: `1px solid ${C.borderDim}` }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.textDim }}>{d.num}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p style={{ fontSize: 12, color: C.textFaint }}>{d.question}</p>
                  <p style={{ fontSize: 18, fontWeight: 500, color: C.text }}>{d.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 pl-14">
                {/* Decision made */}
                <div className="flex flex-col gap-1.5">
                  <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint }}>Decision</p>
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 self-start" style={{ background: 'rgba(39,180,255,0.08)', border: '1px solid rgba(39,180,255,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.blue }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.blue }}>{d.answer}</span>
                  </div>
                </div>
                {/* Rationale */}
                <div className="flex flex-col gap-1.5">
                  <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint }}>Why</p>
                  <p style={{ fontSize: 14, fontWeight: 300, color: C.textDim, lineHeight: 1.65 }}>{d.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      <div className="w-full max-w-[860px] mx-auto px-6"><Divider /></div>

      {/* ═══ 04 · OUTCOME ════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[860px] mx-auto px-6 py-24 flex flex-col gap-12">

        <SectionHeader
          index="04"
          label="Outcome"
          heading="A genuinely helpful assistant."
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '↑', stat: 'Teacher satisfaction', label: 'Overwhelmingly positive early feedback', delay: '0s' },
            { value: '24/7', stat: 'On-demand support', label: 'No team intervention needed', delay: '1s' },
            { value: '✕3', stat: 'Support capacity', label: 'Scaled without growing the team', delay: '2s' },
          ].map(item => (
            <div
              key={item.stat}
              className="relative flex flex-col gap-2 rounded-[20px] px-6 py-7 overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}`, animation: 'v3-glow-pulse 3s ease-in-out infinite', animationDelay: item.delay }}
            >
              <GlareTop color="rgba(39,180,255,0.2)" />
              <span style={{ fontSize: 30, fontWeight: 600, color: C.blue }}>{item.value}</span>
              <p style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{item.stat}</p>
              <p style={{ fontSize: 12, fontWeight: 300, color: C.textDim }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Final media */}
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={A.accessingNodeAi} alt="Node AI — final product" className="w-full rounded-[20px]" style={{ border: `1px solid ${C.border}` }} />
          <FigCaption num="4.0" label="Node AI Assistant — final product" type="VIDEO LOOP" />
        </div>

        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={A.uiComponents} alt="UI components" className="w-full rounded-[20px]" style={{ border: `1px solid ${C.border}` }} />
          <FigCaption num="4.1" label="UI component library" type="IMAGE" />
        </div>

      </section>

      <div className="h-24" />
    </div>
  );
}
