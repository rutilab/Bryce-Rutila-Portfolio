'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatContainer } from '@/components/chat';

export default function Home() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerHeight, setDisclaimerHeight] = useState(68); // initial estimate
  const disclaimerRef = useRef<HTMLDivElement>(null);

  // Measure actual rendered height so ChatContainer always starts below the disclaimer
  useEffect(() => {
    if (!showDisclaimer || !disclaimerRef.current) return;
    const observer = new ResizeObserver(() => {
      setDisclaimerHeight(disclaimerRef.current?.offsetHeight ?? 68);
    });
    observer.observe(disclaimerRef.current);
    return () => observer.disconnect();
  }, [showDisclaimer]);

  return (
    <main className="min-h-screen">
      {/* Disclaimer — fixed below nav, always on top, dismissable */}
      {showDisclaimer && (
        <div
          ref={disclaimerRef}
          style={{
            position: 'fixed',
            top: 80,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 12px',
          }}
        >
          <div
            style={{
              maxWidth: '768px',
              width: '100%',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '1rem',
              border: '1px solid rgba(255,200,50,0.55)',
              padding: '10px 14px 10px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 13, lineHeight: '160%', color: 'rgba(255,230,150,0.85)', margin: 0, flex: 1 }}>
              <strong style={{ color: 'rgba(255,230,150,1)' }}>BAR 9000 is a work in progress.</strong>{' '}
              My knowledge base isn&apos;t finalized and the AI hasn&apos;t been fully trained to respond like me yet — so interactions won&apos;t reflect a finished experience.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,230,150,0.5)',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '2px 0 0 6px',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ChatContainer
        disclaimerVisible={showDisclaimer}
        disclaimerHeight={showDisclaimer ? disclaimerHeight : 0}
      />
    </main>
  );
}
