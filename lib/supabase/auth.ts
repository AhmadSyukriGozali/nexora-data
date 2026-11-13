import { NextResponse } from "next/server";

import {
  FULL_PERMISSIONS,
  can,
  type Module,
  type PermissionAction,
  type PermissionRow,
  type Permissions,
} from "@/lib/admin/access";
import { resolvePermissions } from "@/lib/admin/permissions-resolve";
import type { StaffRole } from "@/lib/admin/types";

import { jsonError } from "./http";
import { createSupabaseServerClient } from "./server";

export type { StaffRole };

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

const STAFF_ROLES: readonly string[] = ["owner", "admin", "teknisi"];

/** Sesi admin yang valid: user login + profil aktif + role staf. */
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
  if (!STAFF_ROLES.includes(role)) return null;

  const staffRole = role as StaffRole;

  if (staffRole !== "owner") {
    const { data: permRows, error: permError } = await supabase
      .from("staff_permissions")
      .select("module, can_view, can_manage, can_delete, can_view_cost")
      .eq("profile_id", user.id);

    // Fail closed: query izin gagal tidak boleh memberi akses penuh.
    const permissions = resolvePermissions(
      staffRole,
      (permRows ?? []) as PermissionRow[],
      permError,
    );
    if (!permissions) return null;

    return {
      userId: user.id,
      email: user.email ?? null,
      role: staffRole,
      fullName: data.full_name ?? "",
      permissions,
    };
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: staffRole,
    fullName: data.full_name ?? "",
    permissions: FULL_PERMISSIONS,
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
