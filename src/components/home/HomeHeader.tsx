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
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="home-header-ext">
            LinkedIn
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <Toast message="Email copied 📋" open={copied} onDismiss={() => setCopied(false)} />
    </header>
  );
}
