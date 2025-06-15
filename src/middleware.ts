
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

// Helper function to get the Supabase auth cookie name, consistent with Supabase Auth Helpers
// This function might not be strictly necessary if createMiddlewareClient handles it all,
// but can be useful for debugging or specific cookie checks.
const getSupabaseAuthCookieName = (supabaseUrl?: string) => {
  if (!supabaseUrl) {
    // console.warn('[Middleware] getSupabaseAuthCookieName: NEXT_PUBLIC_SUPABASE_URL is not defined at call time. Using generic cookie name pattern.');
    return `sb-unknown-auth-token`; // Fallback, less ideal
  }
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) {
      // console.warn('[Middleware] getSupabaseAuthCookieName: Could not derive projectRef from NEXT_PUBLIC_SUPABASE_URL. Using default pattern.');
      return `sb-unknown-auth-token`;
    }
    return `sb-${projectRef}-auth-token`;
  } catch (e) {
    // console.error('[Middleware] getSupabaseAuthCookieName: Error parsing Supabase URL:', e);
    return `sb-error-parsing-url-auth-token`;
  }
};


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res });

  // IMPORTANT: Refresh session to ensure cookies are updated and session is fresh.
  // This is crucial for the Auth Helpers to work correctly.
  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.getSession();

  if (refreshError) {
    console.error(`[Middleware] Error refreshing session for ${pathname}: ${refreshError.message}. Allowing request.`);
    // Allow request to proceed, page might handle it or it's a transient error.
    // In a stricter setup, you might redirect to an error page or login.
    return res;
  }

  // Debugging: Log detected session and cookies
  const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authCookieName = getSupabaseAuthCookieName(envSupabaseUrl);
  const specificAuthCookie = req.cookies.get(authCookieName);

  console.log(`\n[Middleware] === Path: ${pathname} ===`);
  if (specificAuthCookie) {
    console.log(`[Middleware] Auth cookie '${authCookieName}' FOUND. Value (partial): ${specificAuthCookie.value.substring(0, 20)}...`);
  } else {
    console.log(`[Middleware] Auth cookie '${authCookieName}' NOT FOUND.`);
  }
  
  if (refreshedSession) {
    console.log(`[Middleware] User HAS SESSION (User ID: ${refreshedSession.user.id}).`);
  } else {
    console.log(`[Middleware] User has NO SESSION.`);
  }

  // Handle /admin/login route
  if (pathname === '/admin/login') {
    if (refreshedSession) {
      console.log(`[Middleware] User is on /admin/login but ALREADY HAS SESSION. Redirecting to /admin/dashboard.`);
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    console.log(`[Middleware] User is on /admin/login and has NO SESSION. Allowing access.`);
    return res; // Allow access to login page if no session
  }

  // Handle other /admin/* routes
  if (pathname.startsWith('/admin/')) {
    if (!refreshedSession) {
      console.log(`[Middleware] User has NO SESSION, trying to access protected admin path ${pathname}. Redirecting to /admin/login.`);
      const loginUrl = new URL('/admin/login', req.url);
      // Optionally, add a 'redirectedFrom' query param if needed by the login page
      // loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    console.log(`[Middleware] User HAS SESSION. Allowing access to protected admin path ${pathname}.`);
    return res; // Allow access to other admin pages if session exists
  }

  // For non-admin routes, just pass through
  // console.log(`[Middleware] Path ${pathname} is not an admin route or already handled. Allowing.`);
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
     * - .*\..* (files with extensions, e.g. image.png, style.css - this can be broad)
     *
     * It's often better to explicitly list paths to include rather than exclude.
     * For this case, we primarily care about /admin routes.
     */
    // '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)', // This can be too broad
    '/admin/:path*', // Process all /admin routes
    '/', // Process the homepage if it needs auth or cookie handling
    // Add other specific paths if they need middleware processing
  ],
};
