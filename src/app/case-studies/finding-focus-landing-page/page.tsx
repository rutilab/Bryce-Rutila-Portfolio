'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
// Eyebrow:          11px medium tracking-wide #27b4ff

// ── Utility components ───────────────────────────────────────────────────────

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
          <h2 className="text-[22px] md:text-[30px] font-semibold leading-[125%] tracking-[-0.5px] text-[#1a1a1a] mt-4">
            {heading}
          </h2>
        </div>
        {body && (
          <p className="text-[15px] md:text-[18px] font-normal leading-[180%] text-[#555] max-w-[920px]">
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
      <div className="flex flex-col gap-3">
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

function VisualCard({ children, caption, subcaption }: { children: React.ReactNode; caption?: string; subcaption?: string }) {
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
  style?: React.CSSProperties;
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
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-[13px] text-[#999]">{item.label}</p>
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
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${dotProgress}%`, background: '#27b4ff' }} />
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
  { id: 'section-intro',      label: 'Intro' },
  { id: 'section-overview',   label: 'Overview' },
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
  const ideationSentinelRef = useRef<HTMLDivElement>(null);
  const ideationWrapperRef = useRef<HTMLDivElement>(null);
  const ideationMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function check() {
      const sentinel = ideationSentinelRef.current;
      const wrapper = ideationWrapperRef.current;
      const mask = ideationMaskRef.current;
      if (!sentinel || !wrapper || !mask) return;
      const stuck = sentinel.getBoundingClientRect().top < 48 && wrapper.getBoundingClientRect().bottom > 48;
      mask.style.display = stuck ? 'block' : 'none';
    }
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#444444] min-[600px]:pr-[100px]">

      {/* Fixed white bar — covers gap above sticky eyebrow when stuck */}
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
            <img
              src="/case-studies/node-ai/finding-focus-logo.svg"
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
            Led the end-to-end redesign of Finding Focus&apos;s marketing landing page — shifting from a student-centered,
            outdated design to a teacher-first, modern marketing experience. Every visual asset was created from scratch,
            with animations and full responsiveness as first-class design concerns.
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

      {/* ── CONTEXT ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <Section
          eyebrow="Context"
          heading="Our page was speaking to the wrong person."
          body="Finding Focus's original landing page had been largely untouched since the product's early days. While it served as a basic introduction, a critical misalignment had emerged: teachers are the decision-makers for adopting edtech tools in classrooms, but the page spoke almost entirely to students. The copy, imagery, and framing all said 'this is a student product' — not 'this is a tool that will make your classroom better.'"
        >
          <VisualCard
            caption="The original landing page — a student-first design that wasn't speaking to our primary audience"
            subcaption="Click the image above to view the full landing page design"
          >
            <div className="p-6 sm:p-10">
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 500, position: 'relative', cursor: 'zoom-in' }}>
                <ExpandableImage
                  src={assets.oldFullPage}
                  alt="Original Finding Focus landing page — full page screenshot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  scrollable
                />
                {/* Click affordance tag */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)',
                  color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                  padding: '5px 12px', borderRadius: 20,
                  display: 'flex', alignItems: 'center', gap: 6,
                  pointerEvents: 'none', whiteSpace: 'nowrap',
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.3"/>
                    <path d="M7.5 7.5l2.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  View full landing page design
                </div>
              </div>
            </div>
          </VisualCard>
        </Section>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-16">

          <Section
            eyebrow="The Problem"
            heading="Dated, student-centric, and missing key credibility signals."
            body="Beyond the audience mismatch, the page had accumulated several compounding problems that needed to be addressed together — not just patched one at a time."
          >
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-medium text-[#aaa] uppercase tracking-[1.5px] mb-1">
                Problems with the original page:
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  <p className="text-[15px] font-semibold text-[#e03030] mb-1">Student-Centered Messaging</p>
                  <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                    The copy on the page spoke directly to students — not to the teachers and administrators who would actually be making the decision to adopt the platform.
                  </p>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  <p className="text-[15px] font-semibold text-[#e03030] mb-1">Outdated Visual Design</p>
                  <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                    The aesthetic felt dated and failed to communicate the modern, warm brand that Finding Focus had evolved into since launch.
                  </p>
                </div>
                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: 'rgba(224,48,48,0.06)' }}>
                  <p className="text-[15px] font-semibold text-[#e03030] mb-1">Missing Credibility Signals</p>
                  <p className="text-[15px] font-normal leading-[175%] text-[#555]">
                    No prominent indicators of academic research backing, university partnerships, or Department of Education funding — signals that matter deeply to educators.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <div style={{ maxWidth: '690px' }}>
            <Callout
              accentColor="#ff8826"
              label="Our North Star"
              heading="Redesign the landing page into a teacher-first, modern marketing experience that builds immediate trust and clearly communicates value to educators."
            />
          </div>

        </div>
      </section>

      <Divider label="Design" id="section-design" />

      {/* Sticky eyebrow wrapper + sentinel */}
      <div ref={ideationWrapperRef} style={{ position: 'relative' }}>
        <div ref={ideationSentinelRef} style={{ height: 0 }} />

        <div style={{ position: 'sticky', top: 48, zIndex: 20, pointerEvents: 'none', background: 'white' }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20" style={{ paddingTop: 0, paddingBottom: 16 }}>
            <Eyebrow label="Section Walkthrough" />
          </div>
        </div>

        {/* ── HEADER & HERO ── */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28" style={{ marginTop: -16 }}>
          <div className="flex flex-col gap-10">
            <Section
              heading="Header & Hero"
              body="The hero is the most critical section — it's the first thing a teacher sees and must immediately answer: 'Is this for me?' The new design uses teacher-directed copy, a warm student photograph, and a node network background that ties back to our brand identity without feeling clinical."
            />
            <VisualCard caption="Teacher-first copy, real student photography, and a clean light-blue gradient">
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
              heading="Social Proof Strip"
              body="One of the key missing elements from the original page was credibility. Teachers and administrators need to know this isn't just another edtech startup — it's research-backed, institutionally validated, and co-designed with educators. This strip answers that immediately, sitting just below the hero."
            />
            <VisualCard caption="Three credibility anchors: academic origin, co-design with educators, and federal funding">
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
            heading="Showcasing the product through the teacher&apos;s lens."
            body="The product overview is where we show — not just tell — what teachers and students experience. We wanted each product snapshot to share the same visual identity — glassmorphism — while showing off abstracted visuals of our interface."
          />
          <IdeationViewer items={[
            {
              src: assets.tenDayCourse,
              alt: '10-Day Course section — stacked 3D card design',
              label: '10-Day Course',
              caption: '',
            },
            {
              src: assets.focusCoach,
              alt: 'Focus Coach section — layered UI on teal gradient',
              label: 'Focus Coach',
              caption: '',
            },
            {
              src: assets.teacherInterface,
              alt: 'Teacher interface section — bar graph on purple gradient',
              label: 'Teacher Interface',
              caption: '',
            },
          ]} />
        </div>
      </section>

      {/* ── RESEARCH SECTION ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-10">
          <Section
            heading="Research Section"
            body="This section was designed to show off our evidence base. Three tiles surface the most compelling outcomes from four peer-reviewed studies on Finding Focus: more time on task, better academic outcomes, and stronger mental health."
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
            heading="Testimonial Section"
            body="Social proof from real educators is one of the most persuasive signals an ed-tech landing page can offer. This section features a teacher video testimonial prominently at the top, with a quote card carousel below — voices from students and teachers across multiple schools."
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
            heading="FAQ Section"
            body="We wanted to surface the key questions educators consistently ask before adopting a new platform — addressing objections and building confidence before the final CTA."
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
            heading="Final CTA & Footer"
            body='The page closes with a strong call to action — anchored by the Finding Focus logo. The "FREE" badge addresses the most common teacher objection upfront: cost. A combined CTA and footer treatment keeps the page feeling complete without adding visual noise at the end.'
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
            heading="Full Design"
            body="The complete landing page — all sections, from hero to footer."
          />
          <VisualCard
            caption="The redesigned Finding Focus landing page"
            subcaption="Click the image above to view the full landing page design"
          >
            <div className="p-6 sm:p-10">
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 500, position: 'relative', cursor: 'zoom-in' }}>
                <ExpandableImage
                  src={assets.newFullPage}
                  alt="Redesigned Finding Focus landing page — full page screenshot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  scrollable
                />
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)',
                  color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                  padding: '5px 12px', borderRadius: 20,
                  display: 'flex', alignItems: 'center', gap: 6,
                  pointerEvents: 'none', whiteSpace: 'nowrap',
                }}>
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

      {/* ── ANIMATIONS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">
          <Section
            heading="Animations"
            body="We wanted to make the page feel delightful and alive but not overwhelming — so we were very intentional with where we added animations."
          />
          <IdeationViewer items={[
            { src: assets.anim10DayCourse,     alt: '10-Day Course card animation', label: '10-Day Course Card Animation', caption: '' },
            { src: assets.animFocusCoach,       alt: 'Focus Coach animation',         label: 'Focus Coach Animation',         caption: '' },
            { src: assets.animTeacherInterface, alt: 'Teacher Interface animation',   label: 'Teacher Interface Animation',   caption: '' },
          ]} />
        </div>
      </section>

      </div>{/* sticky eyebrow releases here */}

      {/* ── RESPONSIVENESS ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-12 md:pb-20">
        <div className="flex flex-col gap-10">
          <Section
            eyebrow="Responsiveness"
            heading="Built for every screen."
            body="Responsiveness was a first-class design concern — not an afterthought. Every section was designed with mobile in mind from the start."
          >
            <VisualCard>
              <div className="p-6 sm:p-10 flex justify-center">
                <ExpandableImage
                  src={assets.mobileMockup}
                  alt="Mobile mockup of the Finding Focus landing page"
                  style={{ width: 280, height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>
            </VisualCard>
          </Section>
        </div>
      </section>

      <Divider label="Reflection" id="section-reflection" />

      {/* ── REFLECTION ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 md:px-20 pb-14 md:pb-28">
        <div className="flex flex-col gap-12">

          <Section eyebrow="Key Takeaways" heading="" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">Iteration and feedback is key</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">
                This page went through dozens of iterations across every section. The discipline of systematic iteration — one section at a time, responding to feedback incrementally — was what got us to a design that felt cohesive and confident.
              </p>
            </div>
            <div className="bg-[rgba(220,232,248,0.45)] rounded-[24px] p-8">
              <h4 className="text-[18px] font-semibold text-[#1a1a1a] mb-3">Custom assets made it feel cohesive</h4>
              <p className="text-[16px] font-normal leading-[175%] text-[#555]">
                Designing custom assets required thinking systemically about how elements would coexist. That investment in consistency is what makes the final page feel intentional rather than assembled.
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
                className="text-[#27b4ff] hover:underline font-medium"
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
