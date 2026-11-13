import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonGhost, buttonPrimary } from "@/components/admin/form-controls";
import {
  Card,
  PageHeader,
  ServiceStatusBadge,
} from "@/components/admin/ui";
import { can } from "@/lib/admin/access";
import {
  deviceTypeLabels,
  formatDateTime,
  formatRupiah,
  serviceStatusLabels,
} from "@/lib/admin/format";
import { requireStaffPage } from "@/lib/admin/guard";
import type { Order, OrderHistory } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { OrderDetailManager } from "./order-detail-manager";

export const instant = false;

export const metadata = { title: "Detail Order" };

type Context = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Context) {
  const { id } = await params;
  const session = await requireStaffPage("orders");
  const supabase = await createSupabaseServerClient();

  const { data: orderData } = await supabase
    .from("service_orders")
    .select(
      "*, customer:customers(*), device:devices(*), technician:profiles!assigned_technician_id(full_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!orderData) notFound();

  const order = orderData as Order;

  const [historyResult, invoiceResult] = await Promise.all([
    supabase
      .from("service_status_history")
      .select("*, staff:profiles(full_name)")
      .eq("order_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("invoices")
      .select("id, invoice_number, status")
      .eq("order_id", id)
      .maybeSingle(),
  ]);

  const history = (historyResult.data ?? []) as OrderHistory[];
  const invoice = invoiceResult.data as {
    id: string;
    invoice_number: string;
    status: string;
  } | null;

  const canAssign = session.role !== "teknisi";
  const technicians = canAssign
    ? ((
        await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "teknisi")
          .eq("is_active", true)
          .order("full_name", { ascending: true })
      ).data ?? [])
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Order servis"
        title={`Order ${order.ticket_number}`}
        description={`Dibuat ${formatDateTime(order.created_at)} · Status saat ini: ${
          serviceStatusLabels[order.status]
        }`}
      >
        <Link href="/admin/order" className={buttonGhost}>
          Kembali
        </Link>
        {invoice ? (
          <Link href={`/admin/invoice/${invoice.id}`} className={buttonPrimary}>
            Lihat invoice
          </Link>
        ) : null}
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13.5px] font-semibold">Informasi order</h2>
              <ServiceStatusBadge status={order.status} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Pelanggan
                </p>
                <p className="mt-1 text-sm text-[color:var(--bjork-text)]">
                  {order.customer?.full_name ?? "—"}
                </p>
                <p className="text-xs text-[color:var(--bjork-text-muted)]">
                  {order.customer?.phone ?? "—"}
                  {order.customer?.email ? ` · ${order.customer.email}` : ""}
                </p>
                {order.customer?.address ? (
                  <p className="mt-1 text-xs text-[color:var(--bjork-text-muted)]">
                    {order.customer.address}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Perangkat
                </p>
                <p className="mt-1 text-sm text-[color:var(--bjork-text)]">
                  {order.device
                    ? `${order.device.brand} ${order.device.model}`
                    : "—"}
                </p>
                <p className="text-xs text-[color:var(--bjork-text-muted)]">
                  {order.device
                    ? deviceTypeLabels[order.device.device_type]
                    : "—"}
                  {order.device?.serial_number
                    ? ` · SN ${order.device.serial_number}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Estimasi selesai
                </p>
                <p className="mt-1 text-sm text-[color:var(--bjork-text)]">
                  {formatDateTime(order.estimated_finish_at)}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Estimasi biaya
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--bjork-text)]">
                  {formatRupiah(order.total_amount)}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Teknisi
                </p>
                <p className="mt-1 text-sm text-[color:var(--bjork-text)]">
                  {order.technician?.full_name ?? "Belum ditugaskan"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-[color:var(--bjork-border)] pt-4">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Keluhan
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--bjork-text)]">
                  {order.complaint}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                  Diagnosa
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--bjork-text)]">
                  {order.diagnosis ?? "—"}
                </p>
              </div>
              {order.device?.notes ? (
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-soft)]">
                    Catatan perangkat
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--bjork-text)]">
                    {order.device.notes}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-[13.5px] font-semibold">Riwayat status</h2>
            <p className="mt-0.5 text-[12px] text-[color:var(--bjork-text-muted)]">
              Catatan append-only dari setiap perubahan status.
            </p>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-[color:var(--bjork-text-muted)]">
                Belum ada riwayat perubahan status.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {history.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--bjork-accent)]" />
                    <div className="min-w-0 flex-1 border-b border-[color:var(--bjork-border)] pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <ServiceStatusBadge status={entry.to_status} />
                        <span className="text-xs text-[color:var(--bjork-text-muted)]">
                          {formatDateTime(entry.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--bjork-text-muted)]">
                        Dari{" "}
                        {entry.from_status
                          ? serviceStatusLabels[entry.from_status]
                          : "awal"}{" "}
                        · oleh {entry.staff?.full_name || "staf"}
                      </p>
                      {entry.note ? (
                        <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--bjork-text)]">
                          {entry.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <OrderDetailManager
          order={order}
          canManage={can(session.permissions, "orders", "manage")}
          canDelete={can(session.permissions, "orders", "delete")}
          canCancel={session.role === "owner"}
          hasInvoice={Boolean(invoice)}
          canAssign={canAssign}
          technicians={technicians}
        />
      </div>
    </>
  );
}
