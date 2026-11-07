import { createSupabaseServerClient } from "./server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Harga modal hanya bisa dibaca owner (RLS). Untuk staf lain peta kosong,
 * jadi pemanggil tidak pernah menerima nilainya.
 */
export async function getSparepartCostMap(
  supabase: ServerClient,
  sparepartIds: string[],
): Promise<Map<string, number>> {
  if (sparepartIds.length === 0) return new Map();

  const { data } = await supabase
    .from("sparepart_costs")
    .select("sparepart_id, cost_price")
    .in("sparepart_id", sparepartIds);

  return new Map(
    (data ?? []).map((row) => [
      String(row.sparepart_id),
      Number(row.cost_price),
    ]),
  );
}

/** Simpan/perbarui harga modal. Hanya owner yang lolos RLS tabel ini. */
export async function setSparepartCost(
  supabase: ServerClient,
  sparepartId: string,
  costPrice: number,
): Promise<{ error: { message: string; code?: string | null } | null }> {
  const { error } = await supabase
    .from("sparepart_costs")
    .upsert(
      { sparepart_id: sparepartId, cost_price: costPrice },
      { onConflict: "sparepart_id" },
    );

  return { error };
}
