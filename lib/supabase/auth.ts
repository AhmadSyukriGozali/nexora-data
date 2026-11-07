import { NextResponse } from "next/server";

import { jsonError } from "./http";
import { createSupabaseServerClient } from "./server";

export type StaffRole = "owner" | "admin";

export type StaffSession = {
  userId: string;
  email: string | null;
  role: StaffRole;
  fullName: string;
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

  return {
    userId: user.id,
    email: user.email ?? null,
    role,
    fullName: data.full_name ?? "",
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
