import { getStaffSession } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseQuery } from "@/lib/supabase/http";
import { testimonialsQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, testimonialsQuerySchema);
  if ("error" in query) return query.error;

  const { status, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("testimonials")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) builder = builder.eq("status", status);

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}
