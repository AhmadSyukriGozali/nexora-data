export type EquipmentItem = { label: string; returned: boolean };

/** Bawaan yang paling sering dititipkan. Sisanya lewat isian bebas. */
export const EQUIPMENT_PRESETS = [
  "Charger",
  "Kabel USB",
  "Tas/case",
  "SIM card",
  "Kartu memori",
] as const;

const MAX_ITEMS = 10;
const MAX_LABEL = 40;

/** Buang label kosong/duplikat, potong panjang, batasi jumlah item. */
export function normalizeEquipment(
  items: { label: string; returned?: boolean }[],
): EquipmentItem[] {
  const seen = new Set<string>();
  const result: EquipmentItem[] = [];

  for (const item of items) {
    const label = item.label.trim().slice(0, MAX_LABEL);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;

    seen.add(key);
    result.push({ label, returned: item.returned === true });
    if (result.length === MAX_ITEMS) break;
  }

  return result;
}
