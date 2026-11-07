import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { deviceCreateSchema, devicesQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, devicesQuerySchema);
  if ("error" in query) return query.error;

  const { customer_id, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("devices")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (customer_id) {
    builder = builder.eq("customer_id", customer_id);
  }

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const body = await parseBody(request, deviceCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("devices")
    .insert(body.data)
    .select("*")
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data, 201);
}
