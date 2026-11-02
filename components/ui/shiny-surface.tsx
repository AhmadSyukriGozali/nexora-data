import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizeClass = {
  md: "px-6 py-3.5 text-[15px]",
  lg: "px-7 py-4 text-[15px]",
  none: "",
} as const;

type ShinySurfaceProps = {
  children: ReactNode;
  size?: keyof typeof sizeClass;
  faceClassName?: string;
  labelClassName?: string;
};

/**
 * The inside of a shiny control: travelling rim, blurred glow and a sweep that
 * only runs on hover or focus. Shared by the link and button versions so both
 * stay identical in weight and timing.
 */
export function ShinySurface({
  children,
  size = "lg",
  faceClassName,
  labelClassName,
}: ShinySurfaceProps) {
  return (
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
}
