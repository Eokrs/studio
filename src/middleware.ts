
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

// Helper function to get the Supabase auth cookie name
const getSupabaseAuthCookieName = () => {
  // Ensure NEXT_PUBLIC_SUPABASE_URL is defined, otherwise this will throw during build or runtime if not careful
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("[Middleware] CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not defined. Cannot derive Supabase auth cookie name.");
    // Fallback to a generic pattern if URL is not available, though this is not ideal
    return `sb-unknown-auth-token`;
  }
  const parts = supabaseUrl.split('.');
  // Basic parsing, assumes format like https://projectref.supabase.co
  const projectRef = parts[0]?.replace('https://', '');
  if (!projectRef) {
    console.warn('[Middleware] Could not derive projectRef from NEXT_PUBLIC_SUPABASE_URL. Using default pattern.');
    return `sb-unknown-auth-token`;
  }
  return `sb-${projectRef}-auth-token`;
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  console.log(`\n[Middleware] >>>>>>> START Request for ${pathname} <<<<<<<`);

  // Log all cookies received by the middleware for this request
  const allCookies = req.cookies.getAll();
  if (allCookies.length > 0) {
    console.log(`[Middleware] ALL COOKIES RECEIVED FOR ${pathname}:`, JSON.stringify(allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))));
  } else {
    console.log(`[Middleware] NO COOKIES RECEIVED FOR ${pathname}.`);
  }

  const authCookieName = getSupabaseAuthCookieName();
  const specificAuthCookie = req.cookies.get(authCookieName);

  if (specificAuthCookie) {
    console.log(`[Middleware] AUTH COOKIE '${authCookieName}' FOUND in request for ${pathname}. Value: ${specificAuthCookie.value.substring(0,20)}...`);
  } else {
    console.log(`[Middleware] AUTH COOKIE '${authCookieName}' NOT FOUND in request for ${pathname}.`);
  }

  const supabase = createMiddlewareClient<Database>({ req, res });

  console.log(`[Middleware] Attempting supabase.auth.getSession() for ${pathname}...`);
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(`[Middleware] SESSION_ERROR getting session for ${pathname}: ${sessionError.message}.`);
    // Allow request to proceed to see if page handles it, or if it's a transient error.
    // In a stricter setup, you might redirect to an error page or login.
    return res;
  }

  if (session) {
    console.log(`[Middleware] SESSION_CHECK: User HAS SESSION (User ID: ${session.user.id}). Path: ${pathname}`);
    if (pathname === '/admin/login') {
      console.log(`[Middleware] ACTION: User on /admin/login but HAS SESSION. Redirecting to /admin/dashboard.`);
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    console.log(`[Middleware] ACTION: User HAS SESSION. Allowing access to ${pathname}.`);
    return res;
  }

  // User is NOT authenticated
  console.log(`[Middleware] SESSION_CHECK: User has NO SESSION. Path: ${pathname}`);
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    console.log(`[Middleware] ACTION: User has NO SESSION, trying to access protected admin path ${pathname}. Redirecting to /admin/login.`);
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

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
     * - api/ (API routes - adjust if you have them and they need different handling)
     * - .*\..* (files with extensions, e.g. image.png, style.css)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
    /*
     * Specifically include all /admin paths to ensure they are processed by the middleware.
     */
    '/admin/:path*',
  ],
};
