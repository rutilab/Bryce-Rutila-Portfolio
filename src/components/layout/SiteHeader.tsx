'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlyIcon } from '@/components/icons/FlyIcon';
import { Toast } from '@/components/Toast';

const EMAIL = 'rutilab@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/brycerutila/';

/** Each link, and the pages it counts as current on */
const LINKS = [
  { href: '/#work', label: 'Work', current: (p: string) => p === '/' || p.startsWith('/case-studies') },
  { href: '/about', label: 'About', current: (p: string) => p.startsWith('/about') },
  { href: '/playground', label: 'Playground', current: (p: string) => p.startsWith('/playground') },
];

/**
 * The site's top bar: a full-bleed strip whose contents line up with the
 * 1024px frame below it. Wordmark and page links on the left; the two ways to
 * reach Bryce on the right, where a click copies the address rather than
 * opening a mail client nobody has set up.
 *
 * On most pages it sticks to the top. Case studies are long reads, so there
 * it floats instead: it ducks away as you scroll down into the story and
 * comes back the moment you scroll up.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const floats = pathname.startsWith('/case-studies');
  // Tucked away belongs to the page it happened on: a new page starts shown
  const [tuckedOn, setTuckedOn] = useState<string | null>(null);
  const tucked = tuckedOn === pathname;
  const lastY = useRef(0);

  useEffect(() => {
    if (!floats) return;
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      // A few pixels either way is a wobble, not a change of direction
      if (Math.abs(dy) < 4) return;
      setTuckedOn(dy > 0 && y > 80 ? pathname : null);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [floats, pathname]);

  if (pathname.startsWith('/admin')) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <header className={`home-header${floats ? ' home-header--float' : ''}${tucked ? ' is-tucked' : ''}`}>
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
                aria-current={l.current(pathname) ? 'page' : undefined}
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
