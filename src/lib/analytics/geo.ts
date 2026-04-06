import { createHash } from 'node:crypto';

/**
 * Salt for IP hashing. Prefer ANALYTICS_IP_SALT; falls back to ADMIN_SECRET.
 * If neither is set (or too short), IP hashes are omitted (geo still works on Vercel).
 */
function ipSalt(): string | null {
  const s =
    process.env.ANALYTICS_IP_SALT?.trim() || process.env.ADMIN_SECRET?.trim();
  if (!s || s.length < 8) return null;
  return s;
}

function firstForwardedIp(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(',')[0]?.trim();
  if (!first) return null;
  return looksLikeIp(first) ? first : null;
}

function looksLikeIp(s: string): boolean {
  if (s.length < 7 || s.length > 45) return false;
  return /^[\d.:a-fA-F%]+$/i.test(s);
}

/** Best-effort client IP from edge / proxy headers (never stored raw in DB). */
export function getClientIp(headers: Headers): string | null {
  return (
    firstForwardedIp(headers.get('x-forwarded-for')) ||
    firstForwardedIp(headers.get('x-vercel-forwarded-for')) ||
    (() => {
      const r = headers.get('x-real-ip')?.trim();
      return r && looksLikeIp(r) ? r : null;
    })()
  );
}

/** Vercel adds these on the platform; empty locally unless you simulate them. */
export function getGeoFromHeaders(headers: Headers): {
  country: string | null;
  region: string | null;
} {
  const country = headers.get('x-vercel-ip-country')?.trim() || null;
  const region = headers.get('x-vercel-ip-country-region')?.trim() || null;
  return {
    country: country && country.length <= 8 ? country : null,
    region: region && region.length <= 32 ? region : null,
  };
}

/** Short stable hash for deduplication; not reversible without the salt. */
export function hashIp(ip: string): string | null {
  const salt = ipSalt();
  if (!salt) return null;
  return createHash('sha256')
    .update(`${salt}:${ip}`, 'utf8')
    .digest('hex')
    .slice(0, 32);
}

export function enrichMetaFromRequest(request: Request): {
  ip_hash: string | null;
  country: string | null;
  region: string | null;
} {
  const headers = request.headers;
  const ip = getClientIp(headers);
  const { country, region } = getGeoFromHeaders(headers);
  const ip_hash = ip ? hashIp(ip) : null;
  return { ip_hash, country, region };
}
