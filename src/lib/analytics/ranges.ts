import { subDays, subHours, startOfDay, startOfWeek } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

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

/** Two dates the viewer picked, rather than one of the presets above. */
export const CUSTOM_RANGE = 'custom';
export type RangeSelection = RangeKey | typeof CUSTOM_RANGE;

const DEFAULT_RANGE: RangeKey = '30d';

/** Nobody has analytics older than this, and it stops silly input. */
const EARLIEST_YEAR = 2000;

/**
 * A resolved window, always closed at both ends.
 *
 * The presets are all "the last N hours", so they only ever needed a start.
 * A custom range has to stop somewhere, so every range now carries an end and
 * the queries use both. For a preset the end is simply now, which changes
 * nothing about what they return.
 */
export type ResolvedRange = {
  key: RangeSelection;
  label: string;
  since: Date;
  /** Exclusive: rows are counted while created_at < until. */
  until: Date;
  timeZone: string;
};

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

export function isCustomRange(value: string | null | undefined): boolean {
  return (value ?? '').trim().toLowerCase() === CUSTOM_RANGE;
}

/** A calendar day as the date input gives it to us: exactly YYYY-MM-DD. */
export function parseDayInput(value: string | null | undefined): {
  year: number;
  month: number;
  day: number;
} | null {
  const v = (value ?? '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < EARLIEST_YEAR || month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Rejects the days that don't exist, like the 31st of February.
  const probe = new Date(year, month - 1, day);
  if (probe.getFullYear() !== year || probe.getMonth() !== month - 1 || probe.getDate() !== day) {
    return null;
  }
  return { year, month, day };
}

/** Midnight at the start of a given day, as a UTC instant, in the viewer's zone. */
function startOfDayUtc(
  parts: { year: number; month: number; day: number },
  tz: string,
  addDays = 0,
): Date {
  // Day overflow is fine here: the 32nd of a month rolls into the next one,
  // which is exactly what we want for an exclusive end bound.
  const wall = new Date(parts.year, parts.month - 1, parts.day + addDays, 0, 0, 0, 0);
  return fromZonedTime(wall, tz);
}

function dayLabel(d: Date, tz: string): string {
  return formatInTimeZone(d, tz, 'MMM d, yyyy');
}

/**
 * The window for two picked days, or null when they don't make sense.
 *
 * Both days are inclusive as a person would expect: picking the 1st and the
 * 3rd covers all of the 1st, the 2nd and the 3rd, in the viewer's own zone.
 */
export function resolveCustomRange(
  fromInput: string | null | undefined,
  toInput: string | null | undefined,
  timeZone: string,
): ResolvedRange | null {
  const tz = safeTimeZone(timeZone);
  const from = parseDayInput(fromInput);
  const to = parseDayInput(toInput);
  if (!from || !to) return null;

  const since = startOfDayUtc(from, tz);
  const until = startOfDayUtc(to, tz, 1);
  if (until <= since) return null;

  const lastDay = startOfDayUtc(to, tz);
  const label =
    since.getTime() === lastDay.getTime()
      ? dayLabel(since, tz)
      : `${dayLabel(since, tz)} – ${dayLabel(lastDay, tz)}`;

  return { key: CUSTOM_RANGE, label, since, until, timeZone: tz };
}

/** The window for one of the presets, ending now. */
export function resolvePresetRange(key: RangeKey, timeZone: string): ResolvedRange {
  const tz = safeTimeZone(timeZone);
  return {
    key,
    label: rangeLabel(key),
    since: resolveSinceUtc(key, tz),
    until: new Date(),
    timeZone: tz,
  };
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
