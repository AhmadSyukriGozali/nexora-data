"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { ShinySurface } from "@/components/ui/shiny-surface";
import { cn } from "@/lib/cn";

type ShinyButtonProps = ComponentPropsWithRef<"button"> & {
  children: ReactNode;
  tone?: "chrome" | "electric";
  size?: "md" | "lg" | "none";
  faceClassName?: string;
  labelClassName?: string;
  buttonRef?: ComponentPropsWithRef<"button">["ref"];
};

/** Same surface as ShinyLink, for controls that act in place instead of navigating. */
export function ShinyButton({
  children,
  tone = "electric",
  size = "lg",
  className,
  faceClassName,
  labelClassName,
  buttonRef,
  ...rest
}: ShinyButtonProps) {
  return (
    <button
      ref={buttonRef}
      className={cn(
        "shiny",
        tone === "chrome" ? "shiny-chrome text-ink" : "shiny-electric text-white",
        className,
      )}
      {...rest}
    >
      <ShinySurface
        size={size}
        faceClassName={faceClassName}
        labelClassName={labelClassName}
      >
        {children}
      </ShinySurface>
    </button>
  );
}
