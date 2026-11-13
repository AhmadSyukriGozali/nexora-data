import { canAccessOrder } from "@/lib/admin/order-access";
import { canTransitionOrder } from "@/lib/admin/status-flow";
import { getStaffSession, isOwner, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { orderStatusSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

/**
 * Satu-satunya jalur perubahan status. Fungsi database
 * `change_order_status` mengubah order + menulis riwayat secara atomik.
 */
export async function POST(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "manage");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, orderStatusSchema);
  if ("error" in body) return body.error;

  if (body.data.status === "batal" && !isOwner(session)) {
    return jsonError("Hanya owner yang boleh membatalkan order.", 403);
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from("service_orders")
    .select("status, assigned_technician_id")
    .eq("id", parsedId.data)
    .maybeSingle<{ status: string; assigned_technician_id: string | null }>();

  const currentMapped = dbErrorResponse(currentError);
  if (currentMapped) return currentMapped;
  if (!current || !canAccessOrder(session.role, session.userId, current)) {
    return jsonError("Order tidak ditemukan", 404);
  }

  const from = current.status as Parameters<typeof canTransitionOrder>[0];
  const to = body.data.status;
  if (from !== to && !canTransitionOrder(from, to)) {
    return jsonError(
      `Status tidak bisa berpindah dari ${from} ke ${to}.`,
      422,
    );
  }

  const { data, error } = await supabase.rpc("change_order_status", {
    p_order_id: parsedId.data,
    p_new_status: body.data.status,
    p_note: body.data.note ?? null,
  });

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data);
}
