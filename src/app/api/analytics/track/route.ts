import { NextResponse } from 'next/server';
import { ensureAnalyticsSchema, getSql } from '@/lib/analytics/db';
import { enrichMetaFromRequest } from '@/lib/analytics/geo';

export const runtime = 'nodejs';

type TrackBody = {
  visitorId: string;
  sessionId: string;
  eventType: 'pageview' | 'page_leave' | 'click';
  path: string;
  meta?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ ok: false, error: 'analytics_disabled' }, { status: 503 });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { visitorId, sessionId, eventType, path, meta: clientMeta } = body;
  if (
    typeof visitorId !== 'string' ||
    typeof sessionId !== 'string' ||
    typeof path !== 'string' ||
    !['pageview', 'page_leave', 'click'].includes(eventType)
  ) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  if (path.length > 2048 || visitorId.length > 128 || sessionId.length > 128) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 400 });
  }

  const base =
    clientMeta && typeof clientMeta === 'object' && !Array.isArray(clientMeta)
      ? { ...(clientMeta as Record<string, unknown>) }
      : {};
  delete base.ip_hash;
  delete base.country;
  delete base.region;

  const geo = enrichMetaFromRequest(request);
  const merged: Record<string, unknown> = { ...base };
  if (geo.ip_hash) merged.ip_hash = geo.ip_hash;
  if (geo.country) merged.country = geo.country;
  if (geo.region) merged.region = geo.region;

  const metaJson = JSON.stringify(merged);

  try {
    await ensureAnalyticsSchema();
    await sql`
      INSERT INTO analytics_events (visitor_id, session_id, event_type, path, meta)
      VALUES (
        ${visitorId},
        ${sessionId},
        ${eventType},
        ${path},
        ${metaJson}::jsonb
      )
    `;
  } catch (e) {
    console.error('[analytics/track]', e);
    return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
