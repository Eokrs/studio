// components/animation/MotionLazyContainer.tsx
"use client";

import type { ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export function MotionLazyContainer({ children }: Props) {
  return (
    <LazyMotion strict features={domAnimation}>
      {children}
    </LazyMotion>
  );
}
