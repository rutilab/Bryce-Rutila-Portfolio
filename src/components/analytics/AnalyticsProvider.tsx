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
      const el = t.closest('a, button, [role="button"]') as HTMLElement | null;
      if (!el) return;
      const label = (el.textContent ?? '').trim().slice(0, 200);
      const tag = el.tagName.toLowerCase();
      let href =
        el.tagName === 'A' ? (el as HTMLAnchorElement).href?.slice(0, 512) ?? '' : '';
      if (href && typeof window !== 'undefined') {
        try {
          const u = new URL(href, window.location.origin);
          if (u.origin === window.location.origin) {
            href = normalizePathname(u.pathname) + (u.search ? u.search.slice(0, 256) : '');
          }
        } catch {
          /* keep href */
        }
      }
      void send('click', pathRef.current || canonicalPath, {
        element: tag,
        label: label || tag,
        href: href || undefined,
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [canonicalPath, skipAdmin]);

  return null;
}
