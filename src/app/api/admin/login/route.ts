import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { signAdminSessionToken, getAdminSecretBytes } from '@/lib/admin/auth';

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

  return NextResponse.json({ ok: true });
}
