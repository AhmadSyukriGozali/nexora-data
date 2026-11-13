import { describe, expect, it } from "vitest";
import { toPublicStatus } from "./tracking";

describe("toPublicStatus", () => {
  it("hanya mengeluarkan empat field aman", () => {
    const result = toPublicStatus({
      ticket_number: "NXD-2611-001-K9M4",
      device_type: "hp",
      status: "dikerjakan",
      estimated_finish_at: "2026-11-20T10:00:00+07:00",
      id: "order-rahasia",
      customer_id: "customer-rahasia",
      phone: "081234567890",
      customer_name: "Nama Pelanggan",
      complaint: "layar rusak",
    });

    expect(Object.keys(result).sort()).toEqual([
      "device_type",
      "estimated_finish_at",
      "status",
      "ticket_number",
    ]);
    expect(result).toEqual({
      ticket_number: "NXD-2611-001-K9M4",
      device_type: "hp",
      status: "dikerjakan",
      estimated_finish_at: "2026-11-20T10:00:00+07:00",
    });
  });

  it("meneruskan nilai kosong sebagai null", () => {
    const result = toPublicStatus({
      ticket_number: "NXD-2611-002-ABCD",
      device_type: null,
      status: "masuk",
      estimated_finish_at: null,
    });

    expect(result.device_type).toBeNull();
    expect(result.estimated_finish_at).toBeNull();
  });
});
