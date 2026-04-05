'use client';

import Link from 'next/link';

export default function ComingSoon({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#ffffff',
        backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
        backgroundSize: '8px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        padding: '40px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          maxWidth: '480px',
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#aaaaaa',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#141510',
            lineHeight: '1.2',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          Coming Soon
        </h1>

        {/* Body */}
        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          This page is in the works. Check back soon.
        </p>

        {/* Divider */}
        <div
          style={{
            width: '40px',
            height: '1px',
            background: '#d8d8d8',
            margin: '4px 0',
          }}
        />

        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#444444',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#000000')}
          onMouseLeave={e => (e.currentTarget.style.color = '#444444')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M3 7L6.5 3.5M3 7L6.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}
