
'use client';

import type { ReactNode } from 'react';
// No client-side auth checks or redirects needed here if middleware is effective.
// This component is now primarily for shared UI structure within /admin.

// If you need to display user-specific info in a shared admin header/sidebar,
// you could potentially fetch it in a Server Component parent of this layout or
// create a client component that uses onAuthStateChange or getSession client-side
// and passes data via Context. However, route protection is middleware's job.

export default function AdminLayout({ children }: { children: ReactNode }) {
  // The core protection logic and session refresh is handled by src/middleware.ts.
  // This layout component can be simpler.
  // A top-level suspense boundary in your app's root layout or page.tsx
  // can handle loading states for the actual page content.
  return <>{children}</>;
}
