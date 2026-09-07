import { getClientIp } from '@/lib/analytics/geo';

/**
 * Keeping Bryce's own browsing out of Bryce's own numbers.
 *
 * Two independent nets, because each one alone has a hole:
 *
 *  - A cookie, set whenever he signs into /admin. Follows him across networks
 *    and onto his phone, but a cleared cookie or a private window slips past.
 *  - An IP allowlist in ANALYTICS_EXCLUDE_IPS. Catches every browser on the
 *    network at once, but home IPs change and coffee shops don't count.
 *
 * Together they cover most of it. Neither is retroactive: this stops rows from
 * being written, it doesn't clean up ones already there.
 */

export const EXCLUDE_COOKIE = 'no_track';
export const EXCLUDE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export type ExclusionReason = 'cookie' | 'ip' | null;

/** Comma- or space-separated list of raw IPs, from the environment. */
function excludedIps(): string[] {
  const raw = process.env.ANALYTICS_EXCLUDE_IPS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Cookies aren't parsed for us in a route handler, so do it by hand. */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

export function isExcludedIp(ip: string | null): boolean {
  if (!ip) return false;
  return excludedIps().includes(ip.toLowerCase());
}

/** Why this request shouldn't be counted, or null if it should be. */
export function exclusionReason(request: Request): ExclusionReason {
  if (readCookie(request, EXCLUDE_COOKIE) === '1') return 'cookie';
  if (isExcludedIp(getClientIp(request.headers))) return 'ip';
  return null;
}

/** True when the environment names at least one IP to ignore. */
export function hasExcludedIps(): boolean {
  return excludedIps().length > 0;
}
