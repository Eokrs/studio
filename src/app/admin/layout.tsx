
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AdminLayout] useEffect for session check triggered. Pathname:', pathname);
    setAuthError(null); // Reset auth error on each trigger

    const getSessionAndUpdateState = async () => {
      console.log('[AdminLayout] Attempting to get Supabase session...');
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AdminLayout] CRITICAL_AUTH_ERROR: Error getting Supabase session in getSessionAndUpdateState:', error);
          setAuthError(`Error fetching session: ${error.message}`);
          setSession(null); // Ensure session is null on error
        } else {
          console.log('[AdminLayout] Supabase session fetched:', currentSession ? 'Session exists' : 'No session');
          setSession(currentSession);
        }
      } catch (e: any) {
        console.error('[AdminLayout] CRITICAL_AUTH_EXCEPTION: Exception during getSessionAndUpdateState:', e);
        setAuthError(`Exception fetching session: ${e.message}`);
        setSession(null); // Ensure session is null on exception
      } finally {
        setLoading(false);
        console.log('[AdminLayout] Initial session check loading complete.');
      }
    };

    getSessionAndUpdateState();

    console.log('[AdminLayout] Subscribing to onAuthStateChange...');
    let authListenerSubscription: any;
    try {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            console.log('[AdminLayout] onAuthStateChange triggered. Event:', _event, 'New session:', newSession ? 'Session exists' : 'No session');
            setSession(newSession);
            setAuthError(null); // Clear any previous auth error on successful state change
            
            // It's generally better to handle redirects in the second useEffect based on session and loading state
            // to avoid race conditions or multiple redirects.
          }
        );
        authListenerSubscription = authListener?.subscription;
    } catch (e: any) {
        console.error('[AdminLayout] CRITICAL_AUTH_EXCEPTION: Exception during onAuthStateChange subscription:', e);
        setAuthError(`Exception setting up auth listener: ${e.message}`);
        setLoading(false); // Ensure loading stops if listener setup fails
    }


    return () => {
      if (authListenerSubscription) {
        console.log('[AdminLayout] Unsubscribing from onAuthStateChange.');
        authListenerSubscription.unsubscribe();
      } else {
        console.log('[AdminLayout] No authListener subscription to unsubscribe from.');
      }
    };
  }, [router, pathname]); // router and pathname are dependencies

  useEffect(() => {
    // This effect handles redirect logic based on the session state, loading status, and auth errors
    console.log(`[AdminLayout] Session/loading/redirect effect. Loading: ${loading}, Session: ${session ? 'Exists' : 'Null'}, AuthError: ${authError}, Pathname: ${pathname}`);
    
    if (loading) {
      return; // Don't do anything if still loading session
    }

    if (authError && pathname !== '/admin/login') {
        // If there was an auth error during setup, it's risky to proceed.
        // Redirecting to login might be an option, or showing an error.
        // For now, we'll let the session logic handle it, but this log is important.
        console.warn('[AdminLayout] Auth error detected, session might be unreliable. Current session state:', session);
    }

    if (!session && pathname !== '/admin/login') {
      console.log(`[AdminLayout] Not loading, no session, and not on login page. Redirecting to /admin/login.`);
      router.replace('/admin/login');
    } else if (session && pathname === '/admin/login') {
      console.log(`[AdminLayout] Session exists and on login page. Redirecting to /admin/dashboard.`);
      router.replace('/admin/dashboard');
    }
  }, [session, loading, router, pathname, authError]);

  if (loading) {
    console.log('[AdminLayout] Render: Loading state active.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {authError && <p className="ml-4 text-destructive">Authentication Error...</p>}
      </div>
    );
  }

  // If an auth error occurred during setup, and we're not on the login page,
  // it might be safer to prevent rendering children or show a specific error message.
  // However, the redirect logic above might already handle moving away from protected pages.
  // This is a place for potential further refinement if generic errors persist.
  if (authError && pathname !== '/admin/login') {
     console.error(`[AdminLayout] Render: Auth error detected: ${authError}. Pathname: ${pathname}. Session: ${session ? 'Exists' : 'Null'}`);
     // Potentially render an error component or redirect, though redirect is handled by useEffect.
     // For now, falling through to the session check.
  }


  // Allow access to login page even if not authenticated (and no auth error preventing it)
  // Or if on other admin pages and session exists
  if ((!session && pathname === '/admin/login') || session) {
    console.log(`[AdminLayout] Render: Allowing children. Session: ${session ? 'Exists' : 'Null'}, AuthError: ${authError}, Pathname: ${pathname}`);
    return <>{children}</>;
  }
  
  // Fallback for when not loading, no session, and not on /admin/login (should be caught by useEffect redirect)
  // This state implies a redirect should have already happened.
  console.warn(`[AdminLayout] Render: Fallback - rendering null or redirecting. Loading: ${loading}, Session: ${session ? 'Exists' : 'Null'}, AuthError: ${authError}, Pathname: ${pathname}`);
  // The useEffect for redirection should handle this case.
  // If it doesn't, returning null here might be a safe fallback,
  // but it's better if the redirect logic always catches these states.
  return null; 
}
