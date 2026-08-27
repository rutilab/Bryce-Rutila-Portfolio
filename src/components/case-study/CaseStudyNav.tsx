'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** The nav is the only index left in this build, so it carries the whole set. */
export const CASE_STUDIES = [
  {
    href: '/case-studies/focus-coach-achievements',
    title: 'Focus Coach End-of-Session Flow',
  },
  {
    href: '/case-studies/finding-focus-ai-assistant',
    title: 'Finding Focus AI Assistant',
  },
] as const;

/** Breadcrumb tick between the name and the case study — the separator, not a control. */
function Caret() {
  return (
    <svg width="7" height="9" viewBox="0 0 7 9" fill="none" aria-hidden className="cs-nav-caret">
      <path d="M1.4 1.2 5.6 4.5 1.4 7.8Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden className="cs-nav-chevron">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Case-study nav: who this is, and which study you're in.
 *
 * Mounted from the case-studies layout rather than the root one, so it exists
 * on exactly the routes it describes and nowhere else — there's no pathname
 * check to keep in sync.
 *
 * Two halves either side of a breadcrumb tick. The left half is the way home;
 * the right half opens the other studies, which is the only way to cross
 * between them now that the index page is gone. Nothing is filled black —
 * the pill is the only surface, and state is carried in text colour alone.
 */
export function CaseStudyNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  /** Pointer or keyboard is on it. */
  const [engaged, setEngaged] = useState(false);
  /** Clicked or tapped open — the only way in without hover. */
  const [pinned, setPinned] = useState(false);
  const open = engaged || pinned;
  const lastScrollY = useRef(0);
  const closeTimer = useRef<number | undefined>(undefined);

  /** Gets out of the way going down the page, comes back on the way up. */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 50) setVisible(true);
      else if (y > lastScrollY.current) setVisible(false);
      else setVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** A nav that has slid away shouldn't leave its menu hanging in mid-air. */
  useEffect(() => {
    if (!visible) {
      setEngaged(false);
      setPinned(false);
    }
  }, [visible]);

  /** Arriving somewhere new is an answer; the menu has done its job. */
  useEffect(() => {
    setEngaged(false);
    setPinned(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setEngaged(false);
      setPinned(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const current = CASE_STUDIES.find((c) => pathname.startsWith(c.href));
  const others = CASE_STUDIES.filter((c) => c.href !== current?.href);

  /** A grace period on leaving, so the diagonal to the menu doesn't close it. */
  const hold = () => {
    window.clearTimeout(closeTimer.current);
    setEngaged(true);
  };
  const release = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setEngaged(false), 180);
  };
  /** Keyboard focus leaving the group entirely — tabbing *into* the menu isn't leaving. */
  const releaseOnBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    release();
  };

  return (
    <nav className="cs-nav" data-visible={visible} aria-label="Case study">
      <div className="cs-nav-pill">
        <Link href="/" className="cs-nav-home">
          {/* Decorative: the link is already named by its text */}
          <img src="/butterflies/updated-br-fly-1.svg" alt="" aria-hidden className="cs-nav-fly" />
          <span>Bryce Rutila</span>
        </Link>

        <Caret />

        {current && (
          <div
            className="cs-nav-switch"
            onMouseEnter={hold}
            onMouseLeave={release}
            onFocus={hold}
            onBlur={releaseOnBlur}
          >
            <button
              type="button"
              className="cs-nav-current"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setPinned((v) => !v)}
            >
              <span className="cs-nav-title">{current.title}</span>
              <Chevron />
            </button>

            {others.length > 0 && (
              <div className="cs-nav-menu" data-open={open} role="menu">
                {others.map((c) => (
                  <Link key={c.href} href={c.href} className="cs-nav-menu-item" role="menuitem" tabIndex={open ? 0 : -1}>
                    {c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
