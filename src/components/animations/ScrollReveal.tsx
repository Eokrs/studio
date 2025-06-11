"use client";

import type { ReactNode } from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  customVariants?: Variants;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className, 
  customVariants,
  delay = 0,
  once = true,
  amount = 0.2,
  ...rest 
}) => {
  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: delay 
      } 
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={customVariants || defaultVariants}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
