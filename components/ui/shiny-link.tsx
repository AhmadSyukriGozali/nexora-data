"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ShinySurface } from "@/components/ui/shiny-surface";
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

/**
 * The bright call to action. A bar rotates behind a solid face, so only a
 * travelling rim of light shows, and a blurred sweep crosses the face on
 * hover or keyboard focus. No gradient, no shadow; both stop under
 * prefers-reduced-motion.
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
    <ShinySurface
      size={size}
      faceClassName={faceClassName}
      labelClassName={labelClassName}
    >
      {children}
    </ShinySurface>
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
