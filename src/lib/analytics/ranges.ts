import { subDays, subHours, startOfDay, startOfWeek } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const RANGE_KEYS = [
  '1h',
  '8h',
  '24h',
  'today',
  '3d',
  'week',
  '7d',
  '30d',
] as const;

export type RangeKey = (typeof RANGE_KEYS)[number];

const DEFAULT_RANGE: RangeKey = '30d';

export function safeTimeZone(tz: string | null | undefined): string {
  const t = (tz ?? '').trim();
  if (!t || t.length > 80 || !/^[A-Za-z/_\-0-9]+$/.test(t)) return 'UTC';
  return t;
}

export function parseRangeKey(value: string | null | undefined): RangeKey {
  const v = (value ?? '').trim().toLowerCase();
  if (RANGE_KEYS.includes(v as RangeKey)) return v as RangeKey;
  return DEFAULT_RANGE;
}

export function rangeLabel(key: RangeKey): string {
  switch (key) {
    case '1h':
      return 'Last hour';
    case '8h':
      return 'Last 8 hours';
    case '24h':
      return 'Last 24 hours';
    case 'today':
      return 'Today';
    case '3d':
      return 'Last 3 days';
    case 'week':
      return 'This week (from Monday)';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    default:
      return 'Last 30 days';
  }
}

/** UTC instant for `created_at >= since` (inclusive). */
export function resolveSinceUtc(key: RangeKey, timeZone: string): Date {
  const tz = safeTimeZone(timeZone);
  const now = new Date();

  switch (key) {
    case '1h':
      return subHours(now, 1);
    case '8h':
      return subHours(now, 8);
    case '24h':
      return subHours(now, 24);
    case '3d':
      return subDays(now, 3);
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case 'today': {
      const zonedNow = toZonedTime(now, tz);
      const start = startOfDay(zonedNow);
      return fromZonedTime(start, tz);
    }
    case 'week': {
      const zonedNow = toZonedTime(now, tz);
      const start = startOfWeek(zonedNow, { weekStartsOn: 1 });
      return fromZonedTime(start, tz);
    }
    default:
      return subDays(now, 30);
  }
}
