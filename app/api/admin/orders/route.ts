import { canCreateOrders } from "@/lib/admin/order-access";
import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody, parseQuery } from "@/lib/supabase/http";
import { orderCreateSchema, ordersQuerySchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ORDER_SELECT =
  "*, customer:customers(full_name, phone), device:devices(device_type, brand, model), technician:profiles!assigned_technician_id(full_name)";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const query = parseQuery(request, ordersQuerySchema);
  if ("error" in query) return query.error;

  const { status, customer_id, limit, offset } = query.data;
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("service_orders")
    .select(ORDER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) builder = builder.eq("status", status);
  if (customer_id) builder = builder.eq("customer_id", customer_id);
  if (session.role === "teknisi") {
    builder = builder.eq("assigned_technician_id", session.userId);
  }

  const { data, error, count } = await builder;

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "manage");
  if (forbidden) return forbidden;

  if (!canCreateOrders(session.role)) {
    return jsonError("Hanya owner/admin yang boleh membuat order.", 403);
  }

  const body = await parseBody(request, orderCreateSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_orders")
    .insert(body.data)
    .select(ORDER_SELECT)
    .single();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data, 201);
}
