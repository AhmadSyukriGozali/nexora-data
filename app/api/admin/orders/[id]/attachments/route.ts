import { canAccessOrder } from "@/lib/admin/order-access";
import {
  ATTACHMENT_BUCKET,
  ATTACHMENT_KINDS,
  MAX_ATTACHMENTS_PER_KIND,
  attachmentPath,
  validateAttachment,
  type AttachmentKind,
} from "@/lib/admin/attachments";
import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import {
  dbErrorResponse,
  jsonError,
  jsonOk,
} from "@/lib/supabase/http";
import { uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "manage");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);
  const orderId = parsedId.data;

  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase
    .from("service_orders")
    .select("assigned_technician_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return jsonError("Order tidak ditemukan", 404);
  if (!canAccessOrder(session.role, session.userId, order)) {
    return jsonError("Akses ditolak", 403);
  }

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Body harus form-data yang valid", 400);

  const rawKind = String(form.get("kind") ?? "");
  if (!ATTACHMENT_KINDS.includes(rawKind as AttachmentKind)) {
    return jsonError("Jenis foto tidak valid", 422);
  }
  const kind = rawKind as AttachmentKind;

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Berkas foto wajib diisi", 422);

  const invalid = validateAttachment(file);
  if (invalid) return jsonError(invalid, 422);

  const { count } = await supabase
    .from("service_attachments")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId)
    .eq("kind", kind);

  if ((count ?? 0) >= MAX_ATTACHMENTS_PER_KIND) {
    return jsonError(
      `Maksimal ${MAX_ATTACHMENTS_PER_KIND} foto per jenis untuk satu order.`,
      409,
    );
  }

  const path = attachmentPath(orderId, kind, file.type);
  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return jsonError(uploadError.message, 400);

  const { data, error } = await supabase
    .from("service_attachments")
    .insert({
      order_id: orderId,
      kind,
      storage_path: path,
      uploaded_by: session.userId,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([path]);
    return dbErrorResponse(error) ?? jsonError("Gagal menyimpan foto", 400);
  }

  return jsonOk(data, 201);
}
