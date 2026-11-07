import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseQuery } from "@/lib/supabase/http";
import { paginationQuerySchema, uuidParamSchema } from "@/lib/supabase/schemas";
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
    .from("service_status_history")
    .select("*, staff:profiles(full_name)", { count: "exact" })
    .eq("order_id", parsedId.data)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}
