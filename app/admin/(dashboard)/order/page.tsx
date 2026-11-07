import { PageHeader } from "@/components/admin/ui";
import type { CustomerOption, Device, Order } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { OrderManager } from "./order-manager";

export const instant = false;

export const metadata = { title: "Order Servis" };

export default async function OrdersPage() {
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const [ordersResult, customersResult, devicesResult] = await Promise.all([
    supabase
      .from("service_orders")
      .select(
        "*, customer:customers(full_name, phone), device:devices(device_type, brand, model)",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("customers")
      .select("id, full_name, phone")
      .order("full_name", { ascending: true })
      .limit(500),
    supabase
      .from("devices")
      .select(
        "id, customer_id, device_type, brand, model, serial_number, notes, created_at",
      )
      .order("brand", { ascending: true })
      .limit(500),
  ]);

  return (
    <>
      <PageHeader
        title="Order Servis"
        description="Kelola tiket servis: catat keluhan, pilih perangkat, lalu pantau status dan riwayatnya."
      />
      <OrderManager
        orders={(ordersResult.data ?? []) as Order[]}
        customers={(customersResult.data ?? []) as CustomerOption[]}
        devices={(devicesResult.data ?? []) as Device[]}
        canDelete={session?.role === "owner"}
      />
    </>
  );
}
