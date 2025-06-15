
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
    const url = new URL(supabaseUrl); // Use URL constructor for robust parsing
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
  const res = NextResponse.next(); // Response object that can be modified for cookies
  const { pathname } = req.nextUrl;

  console.log(`\n[Middleware] === Path: ${pathname} ===`);

  // For non-admin routes, pass through immediately.
  // The matcher should prevent this from running for non-admin routes, but this is a safeguard.
  if (!pathname.startsWith('/admin')) {
    console.log(`[Middleware] Path ${pathname} is not an admin route. Allowing early.`);
    return NextResponse.next(); // Use a fresh NextResponse.next()
  }

  // Admin routes processing
  const supabase = createMiddlewareClient<Database>({ req, res }); // `res` is passed so Supabase can set cookies

  // IMPORTANT: Refresh session to ensure cookies are updated and session is fresh.
  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.getSession();

  const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authCookieName = getSupabaseAuthCookieName(envSupabaseUrl);
  const specificAuthCookie = req.cookies.get(authCookieName);

  let cookieDebugMessage = `[Middleware] Auth cookie '${authCookieName}' `;
  if (specificAuthCookie) {
    cookieDebugMessage += `FOUND. Value (partial): ${specificAuthCookie.value.substring(0, 20)}...`;
  } else {
    cookieDebugMessage += `NOT FOUND.`;
  }
  console.log(cookieDebugMessage);
  console.log(`[Middleware] All received cookies:`, Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value.substring(0,20) + "..."])));


  if (refreshError) {
    console.error(`[Middleware] Error refreshing session for ${pathname}: ${refreshError.message}. This might indicate an issue with an expired or invalid refresh token, or connectivity problems with Supabase.`);
    // Even with an error, refreshedSession might be null, so the logic below will treat it as "no session".
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
    // If user is NOT logged in and on /admin/login
    console.log(`[Middleware] User is on /admin/login and has NO SESSION. Allowing access directly with a new NextResponse.next().`);
    // Return a fresh NextResponse.next() to avoid any potential side effects from the `res` object
    // that was passed to createMiddlewareClient, in case that's causing a loop.
    return NextResponse.next();
  }

  // Handle other /admin/* routes (e.g., /admin/dashboard, /admin/products)
  // This part assumes pathname.startsWith('/admin/') is true and pathname !== '/admin/login'
  if (!refreshedSession) {
    console.log(`[Middleware] User has NO SESSION, trying to access protected admin path ${pathname}. Redirecting to /admin/login.`);
    const loginUrl = new URL('/admin/login', req.url);
    // loginUrl.searchParams.set('from', pathname); // Optional: for redirecting back after login
    return NextResponse.redirect(loginUrl);
  }

  // If user HAS SESSION and is accessing a protected admin path (not /admin/login)
  console.log(`[Middleware] User HAS SESSION. Allowing access to protected admin path ${pathname}.`);
  // Return the `res` object which might have updated cookies from `getSession()`
  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // This ensures middleware runs only for /admin routes
};
