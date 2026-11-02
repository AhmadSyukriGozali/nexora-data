import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Matches the background the button sits on, not the button's own colour. */
type ButtonTone = "on-dark" | "on-light" | "on-blue" | "hero";

const toneClass: Record<ButtonTone, string> = {
  "on-dark": "bg-electric text-white hover:bg-white hover:text-ink",
  "on-light": "bg-ink text-white hover:bg-electric",
  "on-blue": "bg-ink text-white hover:bg-navy",
  hero: "bg-navy text-white hover:bg-ink",
};

const sizeClass = {
  md: "px-6 py-3.5",
  lg: "px-7 py-4",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  size?: keyof typeof sizeClass;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  tone = "on-dark",
  size = "md",
  className,
}: ButtonLinkProps) {
  const classes = cn(
    "inline-flex items-center gap-2 text-[15px] font-semibold transition-colors",
    sizeClass[size],
    toneClass[tone],
    className,
  );

  // Only the outbound links leave the site; internal routes go through Link.
  if (/^https?:/i.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
