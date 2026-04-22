'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';
import HalftoneCanvas from '@/components/HalftoneCanvas';

// ── Typewriter animation ───────────────────────────────────────────────────
const PHRASES = [
  'turns feedback into features',
  'genuinely cares about users',
  'dives deep into research',
  'brings ideas to life',           // final — no auto-advance
] as const;

const HIGHLIGHT_COLORS = [
  'rgba(137, 255,  18, 0.38)',  // lime green
  'rgba(255, 156,  18, 0.38)',  // orange
  'rgba(255,  18, 251, 0.38)',  // magenta
];

type AnimPhase = 'typing' | 'highlighted' | 'pre-typing' | 'done';

const HERO_SUBTITLE_PREFIX = 'a product designer who ';

const HERO_SUBTITLE_TEXT_STYLE: CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '24px',
  fontWeight: 400,
  lineHeight: '32px',
  color: '#141510',
  margin: 0,
  maxWidth: '100%',
  wordBreak: 'normal',
  overflowWrap: 'normal',
  userSelect: 'none',
  WebkitTextStroke: '2px #ffffff',
  paintOrder: 'stroke fill',
};

// ── Spacing constants ──────────────────────────────────────────────────────
// Equal top/bottom padding centres content in the viewport below the nav
const HOME_HERO_TOP_PAD    = 'calc(24px + 48px + 24px + env(safe-area-inset-top, 0px))';
const HOME_HERO_BOTTOM_PAD = 'calc(24px + 48px + 24px + env(safe-area-inset-bottom, 0px))';

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  // ── "View my work" hover colour cycling ───────────────────────────────
  const VMW_HOVER_COLORS = ['#89FF12', '#FF9C12', '#FF12FB'] as const;
  const [vmwColorIndex,   setVmwColorIndex]   = useState(0);
  const [rippleTrigger,   setRippleTrigger]   = useState(0);
  const canPrimaryHover = useCanPrimaryHover();

  // ── Typewriter state ───────────────────────────────────────────────────
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [phase,       setPhase]       = useState<AnimPhase>('typing');
  const slamDoneRef  = useRef(false);
  const [showSlam,   setShowSlam]     = useState(false);

  // ── Body styles — white bg, hide system cursor on this page ──────────
  useEffect(() => {
    document.body.style.background = '#ffffff';
    document.body.style.color      = '#141510';
    document.body.style.cursor     = 'none';
    return () => {
      document.body.style.background = '';
      document.body.style.color      = '';
      document.body.style.cursor     = '';
    };
  }, []);

  // ── Subtitle min-height (prevents CTA jump as phrases change) ─────────
  const heroContentRef          = useRef<HTMLDivElement>(null);
  const heroSubtitleRef         = useRef<HTMLParagraphElement>(null);
  const heroSubtitleMeasureRef  = useRef<HTMLDivElement>(null);
  const [subtitleBlockMinPx, setSubtitleBlockMinPx] = useState<number | null>(null);

  // ── Subtitle height measurement ────────────────────────────────────────
  useLayoutEffect(() => {
    const container = heroContentRef.current;
    const measure   = heroSubtitleMeasureRef.current;
    if (!container || !measure) return;

    const run = () => {
      if (container.clientWidth < 16) return;
      let maxH = 0;
      for (const phrase of PHRASES) {
        measure.textContent = HERO_SUBTITLE_PREFIX + phrase;
        maxH = Math.max(maxH, measure.offsetHeight);
      }
      setSubtitleBlockMinPx(maxH);
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Typewriter effect ──────────────────────────────────────────────────
  useEffect(() => {
    const phrase = PHRASES[phraseIndex];

    if (phase === 'typing') {
      if (charIndex < phrase.length) {
        const t = setTimeout(() => setCharIndex(c => c + 1), 45);
        return () => clearTimeout(t);
      } else {
        if (slamDoneRef.current) {
          setPhase('done');
        } else if (phraseIndex === PHRASES.length - 1) {
          setShowSlam(true);
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

  // Slam unlock — separate effect so typing cleanup can't cancel it
  useEffect(() => {
    if (!showSlam) return;
    setRippleTrigger(n => n + 1);   // fire canvas ripple wave
    const t = setTimeout(() => {
      slamDoneRef.current = true;
      setShowSlam(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [showSlam]);

  // ── Click subtitle to cycle phrases after initial slam ────────────────
  const handleSubtitleClick = () => {
    if (phase !== 'done' || !slamDoneRef.current) return;
    setPhase('highlighted');
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <HalftoneCanvas rippleTrigger={rippleTrigger} />

      {/* Hero copy — centred over canvas */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          paddingTop: HOME_HERO_TOP_PAD,
          paddingBottom: HOME_HERO_BOTTOM_PAD,
          boxSizing: 'border-box',
        }}
      >
        {/* Headline */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            pointerEvents: 'none',
            width: 'min(860px, max(88vw, min(300px, calc(100vw - 40px))))',
          }}
        >
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: '44px',
              color: '#141510',
              margin: 0,
              letterSpacing: 0,
              maxWidth: '100%',
              width: 'fit-content',
              marginLeft: 'auto',
              marginRight: 'auto',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                WebkitTextStroke: '4px #ffffff',
                paintOrder: 'stroke fill',
                pointerEvents: 'none',
              }}
            >
              Howdy, I&apos;m Bryce
            </span>
          </h1>
        </div>

        {/* Subtitle + CTAs */}
        <div
          ref={heroContentRef}
          style={{
            position: 'relative',
            zIndex: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            flexShrink: 0,
            marginTop: '32px',
            width: 'min(860px, max(88vw, min(300px, calc(100vw - 40px))))',
          }}
        >
          {/* Subtitle — min-height locks CTA position across phrase lengths */}
          <div
            style={{
              marginTop: 0,
              width: '100%',
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              minHeight: subtitleBlockMinPx ?? undefined,
              pointerEvents: 'none',
            }}
          >
            {/* Hidden measurement div */}
            <div
              ref={heroSubtitleMeasureRef}
              aria-hidden
              style={{
                ...HERO_SUBTITLE_TEXT_STYLE,
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                left: 0,
                top: 0,
                width: '100%',
                boxSizing: 'border-box',
                display: 'block',
              }}
            />

            {/* Animated subtitle */}
            <p
              ref={heroSubtitleRef}
              className={showSlam ? 'subtitle-slam' : undefined}
              onClick={handleSubtitleClick}
              style={{
                ...HERO_SUBTITLE_TEXT_STYLE,
                marginTop: 0,
                display: 'inline-block',
                width: 'fit-content',
                cursor: phase === 'done' && slamDoneRef.current ? 'pointer' : 'default',
                pointerEvents: 'auto',
              }}
            >
              a product designer who{' '}

              {/* Animated suffix */}
              <span
                style={{
                  backgroundColor:
                    phase === 'highlighted'
                      ? HIGHLIGHT_COLORS[phraseIndex % HIGHLIGHT_COLORS.length]
                      : 'transparent',
                  borderRadius: '3px',
                  padding: phase === 'highlighted' ? '0 2px' : '0',
                  transition: 'background-color 0.08s ease',
                  ...(phase === 'highlighted'
                    ? { WebkitTextStroke: '0 transparent', paintOrder: 'fill' as const }
                    : {}),
                }}
              >
                {PHRASES[phraseIndex].slice(0, charIndex)}
              </span>

              {/* Blinking cursor */}
              {(phase === 'typing' || phase === 'pre-typing') && (
                <span
                  aria-hidden="true"
                  className="cursor-blink"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.1em',
                    background: '#141510',
                    borderRadius: '1px',
                    marginLeft: '1px',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </p>
          </div>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '48px',
              pointerEvents: 'none',
            }}
          >
            {/* View my work */}
            <Link
              href="/case-studies"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '16px',
                color: '#ffffff',
                background: '#141510',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: 'none',
                transition: 'box-shadow 0.15s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
              {...(canPrimaryHover
                ? {
                    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = `0 4px 0 0 ${VMW_HOVER_COLORS[vmwColorIndex]}`;
                      setVmwColorIndex(i => (i + 1) % VMW_HOVER_COLORS.length);
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = 'none';
                    },
                  }
                : {})}
            >
              View my work
            </Link>

            {/* Get to know me */}
            <Link
              href="/about"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '16px',
                color: '#141510',
                background: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: 'none',
                transition: 'box-shadow 0.15s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
              {...(canPrimaryHover
                ? {
                    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = '0 4px 0 0 #000000';
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.boxShadow = 'none';
                    },
                  }
                : {})}
            >
              Get to know me
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
