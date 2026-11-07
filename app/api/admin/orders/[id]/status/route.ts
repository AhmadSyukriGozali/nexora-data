import { getStaffSession } from "@/lib/supabase/auth";
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

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, orderStatusSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("change_order_status", {
    p_order_id: parsedId.data,
    p_new_status: body.data.status,
    p_note: body.data.note ?? null,
  });

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;

  return jsonOk(data);
}
