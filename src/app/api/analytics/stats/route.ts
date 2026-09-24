import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureAnalyticsSchema, getSql } from '@/lib/analytics/db';
import { verifyAdminSessionToken } from '@/lib/admin/auth';
import {
  isCustomRange,
  parseRangeKey,
  resolveCustomRange,
  resolvePresetRange,
  safeTimeZone,
  type ResolvedRange,
} from '@/lib/analytics/ranges';

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

  const params = request.nextUrl.searchParams;
  const tzResolved = safeTimeZone(params.get('tz'));
  const rangeParam = params.get('range');

  let resolved: ResolvedRange;
  if (isCustomRange(rangeParam)) {
    const custom = resolveCustomRange(params.get('from'), params.get('to'), tzResolved);
    if (!custom) {
      return NextResponse.json({ ok: false, error: 'invalid_range' }, { status: 400 });
    }
    resolved = custom;
  } else {
    resolved = resolvePresetRange(parseRangeKey(rangeParam), tzResolved);
  }
  const { since, until } = resolved;

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
        AND created_at < ${until}
        AND ${pathClean} NOT LIKE '/admin%'
    `;

    const visitorsIp = await sql`
      SELECT COUNT(DISTINCT NULLIF(meta->>'ip_hash', ''))::int AS c
      FROM analytics_events
      WHERE event_type = 'pageview'
        AND created_at >= ${since}
        AND created_at < ${until}
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
        AND created_at < ${until}
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
        AND created_at < ${until}
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
        AND created_at < ${until}
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
          AND created_at < ${until}
          AND meta ? 'duration_ms'
          AND (meta->>'duration_ms') ~ '^[0-9]+(\\.[0-9]+)?$'
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY path_clean
      ORDER BY samples DESC
      LIMIT 80
    `;

    /**
     * The same click rolled up two ways. Targets answer "what gets clicked on
     * this site" across every page; clicks answer "what gets clicked on this
     * page". Visitor counts matter as much as totals: forty clicks from two
     * people is a very different story from forty people.
     */
    const clickTargets = await sql`
      SELECT
        COALESCE(NULLIF(TRIM(meta->>'label'), ''), '') AS label,
        COALESCE(NULLIF(TRIM(meta->>'kind'), ''), '') AS kind,
        COALESCE(NULLIF(TRIM(meta->>'href'), ''), '') AS href,
        COALESCE(NULLIF(TRIM(meta->>'element'), ''), '') AS element,
        COUNT(*)::int AS c,
        COUNT(DISTINCT visitor_id)::int AS visitors,
        COUNT(DISTINCT path_clean)::int AS pages
      FROM (
        SELECT ${pathClean} AS path_clean, meta, visitor_id
        FROM analytics_events
        WHERE event_type = 'click' AND created_at >= ${since}
        AND created_at < ${until}
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY 1, 2, 3, 4
      ORDER BY c DESC
      LIMIT 120
    `;

    const clicks = await sql`
      SELECT
        path_clean AS path,
        COALESCE(NULLIF(TRIM(meta->>'label'), ''), '') AS label,
        COALESCE(NULLIF(TRIM(meta->>'element'), ''), '') AS element,
        COALESCE(NULLIF(TRIM(meta->>'kind'), ''), '') AS kind,
        COALESCE(NULLIF(TRIM(meta->>'href'), ''), '') AS href,
        COALESCE(NULLIF(TRIM(meta->>'section'), ''), '') AS section,
        COUNT(*)::int AS c,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM (
        SELECT ${pathClean} AS path_clean, meta, visitor_id
        FROM analytics_events
        WHERE event_type = 'click' AND created_at >= ${since}
        AND created_at < ${until}
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY 1, 2, 3, 4, 5, 6
      ORDER BY c DESC
      LIMIT 150
    `;

    const vc = visitorsCookie as { c: number }[];
    const vi = visitorsIp as { c: number }[];

    const ipHashConfigured = Boolean(
      process.env.ANALYTICS_IP_SALT?.trim() || process.env.ADMIN_SECRET?.trim(),
    );

    return NextResponse.json({
      ok: true,
      range: {
        key: resolved.key,
        label: resolved.label,
        since: since.toISOString(),
        until: until.toISOString(),
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
      clickTargets,
      clicks,
    });
  } catch (e) {
    console.error('[analytics/stats]', e);
    return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 });
  }
}
