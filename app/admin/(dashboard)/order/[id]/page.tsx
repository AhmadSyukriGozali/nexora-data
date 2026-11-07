import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  PageHeader,
  ServiceStatusBadge,
} from "@/components/admin/ui";
import {
  deviceTypeLabels,
  formatDateTime,
  formatRupiah,
  serviceStatusLabels,
} from "@/lib/admin/format";
import type { Order, OrderHistory } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { OrderDetailManager } from "./order-detail-manager";

export const instant = false;

export const metadata = { title: "Detail Order" };

type Context = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Context) {
  const { id } = await params;
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const { data: orderData } = await supabase
    .from("service_orders")
    .select("*, customer:customers(*), device:devices(*)")
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

  return (
    <>
      <PageHeader
        title={`Order ${order.ticket_number}`}
        description={`Dibuat ${formatDateTime(order.created_at)} · Status saat ini: ${
          serviceStatusLabels[order.status]
        }`}
      >
        <Link
          href="/admin/order"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-chrome transition-colors hover:border-white/40"
        >
          Kembali
        </Link>
        {invoice ? (
          <Link
            href={`/admin/invoice/${invoice.id}`}
            className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-electric-soft"
          >
            Lihat invoice
          </Link>
        ) : null}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg font-bold text-chrome">
              Informasi order
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Pelanggan
                </p>
                <p className="mt-1 text-sm text-chrome">
                  {order.customer?.full_name ?? "—"}
                </p>
                <p className="text-xs text-dim">
                  {order.customer?.phone ?? "—"}
                  {order.customer?.email ? ` · ${order.customer.email}` : ""}
                </p>
                {order.customer?.address ? (
                  <p className="mt-1 text-xs text-dim">
                    {order.customer.address}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Perangkat
                </p>
                <p className="mt-1 text-sm text-chrome">
                  {order.device
                    ? `${order.device.brand} ${order.device.model}`
                    : "—"}
                </p>
                <p className="text-xs text-dim">
                  {order.device
                    ? deviceTypeLabels[order.device.device_type]
                    : "—"}
                  {order.device?.serial_number
                    ? ` · SN ${order.device.serial_number}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Estimasi selesai
                </p>
                <p className="mt-1 text-sm text-chrome">
                  {formatDateTime(order.estimated_finish_at)}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Estimasi biaya
                </p>
                <p className="mt-1 text-sm font-semibold text-chrome">
                  {formatRupiah(order.total_amount)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Keluhan
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-chrome">
                  {order.complaint}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                  Diagnosa
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-chrome">
                  {order.diagnosis ?? "—"}
                </p>
              </div>
              {order.device?.notes ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-dim">
                    Catatan perangkat
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-chrome">
                    {order.device.notes}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold text-chrome">
              Riwayat status
            </h2>
            <p className="text-xs text-dim">
              Catatan append-only dari setiap perubahan status.
            </p>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-dim">
                Belum ada riwayat perubahan status.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {history.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-electric" />
                    <div className="min-w-0 flex-1 border-b border-white/8 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <ServiceStatusBadge status={entry.to_status} />
                        <span className="text-xs text-dim">
                          {formatDateTime(entry.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-dim">
                        Dari{" "}
                        {entry.from_status
                          ? serviceStatusLabels[entry.from_status]
                          : "awal"}{" "}
                        · oleh {entry.staff?.full_name || "staf"}
                      </p>
                      {entry.note ? (
                        <p className="mt-1 whitespace-pre-line text-sm text-chrome">
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
          canDelete={session?.role === "owner"}
          hasInvoice={Boolean(invoice)}
        />
      </div>
    </>
  );
}
