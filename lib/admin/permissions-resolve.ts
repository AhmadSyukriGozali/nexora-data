import {
  FULL_PERMISSIONS,
  rowsToPermissions,
  type PermissionRow,
  type Permissions,
} from "./access";
import type { StaffRole } from "./types";

/**
 * Menentukan izin sesi. `null` berarti sesi harus ditolak: query izin gagal
 * untuk non-owner tidak boleh jatuh ke akses penuh (fail closed).
 */
export function resolvePermissions(
  role: StaffRole,
  rows: PermissionRow[] | null,
  error: unknown,
): Permissions | null {
  if (role === "owner") return FULL_PERMISSIONS;
  if (error) return null;
  return rowsToPermissions(rows ?? []);
}
