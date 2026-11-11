"use client";

import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Small building blocks for the admin shell. The AppDashboardShell reference
 * imports these from a file that was not part of the pasted source, so this is
 * a lean version containing only what the shell actually uses.
 */

/** Root of the shell. Defines the --bjork-* tokens (see globals.css). */
export const blockRoot =
  "nx-block flex w-full overflow-hidden bg-[var(--bjork-bg)] text-[color:var(--bjork-text)]";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Accessible name; icon buttons have no visible text. */
  label: string;
  size?: "sm" | "md";
  pressed?: boolean;
  children: ReactNode;
};

export function IconButton({
  label,
  size = "md",
  pressed,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      {...rest}
      className={cn(
        "inline-grid shrink-0 cursor-pointer place-items-center rounded-[9px] text-[color:var(--bjork-text-muted)] transition-colors duration-150 hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "size-7 [&_svg]:size-3.5" : "size-8 [&_svg]:size-[17px]",
        focusRing,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function InitialsAvatar({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "N";

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border border-[color:var(--bjork-border)] bg-[var(--bjork-accent-soft)] font-semibold text-[color:var(--blk-accent-ink)]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </span>
  );
}

/**
 * Slide-in navigation drawer for small screens. Escape and the backdrop close
 * it, focus moves in on open and returns to the opener on close. The caller
 * should make the rest of the page `inert` while it is open.
 */
export function BlockDrawer({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus handling depends on `open` only, so a new onClose identity
  // never steals focus back into the drawer.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();
    return () => opener?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup menu"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[86vw] flex-col border-r border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </div>
    </>
  );
}
