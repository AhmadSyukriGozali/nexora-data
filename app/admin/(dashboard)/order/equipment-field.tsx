"use client";

import { Field, inputClass } from "@/components/admin/form-controls";
import {
  EQUIPMENT_PRESETS,
  type EquipmentItem,
} from "@/lib/admin/equipment";

type Preset = (typeof EQUIPMENT_PRESETS)[number];

/** Checkbox bawaan pelanggan; status "kembali" hanya muncul saat serah. */
export function EquipmentField({
  initial,
  showReturned = false,
}: {
  initial: EquipmentItem[];
  showReturned?: boolean;
}) {
  const find = (label: string) =>
    initial.find((item) => item.label.toLowerCase() === label.toLowerCase());
  const custom = initial.find(
    (item) => !EQUIPMENT_PRESETS.includes(item.label as Preset),
  );

  return (
    <Field
      label="Kelengkapan unit"
      hint="Bawaan pelanggan yang dititipkan. Teknisi hanya bisa melihat."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {EQUIPMENT_PRESETS.map((label) => {
          const item = find(label);
          return (
            <label
              key={label}
              className="flex items-center gap-2 text-sm text-[color:var(--bjork-text)]"
            >
              <input
                type="checkbox"
                name="equipment"
                value={label}
                defaultChecked={Boolean(item)}
                className="size-4 accent-[var(--bjork-accent)]"
              />
              <span>{label}</span>
              {showReturned && item ? (
                <span className="ml-auto flex items-center gap-1 text-[11px] text-[color:var(--bjork-text-muted)]">
                  <input
                    type="checkbox"
                    name={`returned:${label}`}
                    defaultChecked={item.returned}
                    className="size-3.5 accent-[var(--bjork-accent)]"
                  />
                  kembali
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          name="equipment_other"
          defaultValue={custom?.label ?? ""}
          maxLength={40}
          placeholder="Bawaan lain (opsional)"
          className={inputClass}
        />
        {showReturned && custom ? (
          <label className="flex items-center gap-2 text-[12px] text-[color:var(--bjork-text-muted)]">
            <input
              type="checkbox"
              name="equipment_other_returned"
              defaultChecked={custom.returned}
              className="size-4 accent-[var(--bjork-accent)]"
            />
            sudah dikembalikan
          </label>
        ) : null}
      </div>
    </Field>
  );
}
