import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import {
  invoiceStatusLabels,
  serviceStatusLabels,
  testimonialStatusLabels,
} from "@/lib/admin/format";
import type { InvoiceStatus, ServiceStatus, TestimonialStatus } from "@/lib/admin/types";

const panelClass =
  "rounded-2xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface)]";

export function PageHeader({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[color:var(--bjork-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--blk-accent-ink)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-[color:var(--bjork-text)] sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13px] text-[color:var(--bjork-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap gap-2">{children}</div>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(panelClass, "p-5", className)}>{children}</div>;
}

export function Panel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(panelClass, "min-w-0 overflow-hidden", className)}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[13.5px] font-semibold text-[color:var(--bjork-text)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[12px] text-[color:var(--bjork-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--bjork-border-strong)] px-6 py-10 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-3 grid size-11 place-items-center rounded-xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface-hover)] text-[color:var(--blk-accent-ink)]"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <p className="font-display text-[14px] font-semibold text-[color:var(--bjork-text)]">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-[12.5px] text-[color:var(--bjork-text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className="h-full rounded-2xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] p-5 shadow-[var(--bjork-shadow-surface)] transition-colors hover:border-[color:var(--bjork-border-strong)] hover:bg-[var(--bjork-surface-hover)]">
      <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums text-[color:var(--bjork-text)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[color:var(--bjork-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-2xl focus-visible:outline-offset-4">
        {body}
      </Link>
    );
  }

  return body;
}

const stripTone = {
  default: "text-[color:var(--bjork-text)]",
  accent: "text-[color:var(--blk-accent-ink)]",
  success: "text-[color:var(--blk-success)]",
  warning: "text-[color:var(--blk-warning)]",
  danger: "text-[color:var(--blk-error)]",
} as const;

/** Strip ringkas untuk ringkasan angka di atas tabel modul. */
export function StatStrip({
  items,
}: {
  items: Array<{
    label: string;
    value: string | number;
    hint?: string;
    tone?: keyof typeof stripTone;
  }>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[color:var(--bjork-border)] bg-[color:var(--bjork-border)] sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 bg-[var(--bjork-surface)] px-4 py-3"
        >
          <dt className="truncate text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--bjork-text-soft)]">
            {item.label}
          </dt>
          <dd
            className={cn(
              "mt-1.5 truncate font-display text-[19px] font-bold leading-none tabular-nums",
              stripTone[item.tone ?? "default"],
            )}
          >
            {item.value}
          </dd>
          {item.hint ? (
            <dd className="mt-1 truncate text-[11px] text-[color:var(--bjork-text-muted)]">
              {item.hint}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

type Tone = "neutral" | "blue" | "amber" | "green" | "red" | "dark";

const toneClass: Record<Tone, string> = {
  neutral:
    "border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface-hover)] text-[color:var(--bjork-text)]",
  blue: "border-[color:var(--bjork-accent)]/50 bg-[var(--blk-accent-fill)]/15 text-[color:var(--blk-accent-ink)]",
  amber: "border-[color:var(--blk-warning)]/35 bg-[var(--blk-warning-soft)] text-[color:var(--blk-warning)]",
  green: "border-[var(--color-live)]/35 bg-[var(--blk-success-soft)] text-[color:var(--blk-success)]",
  red: "border-[var(--blk-error)]/35 bg-[var(--blk-error-soft)] text-[color:var(--blk-error)]",
  dark: "border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] text-[color:var(--bjork-text-muted)]",
};

const toneDot: Record<Tone, string> = {
  neutral: "var(--color-dim)",
  blue: "var(--color-electric-soft)",
  amber: "var(--blk-warning)",
  green: "var(--color-live)",
  red: "var(--blk-error)",
  dark: "var(--color-dim)",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        toneClass[tone],
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ backgroundColor: toneDot[tone] }}
        />
      ) : null}
      {children}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-[var(--bjork-surface-active)]",
        className,
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat dashboard">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 @3xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[124px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    </div>
  );
}

const serviceTone: Record<ServiceStatus, Tone> = {
  masuk: "neutral",
  diagnosa: "blue",
  menunggu_persetujuan: "amber",
  dikerjakan: "blue",
  menunggu_sparepart: "amber",
  selesai: "green",
  diambil: "green",
  batal: "red",
};

const invoiceTone: Record<InvoiceStatus, Tone> = {
  draft: "neutral",
  terkirim: "blue",
  lunas: "green",
  batal: "red",
};

const testimonialTone: Record<TestimonialStatus, Tone> = {
  menunggu: "amber",
  disetujui: "green",
  ditolak: "red",
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge tone={serviceTone[status]} dot>
      {serviceStatusLabels[status]}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge tone={invoiceTone[status]} dot>
      {invoiceStatusLabels[status]}
    </Badge>
  );
}

export function TestimonialStatusBadge({
  status,
}: {
  status: TestimonialStatus;
}) {
  return (
    <Badge tone={testimonialTone[status]} dot>
      {testimonialStatusLabels[status]}
    </Badge>
  );
}
