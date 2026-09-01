'use client';

import Link from 'next/link';
import HalftoneCanvas from '@/components/HalftoneCanvas';

export default function ComingSoon({
  label,
  backHref = '/',
  backLabel = 'Back to home',
}: {
  label: string;
  /** Where the way out goes. A folder that is still empty sends you back to the
   *  shelf you opened it from, not all the way home. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <>
    <HalftoneCanvas />
    {/* Fills the viewport and centres in it, but stays in flow rather than
        `position: fixed` — a fixed overlay pins itself over everything below,
        so a footer after it could never be scrolled to. */}
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        padding: '40px 20px',
        boxSizing: 'border-box',
        zIndex: 1,
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
          href={backHref}
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
          {backLabel}
        </Link>
      </div>
    </div>
    </>
  );
}
