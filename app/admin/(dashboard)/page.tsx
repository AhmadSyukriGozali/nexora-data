import Link from "next/link";

import {
  Card,
  EmptyState,
  InvoiceStatusBadge,
  PageHeader,
  ServiceStatusBadge,
  StatCard,
} from "@/components/admin/ui";
import { formatDateTime, formatRupiah } from "@/lib/admin/format";
import type { Invoice, Order, Sparepart } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

const ACTIVE_STATUSES = [
  "masuk",
  "diagnosa",
  "menunggu_persetujuan",
  "dikerjakan",
  "menunggu_sparepart",
];

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    activeOrders,
    waitingApproval,
    inProgress,
    unpaidInvoices,
    pendingTestimonials,
    sparepartsResult,
    recentOrdersResult,
    recentInvoicesResult,
  ] = await Promise.all([
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .in("status", ACTIVE_STATUSES),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu_persetujuan"),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "dikerjakan"),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "terkirim"]),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu"),
    supabase
      .from("spareparts")
      .select("id, sku, name, stock_quantity, min_stock, is_active")
      .eq("is_active", true),
    supabase
      .from("service_orders")
      .select(
        "id, ticket_number, status, estimated_finish_at, customer:customers(full_name), device:devices(device_type, brand, model)",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, status, total_amount, paid_amount, issued_at, order:service_orders(ticket_number)",
      )
      .order("issued_at", { ascending: false })
      .limit(6),
  ]);

  const lowStock = ((sparepartsResult.data ?? []) as Sparepart[])
    .filter((item) => item.stock_quantity <= item.min_stock)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const recentOrders = (recentOrdersResult.data ??
    []) as unknown as Order[];
  const recentInvoices = (recentInvoicesResult.data ??
    []) as unknown as Invoice[];

  return (
    <>
      <PageHeader
        title="Ringkasan"
        description="Pantau order aktif, tagihan, stok, dan testimoni yang menunggu moderasi."
      >
        <Link
          href="/admin/order"
          className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-electric-soft"
        >
          Order servis
        </Link>
        <Link
          href="/admin/invoice"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-chrome transition-colors hover:border-white/40"
        >
          Invoice
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Order aktif"
          value={activeOrders.count ?? 0}
          hint="Masuk, diagnosa, dikerjakan, menunggu bagian"
          href="/admin/order"
        />
        <StatCard
          label="Menunggu persetujuan"
          value={waitingApproval.count ?? 0}
          hint="Perlu konfirmasi pelanggan"
          href="/admin/order"
        />
        <StatCard
          label="Invoice belum lunas"
          value={unpaidInvoices.count ?? 0}
          hint="Status draft atau terkirim"
          href="/admin/invoice"
        />
        <StatCard
          label="Testimoni menunggu"
          value={pendingTestimonials.count ?? 0}
          hint="Belum dimoderasi"
          href="/admin/testimoni"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-chrome">
                Order terbaru
              </h2>
              <p className="text-xs text-dim">6 order terakhir yang masuk.</p>
            </div>
            <Link
              href="/admin/order"
              className="text-xs font-semibold text-electric-soft hover:text-chrome"
            >
              Lihat semua
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada order"
                description="Buat order pertama dari menu Order Servis."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tiket</th>
                    <th className="px-5 py-3 font-semibold">Pelanggan</th>
                    <th className="px-5 py-3 font-semibold">Perangkat</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Estimasi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-white/8">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/order/${order.id}`}
                          className="font-mono text-xs text-electric-soft hover:text-chrome"
                        >
                          {order.ticket_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-chrome">
                        {order.customer?.full_name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-dim">
                        {order.device
                          ? `${order.device.brand} ${order.device.model}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <ServiceStatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-dim">
                        {formatDateTime(order.estimated_finish_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-chrome">
                  Stok menipis
                </h2>
                <p className="text-xs text-dim">
                  Stok aktif yang sudah menyentuh batas minimum.
                </p>
              </div>
              <Link
                href="/admin/sparepart"
                className="text-xs font-semibold text-electric-soft hover:text-chrome"
              >
                Kelola
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-200">
                Semua stok sparepart masih di atas batas minimum.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lowStock.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-chrome">
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] text-dim">
                        {item.sku}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs">
                      <span className="block font-semibold text-red-200">
                        {item.stock_quantity} tersisa
                      </span>
                      <span className="text-dim">min. {item.min_stock}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-chrome">
                Invoice terbaru
              </h2>
              <Link
                href="/admin/invoice"
                className="text-xs font-semibold text-electric-soft hover:text-chrome"
              >
                Lihat
              </Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="px-5 py-6 text-sm text-dim">Belum ada invoice.</p>
            ) : (
              <ul className="divide-y divide-white/8">
                {recentInvoices.map((invoice) => (
                  <li key={invoice.id} className="px-5 py-3">
                    <Link
                      href={`/admin/invoice/${invoice.id}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-xs text-electric-soft">
                          {invoice.invoice_number}
                        </span>
                        <span className="text-[11px] text-dim">
                          {invoice.order?.ticket_number ?? "—"}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold text-chrome">
                          {formatRupiah(invoice.total_amount)}
                        </span>
                        <InvoiceStatusBadge status={invoice.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sedang dikerjakan"
          value={inProgress.count ?? 0}
          hint="Order di meja teknisi"
          href="/admin/order"
        />
        <StatCard
          label="Order aktif total"
          value={activeOrders.count ?? 0}
          hint="Belum selesai/diambil"
          href="/admin/order"
        />
        <StatCard
          label="Garansi"
          value="Kelola"
          hint="Cek masa berlaku garansi servis"
          href="/admin/garansi"
        />
      </div>
    </>
  );
}
