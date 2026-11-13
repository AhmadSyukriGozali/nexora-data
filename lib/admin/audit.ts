import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Catat aksi sensitif ke `audit_logs`. Kegagalan audit hanya dilog ke server
 * agar aksi utama tidak ikut gagal karena masalah pencatatan.
 */
export async function logAudit(input: {
  action: string;
  entity: string;
  entityId: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    metadata: input.metadata ?? {},
  });

  if (error) console.error("audit log gagal:", error);
}
