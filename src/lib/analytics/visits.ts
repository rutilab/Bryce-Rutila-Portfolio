/**
 * Turning a stream of analytics rows into individual visits.
 *
 * Lives apart from the route so it can be exercised on its own: the grouping
 * is the part with edges (out-of-order rows, sessions that straddle the row
 * limit, events that carry no location).
 */
export type RecentEventRow = {
  visitor_id: string;
  session_id: string;
  event_type: string;
  created_at: string | Date;
  path: string;
  label: string;
  kind: string;
  href: string;
  country: string;
  region: string;
  duration_ms: number | null;
};

export type VisitStep = {
  at: string;
  type: string;
  path: string;
  label: string;
  kind: string;
  href: string;
  durationMs: number | null;
};

export type Visit = {
  sessionId: string;
  /** Enough of the cookie to tell two visitors apart, and no more. */
  visitorKey: string;
  country: string;
  region: string;
  startedAt: string;
  endedAt: string;
  pageviews: number;
  clicks: number;
  /** This browser also showed up in an earlier visit inside the range. */
  returning: boolean;
  steps: VisitStep[];
};

function iso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * One row per event becomes one entry per visit.
 *
 * A session id is a single sitting: the same browser coming back tomorrow
 * starts a new one, which is the honest unit for "someone read this". Where
 * a visit happened is taken from whichever of its events actually carried a
 * location, since only pageviews reliably do.
 */
export function groupIntoVisits(
  rows: RecentEventRow[],
  truncated: boolean,
): { sessions: Visit[]; sessionsTruncated: boolean } {
  const bySession = new Map<string, Visit>();
  const visitorFirstSeen = new Map<string, number>();

  // Rows arrive newest first; walk them oldest first so steps read in order.
  for (const row of [...rows].reverse()) {
    const at = iso(row.created_at);
    let visit = bySession.get(row.session_id);
    if (!visit) {
      visit = {
        sessionId: row.session_id,
        visitorKey: (row.visitor_id || '').slice(0, 8),
        country: '',
        region: '',
        startedAt: at,
        endedAt: at,
        pageviews: 0,
        clicks: 0,
        returning: false,
        steps: [],
      };
      bySession.set(row.session_id, visit);
    }

    if (!visit.country && row.country) visit.country = row.country;
    if (!visit.region && row.region) visit.region = row.region;
    if (at < visit.startedAt) visit.startedAt = at;
    if (at > visit.endedAt) visit.endedAt = at;
    if (row.event_type === 'pageview') visit.pageviews += 1;
    if (row.event_type === 'click') visit.clicks += 1;

    visit.steps.push({
      at,
      type: row.event_type,
      path: row.path,
      label: row.label,
      kind: row.kind,
      href: row.href,
      durationMs: row.duration_ms,
    });
  }

  // A browser seen in more than one sitting has been here before.
  const sessionsByVisitor = new Map<string, number>();
  for (const visit of bySession.values()) {
    sessionsByVisitor.set(visit.visitorKey, (sessionsByVisitor.get(visit.visitorKey) ?? 0) + 1);
    const earliest = visitorFirstSeen.get(visit.visitorKey);
    if (earliest === undefined || Date.parse(visit.startedAt) < earliest) {
      visitorFirstSeen.set(visit.visitorKey, Date.parse(visit.startedAt));
    }
  }
  for (const visit of bySession.values()) {
    const seen = sessionsByVisitor.get(visit.visitorKey) ?? 1;
    visit.returning = seen > 1 && Date.parse(visit.startedAt) > (visitorFirstSeen.get(visit.visitorKey) ?? 0);
  }

  const sessions = [...bySession.values()]
    .sort((a, b) => (a.endedAt < b.endedAt ? 1 : a.endedAt > b.endedAt ? -1 : 0))
    .slice(0, 60);

  return { sessions, sessionsTruncated: truncated };
}
