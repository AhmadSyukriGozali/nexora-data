import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export const inputClass =
  "w-full rounded-lg border border-white/15 bg-navy-soft px-3 py-2 text-sm text-chrome placeholder:text-dim/50 focus:border-electric focus:outline-none disabled:opacity-50";

export const buttonPrimary =
  "inline-flex items-center justify-center rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-electric-soft disabled:cursor-not-allowed disabled:opacity-50";

export const buttonGhost =
  "inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-chrome transition-colors hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center justify-center rounded-lg border border-red-400/40 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSmall =
  "inline-flex items-center justify-center rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-chrome transition-colors hover:border-white/40";

export const buttonSmallDanger =
  "inline-flex items-center justify-center rounded-md border border-red-400/40 px-2.5 py-1 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/10";

export const buttonSmallSuccess =
  "inline-flex items-center justify-center rounded-md border border-emerald-300/40 px-2.5 py-1 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-300/10";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-dim">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-dim">{hint}</span> : null}
    </label>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200"
    >
      {message}
    </p>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
