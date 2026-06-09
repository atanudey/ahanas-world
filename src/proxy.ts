import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/hub') ||
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
  const isProtected =
    pathname.startsWith('/parent') ||
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
      // Page routes redirect to login
      return NextResponse.redirect(new URL('/parent/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/parent/:path*',
    '/api/settings/:path*',
    '/api/content/:path*',
    '/api/auth/:path*',
  ],
};
