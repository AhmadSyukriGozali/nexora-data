import { NextResponse } from "next/server";

import {
  EMPTY_PERMISSIONS,
  FULL_PERMISSIONS,
  can,
  rowsToPermissions,
  type Module,
  type PermissionAction,
  type PermissionRow,
  type Permissions,
} from "@/lib/admin/access";

import { jsonError } from "./http";
import { createSupabaseServerClient } from "./server";

export type StaffRole = "owner" | "admin";

export type StaffSession = {
  userId: string;
  email: string | null;
  role: StaffRole;
  fullName: string;
  permissions: Permissions;
};

type ProfileRow = {
  role: string;
  full_name: string | null;
  is_active: boolean;
};

/** Sesi admin yang valid: user login + profil aktif + role owner/admin. */
export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error || !data || !data.is_active) return null;

  const role = data.role;
  if (role !== "owner" && role !== "admin") return null;

  let permissions = EMPTY_PERMISSIONS;
  if (role === "owner") {
    permissions = FULL_PERMISSIONS;
  } else {
    const { data: rows, error: permError } = await supabase
      .from("staff_permissions")
      .select("module, can_view, can_manage, can_delete, can_view_cost")
      .eq("profile_id", user.id);

    // Tabel bisa belum ada bila migrasi 006 belum dijalankan. Jangan kunci
    // semua staf keluar karena urutan deploy; fallback ke akses lama.
    permissions = permError
      ? FULL_PERMISSIONS
      : rowsToPermissions((rows ?? []) as PermissionRow[]);
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role,
    fullName: data.full_name ?? "",
    permissions,
  };
}

/** Mengembalikan respons 403 bila bukan owner, atau null bila boleh lanjut. */
export function ownerOnly(session: StaffSession): NextResponse | null {
  if (session.role !== "owner") {
    return jsonError("Hanya owner yang boleh melakukan aksi ini", 403);
  }
  return null;
}

export function isOwner(session: StaffSession): boolean {
  return session.role === "owner";
}

/** Mengembalikan respons 403 bila izin modul tidak cukup. */
export function requirePermission(
  session: StaffSession,
  module: Module,
  action: PermissionAction = "view",
): NextResponse | null {
  if (can(session.permissions, module, action)) return null;
  return jsonError("Anda tidak punya akses ke aksi ini.", 403);
}
