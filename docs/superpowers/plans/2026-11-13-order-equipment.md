# Kelengkapan Unit (Order Equipment) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mencatat bawaan pelanggan per order dan menandai mana yang sudah dikembalikan saat serah terima.

**Architecture:** Satu kolom `service_orders.equipment` (jsonb array) berisi `{ label, returned }`. Normalisasi di satu helper murni yang dipakai UI dan validasi zod. Teknisi hanya baca; trigger DB yang sudah ada menolak perubahan dari teknisi.

**Tech Stack:** Next.js 16 App Router, React 19, zod 4, Supabase Postgres, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-order-equipment-design.md`

## Global Constraints

- Komentar dan copy UI Bahasa Indonesia.
- Migrasi baru bernomor `012`, jangan ubah migrasi lama.
- Maksimal 10 item, label maksimal 40 karakter, label unik (tanpa beda huruf besar/kecil).
- Preset: Charger, Kabel USB, Tas/case, SIM card, Kartu memori + isian bebas.
- Teknisi tidak boleh mengubah `equipment` (403 di API, trigger di DB).
- Tidak muncul di tracking publik.

## Review Focus

- Label duplikat/berbeda spasi atau kapitalisasi: harus jadi satu item.
- Isian bebas kosong: tidak boleh membuat item `""`.
- Order lama tanpa `equipment`: harus terbaca sebagai daftar kosong, bukan error.
- Teknisi mengirim `equipment` lewat PATCH: 403, bukan tersimpan diam-diam.
- Label >40 karakter atau item >10: dipotong/diabaikan, tidak gagal simpan.

---

### Task 1: Kolom database, tipe, dan helper normalisasi

**Files:**
- Create: `supabase/migrations/012_order_equipment.sql`
- Create: `lib/admin/equipment.ts`
- Test: `lib/admin/equipment.test.ts`
- Modify: `lib/admin/types.ts` (`Order`)

**Interfaces:**
- Produces: `type EquipmentItem = { label: string; returned: boolean }`; `EQUIPMENT_PRESETS: readonly string[]`; `normalizeEquipment(items: { label: string; returned?: boolean }[]): EquipmentItem[]`; `Order.equipment: EquipmentItem[]`.

- [ ] **Step 1: Tulis test yang gagal**

```ts
import { describe, expect, it } from "vitest";
import { normalizeEquipment } from "./equipment";

describe("normalizeEquipment", () => {
  it("memangkas spasi dan membuang label kosong", () => {
    expect(normalizeEquipment([{ label: "  Charger " }, { label: "   " }])).toEqual([
      { label: "Charger", returned: false },
    ]);
  });

  it("menggabungkan label duplikat tanpa beda kapitalisasi", () => {
    expect(
      normalizeEquipment([{ label: "Charger" }, { label: "charger", returned: true }]),
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
    expect(normalizeEquipment([{ label: "x".repeat(60) }])[0].label).toHaveLength(40);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/admin/equipment.test.ts`
Expected: FAIL — modul `./equipment` tidak ada.

- [ ] **Step 3: Implementasi**

`supabase/migrations/012_order_equipment.sql`:

```sql
begin;

alter table public.service_orders
  add column if not exists equipment jsonb not null default '[]'::jsonb;

alter table public.service_orders
  drop constraint if exists service_orders_equipment_shape;
alter table public.service_orders
  add constraint service_orders_equipment_shape
  check (jsonb_typeof(equipment) = 'array' and jsonb_array_length(equipment) <= 10);

-- Teknisi tidak boleh mengubah daftar bawaan.
create or replace function public.guard_order_technician_update()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if public.current_user_role() = 'teknisi' then
    if new.assigned_technician_id is distinct from old.assigned_technician_id
      or new.customer_id is distinct from old.customer_id
      or new.device_id is distinct from old.device_id
      or new.complaint is distinct from old.complaint
      or new.total_amount is distinct from old.total_amount
      or new.equipment is distinct from old.equipment then
      raise exception 'ORDER_FIELD_FORBIDDEN' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';

commit;
```

`lib/admin/equipment.ts`:

```ts
export type EquipmentItem = { label: string; returned: boolean };

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
```

`lib/admin/types.ts`: tambah `equipment: EquipmentItem[];` di `Order` dan
`import type { EquipmentItem } from "./equipment";`.

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npx vitest run lib/admin/equipment.test.ts`
Expected: PASS 4 test.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/012_order_equipment.sql lib/admin/equipment.ts lib/admin/equipment.test.ts lib/admin/types.ts
git commit -m "feat(order): kolom dan helper kelengkapan unit"
```

---

### Task 2: Validasi zod dan pembacaan form

**Files:**
- Modify: `lib/supabase/schemas.ts` (`orderCreateSchema`, `orderUpdateSchema`)
- Modify: `lib/admin/equipment.ts` (parser FormData)
- Test: `lib/admin/equipment.test.ts`

**Interfaces:**
- Consumes: `normalizeEquipment`, `EquipmentItem` (Task 1).
- Produces: `equipmentFromFormData(get: (name: string) => FormDataEntryValue | null, getAll: (name: string) => FormDataEntryValue[]): EquipmentItem[]`; skema `equipment` opsional di create/update order.

- [ ] **Step 1: Tulis test yang gagal**

```ts
it("membaca checkbox preset, isian bebas, dan status kembali", () => {
  const form = new FormData();
  form.append("equipment", "Charger");
  form.append("returned:Charger", "on");
  form.append("equipment", "Tas/case");
  form.append("equipment_other", "  Kunci rumah ");
  form.append("equipment_other_returned", "on");

  expect(equipmentFromFormData((n) => form.get(n), (n) => form.getAll(n))).toEqual([
    { label: "Charger", returned: true },
    { label: "Tas/case", returned: false },
    { label: "Kunci rumah", returned: true },
  ]);
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/admin/equipment.test.ts`
Expected: FAIL — `equipmentFromFormData` belum diekspor.

- [ ] **Step 3: Implementasi**

Di `lib/admin/equipment.ts`, fungsi yang memakai `get`/`getAll` (bukan `FormData`
langsung) supaya bisa diuji di Node:

```ts
export function equipmentFromFormData(
  get: (name: string) => FormDataEntryValue | null,
  getAll: (name: string) => FormDataEntryValue[],
): EquipmentItem[] {
  const checked = getAll("equipment").map(String);
  const items = checked.map((label) => ({
    label,
    returned: get(`returned:${label}`) === "on",
  }));

  const other = String(get("equipment_other") ?? "");
  if (other.trim()) {
    items.push({ label: other, returned: get("equipment_other_returned") === "on" });
  }

  return normalizeEquipment(items);
}
```

Di `lib/supabase/schemas.ts`:

```ts
const equipmentItemSchema = z.strictObject({
  label: z.string().trim().min(1).max(40),
  returned: z.boolean().default(false),
});
const equipmentSchema = z.array(equipmentItemSchema).max(10).transform(normalizeEquipment);
```

Tambahkan `equipment: equipmentSchema.optional()` ke `orderCreateSchema` dan
`orderUpdateSchema`.

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npx vitest run lib/admin/equipment.test.ts` → PASS.
Run: `npx tsc --noEmit` → bersih.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/equipment.ts lib/admin/equipment.test.ts lib/supabase/schemas.ts
git commit -m "feat(order): validasi dan parser kelengkapan unit"
```

---

### Task 3: Komponen checkbox dan form order baru

**Files:**
- Create: `app/admin/(dashboard)/order/equipment-field.tsx`
- Modify: `app/admin/(dashboard)/order/order-manager.tsx` (`handleSubmit`, form tambah)

**Interfaces:**
- Consumes: `EQUIPMENT_PRESETS`, `EquipmentItem`, `equipmentFromFormData`.
- Produces: `<EquipmentField initial={EquipmentItem[]} showReturned={boolean} />`.

- [ ] **Step 1: Implementasi `EquipmentField`**

Client component tanpa state: checkbox `name="equipment"` untuk tiap preset,
checkbox `name={`returned:${label}`}` bila `showReturned` dan label sudah ada di
`initial`, input teks `name="equipment_other"`, dan checkbox
`equipment_other_returned` bila `showReturned`. Pakai `Field` + `inputClass` dari
`@/components/admin/form-controls`, label "Kelengkapan unit", hint "Bawaan
pelanggan yang dititipkan."

- [ ] **Step 2: Pakai di form order baru**

`order-manager.tsx`: render `<EquipmentField initial={[]} showReturned={false} />`
setelah field keluhan; di `handleSubmit` tambah
`equipment: equipmentFromFormData((n) => form.get(n), (n) => form.getAll(n))`.

- [ ] **Step 3: Cek tipe dan lint**

Run: `npx tsc --noEmit` → bersih. `npx eslint .` → bersih.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/(dashboard)/order/equipment-field.tsx" "app/admin/(dashboard)/order/order-manager.tsx"
git commit -m "feat(order): checkbox kelengkapan unit saat terima"
```

---

### Task 4: Edit di detail order dan ringkasan baca-saja

**Files:**
- Modify: `app/admin/(dashboard)/order/[id]/order-detail-manager.tsx`
- Modify: `app/admin/(dashboard)/order/[id]/page.tsx`

**Interfaces:**
- Consumes: `EquipmentField`, `equipmentFromFormData`, `order.equipment`.

- [ ] **Step 1: Form edit**

Di `handleEdit`, untuk `canAssign` tambah
`equipment: equipmentFromFormData((n) => form.get(n), (n) => form.getAll(n))`.
Render `<EquipmentField initial={order.equipment} showReturned />` di dalam
cabang `canAssign`, setelah field teknisi.

- [ ] **Step 2: Ringkasan baca-saja**

Di `page.tsx`, tambah blok "Kelengkapan unit": daftar `order.equipment` dengan
tanda "dikembalikan" atau "belum", dan teks
`${dikembalikan}/${total} bawaan dikembalikan` bila ada item. Tampil untuk semua
role (teknisi ikut melihat).

- [ ] **Step 3: Verifikasi**

Run: `npm test` → 37 pass (32 lama + 5 baru).
Run: `npx tsc --noEmit && npx eslint . && npm run build` → bersih.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/(dashboard)/order/[id]"
git commit -m "feat(order): kelengkapan unit di detail order"
```

---

### Task 5: Migrasi dijalankan pengguna

- [ ] **Step 1:** Minta pengguna menjalankan `supabase/migrations/012_order_equipment.sql` di SQL Editor.
- [ ] **Step 2:** Verifikasi:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'service_orders'
  and column_name = 'equipment';
```
