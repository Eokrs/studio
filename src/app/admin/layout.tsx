
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

  useEffect(() => {
    console.log('[AdminLayout] useEffect for session check triggered. Pathname:', pathname);

    const getSession = async () => {
      console.log('[AdminLayout] Attempting to get Supabase session...');
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AdminLayout] Error getting Supabase session:', error);
          // Potentially set an error state here to display to the user if appropriate
        } else {
          console.log('[AdminLayout] Supabase session fetched:', currentSession ? 'Session exists' : 'No session');
          setSession(currentSession);
        }
      } catch (e) {
        console.error('[AdminLayout] Exception during getSession:', e);
      } finally {
        setLoading(false);
        console.log('[AdminLayout] Initial session check loading complete.');
      }
    };

    getSession();

    console.log('[AdminLayout] Subscribing to onAuthStateChange...');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log('[AdminLayout] onAuthStateChange triggered. Event:', _event, 'New session:', newSession ? 'Session exists' : 'No session');
        setSession(newSession);
        
        if (!newSession && pathname !== '/admin/login') {
          console.log(`[AdminLayout] No new session and not on login page (current: ${pathname}). Redirecting to /admin/login.`);
          router.replace('/admin/login');
        }
        
        if (newSession && pathname === '/admin/login') {
          console.log(`[AdminLayout] New session and on login page. Redirecting to /admin/dashboard.`);
          router.replace('/admin/dashboard');
        }
      }
    );

    return () => {
      console.log('[AdminLayout] Unsubscribing from onAuthStateChange.');
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]); // router and pathname are dependencies

  useEffect(() => {
    // This effect handles redirect logic based on the session state and loading status
    console.log(`[AdminLayout] Session/loading effect. Loading: ${loading}, Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
    if (!loading && !session && pathname !== '/admin/login') {
      console.log(`[AdminLayout] Not loading, no session, and not on login page. Redirecting to /admin/login.`);
      router.replace('/admin/login');
    }
  }, [session, loading, router, pathname]); // session, loading, router, pathname are dependencies

  if (loading) {
    console.log('[AdminLayout] Render: Loading state active.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access to login page even if not authenticated
  // Or if on other admin pages and session exists
  if ((!session && pathname === '/admin/login') || session) {
    console.log(`[AdminLayout] Render: Allowing children. Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
    return <>{children}</>;
  }
  
  // Fallback for when not loading, no session, and not on /admin/login (should be caught by useEffect redirect)
  // This state implies a redirect should have already happened.
  console.warn(`[AdminLayout] Render: Fallback - rendering null. Loading: ${loading}, Session: ${session ? 'Exists' : 'Null'}, Pathname: ${pathname}`);
  return null; 
}
