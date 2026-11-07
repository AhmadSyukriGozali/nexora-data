import { PageHeader } from "@/components/admin/ui";
import type { OrderOption, Warranty } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { WarrantyManager } from "./warranty-manager";

export const instant = false;

export const metadata = { title: "Garansi" };

export default async function WarrantiesPage() {
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const [warrantiesResult, ordersResult] = await Promise.all([
    supabase
      .from("service_warranties")
      .select(
        "*, order:service_orders(ticket_number, customer:customers(full_name))",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("service_orders")
      .select("id, ticket_number, customer:customers(full_name)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const warranties = (warrantiesResult.data ?? []) as Warranty[];
  const warrantedOrderIds = new Set(
    warranties.map((warranty) => warranty.order_id),
  );

  const availableOrders = (
    (ordersResult.data ?? []) as unknown as OrderOption[]
  ).filter((order) => !warrantedOrderIds.has(order.id));

  return (
    <>
      <PageHeader
        title="Garansi"
        description="Catat masa garansi untuk order servis. Tanggal berakhir dihitung otomatis dari durasi hari."
      />
      <WarrantyManager
        warranties={warranties}
        availableOrders={availableOrders}
        canDelete={session?.role === "owner"}
      />
    </>
  );
}
