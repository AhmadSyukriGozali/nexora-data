import { describe, expect, it } from "vitest";

import {
  MAX_ATTACHMENT_BYTES,
  attachmentExtension,
  attachmentPath,
  validateAttachment,
} from "./attachments";

describe("attachmentExtension", () => {
  it("memetakan mime gambar ke ekstensi", () => {
    expect(attachmentExtension("image/jpeg")).toBe("jpg");
    expect(attachmentExtension("image/png")).toBe("png");
    expect(attachmentExtension("image/webp")).toBe("webp");
  });

  it("menolak tipe lain", () => {
    expect(attachmentExtension("image/gif")).toBeNull();
    expect(attachmentExtension("application/pdf")).toBeNull();
  });
});

describe("validateAttachment", () => {
  it("menerima gambar di bawah batas", () => {
    expect(
      validateAttachment({ type: "image/jpeg", size: 1024 * 1024 }),
    ).toBeNull();
  });

  it("menolak tipe yang tidak diizinkan", () => {
    expect(validateAttachment({ type: "image/gif", size: 1000 })).toBe(
      "Format foto harus JPG, PNG, atau WebP.",
    );
  });

  it("menolak berkas kosong", () => {
    expect(validateAttachment({ type: "image/png", size: 0 })).toBe(
      "Berkas kosong.",
    );
  });

  it("menolak berkas melebihi 5 MB", () => {
    expect(
      validateAttachment({ type: "image/png", size: MAX_ATTACHMENT_BYTES + 1 }),
    ).toBe("Ukuran foto maksimal 5 MB.");
  });
});

describe("attachmentPath", () => {
  it("memakai order, jenis, dan ekstensi mime", () => {
    const orderId = "8f14e45f-ceea-467a-9575-9f0d5c1d7a11";
    const path = attachmentPath(orderId, "before", "image/webp");

    expect(path.startsWith(`${orderId}/before/`)).toBe(true);
    expect(path.endsWith(".webp")).toBe(true);
  });
});
