import { describe, expect, it } from "vitest";
import { normalizeEquipment } from "./equipment";

describe("normalizeEquipment", () => {
  it("memangkas spasi dan membuang label kosong", () => {
    expect(
      normalizeEquipment([{ label: "  Charger " }, { label: "   " }]),
    ).toEqual([{ label: "Charger", returned: false }]);
  });

  it("menggabungkan label duplikat tanpa beda kapitalisasi", () => {
    expect(
      normalizeEquipment([
        { label: "Charger" },
        { label: "charger", returned: true },
      ]),
    ).toEqual([{ label: "Charger", returned: false }]);
  });

  it("mempertahankan status returned", () => {
    expect(normalizeEquipment([{ label: "Tas/case", returned: true }])).toEqual([
      { label: "Tas/case", returned: true },
    ]);
  });

  it("membatasi 10 item dan 40 karakter", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ label: `Item ${i}` }));
    expect(normalizeEquipment(items)).toHaveLength(10);
    expect(normalizeEquipment([{ label: "x".repeat(60) }])[0].label).toHaveLength(
      40,
    );
  });
});
