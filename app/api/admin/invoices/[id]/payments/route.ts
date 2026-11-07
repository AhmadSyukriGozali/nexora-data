import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { paginationQuerySchema, paymentCreateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
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
    .from("payments")
    .select("*", { count: "exact" })
    .eq("invoice_id", parsedId.data)
    .order("paid_at", { ascending: false })
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

  const body = await parseBody(request, paymentCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({ ...body.data, invoice_id: parsedId.data })
    .select("*")
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data, 201);
}
