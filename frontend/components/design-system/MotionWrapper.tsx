"use client";

import { motion, Variants } from "framer-motion";
import { useMotion } from "../../providers/MotionProvider";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function MotionWrapper({ children, variants = defaultVariants, className }: MotionWrapperProps) {
  const { isReducedMotion } = useMotion();

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
