"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ShinyLinkProps = {
  href: string;
  children: ReactNode;
  tone?: "chrome" | "electric";
  size?: "md" | "lg" | "none";
  className?: string;
  faceClassName?: string;
  labelClassName?: string;
  cursor?: string;
};

const sizeClass = {
  md: "px-6 py-3.5 text-[15px]",
  lg: "px-7 py-4 text-[15px]",
  none: "",
} as const;

/**
 * The bright call to action. A bar rotates behind a solid face, so only a
 * travelling rim of light shows, and a blurred sweep crosses the face on
 * hover or keyboard focus. Both effects are solid shapes and blur: no
 * gradient, no shadow, and both stop under prefers-reduced-motion.
 */
export function ShinyLink({
  href,
  children,
  tone = "electric",
  size = "lg",
  className,
  faceClassName,
  labelClassName,
  cursor,
}: ShinyLinkProps) {
  const classes = cn(
    "shiny",
    tone === "chrome" ? "shiny-chrome text-ink" : "shiny-electric text-white",
    className,
  );

  const content = (
    <>
      <span aria-hidden="true" className="shiny-rim" />

      <span className={cn("shiny-face", sizeClass[size], faceClassName)}>
        <span aria-hidden="true" className="shiny-glow" />
        <span aria-hidden="true" className="shiny-sheen" />

        <span
          className={cn(
            "relative z-10 inline-flex items-center gap-2 font-semibold",
            labelClassName,
          )}
        >
          {children}
        </span>
      </span>
    </>
  );

  const shared = {
    className: classes,
    "data-cursor": cursor,
  };

  // Only outbound links leave the site; internal routes go through Link.
  if (/^https?:/i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} {...shared}>
      {content}
    </Link>
  );
}
