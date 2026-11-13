import { PageHeader } from "@/components/admin/ui";
import { can } from "@/lib/admin/access";
import { canCreateOrders } from "@/lib/admin/order-access";
import { requireStaffPage } from "@/lib/admin/guard";
import type { CustomerOption, Device, Order } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { OrderManager } from "./order-manager";

export const instant = false;

export const metadata = { title: "Order Servis" };

export default async function OrdersPage() {
  const session = await requireStaffPage("orders");
  const supabase = await createSupabaseServerClient();

  const [ordersResult, customersResult, devicesResult] = await Promise.all([
    supabase
      .from("service_orders")
      .select(
        "*, customer:customers(full_name, phone), device:devices(device_type, brand, model), technician:profiles!assigned_technician_id(full_name)",
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
        canDelete={can(session.permissions, "orders", "delete")}
        canCreate={canCreateOrders(session.role)}
      />
    </>
  );
}
