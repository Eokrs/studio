
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
  const [loading, setLoading] = useState(true); // Start true, set to false once initial session state is known
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);


  useEffect(() => {
    console.log('[AdminLayout] useEffect for auth state change. Pathname:', pathname);
    setLoading(true); 
    setAuthCheckCompleted(false);
    setSession(null); // Reset session on path change before new check

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AdminLayout] onAuthStateChange triggered. Event:', event, 'Current session:', currentSession ? 'Session exists' : 'No session');
        setSession(currentSession);
        
        // This block ensures loading is set to false only after the *initial* session state is processed.
        if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY', 'TOKEN_REFRESHED'].includes(event)) {
          // Check authCheckCompleted before setting loading to false to avoid multiple triggers from subsequent events
          if (!authCheckCompleted) {
            setLoading(false);
            setAuthCheckCompleted(true); 
            console.log('[AdminLayout] Initial auth check completed via onAuthStateChange. Loading set to false.');
          }
        }
      }
    );

    // Fallback: if onAuthStateChange doesn't fire an initial event quickly enough (e.g. no session at all)
    // we still need to stop loading. Let's also fetch the session manually once.
    const checkCurrentSession = async () => {
        try {
            // Wait a very short moment to allow onAuthStateChange to potentially fire first
            await new Promise(resolve => setTimeout(resolve, 50)); 
            if (authCheckCompleted) return; // If onAuthStateChange already completed, do nothing

            const { data: { session: currentSupabaseSession }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('[AdminLayout] Error in getSession fallback:', error);
            }
            
            if (!authCheckCompleted) { // Check again, as onAuthStateChange might have run during the await
                console.log('[AdminLayout] checkCurrentSession. Current Supabase session:', currentSupabaseSession ? 'Exists' : 'Null');
                setSession(currentSupabaseSession); // Set session from getSession
                setLoading(false);
                setAuthCheckCompleted(true);
                console.log('[AdminLayout] Initial auth check completed via getSession fallback. Loading set to false.');
            }
        } catch (error) {
            console.error('[AdminLayout] Exception in checkCurrentSession fallback:', error);
            if (!authCheckCompleted) { 
                setLoading(false);
                setAuthCheckCompleted(true);
                console.log('[AdminLayout] Exception in getSession fallback. Loading set to false.');
            }
        }
    };
    
    // Only run checkCurrentSession if onAuthStateChange hasn't already marked completion.
    // This gives onAuthStateChange a slight priority for INITIAL_SESSION.
    if (!authCheckCompleted) {
        checkCurrentSession();
    }


    return () => {
      console.log('[AdminLayout] Unsubscribing from onAuthStateChange.');
      authListener.subscription.unsubscribe();
    };
  }, [pathname]); 

  useEffect(() => {
    console.log(`[AdminLayout] Redirect logic. Loading: ${loading}, AuthCheckCompleted: ${authCheckCompleted}, Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
    
    if (loading) {
      console.log('[AdminLayout] Redirect logic: Still loading, skipping redirect.');
      return; 
    }
    
    if (!authCheckCompleted) {
        console.log('[AdminLayout] Redirect logic: Auth check not fully completed, skipping redirect evaluation.');
        return;
    }

    if (!session && pathname !== '/admin/login') {
      console.log(`[AdminLayout] Redirect logic: No session and not on login page. Redirecting to /admin/login.`);
      router.replace('/admin/login');
    } else if (session && pathname === '/admin/login') {
      console.log(`[AdminLayout] Redirect logic: Session exists and on login page. Redirecting to /admin/dashboard.`);
      router.replace('/admin/dashboard');
    } else {
      console.log('[AdminLayout] Redirect logic: Conditions for redirect not met or already handled.');
    }
  }, [session, loading, router, pathname, authCheckCompleted]);

  if (loading || !authCheckCompleted) { // Show loader if still loading OR if auth check hasn't definitively completed
    console.log(`[AdminLayout] Render: Loading active (loading: ${loading}, authCheckCompleted: ${authCheckCompleted}).`);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and auth check has completed:
  if ((!session && pathname === '/admin/login') || session) {
    console.log(`[AdminLayout] Render: Allowing children. Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
    return <>{children}</>;
  }
  
  // This state implies a redirect should have occurred or is about to.
  // It's a safeguard.
  console.warn(`[AdminLayout] Render: Fallback state. This usually means a redirect is imminent or just occurred. Session: ${session ? 'Exists':'Null'}, Pathname: ${pathname}`);
  return ( 
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

