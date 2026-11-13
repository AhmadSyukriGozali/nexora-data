import { describe, expect, it } from "vitest";
import { FULL_PERMISSIONS, type PermissionRow } from "./access";
import { resolvePermissions } from "./permissions-resolve";

const teknisiRows: PermissionRow[] = [
  {
    module: "orders",
    can_view: true,
    can_manage: true,
    can_delete: false,
    can_view_cost: false,
  },
];

describe("resolvePermissions", () => {
  it("owner tetap penuh walau query izin gagal", () => {
    expect(resolvePermissions("owner", null, new Error("db down"))).toEqual(
      FULL_PERMISSIONS,
    );
  });

  it("non-owner ditolak saat query izin gagal (fail closed)", () => {
    expect(resolvePermissions("admin", null, new Error("db down"))).toBeNull();
    expect(resolvePermissions("teknisi", null, new Error("db down"))).toBeNull();
  });

  it("non-owner memakai baris izin yang ada", () => {
    const permissions = resolvePermissions("teknisi", teknisiRows, null);
    expect(permissions?.orders.manage).toBe(true);
    expect(permissions?.invoices.view).toBe(false);
  });

  it("tanpa baris izin berarti semua tertutup", () => {
    const permissions = resolvePermissions("admin", [], null);
    expect(permissions?.dashboard.view).toBe(false);
  });
});
