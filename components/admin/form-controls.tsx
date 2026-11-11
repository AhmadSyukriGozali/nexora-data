import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)] focus-visible:ring-offset-0";

export const inputClass = cn(
  "w-full rounded-lg border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-panel)] px-3 py-2 text-sm text-[color:var(--bjork-text)] placeholder:text-[color:var(--bjork-text-faint)] transition-colors focus:border-[color:var(--bjork-accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  focus,
);

export const buttonPrimary = cn(
  "inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--blk-accent-fill)] px-4 py-2 text-sm font-semibold text-[color:var(--blk-accent-fill-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
  focus,
);

export const buttonGhost = cn(
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-[color:var(--bjork-border-strong)] px-3 py-2 text-sm font-medium text-[color:var(--bjork-text)] transition-colors hover:bg-[var(--bjork-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50",
  focus,
);

export const buttonDanger = cn(
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--blk-error)]/40 px-3 py-2 text-sm font-medium text-[color:var(--blk-error)] transition-colors hover:bg-[var(--blk-error-soft)] disabled:cursor-not-allowed disabled:opacity-50",
  focus,
);

export const buttonSmall = cn(
  "inline-flex min-h-8 items-center justify-center rounded-md border border-[color:var(--bjork-border-strong)] px-2.5 py-1 text-xs font-medium text-[color:var(--bjork-text)] transition-colors hover:bg-[var(--bjork-surface-hover)]",
  focus,
);

export const buttonSmallDanger = cn(
  "inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--blk-error)]/40 px-2.5 py-1 text-xs font-medium text-[color:var(--blk-error)] transition-colors hover:bg-[var(--blk-error-soft)]",
  focus,
);

export const buttonSmallSuccess = cn(
  "inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--color-live)]/40 px-2.5 py-1 text-xs font-medium text-[color:var(--blk-success)] transition-colors hover:bg-[var(--blk-success-soft)]",
  focus,
);

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
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--bjork-text-muted)]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-xs text-[color:var(--bjork-text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-[var(--blk-error)]/40 bg-[var(--blk-error-soft)] px-3 py-2 text-sm text-[color:var(--blk-error)]"
    >
      {message}
    </p>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
