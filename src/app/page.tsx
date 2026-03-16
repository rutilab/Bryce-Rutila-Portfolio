'use client';

import { ChatContainer } from '@/components/chat';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col px-4 pt-20 pb-8">

      {/* Disclaimer — pinned at top, above the chat */}
      <div className="w-full max-w-3xl mx-auto mb-3 shrink-0">
        <div
          style={{
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,200,100,0.25)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>⚠️</span>
          <p style={{ fontSize: 13, lineHeight: '160%', color: 'rgba(255,230,150,0.85)', margin: 0 }}>
            <strong style={{ color: 'rgba(255,230,150,1)' }}>BAR 9000 is a work in progress.</strong>{' '}
            My knowledge base isn&apos;t finalized and the AI hasn&apos;t been fully trained to respond like me yet — so interactions won&apos;t reflect a finished experience. Check back soon to see the completed version.
          </p>
        </div>
      </div>

      {/* Chat — takes remaining height, centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <ChatContainer />
        </div>
      </div>

    </main>
  );
}
