import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { customerCreateSchema, customersQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, customersQuerySchema);
  if ("error" in query) return query.error;

  const { search, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    builder = builder.ilike("full_name", `%${search}%`);
  }

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const body = await parseBody(request, customerCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(body.data)
    .select("*")
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data, 201);
}
