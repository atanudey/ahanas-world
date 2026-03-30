import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
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

  // Protected routes — require session cookie
  const isProtected =
    pathname.startsWith('/parent') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api/content');

  if (isProtected) {
    const session = request.cookies.get('ahanas_admin_session');
    if (!session?.value) {
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
