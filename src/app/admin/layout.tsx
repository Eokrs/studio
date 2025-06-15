
'use client';

import type { ReactNode } from 'react';
// No client-side auth checks or redirects needed here if middleware is effective.
// This component is now primarily for shared UI structure within /admin.

export default function AdminLayout({ children }: { children: ReactNode }) {
  // The core protection logic and session refresh is handled by src/middleware.ts.
  // This layout component is now very simple.
  return <>{children}</>;
}
