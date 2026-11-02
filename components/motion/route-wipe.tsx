"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A colour curtain that crosses the viewport on client-side navigation.
 * It is skipped on first load, so a direct visit or a crawler never sees it,
 * and it never blocks a click while it runs.
 */
export function RouteWipe() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setRun((value) => value + 1);
  }, [pathname]);

  if (run === 0) return null;

  return (
    <motion.div
      key={run}
      aria-hidden="true"
      initial={{ y: "100%" }}
      animate={{ y: ["100%", "0%", "-100%"] }}
      transition={{ duration: 0.95, times: [0, 0.45, 1], ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-0 z-[90] bg-electric"
    />
  );
}
