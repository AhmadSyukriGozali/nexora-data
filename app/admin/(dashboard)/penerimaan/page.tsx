import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/ui";
import { requireStaffPage } from "@/lib/admin/guard";
import { canCreateOrders } from "@/lib/admin/order-access";
import type { CustomerOption, Device } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PenerimaanManager } from "./penerimaan-manager";

export const instant = false;

export const metadata = { title: "Penerimaan Unit" };

export default async function PenerimaanPage() {
  const session = await requireStaffPage("orders", "manage");
  // Teknisi mengerjakan order, bukan menerima unit baru.
  if (!canCreateOrders(session.role)) redirect("/admin/order");

  const supabase = await createSupabaseServerClient();

  const [customersResult, devicesResult] = await Promise.all([
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
        title="Penerimaan Unit"
        description="Meja terima: pilih pelanggan, daftarkan perangkat, catat keluhan dan bawaan, lalu buat tiket servis."
      />
      <PenerimaanManager
        customers={(customersResult.data ?? []) as CustomerOption[]}
        devices={(devicesResult.data ?? []) as Device[]}
      />
    </>
  );
}
