import type { StaffRole } from "./types";

/** Teknisi hanya boleh menyentuh order yang ditugaskan kepadanya. */
export function canAccessOrder(
  role: StaffRole,
  userId: string,
  order: { assigned_technician_id: string | null },
): boolean {
  return role !== "teknisi" || order.assigned_technician_id === userId;
}

/** Teknisi mengerjakan order, bukan membuat atau menghapusnya. */
export function canCreateOrders(role: StaffRole): boolean {
  return role !== "teknisi";
}

const TECHNICIAN_FIELDS = new Set(["diagnosis", "estimated_finish_at", "status"]);

/** Kolom yang boleh dikirim teknisi ke PATCH order. */
export function orderFieldAllowed(role: StaffRole, field: string): boolean {
  return role !== "teknisi" || TECHNICIAN_FIELDS.has(field);
}
