"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

const FINE_POINTER = "(pointer: fine)";

function subscribePointer(callback: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getPointerSnapshot() {
  return window.matchMedia(FINE_POINTER).matches;
}

function getPointerServerSnapshot() {
  return false;
}

/**
 * A small companion dot that follows the pointer and names the action under
 * it. The native cursor is never hidden, so precision and accessibility stay
 * intact; on touch devices this component renders nothing at all.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribePointer,
    getPointerSnapshot,
    getPointerServerSnapshot,
  );
  const enabled = finePointer && !reduce;
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const springX = useSpring(x, { stiffness: 700, damping: 45, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 700, damping: 45, mass: 0.25 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target?.getAttribute("data-cursor") || null);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden -translate-x-1/2 -translate-y-1/2 md:block"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {label ? (
          <motion.span
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className="block whitespace-nowrap bg-electric px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            {label}
          </motion.span>
        ) : (
          <motion.span
            key="dot"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="block h-2.5 w-2.5 rounded-full bg-electric"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
