
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] START: Processing request for ${pathname}`);

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(`[Middleware] ERROR: Error getting session for ${pathname}: ${sessionError.message}`);
    // Mesmo com erro, permite que a requisição prossiga para que a página possa lidar com isso,
    // ou para evitar bloquear recursos públicos se o matcher for muito amplo.
    return res;
  }

  if (pathname === '/admin/login') {
    if (session) {
      console.log(`[Middleware] INFO: User HAS SESSION. Path is /admin/login. Redirecting to /admin/dashboard.`);
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    console.log(`[Middleware] INFO: User has NO session. Path is /admin/login. Allowing access.`);
    return res; // Permite acesso à página de login se não houver sessão
  }

  if (pathname.startsWith('/admin/')) {
    if (!session) {
      console.log(`[Middleware] INFO: User has NO SESSION. Path is ${pathname}. Redirecting to /admin/login.`);
      const loginUrl = new URL('/admin/login', req.url);
      // Optionally, pass the original path as a query param for redirecting after login
      // loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Se chegou aqui, o usuário tem uma sessão e está acessando uma página /admin/* que não é /admin/login
    console.log(`[Middleware] INFO: User HAS SESSION. Path is ${pathname}. Allowing access.`);
    return res;
  }

  // Para todas as outras rotas não-admin, apenas permite a requisição
  console.log(`[Middleware] END: Path ${pathname} is not an admin route or already handled. Allowing.`);
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
