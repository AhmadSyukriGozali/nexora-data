import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonGhost, buttonPrimary } from "@/components/admin/form-controls";
import { InvoiceStatusBadge, PageHeader } from "@/components/admin/ui";
import { can } from "@/lib/admin/access";
import { formatDateTime } from "@/lib/admin/format";
import { requireStaffPage } from "@/lib/admin/guard";
import type { InvoiceDetail, Sparepart } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { InvoiceDetailManager } from "./invoice-detail-manager";

export const instant = false;

export const metadata = { title: "Detail Invoice" };

type Context = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Context) {
  const { id } = await params;
  const session = await requireStaffPage("invoices");
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("invoices")
    .select(
      "*, invoice_items(*), payments(*), order:service_orders(ticket_number, customer:customers(full_name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const invoice = data as InvoiceDetail;
  invoice.payments = [...invoice.payments].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime(),
  );

  const { data: spareparts } = await supabase
    .from("spareparts")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(500);

  const orderHref = `/admin/order/${invoice.order_id}`;

  return (
    <>
      <PageHeader
        eyebrow="Invoice"
        title={invoice.invoice_number}
        description={`Diterbitkan ${formatDateTime(invoice.issued_at)}${
          invoice.order?.ticket_number
            ? ` · Order ${invoice.order.ticket_number}`
            : ""
        }${invoice.order?.customer?.full_name ? ` · ${invoice.order.customer.full_name}` : ""}`}
      >
        <InvoiceStatusBadge status={invoice.status} />
        <Link href="/admin/invoice" className={buttonGhost}>
          Kembali
        </Link>
        <Link href={orderHref} className={buttonPrimary}>
          Lihat order
        </Link>
      </PageHeader>

      <InvoiceDetailManager
        invoice={invoice}
        spareparts={(spareparts ?? []) as Sparepart[]}
        canManage={can(session.permissions, "invoices", "manage")}
        canDelete={can(session.permissions, "invoices", "delete")}
        canDeletePayments={session.role === "owner"}
      />
    </>
  );
}
