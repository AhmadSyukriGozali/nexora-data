"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Dialog konfirmasi aksesibel. Dipakai untuk setiap perubahan status order,
 * pengiriman/pembatalan invoice, dan aksi destruktif lain.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  tone = "default",
  busy = false,
  children,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  busy?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("[data-autofocus]")
        ?.focus();
    }, 20);
    return () => {
      window.clearTimeout(timer);
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Tutup dialog"
        tabIndex={-1}
        onClick={() => (busy ? undefined : onClose())}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-description" : undefined}
        className="relative w-full max-w-md rounded-2xl border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-panel)] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]"
      >
        <h2
          id="confirm-title"
          className="font-display text-[16px] font-bold text-[color:var(--bjork-text)]"
        >
          {title}
        </h2>
        {description ? (
          <p
            id="confirm-description"
            className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--bjork-text-muted)]"
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[color:var(--bjork-border-strong)] px-4 text-[13px] font-medium transition-colors hover:bg-[var(--bjork-surface-hover)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex min-h-9 items-center justify-center rounded-lg px-4 text-[13px] font-semibold transition-[filter,opacity] disabled:opacity-60",
              tone === "danger"
                ? "bg-[var(--blk-error)] text-[#1b0b0b] hover:brightness-110"
                : "bg-[var(--blk-accent-fill)] text-[color:var(--blk-accent-fill-ink)] hover:brightness-110",
            )}
          >
            {busy ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
