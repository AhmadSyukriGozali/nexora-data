import { describe, expect, it } from "vitest";
import { equipmentFromFormData, normalizeEquipment } from "./equipment";

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

describe("equipmentFromFormData", () => {
  it("membaca checkbox preset, isian bebas, dan status kembali", () => {
    const form = new FormData();
    form.append("equipment", "Charger");
    form.append("returned:Charger", "on");
    form.append("equipment", "Tas/case");
    form.append("equipment_other", "  Kunci rumah ");
    form.append("equipment_other_returned", "on");

    expect(
      equipmentFromFormData(
        (name) => form.get(name),
        (name) => form.getAll(name),
      ),
    ).toEqual([
      { label: "Charger", returned: true },
      { label: "Tas/case", returned: false },
      { label: "Kunci rumah", returned: true },
    ]);
  });

  it("mengabaikan isian bebas kosong", () => {
    const form = new FormData();
    form.append("equipment", "Charger");
    form.append("equipment_other", "   ");

    expect(
      equipmentFromFormData(
        (name) => form.get(name),
        (name) => form.getAll(name),
      ),
    ).toEqual([{ label: "Charger", returned: false }]);
  });
});
