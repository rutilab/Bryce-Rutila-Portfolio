'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FlyIcon } from '@/components/icons/FlyIcon';
import { Toast } from '@/components/Toast';

const EMAIL = 'rutilab@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/brycerutila/';

const LINKS = [
  { href: '/#work', label: 'Work', current: true },
  { href: '/about', label: 'About' },
  { href: '/case-studies', label: 'Playground' },
];

/**
 * The home page's top bar: a full-bleed strip whose contents line up with the
 * 1024px frame below it. Wordmark and page links on the left; the two ways to
 * reach Bryce on the right, where a click copies the address rather than
 * opening a mail client nobody has set up.
 */
export function HomeHeader() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <div className="home-header-left">
          <Link href="/" className="home-wordmark" aria-label="Bryce Rutila, home">
            Bryce
            <FlyIcon active width={20} height={19} className="home-wordmark-fly" />
            Rutila
          </Link>
          <nav className="home-header-links" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="home-header-link"
                aria-current={l.current ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="home-header-right">
          <button type="button" className="home-header-email" onClick={copyEmail}>
            <span className="home-header-email-text">{EMAIL}</span>
            <svg className="home-header-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.75" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.75 3.25V3a.75.75 0 0 0-.75-.75H3A.75.75 0 0 0 2.25 3v7c0 .41.34.75.75.75h.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="home-header-ext">
            <span className="home-header-ext-text">LinkedIn</span>
            <svg className="home-header-icon home-header-icon--out" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4 10L10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
      <Toast message="Email copied 📋" open={copied} onDismiss={() => setCopied(false)} />
    </header>
  );
}
