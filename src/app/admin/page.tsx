'use client';

import { useCallback, useEffect, useState } from 'react';
import { labelForPath } from '@/lib/analytics/labels';

type Stats = {
  ok: true;
  visitors: { last30Days: number; last7Days: number };
  pageviews: { path: string; c: number }[];
  timeOnPage: { path: string; avg_ms: number | null; samples: number }[];
  clicks: { path: string; label: string; element: string; href: string; c: number }[];
};

function fmtMs(ms: number | null) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${(s / 60).toFixed(1)}m`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch('/api/analytics/stats', { cache: 'no-store' });
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
  }, []);

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
        <div>
          <h1 className="text-2xl font-semibold text-white">Traffic</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Portfolio traffic only (admin URLs excluded). Paths omit query strings so each route rolls up to one
            row; search params are still attached to pageview events in storage.
          </p>
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
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unique visitors</p>
              <p className="mt-1 text-3xl font-semibold text-white">{stats.visitors.last30Days}</p>
              <p className="mt-1 text-sm text-zinc-500">Last 30 days · {stats.visitors.last7Days} in last 7 days</p>
            </div>
          </div>

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
