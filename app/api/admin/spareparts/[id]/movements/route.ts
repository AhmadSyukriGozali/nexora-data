import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { paginationQuerySchema, stockMovementCreateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const query = parseQuery(request, paginationQuerySchema);
  if ("error" in query) return query.error;

  const { limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  const { data, error, count } = await supabase
    .from("stock_movements")
    .select("*, staff:profiles(full_name)", { count: "exact" })
    .eq("sparepart_id", parsedId.data)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, stockMovementCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();

  const { data: movement, error } = await supabase
    .from("stock_movements")
    .insert({ ...body.data, sparepart_id: parsedId.data })
    .select("*")
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  const { data: sparepart, error: sparepartError } = await supabase
    .from("spareparts")
    .select("id, stock_quantity")
    .eq("id", parsedId.data)
    .maybeSingle();

  const sparepartMapped = dbErrorResponse(sparepartError);
  if (sparepartMapped) return sparepartMapped;

  return jsonOk(
    {
      movement,
      stock_quantity: sparepart?.stock_quantity ?? null,
    },
    201,
  );
}
