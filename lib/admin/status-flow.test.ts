import { describe, expect, it } from "vitest";
import {
  MANUAL_INVOICE_FLOW,
  ORDER_SEQUENCE,
  canTransitionOrder,
} from "./status-flow";

describe("alur status order", () => {
  it("mengizinkan transisi yang ada di alur", () => {
    expect(canTransitionOrder("masuk", "diagnosa")).toBe(true);
  });

  it("menolak transisi mundur", () => {
    expect(canTransitionOrder("selesai", "dikerjakan")).toBe(false);
  });

  it("menjaga urutan jalur utama", () => {
    expect(ORDER_SEQUENCE).toEqual([
      "masuk",
      "diagnosa",
      "menunggu_persetujuan",
      "dikerjakan",
      "selesai",
      "diambil",
    ]);
  });

  it("tidak membiarkan staf memilih lunas", () => {
    expect(MANUAL_INVOICE_FLOW.draft).not.toContain("lunas");
  });
});
