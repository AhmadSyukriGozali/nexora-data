import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { invoiceCreateSchema, invoicesQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const INVOICE_SELECT = "*, invoice_items(*), payments(*)";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, invoicesQuerySchema);
  if ("error" in query) return query.error;

  const { status, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("invoices")
    .select(INVOICE_SELECT, { count: "exact" })
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) builder = builder.eq("status", status);

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "invoices", "manage");
  if (forbidden) return forbidden;

  const body = await parseBody(request, invoiceCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert(body.data)
    .select(INVOICE_SELECT)
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data, 201);
}
