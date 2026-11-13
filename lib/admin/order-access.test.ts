import { describe, expect, it } from "vitest";
import {
  canAccessOrder,
  canCreateOrders,
  orderFieldAllowed,
} from "./order-access";

const TECHNICIAN = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

describe("cakupan order", () => {
  it("teknisi boleh membuka order yang ditugaskan ke dirinya", () => {
    expect(
      canAccessOrder("teknisi", TECHNICIAN, { assigned_technician_id: TECHNICIAN }),
    ).toBe(true);
  });

  it("teknisi tidak boleh membuka order orang lain", () => {
    expect(
      canAccessOrder("teknisi", TECHNICIAN, { assigned_technician_id: OTHER }),
    ).toBe(false);
  });

  it("teknisi tidak boleh membuka order tanpa penugasan", () => {
    expect(
      canAccessOrder("teknisi", TECHNICIAN, { assigned_technician_id: null }),
    ).toBe(false);
  });

  it("admin dan owner boleh membuka order siapa pun", () => {
    expect(canAccessOrder("admin", TECHNICIAN, { assigned_technician_id: OTHER })).toBe(
      true,
    );
    expect(canAccessOrder("owner", TECHNICIAN, { assigned_technician_id: null })).toBe(
      true,
    );
  });

  it("hanya admin dan owner yang boleh membuat order", () => {
    expect(canCreateOrders("teknisi")).toBe(false);
    expect(canCreateOrders("admin")).toBe(true);
    expect(canCreateOrders("owner")).toBe(true);
  });

  it("teknisi hanya boleh mengubah field kerja", () => {
    expect(orderFieldAllowed("teknisi", "diagnosis")).toBe(true);
    expect(orderFieldAllowed("teknisi", "estimated_finish_at")).toBe(true);
    expect(orderFieldAllowed("teknisi", "status")).toBe(true);
    expect(orderFieldAllowed("teknisi", "total_amount")).toBe(false);
    expect(orderFieldAllowed("teknisi", "complaint")).toBe(false);
    expect(orderFieldAllowed("teknisi", "assigned_technician_id")).toBe(false);
  });

  it("admin dan owner boleh mengubah field apa pun", () => {
    expect(orderFieldAllowed("admin", "total_amount")).toBe(true);
    expect(orderFieldAllowed("owner", "assigned_technician_id")).toBe(true);
  });
});
