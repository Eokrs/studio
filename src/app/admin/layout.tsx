
'use client';

import type { ReactNode } from 'react';
// Removed useState, useEffect, useRouter, usePathname, supabase client, Loader2, Button from here
// as middleware will handle protection.

// If you need to display user-specific info in a shared admin header/sidebar later,
// you would fetch it using createServerComponentClient in a Server Component
// or pass it down from a Server Component parent of this layout.
// For now, this layout is purely structural.

export default function AdminLayout({ children }: { children: ReactNode }) {
  // The core protection logic is now handled by src/middleware.ts.
  // This layout component can be simpler.
  // If you had a loading state before, it was primarily for client-side auth check.
  // With middleware, the page either loads (if authenticated) or redirects.
  // A top-level suspense boundary in your app layout or page can handle loading for page content itself.
  return <>{children}</>;
}
