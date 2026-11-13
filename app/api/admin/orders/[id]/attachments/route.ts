import { canAccessOrder } from "@/lib/admin/order-access";
import {
  ATTACHMENT_BUCKET,
  ATTACHMENT_KINDS,
  MAX_ATTACHMENTS_PER_KIND,
  MAX_ATTACHMENT_BYTES,
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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .select("assigned_technician_id")
    .eq("id", orderId)
    .maybeSingle();

  const mappedOrder = dbErrorResponse(orderError);
  if (mappedOrder) return mappedOrder;
  if (!order) return jsonError("Order tidak ditemukan", 404);
  if (!canAccessOrder(session.role, session.userId, order)) {
    return jsonError("Akses ditolak", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_ATTACHMENT_BYTES + 64 * 1024) {
    return jsonError("Ukuran foto maksimal 5 MB.", 413);
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

  // shortcut: hitung-lalu-simpan bisa balapan pada unggahan paralel, jadi
  // batas 6 bisa lewat 1–2. Tambah lock/trigger kalau ini jadi masalah.
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
  // Storage diakses dengan service role setelah otorisasi di atas, supaya
  // pembersihan berkas tidak bergantung pada policy Storage.
  const storage = createSupabaseAdminClient();
  const { error: uploadError } = await storage.storage
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
    const { error: cleanupError } = await storage.storage
      .from(ATTACHMENT_BUCKET)
      .remove([path]);
    if (cleanupError) console.error("bersihkan foto gagal:", cleanupError);
    return dbErrorResponse(error) ?? jsonError("Gagal menyimpan foto", 400);
  }

  return jsonOk(data, 201);
}
