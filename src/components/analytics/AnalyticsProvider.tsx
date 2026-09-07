'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { normalizePathname } from '@/lib/analytics/labels';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('analytics_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('analytics_sid', sid);
  }
  return sid;
}

function getVisitorId(): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|; )v_id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

async function send(
  eventType: 'pageview' | 'page_leave' | 'click',
  path: string,
  meta?: Record<string, unknown>,
) {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  if (!visitorId || !sessionId) return;

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId,
        eventType,
        path,
        meta,
      }),
      keepalive: eventType === 'page_leave',
    });
  } catch {
    /* ignore */
  }
}

/** Files worth counting as a download rather than a page visit. */
const DOWNLOAD_EXT = /\.(pdf|zip|docx?|pptx?|xlsx?|csv|png|jpe?g|svg|mp4|mov)$/i;

type ClickKind =
  | 'internal'
  | 'outbound'
  | 'download'
  | 'email'
  | 'phone'
  | 'button';

function squash(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * The element's own words, minus the machinery. A card that carries an inline
 * <style> block would otherwise report a wall of CSS as its name.
 */
function ownText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('style, script, noscript, template').forEach(n => n.remove());
  return squash(clone.textContent);
}

/**
 * A name a human would recognise in the dashboard.
 *
 * Order matters more than it looks. A whole case-study card is one big link,
 * and all of its text runs together into something unreadable, so its heading
 * is a truer name than its contents. Icon-only buttons have no text at all,
 * so fall back through what exists for screen readers before giving up and
 * naming the file or the tag.
 */
function labelFor(el: HTMLElement): string {
  const explicit = squash(el.getAttribute('data-analytics-label'));
  if (explicit) return explicit.slice(0, 200);

  const aria = squash(el.getAttribute('aria-label') || el.getAttribute('title'));
  if (aria) return aria.slice(0, 200);

  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ref = squash(document.getElementById(labelledBy)?.textContent);
    if (ref) return ref.slice(0, 200);
  }

  const heading = squash(el.querySelector('h1, h2, h3, h4, h5, h6')?.textContent);
  if (heading) return heading.slice(0, 200);

  const text = ownText(el);
  if (text) return text.slice(0, 200);

  const img = el.querySelector('img');
  const alt = squash(img?.getAttribute('alt'));
  if (alt) return alt.slice(0, 200);

  const svgTitle = squash(el.querySelector('svg > title')?.textContent);
  if (svgTitle) return svgTitle.slice(0, 200);

  const href = el.getAttribute('href');
  if (href) {
    const tail = href.split('/').pop()?.split('?')[0];
    if (tail) return tail.slice(0, 200);
  }

  return el.tagName.toLowerCase();
}

/** What kind of thing was clicked, so outbound links stand apart from nav. */
function kindFor(el: HTMLElement, rawHref: string): ClickKind {
  if (el.tagName !== 'A' || !rawHref) return 'button';
  if (rawHref.startsWith('mailto:')) return 'email';
  if (rawHref.startsWith('tel:')) return 'phone';
  if (el.hasAttribute('download')) return 'download';
  try {
    const u = new URL(rawHref, window.location.origin);
    if (DOWNLOAD_EXT.test(u.pathname)) return 'download';
    return u.origin === window.location.origin ? 'internal' : 'outbound';
  } catch {
    return 'button';
  }
}

/** Which part of the page it sat in, when the page bothers to say. */
function sectionFor(el: HTMLElement): string {
  const marked = el.closest('[data-analytics-section]') as HTMLElement | null;
  const name = squash(marked?.getAttribute('data-analytics-section'));
  if (name) return name.slice(0, 80);
  const sec = el.closest('section[id], [role="navigation"], nav, header, footer');
  if (!sec) return '';
  const id = squash(sec.getAttribute('id'));
  if (id) return id.slice(0, 80);
  return sec.tagName.toLowerCase();
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathRef = useRef<string>('');
  const enterAtRef = useRef<number>(0);
  const skipAdmin = pathname.startsWith('/admin');

  const raw =
    pathname ||
    (typeof window !== 'undefined' ? window.location.pathname : '') ||
    '/';
  const canonicalPath = normalizePathname(raw);
  const queryStr = searchParams?.toString() ?? '';

  useEffect(() => {
    const prevPath = pathRef.current;
    const prevEnter = enterAtRef.current;

    const emitLeave = (from: string) => {
      const ms = Math.max(0, Math.round(performance.now() - prevEnter));
      if (ms >= 500) {
        void send('page_leave', from, { duration_ms: ms });
      }
    };

    if (skipAdmin) {
      if (prevPath && !prevPath.startsWith('/admin')) {
        emitLeave(prevPath);
      }
      pathRef.current = canonicalPath;
      enterAtRef.current = performance.now();
      return;
    }

    if (prevPath && !prevPath.startsWith('/admin')) {
      emitLeave(prevPath);
    }

    pathRef.current = canonicalPath;
    enterAtRef.current = performance.now();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    void send('pageview', canonicalPath, {
      referrer: (referrer ?? '').slice(0, 512),
      ...(queryStr ? { query: queryStr.slice(0, 512) } : {}),
    });
  }, [canonicalPath, queryStr, skipAdmin]);

  useEffect(() => {
    if (skipAdmin) return;

    const onPageHide = (ev: PageTransitionEvent) => {
      if (ev.persisted) return;
      const p = pathRef.current;
      const ms = Math.max(0, Math.round(performance.now() - enterAtRef.current));
      if (!p || p.startsWith('/admin') || ms < 500) return;
      void send('page_leave', p, { duration_ms: ms });
    };

    window.addEventListener('pagehide', onPageHide as EventListener);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [skipAdmin]);

  useEffect(() => {
    if (skipAdmin) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest(
        'a, button, [role="button"], [role="link"], [data-analytics-label]',
      ) as HTMLElement | null;
      if (!el) return;

      const tag = el.tagName.toLowerCase();
      const rawHref = el.tagName === 'A' ? (el as HTMLAnchorElement).href ?? '' : '';
      const kind = kindFor(el, rawHref);

      // Internal links are stored as bare paths so they line up with the
      // pageview table; everything else keeps the address it actually points at.
      let href = rawHref.slice(0, 512);
      if (href) {
        try {
          const u = new URL(href, window.location.origin);
          if (u.origin === window.location.origin) {
            href = normalizePathname(u.pathname) + (u.search ? u.search.slice(0, 256) : '');
          }
        } catch {
          /* keep href */
        }
      }

      const section = sectionFor(el);
      void send('click', pathRef.current || canonicalPath, {
        element: tag,
        label: labelFor(el),
        kind,
        href: href || undefined,
        ...(section ? { section } : {}),
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [canonicalPath, skipAdmin]);

  return null;
}
