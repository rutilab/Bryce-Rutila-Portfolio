import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Visitor id cookie for analytics (set on all HTML routes).
 * Admin JWT gate for /admin (except /admin/login).
 */
export async function middleware(request: NextRequest) {
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

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSecret = process.env.ADMIN_SECRET?.trim();
    if (!adminSecret || adminSecret.length < 16) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('from', pathname);
      return NextResponse.redirect(login);
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(adminSecret));
      if (payload.role !== 'admin') {
        throw new Error('role');
      }
    } catch {
      const login = new URL('/admin/login', request.url);
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
