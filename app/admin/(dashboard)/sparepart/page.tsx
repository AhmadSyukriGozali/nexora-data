import { PageHeader } from "@/components/admin/ui";
import type {
  OrderOption,
  Sparepart,
  StockMovement,
} from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSparepartCostMap } from "@/lib/supabase/sparepart-costs";

import { SparepartManager } from "./sparepart-manager";

export const instant = false;

export const metadata = { title: "Sparepart" };

export default async function SparepartsPage() {
  const session = await getStaffSession();
  const isOwner = session?.role === "owner";
  const supabase = await createSupabaseServerClient();

  const [sparepartsResult, movementsResult, ordersResult] = await Promise.all([
    supabase
      .from("spareparts")
      .select("*")
      .order("name", { ascending: true })
      .limit(200),
    supabase
      .from("stock_movements")
      .select(
        "*, staff:profiles(full_name), sparepart:spareparts(name, sku), order:service_orders(ticket_number)",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("service_orders")
      .select("id, ticket_number")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const spareparts = (sparepartsResult.data ?? []) as Sparepart[];

  if (isOwner) {
    const costs = await getSparepartCostMap(
      supabase,
      spareparts.map((sparepart) => sparepart.id),
    );
    spareparts.forEach((sparepart) => {
      sparepart.cost_price = costs.get(sparepart.id) ?? 0;
    });
  }

  return (
    <>
      <PageHeader
        title="Sparepart"
        description="Kelola katalog sparepart dan catat pergerakan stok. Stok hanya berubah lewat buku stok, bukan diedit langsung."
      />
      <SparepartManager
        spareparts={spareparts}
        movements={(movementsResult.data ?? []) as StockMovement[]}
        orders={(ordersResult.data ?? []) as OrderOption[]}
        canDelete={isOwner}
        canSeeCost={isOwner}
      />
    </>
  );
}
