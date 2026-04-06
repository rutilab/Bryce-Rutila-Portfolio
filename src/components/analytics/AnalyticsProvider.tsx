'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

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

  const fullPath =
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

  useEffect(() => {
    if (skipAdmin) return;

    const prevPath = pathRef.current;
    const prevEnter = enterAtRef.current;

    if (prevPath) {
      const ms = Math.max(0, Math.round(performance.now() - prevEnter));
      if (ms >= 500) {
        void send('page_leave', prevPath, { duration_ms: ms });
      }
    }

    pathRef.current = fullPath;
    enterAtRef.current = performance.now();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    void send('pageview', fullPath, { referrer: (referrer ?? '').slice(0, 512) });
  }, [fullPath, skipAdmin]);

  useEffect(() => {
    if (skipAdmin) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest('a, button, [role="button"]') as HTMLElement | null;
      if (!el) return;
      const label = (el.textContent ?? '').trim().slice(0, 200);
      const tag = el.tagName.toLowerCase();
      const href =
        el.tagName === 'A' ? (el as HTMLAnchorElement).href?.slice(0, 512) ?? '' : '';
      void send('click', pathRef.current || fullPath, {
        element: tag,
        label: label || tag,
        href: href || undefined,
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [fullPath, skipAdmin]);

  return null;
}
