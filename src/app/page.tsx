'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChatContainer } from '@/components/chat';
import { CursorContrail } from '@/components/CursorContrail';

// Option B: two-axis CSS scaling with min() caps.
//
// Horizontal (left/right) → vw, so positions track viewport width.
// Vertical   (top/bottom) → vh, so positions track viewport height.
// Width                   → min(Xvw, X_figma_px) — scales down on narrow
//                           viewports but never exceeds the Figma pixel value
//                           on wide ones, preventing the "too large" problem.
//
// All source values are frame-relative pixels from Figma (frame: 1440 × 1024).

const W = 1440; // Figma frame width
const H = 1024; // Figma frame height

// px() helpers — convert a Figma pixel to a vw/vh CSS string
const vw  = (px: number) => `${(px / W * 100).toFixed(4)}vw`;
const vh  = (px: number) => `${(px / H * 100).toFixed(4)}vh`;
// min-capped width: scales with vw but is capped at the raw Figma px value
const mw  = (px: number) => `min(${(px / W * 100).toFixed(4)}vw, ${px}px)`;

// reactClass  — which scatter animation to play on slam
// reactDelay  — offset from when phase==='done' so each butterfly reacts
//               slightly differently (slam impact lands at ~670ms)
const butterflies: {
  src:        string;
  style:      React.CSSProperties;
  reactClass: string;
  reactDelay: string;
}[] = [
  { src: '/butterflies/fly-1.svg', style: { left: vw(15),   top: vh(-21), width: mw(229.7) }, reactClass: 'butterfly-react-left',  reactDelay: '630ms' }, // magenta, top-left
  { src: '/butterflies/fly-2.svg', style: { left: vw(8),    top: vh(360), width: mw(235.8) }, reactClass: 'butterfly-react-left',  reactDelay: '660ms' }, // green,   left-mid
  { src: '/butterflies/fly-3.svg', style: { left: vw(-49),  top: vh(840), width: mw(166.8) }, reactClass: 'butterfly-react-left',  reactDelay: '645ms' }, // orange,  bottom-left
  { src: '/butterflies/fly-4.svg', style: { left: vw(1009), top: vh(-34), width: mw(223.8) }, reactClass: 'butterfly-react-right', reactDelay: '640ms' }, // green,   top-right
  { src: '/butterflies/fly-5.svg', style: { left: vw(1308), top: vh(491), width: mw(231.4) }, reactClass: 'butterfly-react-right', reactDelay: '675ms' }, // orange,  right-mid
  { src: '/butterflies/fly-6.svg', style: { left: vw(1092), top: vh(782), width: mw(209)   }, reactClass: 'butterfly-react-right', reactDelay: '615ms' }, // magenta, bottom-right
];

// ── Subtitle typewriter animation ──────────────────────────────────────────
// The prefix stays static. Each suffix is typed in, highlighted, then
// instantly deleted before the next one starts. The final phrase stays.

const PHRASES = [
  'puts users at the center of everything',
  'turns feedback into features',
  'dives deep into research',
  'brings ideas to life',                    // final — no highlight/delete
] as const;

// Highlight colours drawn from the butterfly palette, at reduced opacity
const HIGHLIGHT_COLORS = [
  'rgba(137, 255,  18, 0.38)',  // lime green — #89FF12
  'rgba(255, 156,  18, 0.38)',  // orange     — #FF9C12
  'rgba(255,  18, 251, 0.38)',  // magenta    — #FF12FB
];

type AnimPhase = 'typing' | 'highlighted' | 'pre-typing' | 'done';

// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  // Cycles green → orange → magenta → green … on each hover of "View my work"
  const VMW_HOVER_COLORS = ['#89FF12', '#FF9C12', '#FF12FB'] as const;
  const [vmwColorIndex, setVmwColorIndex] = useState(0);

  // Subtitle animation state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [phase,       setPhase]       = useState<AnimPhase>('typing');

  // Tracks whether the one-time slam has already fired
  const slamDoneRef = useRef(false);
  // Drives the slam CSS class — true only during the initial slam window
  const [showSlam, setShowSlam] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIndex];

    if (phase === 'typing') {
      if (charIndex < phrase.length) {
        // Add one character every 45 ms
        const t = setTimeout(() => setCharIndex(c => c + 1), 45);
        return () => clearTimeout(t);
      } else {
        // Fully typed — decide what happens next
        if (slamDoneRef.current) {
          // ── Manual cycling mode (after initial slam) ──
          // Every phrase settles here and waits for the next user click
          setPhase('done');
        } else if (phraseIndex === PHRASES.length - 1) {
          // ── Initial sequence: reached the last phrase ──
          // Trigger the one-time slam. The unlock timer lives in its own
          // effect (below) so React's cleanup cycle can't cancel it.
          setShowSlam(true);
          setPhase('done');
        } else {
          // ── Initial sequence: mid-run phrase ──
          // Auto-advance to the next phrase without waiting for a click
          const t = setTimeout(() => setPhase('highlighted'), 600);
          return () => clearTimeout(t);
        }
      }
    }

    if (phase === 'highlighted') {
      // Hold highlight for 700 ms then instantly delete and queue next phrase
      const t = setTimeout(() => {
        setCharIndex(0);
        // Wrap around so cycling loops back to phrase 0
        setPhraseIndex(i => (i + 1) % PHRASES.length);
        setPhase('pre-typing');
      }, 700);
      return () => clearTimeout(t);
    }

    if (phase === 'pre-typing') {
      // Brief blank pause (200 ms) before the next phrase starts typing
      const t = setTimeout(() => setPhase('typing'), 200);
      return () => clearTimeout(t);
    }
  }, [phase, charIndex, phraseIndex]);

  // ── Slam unlock timer — lives in its own effect so the typing effect's
  //    cleanup cycle can never cancel it. Fires once when showSlam → true,
  //    then after 1400 ms marks the slam as done and removes the slam class.
  useEffect(() => {
    if (!showSlam) return;
    const t = setTimeout(() => {
      slamDoneRef.current = true;
      setShowSlam(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [showSlam]);

  // Click handler for cycling phrases after the initial slam has completed
  const handleSubtitleClick = () => {
    // Only allow clicking once we're fully settled and slam is done
    if (phase !== 'done' || !slamDoneRef.current) return;
    setPhase('highlighted');
  };

  return (
    <>
      {/* ── Hero page ── white background with dot grid ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: '#ffffff',
          backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          overflow: 'hidden',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          opacity: chatOpen ? 0 : 1,
          visibility: chatOpen ? 'hidden' : 'visible',
        }}
      >
        {/* Butterflies — positioned via vw/vh; scatter on slam when phase==='done' */}
        {butterflies.map((b, i) => (
          <img
            key={i}
            src={b.src}
            alt=""
            aria-hidden="true"
            className={showSlam ? b.reactClass : undefined}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              ...b.style,
              ...(showSlam ? { animationDelay: b.reactDelay } : {}),
            }}
          />
        ))}

        {/* ── Hero content — vertically centered ── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // Fixed responsive width — never changes while typing, so buttons
            // never jitter. Wide enough for one line on desktop; wraps naturally
            // on tablet/mobile where 88vw is narrower than the text.
            width: 'min(88vw, 860px)',
          }}
        >
          {/* Title — Inter Bold 36px / 44px line-height, color #141510 */}
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: '44px',
              color: '#141510',
              margin: 0,
              letterSpacing: 0,
              width: '100%',
            }}
          >
            Howdy I&apos;m Bryce
          </h1>

          {/* Subtitle — animated typewriter, slams in on final phrase */}
          <p
            className={showSlam ? 'subtitle-slam' : undefined}
            onClick={handleSubtitleClick}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: '32px',
              color: '#141510',
              margin: 0,
              marginTop: '32px',
              // Shrink-wrap to actual text content so the click target never
              // extends beyond the visible words. maxWidth:'100%' still lets
              // the block wrap naturally on narrow viewports.
              maxWidth: '100%',
              wordBreak: 'normal',
              overflowWrap: 'normal',
              cursor: phase === 'done' && slamDoneRef.current ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            a product designer who{' '}

            {/* Animated suffix with alternating highlight */}
            <span
              style={{
                backgroundColor: phase === 'highlighted'
                  ? HIGHLIGHT_COLORS[phraseIndex % HIGHLIGHT_COLORS.length]
                  : 'transparent',
                borderRadius: '3px',
                padding: phase === 'highlighted' ? '0 2px' : '0',
                transition: 'background-color 0.08s ease',
              }}
            >
              {PHRASES[phraseIndex].slice(0, charIndex)}
            </span>

            {/* Blinking cursor — visible while typing, hidden when highlighted or done */}
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

          {/* CTAs — 48px below the text block, 16px gap between buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>

            {/* View my work — dark fill, 2px black stroke, 12px radius
                Hover: hard lime-green drop shadow offset 4px down (no blur) */}
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
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 4px 0 0 ${VMW_HOVER_COLORS[vmwColorIndex]}`;
                setVmwColorIndex(i => (i + 1) % VMW_HOVER_COLORS.length);
              }}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              View my work
            </Link>

            {/* Get to know me — white fill, 2px black stroke, 12px radius
                Hover: hard black drop shadow offset 4px down (no blur) */}
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
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 0 0 #000000')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              Get to know me
            </Link>

          </div>
        </div>

        {/* ── Cursor contrail — canvas overlay, landing page only ── */}
        <CursorContrail />

        {/* ── BAR 9000 chat bar — pinned near bottom, centered ── */}
        {/* <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat with BAR 9000"
          style={{
            position: 'absolute',
            bottom: '9.4%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(280px, 38.9vw, 560px)',
            height: '48px',
            background: '#0f0f0e',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'text',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.42)',
              fontSize: '15px',
              fontFamily: 'var(--font-sf-pro)',
              letterSpacing: '-0.15px',
              userSelect: 'none',
            }}
          >
            Chat with BAR 9000...
          </span>
        </button> */}
      </div>

      {/* ── Chat overlay — mounts when chat bar is clicked ── */}
      {/* {chatOpen && (
        <ChatContainer
          disclaimerVisible={false}
          disclaimerHeight={0}
        />
      )} */}
    </>
  );
}
