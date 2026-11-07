import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { staffUpdateSchema, uuidParamSchema } from "@/lib/supabase/schemas";

type Context = { params: Promise<{ id: string }> };

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/** Owner aktif lain di luar `excludeId`, untuk mencegah sistem tanpa owner. */
async function hasAnotherActiveOwner(
  admin: AdminClient,
  excludeId: string,
): Promise<{ allowed: boolean; error: { message: string; code?: string | null } | null }> {
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("is_active", true)
    .neq("id", excludeId);

  return { allowed: !error && (count ?? 0) > 0, error };
}

export async function PATCH(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, staffUpdateSchema);
  if ("error" in body) return body.error;
  if (Object.keys(body.data).length === 0) {
    return jsonError("Tidak ada field untuk diubah", 422);
  }

  const targetId = parsedId.data;

  if (
    targetId === session.userId &&
    (body.data.role === "admin" || body.data.is_active === false)
  ) {
    return jsonError(
      "Tidak bisa menurunkan role atau menonaktifkan akun sendiri.",
      400,
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", targetId)
    .maybeSingle<{ role: string; is_active: boolean }>();

  const targetMapped = dbErrorResponse(targetError);
  if (targetMapped) return targetMapped;
  if (!target) return jsonError("Staf tidak ditemukan", 404);

  const removesOwner =
    target.role === "owner" &&
    (body.data.role === "admin" || body.data.is_active === false);

  if (removesOwner) {
    const { allowed, error: ownerError } = await hasAnotherActiveOwner(
      admin,
      targetId,
    );
    const ownerMapped = dbErrorResponse(ownerError);
    if (ownerMapped) return ownerMapped;
    if (!allowed) {
      return jsonError("Harus ada minimal satu owner aktif.", 400);
    }
  }

  const { data, error } = await admin
    .from("profiles")
    .update(body.data)
    .eq("id", targetId)
    .select("id, full_name, role, is_active, created_at")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Staf tidak ditemukan", 404);

  return jsonOk(data);
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const targetId = parsedId.data;

  if (targetId === session.userId) {
    return jsonError("Tidak bisa menghapus akun sendiri.", 400);
  }

  const admin = createSupabaseAdminClient();
  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetId)
    .maybeSingle<{ role: string }>();

  const targetMapped = dbErrorResponse(targetError);
  if (targetMapped) return targetMapped;
  if (!target) return jsonError("Staf tidak ditemukan", 404);

  if (target.role === "owner") {
    const { allowed, error: ownerError } = await hasAnotherActiveOwner(
      admin,
      targetId,
    );
    const ownerMapped = dbErrorResponse(ownerError);
    if (ownerMapped) return ownerMapped;
    if (!allowed) {
      return jsonError("Harus ada minimal satu owner aktif.", 400);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(targetId);
  if (error) {
    return jsonError(error.message || "Gagal menghapus akun staf.", 400);
  }

  return jsonOk({ deleted: true, id: targetId });
}
