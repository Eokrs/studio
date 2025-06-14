
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
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // If user logs out, and they are not on the login page, redirect them to login
        if (!newSession && pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
        // If user logs in, and they are on the login page, redirect them to dashboard
        if (newSession && pathname === '/admin/login') {
          router.replace('/admin/dashboard');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  useEffect(() => {
    if (!loading && !session && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [session, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access to login page even if not authenticated
  if (!session && pathname !== '/admin/login') {
     // This should ideally be caught by the useEffect redirect,
     // but it's a fallback if rendering occurs before useEffect completes.
    return null; 
  }
  
  // If on login page and session exists, dashboard will redirect via onAuthStateChange or initial check on login page.
  // So children can be rendered here, and login page's own logic will handle redirect if session is present.
  return <>{children}</>;
}
