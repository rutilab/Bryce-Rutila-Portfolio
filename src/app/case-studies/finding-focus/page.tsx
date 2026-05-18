'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChatContainer } from '@/components/chat';
import HalftoneCanvas from '@/components/HalftoneCanvas';

export default function FindingFocus() {
  const [chatOpen, setChatOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 680);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      <HalftoneCanvas />
      {/* ── Finding Focus page ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: 'transparent',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          opacity: chatOpen ? 0 : 1,
          visibility: chatOpen ? 'hidden' : 'visible',
        }}
      >

        {/* ── Scroll container — bottom padding accounts for chat bar ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            paddingTop: '120px',
            paddingBottom: '120px',
          }}
        >

          {/* ── Centered content column ── */}
          <div
            style={{
              maxWidth: '880px',
              margin: '0 auto',
              paddingLeft: 'max(20px, env(safe-area-inset-left, 20px))',
              paddingRight: 'max(20px, env(safe-area-inset-right, 20px))',
            }}
          >

            {/* ── Info card ── */}
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #d8d8d8',
                borderRadius: '16px',
                padding: '24px',
              }}
            >

              {/* Three-column row */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isNarrow ? 'column' : 'row',
                  gap: isNarrow ? '20px' : '32px',
                }}
              >

                {/* Column 1 — COMPANY */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#aaaaaa',
                      lineHeight: '16px',
                      letterSpacing: '0.08em',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Company
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#444444',
                      lineHeight: '20px',
                    }}
                  >
                    Finding Focus — An Edtech startup affiliated with UT Austin
                  </div>
                </div>

                {/* Column 2 — MY ROLE */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#aaaaaa',
                      lineHeight: '16px',
                      letterSpacing: '0.08em',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    My Role
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#444444',
                      lineHeight: '20px',
                    }}
                  >
                    Sole product designer
                  </div>
                </div>

                {/* Column 3 — Timeline */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#aaaaaa',
                      lineHeight: '16px',
                      letterSpacing: '0.08em',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Timeline
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#444444',
                      lineHeight: '20px',
                    }}
                  >
                    2022 – 2026
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#d8d8d8',
                  margin: '24px 0',
                }}
              />

              {/* Description */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '21px',
                  margin: 0,
                }}
              >
                All case studies here come from my work at Finding Focus. As the only designer for four years, I owned the full design process across the entire product.
              </p>

            </div>

            {/* ── Case study cards ── */}
            <div
              style={{
                marginTop: '40px',
                display: 'flex',
                flexDirection: isNarrow ? 'column' : 'row',
                gap: '32px',
              }}
            >

              {/* Card 1 — Finding Focus AI Assistant */}
              <Link
                href="/case-studies/finding-focus-ai-assistant"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    border: '2px solid #d8d8d8',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.borderColor = '#bbbbbb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#d8d8d8';
                  }}
                >
                  {/* Thumbnail — iMac + iPhone stacked mockup */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: '16px',
                      boxSizing: 'border-box',
                      background: 'rgba(220, 232, 248, 0.45)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Inner relative area respects the padding */}
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      {/* iMac — left, slightly down so base clips at bottom */}
                      <img
                        src="/case-studies/finding-focus-ai-assistant/imac-mockup.png"
                        alt=""
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(calc(-50% + 10px))',
                          width: '66%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                      {/* iPhone — overlapping right side of iMac */}
                      <img
                        src="/case-studies/finding-focus-ai-assistant/iphone-mockup.png"
                        alt=""
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(calc(-50% + 18px))',
                          width: '28%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </div>
                  </div>
                  {/* Text */}
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#aaaaaa',
                        letterSpacing: '0.08em',
                        marginBottom: '8px',
                      }}
                    >
                      CASE STUDY
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#141510',
                        lineHeight: '26px',
                        marginBottom: '6px',
                      }}
                    >
                      Finding Focus AI Assistant
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '19px',
                      }}
                    >
                      An LLM-powered support agent that provides on-demand support for educators.
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 2 — Finding Focus Landing Page */}
              <Link
                href="/case-studies/finding-focus-landing-page"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    border: '2px solid #d8d8d8',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.borderColor = '#bbbbbb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#d8d8d8';
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      background: 'rgba(220, 232, 248, 0.45)',
                      padding: '16px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src="/case-studies/landing-page/header-and-hero.png"
                      alt="Finding Focus Landing Page preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                  {/* Text */}
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#aaaaaa',
                        letterSpacing: '0.08em',
                        marginBottom: '8px',
                      }}
                    >
                      CASE STUDY
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#141510',
                        lineHeight: '26px',
                        marginBottom: '6px',
                      }}
                    >
                      Finding Focus Landing Page Redesign
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '19px',
                      }}
                    >
                      End-to-end redesign of a marketing landing page — shifting from student-centered to teacher-first.
                    </div>
                  </div>
                </div>
              </Link>

            </div>

          </div>
        </div>

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
            Ask BAR 9000 about my work...
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
