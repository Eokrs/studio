
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refresh session if expired - crucial for keeping the user logged in
  // This also makes sure the session cookie is updated if necessary.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Middleware: Error getting session:', sessionError.message);
    // Allow request to proceed, maybe show an error page or rely on client-side checks
    // For now, we'll let it pass and the route itself can handle the error display if needed.
    return res;
  }
  
  const { pathname } = req.nextUrl;

  // Handle /admin/login path specifically
  if (pathname === '/admin/login') {
    if (session) {
      // User is logged in and trying to access login page, redirect to dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    // User is not logged in and on login page, allow request to proceed
    return res;
  }

  // Handle other /admin/* paths
  if (pathname.startsWith('/admin/')) {
    if (!session) {
      // User is not logged in and trying to access a protected admin page, redirect to login
      const loginUrl = new URL('/admin/login', req.url);
      // Optionally, pass the original path as a query param for redirecting after login
      // loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // User is logged in and accessing a protected admin page, allow request to proceed
    return res;
  }

  // For all other non-admin paths, just allow the request
  return res;
}

// Ensure the middleware is only called for relevant paths.
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
