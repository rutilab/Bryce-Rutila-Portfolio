import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { signAdminSessionToken, getAdminSecretBytes } from '@/lib/admin/auth';
import { EXCLUDE_COOKIE, EXCLUDE_COOKIE_MAX_AGE } from '@/lib/analytics/exclude';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!getAdminSecretBytes()) {
    return NextResponse.json({ ok: false, error: 'admin_not_configured' }, { status: 503 });
  }

  let password = '';
  try {
    const j = (await request.json()) as { password?: string };
    password = typeof j.password === 'string' ? j.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected || password !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  const token = await signAdminSessionToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'token_failed' }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Anyone who can sign in here is the owner, so stop counting this browser.
  // Outlives the seven-day session on purpose: the point is to keep counting
  // him out long after he's been signed out.
  cookieStore.set(EXCLUDE_COOKIE, '1', {
    httpOnly: false, // the admin page reads it to show whether this browser is excluded
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: EXCLUDE_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
