'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

/** Fade-up entrance used across landing sections. */
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/** Wrap around a card grid to stagger each child's `sectionVariants` entrance. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/**
 * Spreadable scroll-reveal props for `motion.*` elements, e.g.
 * `<motion.section {...revealProps} id="lp-features">`. Triggers once when
 * ~20% of the element enters the viewport and never re-fires on re-scroll.
 */
export const revealProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2 },
  variants: sectionVariants,
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Convenience wrapper for content that needs its own reveal but isn't a section root. */
export function Reveal({ children, className, delay }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}
