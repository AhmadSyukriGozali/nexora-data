import { describe, expect, it } from "vitest";
import { isTicketNumber } from "./ticket-number";

describe("isTicketNumber", () => {
  it("menerima format baru", () => {
    expect(isTicketNumber("NXD-2611-001-K9M4")).toBe(true);
  });

  it("menerima format lama", () => {
    expect(isTicketNumber("NXD-2611-0001")).toBe(true);
  });

  it("menormalkan huruf kecil dan spasi", () => {
    expect(isTicketNumber(" nxd-2611-001-k9m4 ")).toBe(true);
  });

  it("menolak token dengan karakter ambigu", () => {
    expect(isTicketNumber("NXD-2611-001-K9M0")).toBe(false);
    expect(isTicketNumber("NXD-2611-001-K9MI")).toBe(false);
    expect(isTicketNumber("NXD-2611-001-K9MO")).toBe(false);
  });

  it("menerima token berisi L", () => {
    expect(isTicketNumber("NXD-2611-001-DL3S")).toBe(true);
  });

  it("menolak urutan 3 digit tanpa token", () => {
    expect(isTicketNumber("NXD-2611-001")).toBe(false);
  });
});
