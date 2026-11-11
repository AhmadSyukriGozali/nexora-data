import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { sparepartCreateSchema, sparepartsQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getSparepartCostMap,
  setSparepartCost,
} from "@/lib/supabase/sparepart-costs";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Tambahkan cost_price hanya untuk owner; admin tidak pernah menerimanya. */
async function attachCosts(
  supabase: ServerClient,
  rows: Record<string, unknown>[],
) {
  const costs = await getSparepartCostMap(
    supabase,
    rows.map((row) => String(row.id)),
  );

  return rows.map((row) => ({
    ...row,
    cost_price: costs.get(String(row.id)) ?? 0,
  }));
}

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, sparepartsQuerySchema);
  if ("error" in query) return query.error;

  const { search, is_active, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("spareparts")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) builder = builder.ilike("name", `%${search}%`);
  if (is_active) builder = builder.eq("is_active", is_active === "true");

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  const rows = (data ?? []) as Record<string, unknown>[];
  const items = session.role === "owner" ? await attachCosts(supabase, rows) : rows;

  return jsonOk({ items, total: count ?? 0, limit, offset });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "spareparts", "manage");
  if (forbidden) return forbidden;

  const body = await parseBody(request, sparepartCreateSchema);
  if ("error" in body) return body.error;

  const { cost_price, ...payload } = body.data;

  if (cost_price !== undefined && session.role !== "owner") {
    return jsonError("Hanya owner yang boleh mengatur harga modal", 403);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spareparts")
    .insert(payload)
    .select("*")
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Gagal menyimpan sparepart", 500);

  if (cost_price !== undefined) {
    const { error: costError } = await setSparepartCost(
      supabase,
      String(data.id),
      cost_price,
    );
    const costMapped = dbErrorResponse(costError);
    if (costMapped) return costMapped;
    return jsonOk({ ...data, cost_price }, 201);
  }

  return jsonOk(data, 201);
}
