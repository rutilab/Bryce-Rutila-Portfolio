import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureAnalyticsSchema, getSql } from '@/lib/analytics/db';
import { verifyAdminSessionToken } from '@/lib/admin/auth';
import { parseRangeKey, rangeLabel, resolveSinceUtc, safeTimeZone } from '@/lib/analytics/ranges';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token || !(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ ok: false, error: 'analytics_disabled' }, { status: 503 });
  }

  try {
    await ensureAnalyticsSchema();
  } catch (e) {
    console.error('[analytics/stats] schema', e);
    return NextResponse.json({ ok: false, error: 'schema_failed' }, { status: 500 });
  }

  const rangeKey = parseRangeKey(request.nextUrl.searchParams.get('range'));
  const tzResolved = safeTimeZone(request.nextUrl.searchParams.get('tz'));
  const since = resolveSinceUtc(rangeKey, tzResolved);

  /** Matches client-side normalizePathname: strip query, collapse trailing slash, root = /. */
  const pathClean = sql`COALESCE(
    NULLIF(TRIM(REGEXP_REPLACE(SPLIT_PART(path, '?', 1), '/+$', '')), ''),
    '/'
  )`;

  try {
    const visitorsCookie = await sql`
      SELECT COUNT(DISTINCT visitor_id)::int AS c
      FROM analytics_events
      WHERE event_type = 'pageview'
        AND created_at >= ${since}
        AND ${pathClean} NOT LIKE '/admin%'
    `;

    const visitorsIp = await sql`
      SELECT COUNT(DISTINCT NULLIF(meta->>'ip_hash', ''))::int AS c
      FROM analytics_events
      WHERE event_type = 'pageview'
        AND created_at >= ${since}
        AND ${pathClean} NOT LIKE '/admin%'
        AND meta ? 'ip_hash'
    `;

    const countries = await sql`
      SELECT
        COALESCE(NULLIF(TRIM(meta->>'country'), ''), 'Unknown') AS country,
        COUNT(*)::int AS pageviews,
        COUNT(DISTINCT visitor_id)::int AS visitors_by_cookie
      FROM analytics_events
      WHERE event_type = 'pageview'
        AND created_at >= ${since}
        AND ${pathClean} NOT LIKE '/admin%'
      GROUP BY COALESCE(NULLIF(TRIM(meta->>'country'), ''), 'Unknown')
      ORDER BY pageviews DESC
      LIMIT 40
    `;

    const usStates = await sql`
      SELECT
        COALESCE(NULLIF(TRIM(meta->>'region'), ''), 'Unknown') AS region_code,
        COUNT(*)::int AS pageviews,
        COUNT(DISTINCT visitor_id)::int AS visitors_by_cookie
      FROM analytics_events
      WHERE event_type = 'pageview'
        AND created_at >= ${since}
        AND ${pathClean} NOT LIKE '/admin%'
        AND TRIM(COALESCE(meta->>'country', '')) = 'US'
      GROUP BY COALESCE(NULLIF(TRIM(meta->>'region'), ''), 'Unknown')
      ORDER BY pageviews DESC
      LIMIT 60
    `;

    const pageviews = await sql`
      SELECT path_clean AS path, COUNT(*)::int AS c
      FROM (
        SELECT ${pathClean} AS path_clean
        FROM analytics_events
        WHERE event_type = 'pageview' AND created_at >= ${since}
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY path_clean
      ORDER BY c DESC
      LIMIT 80
    `;

    const timeOnPage = await sql`
      SELECT
        path_clean AS path,
        AVG((meta->>'duration_ms')::double precision)::float AS avg_ms,
        COUNT(*)::int AS samples
      FROM (
        SELECT
          ${pathClean} AS path_clean,
          meta
        FROM analytics_events
        WHERE event_type = 'page_leave'
          AND created_at >= ${since}
          AND meta ? 'duration_ms'
          AND (meta->>'duration_ms') ~ '^[0-9]+(\\.[0-9]+)?$'
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY path_clean
      ORDER BY samples DESC
      LIMIT 80
    `;

    const clicks = await sql`
      SELECT
        path_clean AS path,
        COALESCE(meta->>'label', '') AS label,
        COALESCE(meta->>'element', '') AS element,
        COALESCE(meta->>'href', '') AS href,
        COUNT(*)::int AS c
      FROM (
        SELECT ${pathClean} AS path_clean, meta
        FROM analytics_events
        WHERE event_type = 'click' AND created_at >= ${since}
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY path_clean, meta->>'label', meta->>'element', meta->>'href'
      ORDER BY c DESC
      LIMIT 100
    `;

    const vc = visitorsCookie as { c: number }[];
    const vi = visitorsIp as { c: number }[];

    const ipHashConfigured = Boolean(
      process.env.ANALYTICS_IP_SALT?.trim() || process.env.ADMIN_SECRET?.trim(),
    );

    return NextResponse.json({
      ok: true,
      range: {
        key: rangeKey,
        label: rangeLabel(rangeKey),
        since: since.toISOString(),
        timeZone: tzResolved,
      },
      visitors: {
        byCookie: { count: vc[0]?.c ?? 0 },
        byIpHash: { count: vi[0]?.c ?? 0 },
        ipHashConfigured,
      },
      countries,
      usStates,
      pageviews,
      timeOnPage,
      clicks,
    });
  } catch (e) {
    console.error('[analytics/stats]', e);
    return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 });
  }
}
