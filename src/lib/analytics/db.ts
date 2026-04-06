import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

export function getSql(): ReturnType<typeof neon> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!_sql) _sql = neon(url);
  return _sql;
}

/** Run once per process; safe to call on every track if needed. */
let schemaReady = false;

export async function ensureAnalyticsSchema(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (schemaReady) return true;
  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      path TEXT NOT NULL,
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
    ON analytics_events (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS analytics_events_path_idx
    ON analytics_events (path)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx
    ON analytics_events (visitor_id)
  `;
  schemaReady = true;
  return true;
}
