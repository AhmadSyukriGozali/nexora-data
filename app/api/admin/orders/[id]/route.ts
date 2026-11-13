import { logAudit } from "@/lib/admin/audit";
import {
  canAccessOrder,
  canCreateOrders,
  orderFieldAllowed,
} from "@/lib/admin/order-access";
import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { orderUpdateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ORDER_SELECT =
  "*, customer:customers(full_name, phone), device:devices(device_type, brand, model), technician:profiles!assigned_technician_id(full_name)";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_orders")
    .select(ORDER_SELECT)
    .eq("id", parsedId.data)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Order servis tidak ditemukan", 404);
  if (!canAccessOrder(session.role, session.userId, data)) {
    return jsonError("Order servis tidak ditemukan", 404);
  }

  return jsonOk(data);
}

export async function PATCH(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "manage");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, orderUpdateSchema);
  if ("error" in body) return body.error;
  if (Object.keys(body.data).length === 0) {
    return jsonError("Tidak ada field untuk diubah", 422);
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from("service_orders")
    .select("id, assigned_technician_id")
    .eq("id", parsedId.data)
    .maybeSingle<{ id: string; assigned_technician_id: string | null }>();

  const currentMapped = dbErrorResponse(currentError);
  if (currentMapped) return currentMapped;
  if (!current || !canAccessOrder(session.role, session.userId, current)) {
    return jsonError("Order servis tidak ditemukan", 404);
  }

  const forbiddenFields = Object.keys(body.data).filter(
    (field) => !orderFieldAllowed(session.role, field),
  );
  if (forbiddenFields.length > 0) {
    return jsonError("Field tidak boleh diubah untuk role ini.", 403);
  }

  const { data, error } = await supabase
    .from("service_orders")
    .update(body.data)
    .eq("id", parsedId.data)
    .select(ORDER_SELECT)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Order servis tidak ditemukan", 404);

  return jsonOk(data);
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "delete");
  if (forbidden) return forbidden;

  if (!canCreateOrders(session.role)) {
    return jsonError("Teknisi tidak boleh menghapus order.", 403);
  }

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_orders")
    .delete()
    .eq("id", parsedId.data)
    .select("id, ticket_number")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Order servis tidak ditemukan", 404);

  await logAudit({
    action: "order.delete",
    entity: "service_orders",
    entityId: data.id,
    metadata: { ticket_number: data.ticket_number },
  });

  return jsonOk({ deleted: true, id: data.id });
}
