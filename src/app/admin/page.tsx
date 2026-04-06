'use client';

import { useCallback, useEffect, useState } from 'react';
import { labelForPath } from '@/lib/analytics/labels';
import { RANGE_KEYS, rangeLabel, type RangeKey } from '@/lib/analytics/ranges';
import { labelUsState } from '@/lib/analytics/usStateNames';

type Stats = {
  ok: true;
  range: {
    key: string;
    label: string;
    since: string;
    timeZone: string;
  };
  visitors: {
    byCookie: { count: number };
    byIpHash: { count: number };
    ipHashConfigured: boolean;
  };
  countries: {
    country: string;
    pageviews: number;
    visitors_by_cookie: number;
  }[];
  usStates: {
    region_code: string;
    pageviews: number;
    visitors_by_cookie: number;
  }[];
  pageviews: { path: string; c: number }[];
  timeOnPage: { path: string; avg_ms: number | null; samples: number }[];
  clicks: { path: string; label: string; element: string; href: string; c: number }[];
};

function countryLabel(code: string): string {
  if (code === 'Unknown') return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function fmtMs(ms: number | null) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${(s / 60).toFixed(1)}m`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>('30d');

  const load = useCallback(async () => {
    setErr(null);
    try {
      const tz =
        typeof window !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : 'UTC';
      const res = await fetch(
        `/api/analytics/stats?range=${encodeURIComponent(range)}&tz=${encodeURIComponent(tz)}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error === 'analytics_disabled' ? 'Add DATABASE_URL (Neon) to enable analytics.' : 'Could not load stats.');
        setStats(null);
        return;
      }
      setStats(data as Stats);
    } catch {
      setErr('Network error.');
      setStats(null);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-white">Traffic</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Portfolio traffic only (admin URLs excluded). Unique visitors use pageviews only. Cookie counts can
            exceed people (new device, incognito, cleared cookies). IP hash is a rough lower bound; shared Wi‑Fi
            can look like one visitor.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500" htmlFor="analytics-range">
              Time range
            </label>
            <select
              id="analytics-range"
              value={range}
              onChange={e => setRange(e.target.value as RangeKey)}
              className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            >
              {RANGE_KEYS.map(k => (
                <option key={k} value={k}>
                  {rangeLabel(k)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </div>

      {err ? (
        <p className="rounded-lg border border-amber-800 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">{err}</p>
      ) : null}

      {stats ? (
        <>
          <p className="mb-6 text-sm text-zinc-500">
            Showing <span className="text-zinc-300">{stats.range.label}</span>
            {stats.range.key === 'today' || stats.range.key === 'week' ? (
              <>
                {' '}
                in <span className="font-mono text-xs text-zinc-400">{stats.range.timeZone}</span>
              </>
            ) : null}
            . Window starts{' '}
            <span className="text-zinc-300">
              {new Date(stats.range.since).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
            .
          </p>

          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unique visitors (cookie)</p>
              <p className="mt-1 text-3xl font-semibold text-white">{stats.visitors.byCookie.count}</p>
              <p className="mt-1 text-sm text-zinc-500">In selected range</p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                One ID per browser cookie. Deploys, new devices, private windows, or clearing site data each add a
                new visitor.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Approx. unique visitors (IP)
              </p>
              <p className="mt-1 text-3xl font-semibold text-white">{stats.visitors.byIpHash.count}</p>
              <p className="mt-1 text-sm text-zinc-500">In selected range</p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Hashed IP from the edge (never stored raw). Same network often shares one address. Country comes
                from Vercel when deployed.
              </p>
              {!stats.visitors.ipHashConfigured ? (
                <p className="mt-2 text-xs text-amber-200/90">
                  Set ANALYTICS_IP_SALT or ADMIN_SECRET so IPs can be hashed; older rows may lack IP data.
                </p>
              ) : null}
            </div>
          </div>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium text-white">By US state (pageviews)</h2>
            <p className="mb-3 text-sm text-zinc-500">
              Only traffic where country is US. Region comes from Vercel (<code className="text-zinc-400">x-vercel-ip-country-region</code>
              ), usually a two-letter state code.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">State</th>
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Page views</th>
                    <th className="px-4 py-2 font-medium">Visitors (cookie)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.usStates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        No US pageviews in range, or region not available yet.
                      </td>
                    </tr>
                  ) : (
                    stats.usStates.map(row => (
                      <tr key={row.region_code} className="border-b border-zinc-800/80 last:border-0">
                        <td className="px-4 py-2 text-zinc-100">{labelUsState(row.region_code)}</td>
                        <td className="px-4 py-2 font-mono text-xs text-zinc-500">{row.region_code}</td>
                        <td className="px-4 py-2 text-zinc-200">{row.pageviews}</td>
                        <td className="px-4 py-2 text-zinc-400">{row.visitors_by_cookie}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium text-white">By country (pageviews)</h2>
            <p className="mb-3 text-sm text-zinc-500">
              From Vercel request headers in production. Local dev is often “Unknown” until you deploy.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Country / region</th>
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Page views</th>
                    <th className="px-4 py-2 font-medium">Visitors (cookie)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.countries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        No pageviews in range.
                      </td>
                    </tr>
                  ) : (
                    stats.countries.map(row => (
                      <tr key={row.country} className="border-b border-zinc-800/80 last:border-0">
                        <td className="px-4 py-2 text-zinc-100">{countryLabel(row.country)}</td>
                        <td className="px-4 py-2 font-mono text-xs text-zinc-500">{row.country}</td>
                        <td className="px-4 py-2 text-zinc-200">{row.pageviews}</td>
                        <td className="px-4 py-2 text-zinc-400">{row.visitors_by_cookie}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium text-white">Page views</h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Page</th>
                    <th className="px-4 py-2 font-medium">Path</th>
                    <th className="px-4 py-2 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pageviews.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                        No data yet. Browse the site with DATABASE_URL set.
                      </td>
                    </tr>
                  ) : (
                    stats.pageviews.map(row => (
                      <tr key={row.path} className="border-b border-zinc-800/80 last:border-0">
                        <td className="max-w-[200px] truncate px-4 py-2 text-zinc-100">
                          {labelForPath(row.path)}
                        </td>
                        <td className="max-w-[min(100vw,360px)] truncate px-4 py-2 font-mono text-xs text-zinc-400">
                          {row.path}
                        </td>
                        <td className="px-4 py-2 text-zinc-200">{row.c}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium text-white">Avg. time on page</h2>
            <p className="mb-3 text-sm text-zinc-500">
              Time between in-app navigations and when the tab closes or you leave the site. Long idle sessions
              on one page can be undercounted.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Page</th>
                    <th className="px-4 py-2 font-medium">Path</th>
                    <th className="px-4 py-2 font-medium">Avg</th>
                    <th className="px-4 py-2 font-medium">Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.timeOnPage.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        No leave events yet.
                      </td>
                    </tr>
                  ) : (
                    stats.timeOnPage.map(row => (
                      <tr key={row.path} className="border-b border-zinc-800/80 last:border-0">
                        <td className="max-w-[200px] truncate px-4 py-2 text-zinc-100">
                          {labelForPath(row.path)}
                        </td>
                        <td className="max-w-[min(100vw,360px)] truncate px-4 py-2 font-mono text-xs text-zinc-400">
                          {row.path}
                        </td>
                        <td className="px-4 py-2 text-zinc-200">{fmtMs(row.avg_ms)}</td>
                        <td className="px-4 py-2 text-zinc-400">{row.samples}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Clicks</h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Page</th>
                    <th className="px-4 py-2 font-medium">Path</th>
                    <th className="px-4 py-2 font-medium">Label</th>
                    <th className="px-4 py-2 font-medium">El</th>
                    <th className="px-4 py-2 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.clicks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                        No clicks recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stats.clicks.map((row, i) => (
                      <tr key={`${row.path}-${row.label}-${i}`} className="border-b border-zinc-800/80 last:border-0">
                        <td className="max-w-[160px] truncate px-4 py-2 text-zinc-100">
                          {labelForPath(row.path)}
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-2 font-mono text-xs text-zinc-400">
                          {row.path}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2 text-zinc-200">{row.label || '—'}</td>
                        <td className="truncate px-4 py-2 text-zinc-500">{row.element}</td>
                        <td className="px-4 py-2 text-zinc-200">{row.c}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : !err ? (
        <p className="text-zinc-500">Loading…</p>
      ) : null}
    </div>
  );
}
