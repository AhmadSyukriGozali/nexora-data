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

  const [usersResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("profiles")
      .select("id, full_name, role, is_active, created_at"),
  ]);

  if (usersResult.error) {
    return { members: [], error: usersResult.error.message };
  }
  if (profilesResult.error) {
    return { members: [], error: profilesResult.error.message };
  }

  const emailById = new Map(
    usersResult.data.users.map((user) => [user.id, user.email ?? null]),
  );

  const members: StaffMember[] = (profilesResult.data ?? []).map((row) => ({
    id: String(row.id),
    email: emailById.get(String(row.id)) ?? null,
    full_name: String(row.full_name ?? ""),
    role: row.role as StaffRole,
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at),
  }));

  members.sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.full_name.localeCompare(b.full_name, "id");
  });

  return { members, error: null };
}
