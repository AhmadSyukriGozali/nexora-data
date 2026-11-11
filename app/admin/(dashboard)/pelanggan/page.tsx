import { PageHeader } from "@/components/admin/ui";
import { can } from "@/lib/admin/access";
import { requireStaffPage } from "@/lib/admin/guard";
import type { Customer } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { CustomerManager } from "./customer-manager";

export const instant = false;

export const metadata = { title: "Pelanggan" };

export default async function CustomersPage() {
  const session = await requireStaffPage("customers");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <PageHeader
        title="Pelanggan"
        description="Data kontak pelanggan. Nomor HP disimpan dalam format 0xxx dan dipakai untuk cek status servis."
      />
      <CustomerManager
        customers={(data ?? []) as Customer[]}
        canManage={can(session.permissions, "customers", "manage")}
        canDelete={can(session.permissions, "customers", "delete")}
      />
    </>
  );
}
