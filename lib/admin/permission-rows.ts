import { MODULES, PRESETS, ROLE_PRESETS, type PermissionRow } from "./access";
import type { StaffRole } from "./types";

/**
 * Baris izin yang ditanam saat akun dibuat atau role-nya diganti.
 * Hanya modul yang terlihat yang ditulis; modul lain berarti tidak ada akses.
 */
export function permissionRowsForRole(role: StaffRole): PermissionRow[] {
  const presetKey = ROLE_PRESETS[role];
  if (!presetKey) return [];

  const permissions = PRESETS[presetKey].permissions;
  return MODULES.filter((module) => permissions[module].view).map((module) => ({
    module,
    can_view: permissions[module].view,
    can_manage: permissions[module].manage,
    can_delete: permissions[module].delete,
    can_view_cost: permissions[module].viewCost,
  }));
}
