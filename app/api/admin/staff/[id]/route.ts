import {
  PRESETS,
  permissionsToRows,
  type PermissionRow,
  type PresetKey,
} from "@/lib/admin/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { staffUpdateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import {
  removeStaffPermissions,
  replaceStaffPermissions,
} from "@/lib/supabase/staff";

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

function resolveRows(input: {
  preset?: PresetKey;
  permissions?: {
    module: PermissionRow["module"];
    can_view: boolean;
    can_manage: boolean;
    can_delete: boolean;
    can_view_cost?: boolean;
  }[];
}): PermissionRow[] {
  if (input.permissions) {
    return input.permissions.map((row) => ({
      module: row.module,
      can_view: row.can_view,
      can_manage: row.can_manage,
      can_delete: row.can_delete,
      can_view_cost: row.can_view_cost ?? false,
    }));
  }
  return permissionsToRows(PRESETS[input.preset ?? "teknisi"].permissions);
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
  const wantsPermissions =
    body.data.permissions !== undefined || body.data.preset !== undefined;

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

  if (target.role === "owner" && wantsPermissions) {
    return jsonError("Owner selalu punya akses penuh.", 400);
  }

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

  const profilePatch: { role?: "owner" | "admin"; is_active?: boolean } = {};
  if (body.data.role !== undefined) profilePatch.role = body.data.role;
  if (body.data.is_active !== undefined) {
    profilePatch.is_active = body.data.is_active;
  }

  let profile: {
    id: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  } | null = null;

  if (Object.keys(profilePatch).length > 0) {
    const { data, error } = await admin
      .from("profiles")
      .update(profilePatch)
      .eq("id", targetId)
      .select("id, full_name, role, is_active, created_at")
      .maybeSingle();

    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
    if (!data) return jsonError("Staf tidak ditemukan", 404);
    profile = data;
  }

  const becomesOwner = body.data.role === "owner";
  if (becomesOwner) {
    const { error } = await removeStaffPermissions(admin, targetId);
    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
  } else if (wantsPermissions) {
    const rows = resolveRows(body.data);
    const { error } = await replaceStaffPermissions(
      admin,
      targetId,
      rows,
      session.userId,
    );
    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
  }

  if (!profile) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, role, is_active, created_at")
      .eq("id", targetId)
      .maybeSingle();
    const mapped = dbErrorResponse(error);
    if (mapped) return mapped;
    profile = data;
  }

  return jsonOk(profile);
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
