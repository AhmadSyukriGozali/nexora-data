import { ArrowUpRight, Package, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  AreaTrend,
  BarSeries,
  ChartEmpty,
  Donut,
  Sparkline,
  StatDelta,
  type Point,
} from "@/components/admin/charts";
import {
  EmptyState,
  InvoiceStatusBadge,
  ServiceStatusBadge,
} from "@/components/admin/ui";
import { formatDateTime, formatRupiah } from "@/lib/admin/format";
import type { Invoice, Order, Sparepart } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

export type OverviewData = {
  name: string;
  today: string;
  activeOrders: number;
  waitingApproval: number;
  inProgress: number;
  unpaidCount: number;
  unpaidTotal: number;
  paidTotal: number;
  paidDelta: number | null;
  orderDelta: number | null;
  pendingTestimonials: number;
  ordersTrend: Point[];
  revenueTrend: Point[];
  statusBreakdown: { label: string; value: number; color?: string }[];
  lowStock: Sparepart[];
  recentOrders: Order[];
  recentInvoices: Invoice[];
};

const linkRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]";

function Metric({
  label,
  value,
  hint,
  href,
  delta,
  series,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href: string;
  delta?: number | null;
  series?: Point[];
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] p-4 shadow-[var(--bjork-shadow-surface)] transition-colors duration-150 hover:border-[color:var(--bjork-border-strong)] hover:bg-[var(--bjork-surface-hover)]",
        linkRing,
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
          {icon}
          {label}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-[color:var(--bjork-text-faint)] transition-colors group-hover:text-[color:var(--blk-accent-ink)]"
        />
      </span>
      <span className="mt-3 truncate font-display text-[26px] font-bold leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </span>
      {delta !== undefined ? (
        <span className="mt-2">
          <StatDelta value={delta} />
        </span>
      ) : hint ? (
        <span className="mt-2 text-[12px] leading-snug text-[color:var(--bjork-text-soft)]">
          {hint}
        </span>
      ) : null}
      {series && series.length > 1 ? (
        <span className="mt-3 block">
          <Sparkline points={series} />
        </span>
      ) : null}
    </Link>
  );
}

function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "min-w-0 rounded-2xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[12px] text-[color:var(--bjork-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className={cn(
              "shrink-0 rounded-md text-[12px] font-medium text-[color:var(--blk-accent-ink)] transition-colors hover:text-[color:var(--bjork-text)]",
              linkRing,
            )}
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function OverviewView({ data }: { data: OverviewData }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--blk-accent-ink)]">
            {data.today}
          </p>
          <h1 className="font-display text-[26px] font-bold leading-none tracking-[-0.03em] @3xl/main:text-[30px]">
            Halo, {data.name || "Staf"}
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] text-[color:var(--bjork-text-muted)]">
            Ringkasan operasional 14 hari terakhir. Order, tagihan, stok, dan
            antrean moderasi ada di satu tempat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/order"
            className={cn(
              "rounded-[9px] bg-[var(--blk-accent-fill)] px-3.5 py-2 text-[13px] font-semibold text-[color:var(--blk-accent-fill-ink)] transition-opacity hover:opacity-90",
              linkRing,
            )}
          >
            Order servis
          </Link>
          <Link
            href="/admin/invoice"
            className={cn(
              "rounded-[9px] border border-[color:var(--bjork-border-strong)] px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--bjork-surface-hover)]",
              linkRing,
            )}
          >
            Invoice
          </Link>
        </div>
      </div>

      <section
        aria-label="Angka utama"
        className="grid grid-cols-2 gap-2.5 @3xl/main:grid-cols-4 @3xl/main:gap-3"
      >
        <Metric
          label="Order aktif"
          value={data.activeOrders}
          hint="Belum selesai/diambil"
          href="/admin/order"
          delta={data.orderDelta}
          series={data.ordersTrend}
        />
        <Metric
          label="Menunggu persetujuan"
          value={data.waitingApproval}
          hint="Perlu konfirmasi pelanggan"
          href="/admin/order"
        />
        <Metric
          label="Belum lunas"
          value={data.unpaidCount}
          hint={`Sisa ${formatRupiah(data.unpaidTotal)}`}
          href="/admin/invoice"
        />
        <Metric
          label="Pendapatan 14 hari"
          value={formatRupiah(data.paidTotal)}
          href="/admin/invoice"
          delta={data.paidDelta}
          series={data.revenueTrend}
          icon={<Wallet aria-hidden="true" className="size-3.5" />}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="Order masuk"
          description="Jumlah order baru per hari, 14 hari terakhir."
          action={{ href: "/admin/order", label: "Lihat semua" }}
        >
          <div className="px-4 pb-4">
            {data.ordersTrend.some((point) => point.value > 0) ? (
              <AreaTrend points={data.ordersTrend} formatValue={(v) => `${v} order`} />
            ) : (
              <ChartEmpty>Belum ada order dalam 14 hari terakhir.</ChartEmpty>
            )}
          </div>
        </Panel>

        <Panel
          title="Sebaran status order"
          description="Order yang masih berjalan."
          action={{ href: "/admin/order", label: "Kelola" }}
        >
          <div className="px-4 pb-4">
            {data.statusBreakdown.length > 0 ? (
              <Donut
                segments={data.statusBreakdown}
                centerLabel="order aktif"
                centerValue={data.activeOrders}
              />
            ) : (
              <ChartEmpty>Tidak ada order aktif.</ChartEmpty>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel
          title="Pendapatan harian"
          description="Pembayaran tercatat per hari, 14 hari terakhir."
          action={{ href: "/admin/invoice", label: "Invoice" }}
        >
          <div className="px-4 pb-4">
            {data.revenueTrend.some((point) => point.value > 0) ? (
              <BarSeries
                points={data.revenueTrend}
                tone="var(--color-live)"
                formatValue={(value) => formatRupiah(value)}
              />
            ) : (
              <ChartEmpty>Belum ada pembayaran dalam 14 hari terakhir.</ChartEmpty>
            )}
          </div>
        </Panel>

        <Panel
          title="Order terbaru"
          action={{ href: "/admin/order", label: "Semua" }}
          className="@container/panel"
        >
          {data.recentOrders.length === 0 ? (
            <div className="px-4 pb-4">
              <EmptyState
                title="Belum ada order"
                description="Buat order pertama dari menu Order Servis."
              />
            </div>
          ) : (
            <ul>
              {data.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="border-t border-[color:var(--bjork-border)]"
                >
                  <Link
                    href={`/admin/order/${order.id}`}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--bjork-surface-hover)]",
                      linkRing,
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">
                        {order.customer?.full_name ?? "—"}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-[color:var(--bjork-text-muted)]">
                        {order.ticket_number} ·{" "}
                        {order.device
                          ? `${order.device.brand} ${order.device.model}`
                          : "—"}
                      </span>
                    </span>
                    <ServiceStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-2">
        <Panel
          title="Stok menipis"
          description="Stok aktif yang menyentuh batas minimum."
          action={{ href: "/admin/sparepart", label: "Kelola" }}
        >
          <div className="px-4 pb-4">
            {data.lowStock.length === 0 ? (
              <p className="rounded-[10px] border border-[var(--color-live)]/30 bg-[var(--blk-success-soft)] px-3 py-2 text-[13px] text-[color:var(--blk-success)]">
                Semua stok sparepart masih di atas batas minimum.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.lowStock.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-[color:var(--bjork-border)] px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Package
                        aria-hidden="true"
                        className="size-4 shrink-0 text-[color:var(--blk-warning)]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px]">
                          {item.name}
                        </span>
                        <span className="font-mono text-[11px] text-[color:var(--bjork-text-muted)]">
                          {item.sku}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-[12px]">
                      <span className="block font-semibold text-[color:var(--blk-error)]">
                        {item.stock_quantity} tersisa
                      </span>
                      <span className="text-[color:var(--bjork-text-muted)]">
                        min. {item.min_stock}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel
          title="Invoice terbaru"
          action={{ href: "/admin/invoice", label: "Lihat" }}
        >
          {data.recentInvoices.length === 0 ? (
            <p className="border-t border-[color:var(--bjork-border)] px-4 py-5 text-[13px] text-[color:var(--bjork-text-muted)]">
              Belum ada invoice.
            </p>
          ) : (
            <ul>
              {data.recentInvoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="border-t border-[color:var(--bjork-border)]"
                >
                  <Link
                    href={`/admin/invoice/${invoice.id}`}
                    className={cn(
                      "flex items-start justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--bjork-surface-hover)]",
                      linkRing,
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[12px] text-[color:var(--blk-accent-ink)]">
                        {invoice.invoice_number}
                      </span>
                      <span className="text-[11px] text-[color:var(--bjork-text-muted)]">
                        {formatDateTime(invoice.issued_at)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[13px] font-semibold tabular-nums">
                        {formatRupiah(invoice.total_amount)}
                      </span>
                      <InvoiceStatusBadge status={invoice.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-2.5 @3xl/main:grid-cols-3">
        <Metric
          label="Sedang dikerjakan"
          value={data.inProgress}
          hint="Order di meja teknisi"
          href="/admin/order"
        />
        <Metric
          label="Testimoni menunggu"
          value={data.pendingTestimonials}
          hint="Belum dimoderasi"
          href="/admin/testimoni"
        />
        <Metric
          label="Total order aktif"
          value={data.activeOrders}
          hint="Masuk sampai menunggu sparepart"
          href="/admin/order"
        />
      </div>
    </>
  );
}
