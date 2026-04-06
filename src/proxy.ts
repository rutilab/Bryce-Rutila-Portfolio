import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/** Exact /admin/login only; `/admin/login/` must be treated as login too or it hits the secret gate. */
function isAdminLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname === '/admin/login/';
}

/**
 * Visitor id cookie for analytics (set on all HTML routes).
 * Admin JWT gate for /admin (except /admin/login).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const res = NextResponse.next();

  if (!request.cookies.get('v_id')?.value) {
    res.cookies.set('v_id', crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * 400,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  if (pathname.startsWith('/admin') && !isAdminLoginPath(pathname)) {
    const adminSecret = process.env.ADMIN_SECRET?.trim();
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('from', pathname);

    if (!adminSecret || adminSecret.length < 16) {
      // Redirect (not /404 rewrite): login page explains via API if server is not configured.
      return NextResponse.redirect(login);
    }

    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(login);
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(adminSecret));
      if (payload.role !== 'admin') {
        throw new Error('role');
      }
    } catch {
      return NextResponse.redirect(login);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * All paths except static assets and API (API sets its own cookies / auth).
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
