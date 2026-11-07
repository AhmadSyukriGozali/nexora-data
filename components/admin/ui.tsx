import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import {
  invoiceStatusLabels,
  serviceStatusLabels,
  testimonialStatusLabels,
} from "@/lib/admin/format";
import type { InvoiceStatus, ServiceStatus, TestimonialStatus } from "@/lib/admin/types";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-chrome sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-dim">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
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
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold text-chrome">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-dim">{description}</p>
      ) : null}
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
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-electric/60">
      <p className="text-xs uppercase tracking-[0.16em] text-dim">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-chrome">{value}</p>
      {hint ? <p className="mt-1 text-xs text-dim">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-offset-4">
        {body}
      </Link>
    );
  }

  return body;
}

type Tone = "neutral" | "blue" | "amber" | "green" | "red" | "dark";

const toneClass: Record<Tone, string> = {
  neutral: "border-white/20 bg-white/[0.06] text-chrome",
  blue: "border-electric/50 bg-electric/15 text-electric-soft",
  amber: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  green: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  red: "border-red-400/40 bg-red-400/10 text-red-200",
  dark: "border-white/10 bg-navy text-dim",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        toneClass[tone],
      )}
    >
      {children}
    </span>
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
  return <Badge tone={serviceTone[status]}>{serviceStatusLabels[status]}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge tone={invoiceTone[status]}>{invoiceStatusLabels[status]}</Badge>;
}

export function TestimonialStatusBadge({
  status,
}: {
  status: TestimonialStatus;
}) {
  return (
    <Badge tone={testimonialTone[status]}>
      {testimonialStatusLabels[status]}
    </Badge>
  );
}
