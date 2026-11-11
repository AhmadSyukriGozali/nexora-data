import { redirect } from "next/navigation";

import {
  MODULE_PATHS,
  can,
  firstAllowedModule,
  type Module,
  type PermissionAction,
} from "@/lib/admin/access";
import { getStaffSession, type StaffSession } from "@/lib/supabase/auth";

/**
 * Guard halaman: staf tanpa izin diarahkan ke menu pertama yang boleh dibuka.
 * Owner selalu lolos karena permission-nya penuh.
 */
export function requirePageAccess(
  session: StaffSession,
  module: Module,
  action: PermissionAction = "view",
): void {
  if (can(session.permissions, module, action)) return;

  const fallback = firstAllowedModule(session.permissions);
  if (!fallback) redirect("/admin/login");
  redirect(MODULE_PATHS[fallback]);
}

/** Ambil sesi + pastikan boleh membuka modul. Dipakai setiap halaman admin. */
export async function requireStaffPage(
  module: Module,
  action: PermissionAction = "view",
): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");
  requirePageAccess(session, module, action);
  return session;
}

/** Owner-only, untuk halaman Staf. */
export async function requireOwnerPage(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "owner") redirect("/admin");
  return session;
}
