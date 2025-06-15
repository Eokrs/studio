
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

// Helper function to get the Supabase auth cookie name
const getSupabaseAuthCookieName = (supabaseUrl?: string) => {
  if (!supabaseUrl) {
    console.warn('[Middleware:getSupabaseAuthCookieName] NEXT_PUBLIC_SUPABASE_URL is not defined. Using generic cookie name.');
    return `sb-unknown-auth-token`;
  }
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) {
      console.warn('[Middleware:getSupabaseAuthCookieName] Could not derive projectRef from NEXT_PUBLIC_SUPABASE_URL. Using default pattern.');
      return `sb-unknown-auth-token`;
    }
    return `sb-${projectRef}-auth-token`;
  } catch (e) {
    console.error('[Middleware:getSupabaseAuthCookieName] Error parsing Supabase URL:', e);
    return `sb-error-parsing-url-auth-token`;
  }
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabase = createMiddlewareClient<Database>({ req, res });

  // IMPORTANT: Refresh session to ensure cookies are updated and session is fresh.
  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.getSession();

  console.log(`\n[Middleware] === Path: ${pathname} ===`);
  const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authCookieName = getSupabaseAuthCookieName(envSupabaseUrl);
  const specificAuthCookie = req.cookies.get(authCookieName);

  if (specificAuthCookie) {
    console.log(`[Middleware] Auth cookie '${authCookieName}' FOUND. Value (partial): ${specificAuthCookie.value.substring(0, 20)}...`);
  } else {
    console.log(`[Middleware] Auth cookie '${authCookieName}' NOT FOUND.`);
  }

  if (refreshError) {
    console.error(`[Middleware] Error refreshing session for ${pathname}: ${refreshError.message}. Allowing request to proceed, but this might indicate issues.`);
    // Allowing to proceed, but this is a yellow flag.
  }

  if (refreshedSession) {
    console.log(`[Middleware] User HAS SESSION (User ID: ${refreshedSession.user.id}).`);
  } else {
    console.log(`[Middleware] User has NO SESSION after getSession().`);
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
      return NextResponse.redirect(loginUrl);
    }
    console.log(`[Middleware] User HAS SESSION. Allowing access to protected admin path ${pathname}.`);
    return res; // Allow access to other admin pages if session exists
  }

  // For non-admin routes, just pass through
  console.log(`[Middleware] Path ${pathname} is not an admin route or login page. Allowing.`);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * We want to process all /admin routes including /admin/login
     */
    '/admin/:path*',
    // If you have other top-level routes that might need middleware, add them.
    // Example: '/'
    // But be careful not to create overly broad matchers that process static assets.
  ],
};
