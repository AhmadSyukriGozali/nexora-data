import { describe, expect, it } from "vitest";
import {
  EMPTY_PERMISSIONS,
  FULL_PERMISSIONS,
  MODULES,
  PRESETS,
  can,
  rowsToPermissions,
} from "./access";

describe("izin staf", () => {
  it("izin kosong menutup semua modul", () => {
    for (const moduleKey of MODULES) {
      expect(EMPTY_PERMISSIONS[moduleKey].view).toBe(false);
    }
  });

  it("izin penuh membolehkan hapus", () => {
    expect(can(FULL_PERMISSIONS, "orders", "delete")).toBe(true);
  });

  it("preset teknisi tidak membuka invoice", () => {
    expect(PRESETS.teknisi.permissions.invoices.view).toBe(false);
  });

  it("preset teknisi boleh mengelola order", () => {
    expect(PRESETS.teknisi.permissions.orders.manage).toBe(true);
  });

  it("tanpa baris izin berarti semua tertutup", () => {
    const result = rowsToPermissions([]);
    for (const moduleKey of MODULES) {
      expect(result[moduleKey].view).toBe(false);
    }
  });
});
