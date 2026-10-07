import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Public routes — no auth needed
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/music') ||
    pathname.startsWith('/art') ||
    pathname.startsWith('/reading') ||
    pathname.startsWith('/space') ||
    pathname.startsWith('/milestones') ||
    pathname.startsWith('/content/') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/parent/login' ||
    pathname === '/api/settings/oauth/callback';

  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes — require a valid, signed, unexpired session token.
  // The Child Hub is included: a parent unlocks the device once (the session
  // lasts a day) and the hub's uploads need that session anyway.
  const isProtected =
    pathname.startsWith('/parent') ||
    pathname.startsWith('/hub') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api/content');

  if (isProtected) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      // API routes get 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Page routes go to the login and come back here afterwards.
      const login = new URL('/parent/login', request.url);
      login.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/parent/:path*',
    '/hub/:path*',
    '/portfolio/:path*',
    '/api/settings/:path*',
    '/api/content/:path*',
    '/api/auth/:path*',
  ],
};
