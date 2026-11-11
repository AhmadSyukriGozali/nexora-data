import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { sparepartUpdateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getSparepartCostMap,
  setSparepartCost,
} from "@/lib/supabase/sparepart-costs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spareparts")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Sparepart tidak ditemukan", 404);

  if (session.permissions.spareparts.viewCost) {
    const costs = await getSparepartCostMap(supabase, [String(data.id)]);
    return jsonOk({ ...data, cost_price: costs.get(String(data.id)) ?? 0 });
  }

  return jsonOk(data);
}

export async function PATCH(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "spareparts", "manage");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, sparepartUpdateSchema);
  if ("error" in body) return body.error;

  const { cost_price, ...payload } = body.data;

  if (cost_price !== undefined && session.role !== "owner") {
    return jsonError("Hanya owner yang boleh mengatur harga modal", 403);
  }
  if (Object.keys(payload).length === 0 && cost_price === undefined) {
    return jsonError("Tidak ada field untuk diubah", 422);
  }

  const supabase = await createSupabaseServerClient();

  let sparepart: Record<string, unknown> | null = null;

  if (Object.keys(payload).length > 0) {
    const { data, error } = await supabase
      .from("spareparts")
      .update(payload)
      .eq("id", parsedId.data)
      .select("*")
      .maybeSingle();

    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
    if (!data) return jsonError("Sparepart tidak ditemukan", 404);
    sparepart = data as Record<string, unknown>;
  } else {
    const { data, error } = await supabase
      .from("spareparts")
      .select("*")
      .eq("id", parsedId.data)
      .maybeSingle();

    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
    if (!data) return jsonError("Sparepart tidak ditemukan", 404);
    sparepart = data as Record<string, unknown>;
  }

  if (cost_price !== undefined) {
    const { error: costError } = await setSparepartCost(
      supabase,
      parsedId.data,
      cost_price,
    );
    const costMapped = dbErrorResponse(costError);
    if (costMapped) return costMapped;
    return jsonOk({ ...sparepart, cost_price });
  }

  return jsonOk(sparepart);
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "spareparts", "delete");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spareparts")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Sparepart tidak ditemukan", 404);

  return jsonOk({ deleted: true, id: data.id });
}
