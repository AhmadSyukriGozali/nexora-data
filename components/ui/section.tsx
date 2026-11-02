import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One background tone per section. `data-chapter` tells the fixed header
 * which colours to use while that section is under the top edge.
 */
const tones = {
  navy: { chapter: "dark", className: "bg-navy text-chrome" },
  surface: { chapter: "dark", className: "bg-surface text-chrome" },
  paper: { chapter: "light", className: "bg-paper text-ink" },
  electric: { chapter: "blue", className: "bg-electric text-ink" },
} as const;

export type SectionTone = keyof typeof tones;

type SectionProps = {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
};

export function Section({
  children,
  tone = "navy",
  id,
  className,
  ...rest
}: SectionProps) {
  const { chapter, className: toneClass } = tones[tone];

  return (
    <section
      id={id}
      data-chapter={chapter}
      className={cn(toneClass, className)}
      {...rest}
    >
      {children}
    </section>
  );
}
