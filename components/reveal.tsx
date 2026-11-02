"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "scale" | "mask";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Each variant enters from a different direction, so sections do not all move alike. */
  variant?: RevealVariant;
};

/**
 * Adds `is-in` once the element approaches the viewport. The movement itself
 * lives in globals.css, so the content is still readable without JavaScript.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      element.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add("is-in");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
