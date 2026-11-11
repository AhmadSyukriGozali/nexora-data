import type { PermissionRow } from "@/lib/admin/access";
import type { StaffMember, StaffRole } from "@/lib/admin/types";

import { createSupabaseAdminClient } from "./admin";

/**
 * Daftar staf = profil (sumber kebenaran role/status) + email dari auth.users.
 * Memakai service role karena email tidak tersedia lewat tabel profiles.
 * Hanya dipanggil dari server dan sudah dijaga ownerOnly oleh pemanggil.
 */
export async function listStaffMembers(): Promise<{
  members: StaffMember[];
  error: string | null;
}> {
  const admin = createSupabaseAdminClient();

  const [usersResult, profilesResult, permissionsResult] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("profiles")
      .select("id, full_name, role, is_active, created_at"),
    admin
      .from("staff_permissions")
      .select("profile_id, module, can_view, can_manage, can_delete, can_view_cost"),
  ]);

  if (usersResult.error) {
    return { members: [], error: usersResult.error.message };
  }
  if (profilesResult.error) {
    return { members: [], error: profilesResult.error.message };
  }

  const usersById = new Map(
    usersResult.data.users.map((user) => [user.id, user]),
  );

  const permissionsById = new Map<string, PermissionRow[]>();
  if (!permissionsResult.error) {
    for (const row of permissionsResult.data ?? []) {
      const id = String(row.profile_id);
      const list = permissionsById.get(id) ?? [];
      list.push({
        module: row.module as PermissionRow["module"],
        can_view: Boolean(row.can_view),
        can_manage: Boolean(row.can_manage),
        can_delete: Boolean(row.can_delete),
        can_view_cost: Boolean(row.can_view_cost),
      });
      permissionsById.set(id, list);
    }
  }

  const members: StaffMember[] = (profilesResult.data ?? []).map((row) => {
    const user = usersById.get(String(row.id));
    return {
      id: String(row.id),
      email: user?.email ?? null,
      full_name: String(row.full_name ?? ""),
      role: row.role as StaffRole,
      is_active: Boolean(row.is_active),
      created_at: String(row.created_at),
      email_confirmed_at: user?.email_confirmed_at ?? null,
      invited_at: user?.invited_at ?? null,
      last_sign_in_at: user?.last_sign_in_at ?? null,
      permissions: permissionsById.get(String(row.id)) ?? [],
    };
  });

  members.sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.full_name.localeCompare(b.full_name, "id");
  });

  return { members, error: null };
}

/** Ganti seluruh baris izin staf. Dipakai route staf (owner-only). */
export async function replaceStaffPermissions(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  profileId: string,
  rows: PermissionRow[],
  updatedBy: string | null,
): Promise<{ error: { message: string; code?: string | null } | null }> {
  const { error: deleteError } = await admin
    .from("staff_permissions")
    .delete()
    .eq("profile_id", profileId);

  if (deleteError) return { error: deleteError };

  if (rows.length === 0) return { error: null };

  const { error } = await admin.from("staff_permissions").insert(
    rows.map((row) => ({
      profile_id: profileId,
      module: row.module,
      can_view: row.can_view,
      can_manage: row.can_manage,
      can_delete: row.can_delete,
      can_view_cost: row.can_view_cost,
      updated_by: updatedBy,
    })),
  );

  return { error };
}

export async function removeStaffPermissions(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  profileId: string,
): Promise<{ error: { message: string; code?: string | null } | null }> {
  const { error } = await admin
    .from("staff_permissions")
    .delete()
    .eq("profile_id", profileId);
  return { error };
}
