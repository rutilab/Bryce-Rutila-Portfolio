'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PersonSearchOutlined from '@mui/icons-material/PersonSearchOutlined';
import AutoFixHighOutlined from '@mui/icons-material/AutoFixHighOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';

const CASE_STUDY_ACCENT = '#006EFE';
/** North Star callout: left border + eyebrow (matches NorthStar.svg fills) */
const NORTH_STAR_CONTAINER_ACCENT = '#690FD0';
/** Matches Node AI pain cards: rgba(theme, 0.06) */
const GOAL_CARD_FILL = 'rgba(0, 110, 254, 0.06)';

// ── Asset paths ──────────────────────────────────────────────────────────────
// Copy images from "Landing Page Reference/" into public/case-studies/landing-page/
const assets = {
  oldInterface: '/case-studies/landing-page/old-interface.png',
  oldFullPage: '/case-studies/landing-page/old-full-page.png',
  newFullPage: '/case-studies/landing-page/new-full-page.png',
  headerAndHero: '/case-studies/landing-page/header-and-hero.png',
  focusCoach: '/case-studies/landing-page/focus-coach.png',
  teacherInterface: '/case-studies/landing-page/teacher-interface.png',
  researchSection: '/case-studies/landing-page/research-section.png',
  socialProofStrip: '/case-studies/landing-page/social-proof-strip.png',
  testimonialSection: '/case-studies/landing-page/testimonial-section.png',
  tenDayCourse: '/case-studies/landing-page/10-day-course.png',
  finalCta: '/case-studies/landing-page/final-cta.png',
  faq: '/case-studies/landing-page/faq.png',
  approachResearchBoard: '/case-studies/landing-page/approach-competitive-research-board.png',
  viExistingAssets: '/case-studies/landing-page/vi-01-existing-assets.png',
  viIntroSlackCanvas: '/case-studies/landing-page/vi-02-intro-slack-canvas.png',
  viGlassmorphismFf: '/case-studies/landing-page/vi-03-glassmorphism-ff.png',
  viGlassmorphismBroad: '/case-studies/landing-page/vi-04-glassmorphism-broad.png',
  messagingStorybrandDoc: '/case-studies/landing-page/messaging-storybrand-teacher-doc.png',
  mobileMockup: '/case-studies/landing-page/mobile-mockup.png',
  anim10DayCourse: '/case-studies/landing-page/anim-10-day-course.gif',
  animFocusCoach: '/case-studies/landing-page/anim-focus-coach.gif',
  animTeacherInterface: '/case-studies/landing-page/anim-teacher-interface.gif',
};

// ── Text scale ───────────────────────────────────────────────────────────────
// Section heading:  30px semibold
// Section body:     18px normal 180%
// Card title:       17–19px semibold
// Card body:        16px normal 175%
// Caption:          13px normal #888–#999
// Eyebrow:          11px medium tracking-wide #006EFE

// ── Utility components ───────────────────────────────────────────────────────

function Eyebrow({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#006EFE]">
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
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="max-w-[720px]">
          {eyebrow && <Eyebrow label={eyebrow} />}
          <h2 className="text-[22px] md:text-[30px] font-semibold leading-[125%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
            {heading}
          </h2>
        </div>
        {body && (
          <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555] max-w-[920px] whitespace-pre-line">
            {body}
          </p>
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
  iconSrc,
}: {
  accentColor: string;
  label: string;
  heading: string;
  body?: string;
  compactBody?: boolean;
  iconSrc?: string;
}) {
  return (
    <div
      className="flex max-w-[760px] items-stretch bg-white rounded-[16px]"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `2px solid ${accentColor}` }}
    >
      {iconSrc && (
        <div className="flex shrink-0 items-center justify-center self-stretch px-4" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} alt="" width={64} height={64} className="block size-16 object-contain" />
        </div>
      )}
      <div className={`flex min-w-0 flex-1 flex-col gap-3 py-6 pr-6 ${iconSrc ? '' : 'pl-6'}`}>
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: accentColor }}>
          {label}
        </p>
        <p className="text-[20px] font-semibold leading-[135%] text-[#1a1a1a]">{heading}</p>
        {body && (
          <p className={compactBody ? 'text-[14px] font-normal leading-[170%] text-[#666]' : 'text-[17px] font-normal leading-[175%] text-[#666]'}>
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

function VisualCard({ children, caption, subcaption }: { children: ReactNode; caption?: string; subcaption?: string }) {
  return (
    <div>
      <div className="rounded-[24px] overflow-hidden" style={{ background: 'rgba(220,232,248,0.45)' }}>
        {children}
      </div>
      {caption && <p className="text-[13px] text-[#999] text-center mt-3">{caption}</p>}
      {subcaption && <p className="text-[13px] text-[#bbb] text-center mt-1 italic">{subcaption}</p>}
    </div>
  );
}

// ── ExpandableImage: click-to-lightbox wrapper ───────────────────────────────
function ExpandableImage({
  src,
  alt,
  style,
  className,
  scrollable,
}: {
  src: string;
  alt: string;
  style?: CSSProperties;
  className?: string;
  scrollable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ ...style, cursor: 'zoom-in' }}
        className={className}
        onClick={() => setOpen(true)}
      />
      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(8,8,8,0.92)',
            display: 'flex',
            alignItems: scrollable ? 'flex-start' : 'center',
            justifyContent: 'center',
            overflowY: scrollable ? 'auto' : 'hidden',
            padding: scrollable ? '60px 32px 48px' : '40px 32px',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', top: 20, right: 20,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', cursor: 'pointer',
            }}
            className="hover:bg-white/20"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={e => e.stopPropagation()}
            style={scrollable ? {
              width: 'min(90vw, 960px)', height: 'auto',
              borderRadius: 14, cursor: 'default', display: 'block',
            } : {
              maxWidth: 'min(88vw, 1280px)', maxHeight: '82vh',
              objectFit: 'contain', borderRadius: 14, cursor: 'default', display: 'block',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
}

// ── IdeationViewer: auto-advance image carousel with progress dots ────────────
function IdeationViewer({
  items,
}: {
  items: { src: string; alt: string; secondSrc?: string; secondAlt?: string; label: string; caption: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [dotProgress, setDotProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const DURATION = 12000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.4 },
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
    <>
    <div ref={containerRef}>
      <div
        className="rounded-[24px] overflow-hidden relative h-[500px] md:h-[380px]"
        style={{ background: 'rgba(220,232,248,0.45)' }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center p-8 gap-6 ${it.secondSrc ? 'flex-col md:flex-row' : ''}`}
            style={{ opacity: i === current ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: i === current ? 'auto' : 'none' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src}
              alt={it.alt}
              className={it.secondSrc
                ? 'max-h-[44%] md:max-h-full md:max-w-[52%] max-w-full w-auto h-auto block flex-shrink-0'
                : 'max-h-full max-w-full w-auto h-auto block'}
              style={{ cursor: i === current ? 'zoom-in' : 'default' }}
              onClick={i === current ? () => { setLightboxSrc(it.src); setLightboxAlt(it.alt); } : undefined}
            />
            {it.secondSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.secondSrc}
                alt={it.secondAlt ?? ''}
                className="max-h-[44%] md:max-h-full md:max-w-[44%] max-w-full w-auto h-auto block flex-shrink-0"
              />
            )}
          </div>
        ))}
        <button
          onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
          style={{
            visibility: current > 0 ? 'visible' : 'hidden',
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            width: 32, height: 32, borderRadius: '50%', background: 'white',
            border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555', cursor: 'pointer', zIndex: 2,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L4 7l5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % items.length)}
          style={{
            visibility: current < items.length - 1 ? 'visible' : 'hidden',
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            width: 32, height: 32, borderRadius: '50%', background: 'white',
            border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555', cursor: 'pointer', zIndex: 2,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2 px-2">
        <p className="text-[13px] text-[#999] text-center max-w-[min(720px,92vw)] leading-[160%]">{item.label}</p>
        {item.caption && <p className="text-[13px] text-[#bbb] text-center max-w-[480px]">{item.caption}</p>}
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                height: 5, borderRadius: 3, width: i === current ? 48 : 5,
                transition: 'width 0.25s', background: 'rgba(0,0,0,0.12)',
                border: 'none', cursor: 'pointer', padding: 0,
                position: 'relative', overflow: 'hidden', flexShrink: 0,
              }}
            >
              {i === current && (
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${dotProgress}%`, background: '#006EFE' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
    {lightboxSrc && mounted && createPortal(
      <div
        onClick={() => setLightboxSrc(null)}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,8,8,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', cursor: 'zoom-out' }}
      >
        <button
          onClick={() => setLightboxSrc(null)}
          style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
          className="hover:bg-white/20"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lightboxSrc} alt={lightboxAlt} onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(88vw, 1280px)', maxHeight: '82vh', objectFit: 'contain', borderRadius: 14, cursor: 'default', display: 'block' }} />
      </div>,
      document.body
    )}
    </>
  );
}

// ── SectionNav ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'section-intro', label: 'Intro' },
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-approach', label: 'Approach' },
  { id: 'section-design', label: 'Design' },
  { id: 'section-animations', label: 'Animations' },
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPageCaseStudy() {
  return (
    <div className="min-h-screen bg-white text-[#444444] min-[600px]:pr-[100px]">

      <SectionNav />

      {/* ── HERO ── */}
      <header id="section-intro" className="relative bg-gradient-to-b from-[rgba(0,110,254,0.12)] to-white to-[87%] min-[600px]:-mr-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-0">

          {/* Company branding */}
          <div className="flex items-center gap-2.5 mb-6" style={{ opacity: 0.65 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/case-studies/finding-focus-ai-assistant/finding-focus-logo.svg"
              alt="Finding Focus logo"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
            <span className="text-[15px] font-semibold text-[#000] tracking-[-0.1px]">Finding Focus</span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[110%] tracking-[-1px] text-[#1a1a1a] mb-4 max-w-[680px]">
            Landing Page Redesign
          </h1>

          {/* Description */}
          <p className="text-[15px] md:text-[18px] font-normal leading-[170%] text-[#555] max-w-[800px] mb-10">
            I led the redesign of Finding Focus&apos;s landing page, shifting its messaging towards the audience most responsible for bringing the product into classrooms: teachers. My goal was to make Finding Focus feel clearer, more credible, and more worth signing up for.
          </p>

          {/* Hero image — new design */}
          <VisualCard>
            <div className="p-4 sm:p-8">
              <ExpandableImage
                src={assets.headerAndHero}
                alt="Redesigned Finding Focus landing page hero"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              />
            </div>
          </VisualCard>

          {/* My Role / Team / Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 mt-10 pb-16 text-center sm:text-center">
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">My Role</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">UX Designer</p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Team</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">
                Mike Mrazek, Co-founder<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            <div>
              <p className="text-[17px] md:text-[20px] font-semibold text-[#1a1a1a] mb-2">Timeline</p>
              <p className="text-[15px] md:text-[17px] font-normal leading-[175%] text-[#555]">Sep – Nov 2025</p>
            </div>
          </div>

        </div>
      </header>

      <Divider label="Overview" id="section-overview" />

      {/* ── CONTEXT (The Problem → image → Project Goal → problem cards) ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="The Problem"
            heading="Our page was speaking to the wrong audience."
            body="Finding Focus&apos;s original landing page had been around since the company&apos;s early days. It no longer matched the audience we needed to persuade. Because teachers are the ones who decide whether Finding Focus gets brought into the classroom, the page needed to speak directly to them. Instead, much of the messaging and framing centered the student experience."
          />

          <VisualCard
            caption="The original landing page — a student-first design that wasn't speaking to our primary audience"
            subcaption="Click the image above to view the full landing page design"
          >
            <div className="p-6 sm:p-10">
              <div
                className="group"
                style={{ borderRadius: 12, overflow: 'hidden', height: 500, position: 'relative', cursor: 'zoom-in' }}
              >
                <ExpandableImage
                  src={assets.oldFullPage}
                  alt="Original Finding Focus landing page — full page screenshot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  scrollable
                />
                {/* Click affordance tag — visible on hover only */}
                <div
                  className="pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    position: 'absolute', bottom: 12, left: 12,
                    background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                    padding: '5px 12px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.3"/>
                    <path d="M7.5 7.5l2.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  View full landing page design
                </div>
              </div>
            </div>
          </VisualCard>

          <Section
            eyebrow="Project Goal"
            heading="Redesign the landing page to optimize for conversion."
            body="The goal for this project was simple: create a kick ass landing page that helps teachers understand the value of Finding Focus and gets them to sign up."
          >
            {/* Goal cards — layout matches Node AI painpoint cards (Finding Focus Assistant case study) */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: GOAL_CARD_FILL }}>
                  <PersonSearchOutlined sx={{ fontSize: 24, color: CASE_STUDY_ACCENT }} className="flex-shrink-0" aria-hidden />
                  <div>
                    <p className="text-[15px] font-semibold mb-1.5" style={{ color: CASE_STUDY_ACCENT }}>
                      Align With Audience
                    </p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                      Update the landing page to speak to Teachers since they are the ones who actually drive adoption of Finding Focus — not students.
                    </p>
                  </div>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: GOAL_CARD_FILL }}>
                  <AutoFixHighOutlined sx={{ fontSize: 24, color: CASE_STUDY_ACCENT }} className="flex-shrink-0" aria-hidden />
                  <div>
                    <p className="text-[15px] font-semibold mb-1.5" style={{ color: CASE_STUDY_ACCENT }}>
                      Update Visual Design
                    </p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                      Modernize the design of the landing page to help make a good first impression and to help communicate that the product they are signing up for is polished.
                    </p>
                  </div>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: GOAL_CARD_FILL }}>
                  <VerifiedUserOutlined sx={{ fontSize: 24, color: CASE_STUDY_ACCENT }} className="flex-shrink-0" aria-hidden />
                  <div>
                    <p className="text-[15px] font-semibold mb-1.5" style={{ color: CASE_STUDY_ACCENT }}>
                      Include Trust Signals
                    </p>
                    <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                      Introduce testimonials, social proof, and clearer reassurance around the product&apos;s value – all key confidence-builders to drive sign ups.
                    </p>
                  </div>
                </div>
            </div>
          </Section>

          <div style={{ maxWidth: '690px' }}>
            <Callout
              accentColor={NORTH_STAR_CONTAINER_ACCENT}
              label="North Star"
              heading="Convert skeptical teachers into sign-ups by making a great first impression and building confidence in the product."
              iconSrc="/images/case-studies/NorthStar.svg"
            />
          </div>
        </div>
      </section>

      <Divider label="Approach" id="section-approach" />

      {/* ── APPROACH ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">
          <Section
            eyebrow="Research"
            heading="Looking at other edtech landing pages made it clear what ours was missing."
            body="Reviewing other edtech landing pages gave me a better sense of what strong pages in the space were doing well and how we could improve our own. It helped me think through how we should introduce the product, communicate its value, and build trust with our audience."
          >
            <VisualCard caption="Competitive audit of edtech landing pages — screenshots and sticky-note notes within FigJam">
              <div className="p-4 sm:p-8">
                <ExpandableImage
                  src={assets.approachResearchBoard}
                  alt="Research board comparing edtech landing pages with annotated sticky notes"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>
            </VisualCard>
          </Section>

          <Section
            eyebrow="Visual Identity"
            heading="We aligned on what Finding Focus should look and feel like."
            body={`To kick off the re-design of this page, my team and I sat down and began to work on defining Finding Focus's visual identity – which was lacking. It's hard to create a compelling landing page without a sense for what the visual identity should be and what the page should visually communicate.

We knew we wanted our visual identity to convey: cool, modern, mature, and science-based – but we still needed to settle on a design style. One of the ways we as a team were able to tackle this was by sharing our existing assets and going over possible design styles we could lean into.`}
          >
            <IdeationViewer
              items={[
                {
                  src: assets.viIntroSlackCanvas,
                  alt: 'Slack Canvas titled Finding Focus Visual Identity, reviewing existing gradients and UI',
                  label: 'Slack Canvas created to go over our current visual identity',
                  caption: '',
                },
                {
                  src: assets.viExistingAssets,
                  alt: 'Isometric glassy icons — brain, book, and timer — for Finding Focus student interface',
                  label: 'Some existing assets I had created for the student interface that fit what we wanted our visual identity to be',
                  caption: '',
                },
                {
                  src: assets.viGlassmorphismBroad,
                  alt: 'Slack Canvas sections explaining glassmorphic and Web3-style design references',
                  label: 'This Slack canvas had dedicated sections to explain different design styles and what they looked like',
                  caption: '',
                },
                {
                  src: assets.viGlassmorphismFf,
                  alt: 'Glassmorphism experimentation in Slack Canvas — translated assets and team feedback',
                  label: "We shared and explored various design styles but glassmorphism was the team's favorite",
                  caption: '',
                },
              ]}
            />
          </Section>

          <Section
            eyebrow="Messaging"
            heading="Clear messaging started with getting in the shoes of our teachers."
            body={`As I began working on the page, I kept coming back to a few simple questions: What is Finding Focus? Why should a teacher care? And why should they trust it?

One activity we did as a team to help answer these questions was to imagine ourselves as teachers and map out their story from the ground up — identifying their goals, their frustrations with student distraction, and what it would take for them to trust a solution like Finding Focus.`}
          >
            <VisualCard caption="Google Doc we used to map out the teacher's narrative">
              <div className="p-4 sm:p-8">
                <ExpandableImage
                  src={assets.messagingStorybrandDoc}
                  alt="Google Doc titled Storybrand: Teacher — StoryBrand framework mapping teacher goals, problems, and Finding Focus as guide, with collaborator comments"
                  scrollable
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>
            </VisualCard>
          </Section>
        </div>
      </section>

      <Divider label="Design" id="section-design" />

        {/* ── HEADER & HERO ── */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28" style={{ marginTop: -16 }}>
          <div className="flex flex-col gap-10">
            <Section
              eyebrow="Hero"
              heading="The hero needed to make the value of Finding Focus clear right away."
              body="I used the hero section as an opportunity to frame Finding Focus around outcomes teachers care about, highlight the product&apos;s credibility, and put a clear sign-up path front and center. That way, teachers could quickly understand the value of the platform without having to piece it together themselves."
            />
            <VisualCard caption="A hero designed around teacher outcomes, credibility cues, and a clear path to sign up">
              <div className="p-4 sm:p-8">
                <ExpandableImage
                  src={assets.headerAndHero}
                  alt="Redesigned landing page header and hero section"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>
            </VisualCard>
          </div>
        </section>

        {/* ── SOCIAL PROOF STRIP ── */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
          <div className="flex flex-col gap-10">
            <Section
              eyebrow="Credibility Strip"
              heading="I wanted trust signals to appear before teachers had to go looking for them."
              body="I placed credibility signals directly below the hero so teachers could quickly see Finding Focus&apos;s legitimacy. By mentioning the university backing, educator involvement, and US DOE funding - the page is able to build trust early instead of making users question the legitimacy or search for it later."
            />
            <VisualCard caption="Trust signals placed early: university backing, educator involvement, and US DOE funding">
              <div className="p-4 sm:p-8">
                <ExpandableImage
                  src={assets.socialProofStrip}
                  alt="Why Teachers Choose Finding Focus — social proof strip"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>
            </VisualCard>
          </div>
        </section>

      {/* ── PRODUCT OVERVIEW ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">
          <Section
              eyebrow="Product Overview"
              heading="Teachers needed to quickly understand what Finding Focus actually includes."
              body="One of the biggest problems with the original landing page was that it described Finding Focus without really going over the full product offering. I decided to show off the different offerings Finding Focus has by creating abstracted versions of the interface. These assets helped make the product easier to understand at a glance by showing the core parts of the platform in a way that felt clear, cohesive with the rest of the page, and easy to scan."
          />
          <IdeationViewer items={[
            {
              src: assets.tenDayCourse,
              alt: '10-Day Course section — stacked 3D card design',
              label: '10-day course',
              caption: '',
            },
            {
              src: assets.focusCoach,
              alt: 'Focus Coach section — layered UI on teal gradient',
              label: 'Focus coach',
              caption: '',
            },
            {
              src: assets.teacherInterface,
              alt: 'Teacher interface section — bar graph on purple gradient',
              label: 'Teacher interface',
              caption: '',
            },
          ]} />
        </div>
      </section>

      {/* ── RESEARCH SECTION ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Evidence Base"
            heading="Finding Focus’s research is a genuine differentiator. The page needed to show it off."
            body="Finding Focus is grounded in research, and we really wanted to highlight that. Creating a research section helped us surface our measured outcomes in a way that demonstrate our value and would be relevant to teachers."
          />
          <VisualCard>
            <div className="p-4 sm:p-8">
              <ExpandableImage
                src={assets.researchSection}
                alt="Backed by rigorous research section"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              />
            </div>
          </VisualCard>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Testimonials"
            heading="The page needed real voices to help confirm the value."
            body="Testimonials were one of the clearest missing pieces from the original landing page. Bringing in real perspectives from both teachers and students helped make Finding Focus feel more credible, more human, and more proven in practice — all important for getting teachers to sign up."
          />
          <VisualCard>
            <div className="p-4 sm:p-8">
              <ExpandableImage
                src={assets.testimonialSection}
                alt="Testimonial section with teacher video and quote cards"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              />
            </div>
          </VisualCard>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="FAQ"
            heading="FAQs are a staple on landing pages for a reason."
            body="Talking with my co-founder, we decided on a few ideas that were important to clarify and get across to our audience. The FAQ section helped us answer practical questions around who Finding Focus is for, why it matters, and how easy it is to get started — all of which helps reduce hesitation before signing up."
          />
          <VisualCard>
            <div className="p-4 sm:p-8">
              <ExpandableImage
                src={assets.faq}
                alt="FAQ section — Frequently Asked Questions"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              />
            </div>
          </VisualCard>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-12 md:pb-20">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Final CTA"
            heading="One final call to action to help drive conversion."
            body="After spending the page building clarity and trust, I wanted to use the final section to really push conversion. I treated it almost like a second hero section — giving teachers one clear action to take, while reinforcing that getting started with Finding Focus is free and easy."
          />
          <VisualCard>
            <div className="p-4 sm:p-8">
              <ExpandableImage
                src={assets.finalCta}
                alt="Final CTA and footer section"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              />
            </div>
          </VisualCard>
        </div>
      </section>

      {/* ── FULL DESIGN ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Full Design"
            heading="Here’s the full landing page, shown as one continuous experience."
            body="The complete landing page — all sections, from hero to footer."
          />
          <VisualCard
            subcaption="Click the image above to view the full landing page design"
          >
            <div className="p-6 sm:p-10">
              <div
                className="group"
                style={{ borderRadius: 12, overflow: 'hidden', height: 500, position: 'relative', cursor: 'zoom-in' }}
              >
                <ExpandableImage
                  src={assets.newFullPage}
                  alt="Redesigned Finding Focus landing page — full page screenshot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  scrollable
                />
                <div
                  className="pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    position: 'absolute', bottom: 12, left: 12,
                    background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                    padding: '5px 12px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.3"/>
                    <path d="M7.5 7.5l2.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  View full landing page design
                </div>
              </div>
            </div>
          </VisualCard>
        </div>
      </section>

      <Divider label="Animations" id="section-animations" />

      {/* ── ANIMATIONS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">
          <Section
            eyebrow="Context"
            heading="Motion helped bring the page to life and add a bit of playfulness."
            body="Animating different assets gave me another way to make the page feel more engaging and delightful. Rather than using motion everywhere, I focused on a few places where it could support the content, improve the experience, or create a strong brand moment."
          />

          <Section
            eyebrow="Product Highlights"
            heading="Animations took the product highlights to another level."
            body="The product overview section was already quite attractive, but animating the different assets really helped elevate the overall experience. Because I created each asset from scratch as an SVG, I was able to use Claude Code to animate them on scroll. The goal was to make the section feel like a standout moment."
          >
            <IdeationViewer items={[
              { src: assets.anim10DayCourse,     alt: '10-Day Course card animation', label: '10-day course card animation', caption: '' },
              { src: assets.animFocusCoach,       alt: 'Focus Coach animation',         label: 'Focus coach animation',         caption: '' },
              { src: assets.animTeacherInterface, alt: 'Teacher Interface animation',   label: 'Teacher interface animation',   caption: '' },
            ]} />
          </Section>

          <Section
            eyebrow="Testimonial Cards"
            heading="The testimonial cards needed a transition that felt both useful and delightful."
            body="We wanted to show three testimonial cards at once, then bring in three new ones with each click rather than swapping them out one at a time. I used animation to make that transition feel more intentional and engaging, while also helping the section stand out. I prototyped the interaction in Claude Code, then shared it with my SWE so it could be implemented in the final page."
          >
            <div className="rounded-[24px] border border-[#e8e8e8] bg-[#fafafa] p-8">
              <p className="text-[15px] font-semibold text-[#1a1a1a] mb-2">Filler container</p>
              <p className="text-[14px] font-normal leading-[170%] text-[#666]">
                Add the animated testimonial card carousel here.
              </p>
            </div>
          </Section>

          <Section
            eyebrow="Logo"
            heading="Using animation helped reinforce the brand in a more memorable way."
            body="For the final CTA, I reused a pulsing animation of the Finding Focus logo to create a stronger brand moment at the point of conversion. Because the animation was built as a Lottie, it felt polished and high quality while adding a bit more life to the end of the page."
          >
            <div className="rounded-[24px] border border-[#e8e8e8] bg-[#fafafa] p-8">
              <p className="text-[15px] font-semibold text-[#1a1a1a] mb-2">Filler container</p>
              <p className="text-[14px] font-normal leading-[170%] text-[#666]">
                Add the Lottie animation for the final CTA logo here.
              </p>
            </div>
          </Section>
        </div>
      </section>

      <Divider label="Reflection" id="section-reflection" />

      {/* ── REFLECTION ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">

          <Section eyebrow="Reflections" heading="" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">This project pushed me beyond product design in a really valuable way.</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">
                I’m a product designer by nature, but as the sole designer at a small startup, I’ve had to wear a lot of different hats. This project was a good example of that. Redesigning the landing page meant stepping into more traditional marketing and brand design work, while still relying on the same kind of strategic thinking I use in product design.
              </p>
            </div>
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">It also became an opportunity to shape the Finding Focus brand.</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">
                Because Finding Focus didn’t yet have many strong brand signals beyond the logo, this project gave me the chance to define more of the company’s visual identity. That made the work feel bigger than a landing page refresh. It became a chance to create a more cohesive, recognizable brand experience.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE SITE ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-20">
        <div
          className="rounded-[24px] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ background: 'white', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}
        >
          <div>
            <p className="text-[18px] font-semibold text-[#1a1a1a] mb-1">See the live landing page in action</p>
            <p className="text-[15px] font-normal leading-[170%] text-[#555]">
              The redesigned page is live at{' '}
              <a
                href="https://findingfocus.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006EFE] hover:underline font-medium"
              >
                findingfocus.app
              </a>
            </p>
          </div>
          <a
            href="https://findingfocus.app"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: '#1a1a1a', whiteSpace: 'nowrap' }}
          >
            Visit Live Design
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 10.5l8-8M5 2.5h5.5v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

    </div>
  );
}
