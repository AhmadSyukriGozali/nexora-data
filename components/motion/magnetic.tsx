"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** 0.2 is a nudge, 0.5 is a pull. Large targets need less. */
  strength?: number;
};

/**
 * Pulls its child toward the cursor and springs it back. Pointer-type is
 * checked so a touch tap never leaves the element stuck off-centre.
 */
export function Magnetic({
  children,
  className,
  strength = 0.28,
}: MagneticProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 20, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 240, damping: 20, mass: 0.6 });

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}
