import { describe, expect, it } from "vitest";
import { permissionRowsForRole } from "./permission-rows";

describe("permissionRowsForRole", () => {
  it("teknisi dapat mengelola order", () => {
    const rows = permissionRowsForRole("teknisi");
    const orders = rows.find((row) => row.module === "orders");
    expect(orders?.can_view).toBe(true);
    expect(orders?.can_manage).toBe(true);
  });

  it("teknisi tidak mendapat invoice dan testimoni", () => {
    const modules = permissionRowsForRole("teknisi").map((row) => row.module);
    expect(modules).not.toContain("invoices");
    expect(modules).not.toContain("testimonials");
  });

  it("owner tidak memakai baris izin", () => {
    expect(permissionRowsForRole("owner")).toEqual([]);
  });

  it("admin operasional dapat invoice tanpa hapus", () => {
    const rows = permissionRowsForRole("admin");
    const invoices = rows.find((row) => row.module === "invoices");
    expect(invoices?.can_view).toBe(true);
    expect(invoices?.can_delete).toBe(false);
  });
});
