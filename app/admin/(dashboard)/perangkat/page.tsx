import { PageHeader } from "@/components/admin/ui";
import type { CustomerOption, Device } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { DeviceManager } from "./device-manager";

export const instant = false;

export const metadata = { title: "Perangkat" };

export default async function DevicesPage() {
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const [devicesResult, customersResult] = await Promise.all([
    supabase
      .from("devices")
      .select("*, customer:customers(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("customers")
      .select("id, full_name, phone")
      .order("full_name", { ascending: true })
      .limit(500),
  ]);

  return (
    <>
      <PageHeader
        title="Perangkat"
        description="Perangkat milik pelanggan. Satu perangkat bisa dipakai untuk beberapa order servis."
      />
      <DeviceManager
        devices={(devicesResult.data ?? []) as Device[]}
        customers={(customersResult.data ?? []) as CustomerOption[]}
        canDelete={session?.role === "owner"}
      />
    </>
  );
}
