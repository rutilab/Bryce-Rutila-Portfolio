import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/admin/auth';
import { getClientIp } from '@/lib/analytics/geo';
import {
  EXCLUDE_COOKIE,
  EXCLUDE_COOKIE_MAX_AGE,
  hasExcludedIps,
  isExcludedIp,
  readCookie,
} from '@/lib/analytics/exclude';

export const runtime = 'nodejs';

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get('admin_token')?.value;
  return Boolean(token && (await verifyAdminSessionToken(token)));
}

/** Whether this browser and this network are being counted, and the IP to add. */
export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(request.headers);
  return NextResponse.json({
    ok: true,
    cookieExcluded: readCookie(request, EXCLUDE_COOKIE) === '1',
    ip,
    ipExcluded: isExcludedIp(ip),
    ipListConfigured: hasExcludedIps(),
  });
}

/** Turn counting for this browser off or back on. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let exclude = true;
  try {
    const j = (await request.json()) as { exclude?: unknown };
    if (typeof j.exclude === 'boolean') exclude = j.exclude;
  } catch {
    /* default to excluding */
  }

  const cookieStore = await cookies();
  if (exclude) {
    cookieStore.set(EXCLUDE_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: EXCLUDE_COOKIE_MAX_AGE,
    });
  } else {
    cookieStore.set(EXCLUDE_COOKIE, '', { path: '/', maxAge: 0 });
  }

  return NextResponse.json({ ok: true, cookieExcluded: exclude });
}
