
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Client-side Supabase instance
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Import Button for error state

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // True until initial auth status is determined
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[AdminLayout] Auth effect running for pathname: ${pathname}`);
    setLoading(true);
    setAuthError(null);
    // setSession(null); // Avoid resetting session here; let getSession/onAuthStateChange dictate

    let isMounted = true;

    // Attempt to get the session immediately. This helps with the initial load,
    // especially if onAuthStateChange is delayed or doesn't fire for an initial null session.
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (!isMounted) return;
      console.log('[AdminLayout] getSession completed. Session:', currentSession ? 'Exists' : 'Null', 'Error:', error);
      if (error) {
        console.error('[AdminLayout] Error from getSession():', error.message);
        setAuthError(`Error fetching session: ${error.message}. Check Supabase client setup and network.`);
        // If getSession fails but returns a session, respect it. Otherwise, assume null.
        setSession(currentSession || null);
      } else {
        setSession(currentSession);
      }
      // Do not set setLoading(false) here; onAuthStateChange is the primary driver for this,
      // or the timeout fallback. This ensures we wait for the listener's initial state.
    }).catch(e => {
        if (!isMounted) return;
        console.error('[AdminLayout] Exception from getSession():', e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error during getSession';
        setAuthError(`Exception fetching session: ${errorMessage}. Check console.`);
        setSession(null); // Assume no session on exception
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMounted) return;
        console.log('[AdminLayout] onAuthStateChange event:', _event, 'Session:', currentSession ? 'Exists' : 'Null');
        setSession(currentSession);
        setAuthError(null); // Clear previous auth errors if auth state changes successfully
        setLoading(false); // This is a more definitive point to stop loading
      }
    );

    // Fallback timeout: if after a reasonable delay, `loading` is still true
    // (meaning onAuthStateChange hasn't fired its initial state yet),
    // set loading to false. This handles cases like an initial unauthenticated state
    // where onAuthStateChange might not fire immediately or if getSession already covered it.
    const loadingTimeout = setTimeout(() => {
        if (isMounted && loading) {
            console.log('[AdminLayout] Loading timeout reached. Setting loading to false. Current session state (from getSession):', session ? 'Exists' : 'Null');
            setLoading(false);
        }
    }, 1200); // Timeout for loading state

    return () => {
      isMounted = false;
      console.log('[AdminLayout] Unsubscribing from onAuthStateChange.');
      authListener?.subscription?.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [pathname]); // Re-run auth check if pathname changes

  useEffect(() => {
    console.log(`[AdminLayout] Redirect logic. Loading: ${loading}, Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}, AuthError: ${authError}`);

    if (loading) {
      console.log('[AdminLayout] Redirect logic: Still loading, skipping redirect.');
      return;
    }

    // If there's an auth error, don't redirect away from login, allow user to try again.
    if (authError && pathname === '/admin/login') {
        console.log('[AdminLayout] Redirect logic: Auth error on login page, allowing login page to render.');
        return;
    }
    // If there's an auth error on a protected page, the render logic below will show an error message.

    if (!session && pathname !== '/admin/login') {
      console.log(`[AdminLayout] Redirect logic: No session and not on login page. Redirecting to /admin/login.`);
      router.replace('/admin/login');
    } else if (session && pathname === '/admin/login') {
      console.log(`[AdminLayout] Redirect logic: Session exists and on login page. Redirecting to /admin/dashboard.`);
      router.replace('/admin/dashboard');
    } else {
      console.log('[AdminLayout] Redirect logic: Conditions for redirect not met or already handled.');
    }
  }, [session, loading, router, pathname, authError]);

  if (loading) {
    console.log(`[AdminLayout] Render: Loading active.`);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there was an auth error, and we are trying to access a protected page (not login)
  if (authError && pathname !== '/admin/login') {
    console.log(`[AdminLayout] Render: Auth error state. Pathname: ${pathname}`);
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 text-center">
        <Loader2 className="h-12 w-12 text-destructive mb-4" /> {/* Visually indicates an issue */}
        <p className="text-destructive text-xl font-semibold mb-2">Erro de Autenticação</p>
        <p className="text-muted-foreground text-sm mb-4 max-w-md">{authError}</p>
        <p className="text-muted-foreground text-xs">
          Verifique sua conexão com a internet ou se as configurações do Supabase estão corretas no ambiente de deploy.
        </p>
        <Button onClick={() => router.replace('/admin/login')} variant="outline" className="mt-6">
          Ir para a Página de Login
        </Button>
      </div>
    );
  }

  // If not loading:
  // Allow access to login page if no session (or if authError is set - error component handles it for other pages)
  // Allow access to other admin pages if there is a session and no authError
  if ((!session && pathname === '/admin/login') || (session && !authError)) {
    console.log(`[AdminLayout] Render: Allowing children. Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
    return <>{children}</>;
  }
  
  // This state implies a redirect should have occurred or is about to, or an auth error on login page.
  // If it's an authError on the login page itself, children (LoginPage) will be rendered.
  if (authError && pathname === '/admin/login') {
    console.log(`[AdminLayout] Render: Auth error on login page, allowing LoginPage to render.`);
    return <>{children}</>;
  }

  console.warn(`[AdminLayout] Render: Fallback loader/redirect state. Session: ${session ? 'Exists':'Null'}, Pathname: ${pathname}, AuthError: ${authError}`);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
