import { logAudit } from "@/lib/admin/audit";
import { ATTACHMENT_BUCKET } from "@/lib/admin/attachments";
import { getStaffSession, requirePermission } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk } from "@/lib/supabase/http";
import { uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "orders", "manage");
  if (forbidden) return forbidden;

  if (session.role === "teknisi") {
    return jsonError("Hanya owner/admin yang boleh menghapus foto.", 403);
  }

  const rawParams = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawParams.id);
  const parsedAttachmentId = uuidParamSchema.safeParse(rawParams.attachmentId);
  if (!parsedId.success || !parsedAttachmentId.success) {
    return jsonError("ID tidak valid", 422);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_attachments")
    .select("id, storage_path")
    .eq("id", parsedAttachmentId.data)
    .eq("order_id", parsedId.data)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Foto tidak ditemukan", 404);

  // Berkas dihapus lebih dulu supaya tidak ada objek yatim tanpa baris metadata.
  const { error: removeError } = await createSupabaseAdminClient()
    .storage.from(ATTACHMENT_BUCKET)
    .remove([data.storage_path]);

  if (removeError) return jsonError("Gagal menghapus berkas foto", 400);

  const { error: deleteError } = await supabase
    .from("service_attachments")
    .delete()
    .eq("id", data.id);

  const mappedDelete = dbErrorResponse(deleteError);
  if (mappedDelete) return mappedDelete;

  await logAudit({
    action: "attachment.delete",
    entity: "service_attachment",
    entityId: data.id,
    metadata: { order_id: parsedId.data },
  });

  return jsonOk({ deleted: true });
}
