import { PageHeader } from "@/components/admin/ui";
import type { Invoice, OrderOption } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { InvoiceManager } from "./invoice-manager";

export const instant = false;

export const metadata = { title: "Invoice" };

export default async function InvoicesPage() {
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const [invoicesResult, ordersResult] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "*, order:service_orders(ticket_number, customer:customers(full_name))",
      )
      .order("issued_at", { ascending: false })
      .limit(200),
    supabase
      .from("service_orders")
      .select("id, ticket_number, customer:customers(full_name)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const invoices = (invoicesResult.data ?? []) as Invoice[];
  const invoicedOrderIds = new Set(invoices.map((invoice) => invoice.order_id));

  const availableOrders = (
    (ordersResult.data ?? []) as unknown as OrderOption[]
  ).filter((order) => !invoicedOrderIds.has(order.id));

  return (
    <>
      <PageHeader
        title="Invoice"
        description="Buat tagihan dari order servis, catat item, lalu input pembayaran. Total dihitung otomatis oleh database."
      />
      <InvoiceManager
        invoices={invoices}
        availableOrders={availableOrders}
        canDelete={session?.role === "owner"}
      />
    </>
  );
}
