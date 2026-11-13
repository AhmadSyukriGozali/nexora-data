import { describe, expect, it } from "vitest";

import { site } from "@/lib/site";

import type { Order } from "./types";
import { orderStatusMessage, waCustomerLink, waNumber } from "./whatsapp";

describe("waNumber", () => {
  it("menerima format lokal, internasional, dan tanpa nol", () => {
    expect(waNumber("0815-1616-343")).toBe("628151616343");
    expect(waNumber("+62 815 1616 343")).toBe("628151616343");
    expect(waNumber("8151616343")).toBe("628151616343");
  });

  it("menolak nomor yang terlalu pendek atau kosong", () => {
    expect(waNumber("")).toBeNull();
    expect(waNumber(null)).toBeNull();
    expect(waNumber("12345")).toBeNull();
  });
});

const order: Order = {
  id: "e2b1f4c8-1111-4a1a-8f00-000000000001",
  ticket_number: "NXD-2611-001-K9M4",
  customer_id: "e2b1f4c8-1111-4a1a-8f00-000000000002",
  device_id: "e2b1f4c8-1111-4a1a-8f00-000000000003",
  complaint: "Layar berkedip",
  diagnosis: null,
  status: "selesai",
  estimated_finish_at: null,
  total_amount: 0,
  assigned_technician_id: null,
  equipment: [],
  created_at: "2026-11-13T02:00:00.000Z",
  customer: { full_name: "Budi", phone: "08151616343" },
  device: {
    device_type: "laptop",
    brand: "Asus",
    model: "A416",
    serial_number: null,
  },
};

describe("orderStatusMessage", () => {
  it("memuat nama, kode servis, status, dan tautan tracking", () => {
    const message = orderStatusMessage(order);

    expect(message).toContain("Halo Budi");
    expect(message).toContain("Asus A416");
    expect(message).toContain("NXD-2611-001-K9M4");
    expect(message).toContain("Status: Selesai");
    expect(message).toContain(`${site.url}/cek-status`);
    expect(message).toContain("kode=NXD-2611-001-K9M4");
    expect(message).toContain("hp=6343");
  });
});

describe("waCustomerLink", () => {
  it("membangun tautan wa.me ke nomor pelanggan", () => {
    const link = waCustomerLink(order);

    expect(link?.startsWith("https://wa.me/628151616343?text=")).toBe(true);
  });

  it("null bila nomor pelanggan tidak ada", () => {
    expect(waCustomerLink({ ...order, customer: null })).toBeNull();
  });
});
