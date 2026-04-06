import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureAnalyticsSchema, getSql } from '@/lib/analytics/db';
import { verifyAdminSessionToken } from '@/lib/admin/auth';

export const runtime = 'nodejs';

export async function GET() {
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

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  /** Matches client-side normalizePathname: strip query, collapse trailing slash, root = /. */
  const pathClean = sql`COALESCE(
    NULLIF(TRIM(REGEXP_REPLACE(SPLIT_PART(path, '?', 1), '/+$', '')), ''),
    '/'
  )`;

  try {
    const visitors30 = await sql`
      SELECT COUNT(DISTINCT visitor_id)::int AS c
      FROM analytics_events
      WHERE created_at >= ${since30}
        AND ${pathClean} NOT LIKE '/admin%'
    `;
    const visitors7 = await sql`
      SELECT COUNT(DISTINCT visitor_id)::int AS c
      FROM analytics_events
      WHERE created_at >= ${since7}
        AND ${pathClean} NOT LIKE '/admin%'
    `;

    const pageviews = await sql`
      SELECT path_clean AS path, COUNT(*)::int AS c
      FROM (
        SELECT ${pathClean} AS path_clean
        FROM analytics_events
        WHERE event_type = 'pageview' AND created_at >= ${since30}
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
          AND created_at >= ${since30}
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
        WHERE event_type = 'click' AND created_at >= ${since30}
      ) sub
      WHERE path_clean NOT LIKE '/admin%'
      GROUP BY path_clean, meta->>'label', meta->>'element', meta->>'href'
      ORDER BY c DESC
      LIMIT 100
    `;

    const v30 = visitors30 as { c: number }[];
    const v7 = visitors7 as { c: number }[];

    return NextResponse.json({
      ok: true,
      range: { since30, since7 },
      visitors: {
        last30Days: v30[0]?.c ?? 0,
        last7Days: v7[0]?.c ?? 0,
      },
      pageviews,
      timeOnPage,
      clicks,
    });
  } catch (e) {
    console.error('[analytics/stats]', e);
    return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 });
  }
}
