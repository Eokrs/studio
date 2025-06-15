
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] START: Processing request for ${pathname}`);

  // Attempt to get the session. This also refreshes the session if needed.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(`[Middleware] CRITICAL_SESSION_ERROR: Error getting/refreshing session for ${pathname}: ${sessionError.message}. Allowing request to proceed.`);
    // Even with a session error, allow the request to proceed.
    // The page itself might handle this, or it might be a transient issue.
    // Forcing a redirect here could mask underlying problems or block public parts if matcher is too broad.
    return res;
  }

  // User IS authenticated
  if (session) {
    console.log(`[Middleware] SESSION_CHECK: User HAS SESSION (ID: ${session.user.id}). Path: ${pathname}`);
    if (pathname === '/admin/login') {
      console.log(`[Middleware] ACTION: User is on /admin/login but HAS SESSION. Redirecting to /admin/dashboard.`);
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    console.log(`[Middleware] ACTION: User HAS SESSION. Allowing access to ${pathname}.`);
    // For any other /admin/* path, or non-admin paths, allow access
    return res;
  }

  // User is NOT authenticated
  console.log(`[Middleware] SESSION_CHECK: User has NO SESSION. Path: ${pathname}`);
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    console.log(`[Middleware] ACTION: User has NO SESSION and trying to access protected admin path ${pathname}. Redirecting to /admin/login.`);
    const loginUrl = new URL('/admin/login', req.url);
    // loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: for redirecting back after login
    return NextResponse.redirect(loginUrl);
  }

  // For /admin/login (user not authenticated), or any non-admin path (user not authenticated)
  console.log(`[Middleware] ACTION: Path is ${pathname} (either /admin/login or non-admin). User has NO SESSION. Allowing request to proceed.`);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes, if you had them and didn't want middleware)
     * - .*\..* (files with extensions, e.g. image.png, style.css)
     * This first pattern is a general attempt to match "pages".
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
    /*
     * Specifically include all /admin paths to ensure they are processed by the middleware.
     * This ensures that /admin/login and /admin/dashboard, etc., are all covered.
     */
    '/admin/:path*',
  ],
};
