# Refactor Fondasi Nexora Data — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membereskan fondasi teknis (test, format kode servis, role teknisi + assignment, rate limit bersama, audit log) tanpa menambah fitur produk baru.

**Architecture:** Lima lapis perubahan berurutan: test harness → kode servis di PostgreSQL + helper TypeScript bersama → role/assignment di DB, API, dan UI → hardening rate limit/audit → rekonsiliasi dokumen. Setiap lapis punya gate verifikasi sendiri.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Supabase (PostgreSQL + RLS), zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-foundation-refactor-design.md`

## Global Constraints

- Komentar kode dan copy UI berbahasa Indonesia.
- Migrasi baru bernomor urut; migrasi 001–006 tidak diubah.
- Format kode servis baru: `NXD-YYMM-XXX-YYYY`; format lama `NXD-YYMM-XXXX` tetap diterima.
- `cacheComponents: true`: jangan pakai `new Date()` di server component saat prerender.
- Path alias `@/*` = root repo.
- **Jangan commit, push, atau deploy kecuali diminta eksplisit.** Ganti langkah "commit" dengan checkpoint review diff.
- Migrasi dijalankan manual lewat Supabase SQL Editor, urut 007 → 011.
- Verifikasi tiap task: `npx vitest run <file>`, `npx tsc --noEmit`, `npx eslint .`.

## Review Focus

- Tiket dibuat bersamaan pada periode yang sama: nomor urut tidak duplikat dan tidak bolong. Test: Task 4.
- Teknisi membuka order yang tidak ditugaskan: ditolak tanpa membocorkan keberadaan order. Test: Task 5 (helper) + Task 8 (API).
- Teknisi mengirim field terlarang (`total_amount`, `complaint`, assignment): ditolak 403 dan trigger DB menolak update langsung. Test: Task 5 + Task 8, checklist SQL Task 7.
- Tiket lama `NXD-YYMM-XXXX` masih bisa dilacak setelah format baru aktif. Test: Task 2.
- Query `staff_permissions` gagal: non-owner ditolak (fail closed), owner tetap penuh. Test: Task 5.

---

### Task 1: Test harness + perbaikan AGENTS.md

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/admin/status-flow.test.ts`
- Create: `lib/admin/access.test.ts`
- Modify: `AGENTS.md`

**Interfaces:**
- Produces: `npx vitest run` sebagai test runner; alias `@` tersedia di test.

- [ ] **Step 1: Tambah Vitest**

Run: `npm install -D vitest`

Tambahkan script di `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Buat `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: { environment: "node", include: ["**/*.test.ts"] },
});
```

- [ ] **Step 3: Tulis test status flow**

`lib/admin/status-flow.test.ts` — assert:
- `canTransitionOrder("masuk", "diagnosa") === true`
- `canTransitionOrder("selesai", "dikerjakan") === false`
- `ORDER_SEQUENCE` = `["masuk","diagnosa","menunggu_persetujuan","dikerjakan","selesai","diambil"]`
- `MANUAL_INVOICE_FLOW.draft` tidak memuat `"lunas"`.

- [ ] **Step 4: Tulis test permission**

`lib/admin/access.test.ts` — assert:
- `EMPTY_PERMISSIONS` semua modul `false`.
- `can(FULL_PERMISSIONS, "orders", "delete") === true`.
- `PRESETS.teknisi.permissions.invoices.view === false` (setelah Task 5; sebelum itu assert `PRESETS.kasir` sebagai smoke test).
- `rowsToPermissions([])` menghasilkan semua `false`.

- [ ] **Step 5: Jalankan test dan typecheck**

Run: `npx vitest run lib/admin/status-flow.test.ts lib/admin/access.test.ts`
Expected: PASS.
Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 6: Perbaiki `AGENTS.md`**

Ganti rujukan `referensi_audit/docs/` menjadi `panduan_refactor/docs/`. Tambah satu baris: format kode servis `NXD-YYMM-XXX-YYYY` (format lama tetap diterima) dan test runner `npx vitest run`.

- [ ] **Step 7: Checkpoint**

Run: `git diff --stat` dan review. Jangan commit.

---

### Task 2: Helper kode servis (TDD)

**Files:**
- Create: `lib/tickets/ticket-number.ts`
- Create: `lib/tickets/ticket-number.test.ts`

**Interfaces:**
- Produces:
  - `LEGACY_TICKET_NUMBER_PATTERN: RegExp`
  - `NEW_TICKET_NUMBER_PATTERN: RegExp`
  - `TICKET_NUMBER_PATTERN: RegExp` — menerima lama dan baru.
  - `TICKET_NUMBER_PLACEHOLDER = "NXD-2611-001-K9M4"`
  - `isTicketNumber(value: string): boolean` — trim + uppercase sebelum uji.

- [ ] **Step 1: Tulis test yang gagal**

`lib/tickets/ticket-number.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isTicketNumber } from "./ticket-number";

describe("isTicketNumber", () => {
  it("menerima format baru", () => {
    expect(isTicketNumber("NXD-2611-001-K9M4")).toBe(true);
  });
  it("menerima format lama", () => {
    expect(isTicketNumber("NXD-2611-0001")).toBe(true);
  });
  it("menormalkan huruf kecil", () => {
    expect(isTicketNumber(" nxd-2611-001-k9m4 ")).toBe(true);
  });
  it("menolak token dengan karakter ambigu", () => {
    expect(isTicketNumber("NXD-2611-001-K9M0")).toBe(false);
    expect(isTicketNumber("NXD-2611-001-K9MI")).toBe(false);
  });
  it("menolak urutan 3 digit tanpa token", () => {
    expect(isTicketNumber("NXD-2611-001")).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run lib/tickets/ticket-number.test.ts`
Expected: FAIL — module `./ticket-number` tidak ditemukan.

- [ ] **Step 3: Implementasi helper**

`lib/tickets/ticket-number.ts`:

```ts
export const LEGACY_TICKET_NUMBER_PATTERN = /^NXD-[0-9]{4}-[0-9]{4,}$/;
export const NEW_TICKET_NUMBER_PATTERN = /^NXD-[0-9]{4}-[0-9]{3,}-[A-HJ-KM-NP-Z2-9]{4}$/;
export const TICKET_NUMBER_PATTERN =
  /^NXD-[0-9]{4}-(?:[0-9]{4,}|[0-9]{3,}-[A-HJ-KM-NP-Z2-9]{4})$/;
export const TICKET_NUMBER_PLACEHOLDER = "NXD-2611-001-K9M4";

export function isTicketNumber(value: string): boolean {
  return TICKET_NUMBER_PATTERN.test(value.trim().toUpperCase());
}
```

- [ ] **Step 4: Jalankan test**

Run: `npx vitest run lib/tickets/ticket-number.test.ts`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Review diff. Jangan commit.

---

### Task 3: Migrasi 007 + validasi/UI kode servis

**Files:**
- Create: `supabase/migrations/007_ticket_code_format.sql`
- Modify: `lib/supabase/schemas.ts:312-336`
- Modify: `components/testimonial-form.tsx:47-49,174`
- Modify: `components/order-status-checker.tsx:182`
- Modify: `app/cek-status/page.tsx:87`

**Interfaces:**
- Consumes: `isTicketNumber`, `TICKET_NUMBER_PLACEHOLDER` dari Task 2.
- Produces: generator DB `public.next_ticket_number()` dengan format baru.

- [ ] **Step 1: Tulis migrasi 007**

Isi `supabase/migrations/007_ticket_code_format.sql`:

```sql
begin;

-- Token 4 karakter dari RNG kuat PostgreSQL (gen_random_uuid).
create or replace function public.ticket_token()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_hex text := replace(gen_random_uuid()::text, '-', '');
  v_token text := '';
  i int;
  b int;
begin
  for i in 0..3 loop
    b := ('x' || substr(v_hex, 25 + i * 2, 2))::bit(8)::int;
    v_token := v_token || substr(v_alphabet, (b % 32) + 1, 1);
  end loop;
  return v_token;
end;
$$;

-- Format baru: NXD-YYMM-XXX-YYYY (periode Asia/Jakarta).
create or replace function public.next_ticket_number()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text := to_char((now() at time zone 'Asia/Jakarta'), 'YYMM');
  v_seq bigint;
begin
  v_seq := public.next_counter('ticket:' || v_period);
  if v_seq > 999 then
    raise exception 'TICKET_SEQUENCE_EXHAUSTED' using errcode = '22003';
  end if;
  return 'NXD-' || v_period || '-' || lpad(v_seq::text, 3, '0')
    || '-' || public.ticket_token();
end;
$$;

alter table public.service_orders
  drop constraint service_orders_ticket_format;

alter table public.service_orders
  add constraint service_orders_ticket_format
  check (
    ticket_number ~ '^NXD-[0-9]{4}-(?:[0-9]{4,}|[0-9]{3,}-[A-HJ-KM-NP-Z2-9]{4})$'
  );

commit;
```

- [ ] **Step 2: Ganti validasi zod**

Di `lib/supabase/schemas.ts`, `ticketNumberSchema` memakai:

```ts
const ticketNumberSchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine(isTicketNumber, "Format nomor tiket tidak valid");
```

Import `isTicketNumber` dari `@/lib/tickets/ticket-number`.

- [ ] **Step 3: Ganti regex dan placeholder klien**

- `components/testimonial-form.tsx`: hapus regex lokal, pakai `isTicketNumber(ticketNumber)`; placeholder `TICKET_NUMBER_PLACEHOLDER`.
- `components/order-status-checker.tsx`: placeholder `TICKET_NUMBER_PLACEHOLDER`.
- `app/cek-status/page.tsx`: teks contoh menjadi `NXD-2611-001-K9M4`.

- [ ] **Step 4: Verifikasi**

Run: `npx vitest run lib/tickets/ticket-number.test.ts`
Run: `npx tsc --noEmit`
Run: `npx eslint .`
Run: `npm run build`
Expected: semua hijau.

- [ ] **Step 5: Jalankan migrasi 007 di Supabase SQL Editor**

Buat satu order baru lewat dashboard, pastikan nomor berbentuk `NXD-YYMM-XXX-YYYY`. Jangan hapus tiket lama.

- [ ] **Step 6: Checkpoint**

Review diff. Jangan commit.

---

### Task 4: Skrip verifikasi concurrency tiket

**Files:**
- Create: `scripts/verify-ticket-concurrency.mjs`

**Interfaces:**
- Consumes: tabel `service_orders`, `customers`, `devices`; env Supabase yang sudah ada.
- Produces: exit code 1 bila ada duplikat/format salah.

- [ ] **Step 1: Tulis skrip**

Skrip memakai `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY`, langkah:
1. Ambil satu pasangan `devices(id, customer_id)`.
2. Insert 20 order paralel dengan `complaint: "uji concurrency"`.
3. Assert semua `ticket_number` unik dan cocok `NEW_TICKET_NUMBER_PATTERN`.
4. Assert tidak ada nomor urut duplikat.
5. Hapus order yang dibuat (service role).
6. Cetak `PASS`/`FAIL`, `process.exit(1)` saat gagal.

- [ ] **Step 2: Jalankan manual**

Run: `node scripts/verify-ticket-concurrency.mjs`
Expected: `PASS`, 20 tiket unik. Jalankan sekali lagi untuk periode yang sama; nomor urut melanjutkan, tidak mengulang.

- [ ] **Step 3: Checkpoint**

Review diff. Jangan commit.

---

### Task 5: Model role, preset, dan fail-closed (TDD)

**Files:**
- Modify: `lib/admin/types.ts:1,51-75`
- Modify: `lib/admin/access.ts:88-134`
- Modify: `lib/supabase/auth.ts:33-78`
- Create: `lib/admin/order-access.ts`
- Create: `lib/admin/order-access.test.ts`
- Create: `lib/admin/permissions-resolve.ts`
- Create: `lib/admin/permissions-resolve.test.ts`
- Create: `lib/admin/permission-rows.ts`
- Create: `lib/admin/permission-rows.test.ts`
- Modify: `lib/supabase/schemas.ts:212,222`
- Modify: `proxy.ts:89-92`
- Modify: `app/api/admin/auth/login/route.ts:39-43`
- Modify: `app/api/admin/staff/route.ts:88-122`
- Modify: `app/api/admin/staff/[id]/route.ts:110-130`

**Interfaces:**
- Produces:
  - `StaffRole = "owner" | "admin" | "teknisi"`.
  - `ROLE_PRESETS: Record<StaffRole, PresetKey | null>` = `{ owner: null, admin: "operasional", teknisi: "teknisi" }`.
  - `resolvePermissions(role: StaffRole, rows: PermissionRow[] | null, error: unknown): Permissions | null` — `null` = tolak sesi; owner + error tetap `FULL_PERMISSIONS`.
  - `permissionRowsForRole(role: StaffRole): PermissionRow[]` — owner menghasilkan array kosong.
  - `canAccessOrder(role: StaffRole, userId: string, order: { assigned_technician_id: string | null }): boolean`.
  - `canCreateOrders(role: StaffRole): boolean`.
  - `orderFieldAllowed(role: StaffRole, field: string): boolean` — teknisi hanya `diagnosis`, `estimated_finish_at`, `status`.

- [ ] **Step 1: Tulis test yang gagal**

`lib/admin/order-access.test.ts`:
- teknisi + order assigned ke dirinya → `true`.
- teknisi + order assigned ke orang lain → `false`.
- teknisi + assigned `null` → `false`.
- admin/owner → `true` untuk order siapa pun.
- `canCreateOrders("teknisi") === false`, admin/owner `true`.
- `orderFieldAllowed("teknisi", "total_amount") === false`; `"diagnosis"` dan `"estimated_finish_at"` `true`.

`lib/admin/permissions-resolve.test.ts`:
- owner + error → `FULL_PERMISSIONS`.
- admin + error → `null`.
- teknisi + rows → izin sesuai rows.

`lib/admin/permission-rows.test.ts`:
- `permissionRowsForRole("teknisi")` memuat `orders` dengan `can_manage = true` dan `can_view = true`.
- hasil teknisi tidak memuat `invoices` atau `testimonials`.
- `permissionRowsForRole("owner")` = `[]`.
- `permissionRowsForRole("admin")` memuat `invoices` dan tidak memuat `can_delete`.

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run lib/admin/order-access.test.ts lib/admin/permissions-resolve.test.ts lib/admin/permission-rows.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi helper murni**

`lib/admin/order-access.ts`:

```ts
import type { StaffRole } from "./types";

export function canAccessOrder(
  role: StaffRole,
  userId: string,
  order: { assigned_technician_id: string | null },
): boolean {
  return role !== "teknisi" || order.assigned_technician_id === userId;
}

export function canCreateOrders(role: StaffRole): boolean {
  return role !== "teknisi";
}

const TECHNICIAN_FIELDS = new Set(["diagnosis", "estimated_finish_at", "status"]);

export function orderFieldAllowed(role: StaffRole, field: string): boolean {
  return role !== "teknisi" || TECHNICIAN_FIELDS.has(field);
}
```

`lib/admin/permissions-resolve.ts`:

```ts
import {
  FULL_PERMISSIONS,
  rowsToPermissions,
  type PermissionRow,
  type Permissions,
} from "./access";
import type { StaffRole } from "./types";

export function resolvePermissions(
  role: StaffRole,
  rows: PermissionRow[] | null,
  error: unknown,
): Permissions | null {
  if (role === "owner") return FULL_PERMISSIONS;
  if (error) return null;
  return rowsToPermissions(rows ?? []);
}
```

`lib/admin/permission-rows.ts`:

```ts
import { MODULES, PRESETS, ROLE_PRESETS, type PermissionRow } from "./access";
import type { StaffRole } from "./types";

export function permissionRowsForRole(role: StaffRole): PermissionRow[] {
  const presetKey = ROLE_PRESETS[role];
  if (!presetKey) return [];

  const permissions = PRESETS[presetKey].permissions;
  return MODULES.map((module) => ({
    module,
    can_view: permissions[module].view,
    can_manage: permissions[module].manage,
    can_delete: permissions[module].delete,
    can_view_cost: permissions[module].viewCost,
  }));
}
```

- [ ] **Step 4: Ubah tipe dan preset**

- `StaffRole` tambah `"teknisi"`.
- `Order` tambah `assigned_technician_id: string | null` dan `technician?: { full_name: string } | null`.
- `PRESETS.teknisi` menjadi: dashboard `{}`; orders `{ manage: true }`; customers `{}`; devices `{}`; warranties `{}`; spareparts `{}`; invoices dan testimonials tanpa baris.
- Tambah `ROLE_PRESETS` dengan tipe `Record<StaffRole, PresetKey | null>` dan nilai `{ owner: null, admin: "operasional", teknisi: "teknisi" }`.
- `lib/supabase/schemas.ts`: kedua `z.enum(["owner", "admin"])` menjadi `z.enum(["owner", "admin", "teknisi"])`.

- [ ] **Step 5: Ubah `getStaffSession`**

- Izinkan `teknisi`.
- Ganti fallback `FULL_PERMISSIONS` dengan `resolvePermissions(role, rows, permError)`; jika hasilnya `null`, `return null`.
- Komentar singkat: fail closed, migrasi harus sudah jalan.

- [ ] **Step 6: Seed izin sesuai role di API staf**

- `app/api/admin/staff/route.ts`: setelah role ditetapkan, untuk `admin` tetap pakai `resolveRows(body.data)` (izin pilihan owner); untuk `teknisi` paksa `permissionRowsForRole("teknisi")`; untuk `owner` tidak menulis baris izin.
- `app/api/admin/staff/[id]/route.ts`: bila role berubah, panggil `replaceStaffPermissions(admin, id, permissionRowsForRole(roleBaru), session.userId)`. Untuk owner, array kosong menghapus semua baris.
- Jangan mengubah permission saat role tidak berubah.

- [ ] **Step 7: Guard login dan proxy**

- `proxy.ts`: syarat staf menjadi `profile.role === "owner" || profile.role === "admin" || profile.role === "teknisi"`.
- `app/api/admin/auth/login/route.ts`: syarat role yang sama.

- [ ] **Step 8: Jalankan test + typecheck**

Update `lib/admin/access.test.ts` dari Task 1: assert `PRESETS.teknisi.permissions.invoices.view === false` dan `PRESETS.teknisi.permissions.orders.manage === true`.
Run: `npx vitest run lib/admin/order-access.test.ts lib/admin/permissions-resolve.test.ts lib/admin/permission-rows.test.ts lib/admin/access.test.ts`
Run: `npx tsc --noEmit`
Expected: PASS. Error typecheck yang tersisa (role union) diperbaiki di Task 8–9.

- [ ] **Step 9: Checkpoint**

Review diff. Jangan commit.

---

### Task 6: Migrasi 008 — nilai enum teknisi

**Files:**
- Create: `supabase/migrations/008_staff_role_technician.sql`

- [ ] **Step 1: Tulis migrasi**

```sql
begin;
alter type public.staff_role add value if not exists 'teknisi';
commit;
```

Catatan: nilai tidak boleh dipakai di transaksi yang sama. Task 7 terpisah.

- [ ] **Step 2: Jalankan di SQL Editor**

Expected: `ALTER TYPE`. Cek `select unnest(enum_range(null::public.staff_role));` memuat `teknisi`.

- [ ] **Step 3: Checkpoint**

Jangan commit.

---

### Task 7: Migrasi 009 — assignment + RLS + trigger

**Files:**
- Create: `supabase/migrations/009_technician_assignment.sql`

**Interfaces:**
- Produces: kolom `service_orders.assigned_technician_id`; helper `public.is_admin_or_owner()`; policy select/insert/update baru.

- [ ] **Step 1: Tulis migrasi**

Isi wajib (boleh ditambah komentar):

```sql
begin;

alter table public.service_orders
  add column if not exists assigned_technician_id uuid
  references public.profiles (id) on delete set null;

create index if not exists service_orders_technician_idx
  on public.service_orders (assigned_technician_id);

create or replace function public.is_admin_or_owner()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.current_user_role() in ('owner', 'admin');
$$;
grant execute on function public.is_admin_or_owner() to authenticated;

-- Profil: admin/owner boleh membaca nama staf untuk penugasan.
drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin_or_owner());

-- Order: teknisi hanya yang ditugaskan.
drop policy if exists service_orders_select_staff on public.service_orders;
create policy service_orders_select_staff on public.service_orders
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and (
    public.is_admin_or_owner()
    or assigned_technician_id = auth.uid()
  )
);

drop policy if exists service_orders_insert_staff on public.service_orders;
create policy service_orders_insert_staff on public.service_orders
for insert to authenticated
with check (
  public.is_admin_or_owner()
  and public.has_permission('orders', 'manage')
);

drop policy if exists service_orders_update_staff on public.service_orders;
create policy service_orders_update_staff on public.service_orders
for update to authenticated
using (
  public.has_permission('orders', 'manage')
  and (public.is_admin_or_owner() or assigned_technician_id = auth.uid())
)
with check (
  public.has_permission('orders', 'manage')
  and (public.is_admin_or_owner() or assigned_technician_id = auth.uid())
);

-- Histori: ikut cakupan order.
drop policy if exists service_status_history_select_staff on public.service_status_history;
create policy service_status_history_select_staff on public.service_status_history
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_status_history.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

-- Pelanggan & perangkat: teknisi hanya yang terkait order-nya.
drop policy if exists customers_select_staff on public.customers;
create policy customers_select_staff on public.customers
for select to authenticated
using (
  public.has_permission('customers', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.customer_id = customers.id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

drop policy if exists devices_select_staff on public.devices;
create policy devices_select_staff on public.devices
for select to authenticated
using (
  public.has_permission('devices', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.device_id = devices.id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

drop policy if exists service_warranties_select_staff on public.service_warranties;
create policy service_warranties_select_staff on public.service_warranties
for select to authenticated
using (
  public.has_permission('warranties', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.id = service_warranties.order_id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

-- Tabel sensitif: ikut izin modul, bukan sekadar staf.
drop policy if exists invoices_select_staff on public.invoices;
create policy invoices_select_staff on public.invoices
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists invoice_items_select_staff on public.invoice_items;
create policy invoice_items_select_staff on public.invoice_items
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists payments_select_staff on public.payments;
create policy payments_select_staff on public.payments
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists spareparts_select_staff on public.spareparts;
create policy spareparts_select_staff on public.spareparts
for select to authenticated
using (public.has_permission('spareparts', 'view'));

drop policy if exists stock_movements_select_staff on public.stock_movements;
create policy stock_movements_select_staff on public.stock_movements
for select to authenticated
using (public.has_permission('spareparts', 'view'));

drop policy if exists testimonials_select_staff on public.testimonials;
create policy testimonials_select_staff on public.testimonials
for select to authenticated
using (public.has_permission('testimonials', 'view'));

-- Teknisi tidak boleh mengubah identitas order/biaya/penugasan.
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
      or new.total_amount is distinct from old.total_amount then
      raise exception 'ORDER_FIELD_FORBIDDEN' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists service_orders_guard_technician on public.service_orders;
create trigger service_orders_guard_technician
before update on public.service_orders
for each row execute function public.guard_order_technician_update();

notify pgrst, 'reload schema';

commit;
```

- [ ] **Step 2: Jalankan di SQL Editor**

Expected: sukses. Verifikasi cepat:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'service_orders'
  and column_name = 'assigned_technician_id';
```

- [ ] **Step 3: Cek manual dengan SQL**

Sebagai owner: semua order terlihat. Sebagai teknisi (setelah Task 9 membuat akun): hanya order dengan `assigned_technician_id = auth.uid()`. Coba `update service_orders set total_amount = 1` sebagai teknisi → error `ORDER_FIELD_FORBIDDEN`.

- [ ] **Step 4: Checkpoint**

Jangan commit.

---

### Task 8: API scoping + whitelist field

**Files:**
- Modify: `app/api/admin/orders/route.ts:1-57`
- Modify: `app/api/admin/orders/[id]/route.ts`
- Modify: `app/api/admin/orders/[id]/status/route.ts`
- Modify: `app/api/admin/orders/[id]/history/route.ts`
- Test: `lib/admin/order-access.test.ts` (dari Task 5)

**Interfaces:**
- Consumes: `canAccessOrder`, `canCreateOrders`, `orderFieldAllowed`.
- Produces: 403 untuk field terlarang, 404 untuk order di luar cakupan.

- [ ] **Step 1: GET daftar order**

Di `app/api/admin/orders/route.ts`:
- Tambah `assigned_technician_id` dan `technician:profiles(full_name)` ke `ORDER_SELECT`.
- Setelah parsing query: `if (session.role === "teknisi") builder = builder.eq("assigned_technician_id", session.userId);`
- POST: `if (!canCreateOrders(session.role)) return jsonError("Hanya owner/admin yang boleh membuat order.", 403);`

- [ ] **Step 2: GET/PATCH/DELETE detail**

Di `app/api/admin/orders/[id]/route.ts`:
- `ORDER_SELECT` tambah `assigned_technician_id, technician:profiles(full_name)`.
- GET: setelah `data` ada, `if (!canAccessOrder(session.role, session.userId, data)) return jsonError("Order servis tidak ditemukan", 404);`
- PATCH: muat dulu `id, assigned_technician_id`; 404 bila tidak boleh diakses. Lalu:
  ```ts
  const forbiddenFields = Object.keys(body.data).filter(
    (field) => !orderFieldAllowed(session.role, field),
  );
  if (forbiddenFields.length > 0) {
    return jsonError("Field tidak boleh diubah untuk role ini.", 403);
  }
  ```
- DELETE: tambah `if (!canCreateOrders(session.role))` → 403 (teknisi tidak boleh hapus).

- [ ] **Step 3: Status dan histori**

Di `[id]/status/route.ts`: ubah select menjadi `status, assigned_technician_id`; setelah `current` ada, tolak 404 bila `!canAccessOrder(...)`.
Di `[id]/history/route.ts`: muat order `assigned_technician_id` dulu; 404 bila tidak boleh.

- [ ] **Step 4: Test + verifikasi**

Run: `npx vitest run lib/admin/order-access.test.ts`
Run: `npx tsc --noEmit`
Expected: PASS, tidak ada error type.

- [ ] **Step 5: Cek manual API**

Dengan akun teknisi:
- GET daftar → hanya order assigned.
- GET order lain → 404.
- PATCH `total_amount` → 403.
- PATCH `diagnosis` → 200.

- [ ] **Step 6: Checkpoint**

Jangan commit.

---

### Task 9: UI penugasan + role staf

**Files:**
- Modify: `app/admin/(dashboard)/order/[id]/page.tsx`
- Modify: `app/admin/(dashboard)/order/[id]/order-detail-manager.tsx`
- Modify: `app/admin/(dashboard)/order/order-manager.tsx`
- Modify: `app/admin/(dashboard)/staf/staff-manager.tsx`
- Modify: `lib/supabase/schemas.ts` (`orderUpdateSchema` tambah `assigned_technician_id`)

**Interfaces:**
- Consumes: `ROLE_PRESETS`, `StaffRole`, `assigned_technician_id`, `technician.full_name`.
- Produces: form penugasan owner/admin; opsi role teknisi.

- [ ] **Step 1: Schema update**

Di `orderUpdateSchema` tambah `assigned_technician_id: z.string().uuid().nullable().optional()`.

- [ ] **Step 2: Halaman detail order**

Di `page.tsx`, setelah `requireStaffPage("orders")`, bila `session.role !== "teknisi"` ambil `profiles(id, full_name)` yang `is_active = true` dan `role = 'teknisi'`, urut `full_name`. Pass sebagai prop `technicians` dan `canAssign={session.role !== "teknisi"}`.

- [ ] **Step 3: Manager detail order**

Di `order-detail-manager.tsx`:
- Tampilkan "Teknisi: {technician?.full_name ?? 'Belum ditugaskan'}".
- Bila `canAssign`, tampilkan `<select>` berisi `technicians` + opsi "Belum ditugaskan"; simpan lewat `apiRequest(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ assigned_technician_id: value || null }) })`.
- Muat ulang data setelah sukses (pola yang sudah dipakai manager lain).

- [ ] **Step 4: Daftar order**

Di `order-manager.tsx`, tampilkan nama teknisi di baris order (kolom status/aksi yang ada). Tidak perlu filter baru; API sudah memfilter.

- [ ] **Step 5: Staff manager**

Di `staff-manager.tsx`:
- Opsi role: owner, admin, teknisi.
- Default form tetap admin.
- Saat role diubah, tampilkan catatan: "Izin akun akan direset ke preset role ini."
- Label role teknisi.

- [ ] **Step 6: Verifikasi**

Run: `npx tsc --noEmit`, `npx eslint .`, `npm run build`.
Manual: owner menugaskan teknisi; teknisi melihat order itu setelah login.

- [ ] **Step 7: Checkpoint**

Jangan commit.

---

### Task 10: Rate limit bersama

**Files:**
- Create: `supabase/migrations/010_shared_rate_limit.sql`
- Modify: `lib/supabase/rate-limit.ts`
- Modify: `app/api/public/service-status/route.ts:26,35`
- Modify: `app/api/public/testimonials/route.ts:61`
- Modify: `app/api/admin/auth/login/route.ts:7`

**Interfaces:**
- Produces: `rateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfterSeconds: number }>`.

- [ ] **Step 1: Tulis migrasi 010**

```sql
begin;

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0 check (count >= 0),
  reset_at timestamptz not null
);
create index if not exists rate_limits_reset_idx on public.rate_limits (reset_at);

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_reset timestamptz;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count = case when r.reset_at <= now() then 1 else r.count + 1 end,
        reset_at = case
          when r.reset_at <= now() then now() + make_interval(secs => p_window_ms / 1000.0)
          else r.reset_at
        end
  returning r.count, r.reset_at into v_count, v_reset;

  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 hour';
  end if;

  return query
    select
      v_count <= p_limit,
      greatest(0, ceil(extract(epoch from (v_reset - now())))::int);
end;
$$;

grant execute on function public.consume_rate_limit(text, integer, integer)
  to anon, authenticated;

commit;
```

- [ ] **Step 2: Ganti implementasi TypeScript**

`lib/supabase/rate-limit.ts`:

```ts
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    .single<{ allowed: boolean; retry_after_seconds: number }>();

  if (error || !data) {
    console.error("rate limit error:", error);
    return { ok: false, retryAfterSeconds: 30 };
  }
  return { ok: data.allowed, retryAfterSeconds: data.retry_after_seconds };
}
```

Hapus Map in-memory. Import `createSupabaseServerClient`.

- [ ] **Step 3: `await` semua pemanggil**

Ubah tiga route: `const limit = await rateLimit(...)`. Tidak ada perubahan perilaku lain.

- [ ] **Step 4: Jalankan migrasi 010 + verifikasi**

Run: `npx tsc --noEmit`, `npx eslint .`.
Manual: 21 request tracking dalam 10 menit dari IP yang sama → 429. Login 11 kali → 429.

- [ ] **Step 5: Checkpoint**

Jangan commit.

---

### Task 11: Audit log

**Files:**
- Create: `supabase/migrations/011_audit_log.sql`
- Create: `lib/admin/audit.ts`
- Modify: `app/api/admin/staff/route.ts`
- Modify: `app/api/admin/staff/[id]/route.ts`
- Modify: `app/api/admin/orders/[id]/route.ts` (DELETE)
- Modify: `app/api/admin/invoices/[id]/route.ts` (status batal)

**Interfaces:**
- Produces: `logAudit(input: { action: string; entity: string; entityId: string | null; metadata?: Record<string, unknown> }): Promise<void>`.

- [ ] **Step 1: Tulis migrasi 011**

```sql
begin;

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon;
grant select, insert on public.audit_logs to authenticated;

create policy audit_logs_select_owner on public.audit_logs
for select to authenticated using (public.is_owner());

create policy audit_logs_insert_staff on public.audit_logs
for insert to authenticated with check (actor_id = auth.uid());

-- Perubahan status order otomatis tercatat.
create or replace function public.audit_order_status()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
    values (
      auth.uid(),
      'order.status',
      'service_orders',
      new.id::text,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists service_orders_audit_status on public.service_orders;
create trigger service_orders_audit_status
after update of status on public.service_orders
for each row execute function public.audit_order_status();

commit;
```

- [ ] **Step 2: Helper TypeScript**

`lib/admin/audit.ts`:

```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logAudit(input: {
  action: string;
  entity: string;
  entityId: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    metadata: input.metadata ?? {},
  });
  if (error) console.error("audit log gagal:", error);
}
```

`actor_id` terisi otomatis jika kolom default `auth.uid()`; tambahkan default tersebut di migrasi:
`actor_id uuid default auth.uid() references ...`. Sesuaikan SQL Step 1.

- [ ] **Step 3: Pasang di operasi sensitif**

- `staff/route.ts`: setelah akun dibuat, `await logAudit({ action: "staff.create", entity: "profiles", entityId: userId, metadata: { role } })`.
- `staff/[id]/route.ts`: setelah update, `action: "staff.update"`, metadata field yang berubah (`role`, `is_active`).
- `orders/[id]/route.ts` DELETE: sebelum/sesudah hapus, `action: "order.delete"`, entityId.
- `invoices/[id]/route.ts`: bila `status === "batal"`, `action: "invoice.cancel"`.

- [ ] **Step 4: Verifikasi**

Run: migrasi 011, `npx tsc --noEmit`, `npx eslint .`.
Manual: ubah status order → baris `audit_logs` dengan `action = order.status`. Ubah role staf → `staff.update`.

- [ ] **Step 5: Checkpoint**

Jangan commit.

---

### Task 12: Mapper respons tracking publik (TDD)

**Files:**
- Create: `lib/public/tracking.ts`
- Create: `lib/public/tracking.test.ts`
- Modify: `app/api/public/service-status/route.ts:97-103`

**Interfaces:**
- Produces: `toPublicStatus(input: { ticket_number: string; device_type: string | null; status: string; estimated_finish_at: string | null }): { ticket_number: string; device_type: string | null; status: string; estimated_finish_at: string | null }`.

- [ ] **Step 1: Tulis test yang gagal**

Test: output hanya punya empat key tersebut; `Object.keys(result).sort()` sama persis; input berisi `phone`/`customer_name`/`id` tambahan tidak ikut keluar.

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run lib/public/tracking.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi mapper**

Fungsi memilih empat field secara eksplisit, tidak memakai spread.

- [ ] **Step 4: Pakai di route**

Ganti objek manual di route dengan `return jsonOk(toPublicStatus({ ... }))`.

- [ ] **Step 5: Verifikasi + checkpoint**

Run: `npx vitest run lib/public/tracking.test.ts`, `npx tsc --noEmit`.
Manual: respons tracking tidak memuat `phone`, `customer_name`, `id`.
Jangan commit.

---

### Task 13: Runbook migrasi + rekonsiliasi dokumen

**Files:**
- Create: `docs/runbooks/2026-11-13-foundation-migrations.md`
- Modify: `README.md`
- Modify: `panduan_refactor/docs/DESIGN-SYSTEM.md`
- Modify: `AGENTS.md` (bila belum lengkap dari Task 1)

- [ ] **Step 1: Tulis runbook**

Isi: urutan 007–011, cara menjalankan lewat SQL Editor, query verifikasi per migrasi, arti error (`TICKET_SEQUENCE_EXHAUSTED`, `ORDER_FIELD_FORBIDDEN`), prosedur rollback/recovery non-destruktif, dan urutan deploy (migrasi dulu, kode kemudian).

- [ ] **Step 2: Update README**

Struktur halaman publik terbaru (`tarif`, `faq`, `tentang`, `cek-status`, `selamat-datang`), dashboard admin, dan test command.

- [ ] **Step 3: Update DESIGN-SYSTEM**

Catat token aktual (`#061024`, `#1e5eff`, Sora + Plus Jakarta Sans) sebagai yang berlaku; palet PRD sebagai referensi awal. Tidak mengubah kode UI.

- [ ] **Step 4: Verifikasi akhir**

Run: `npm test`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`.
Expected: semua hijau.

- [ ] **Step 5: Laporan akhir**

Tulis ringkasan: file berubah, migrasi, hasil verifikasi, risiko, dan langkah uji manual 3 role. Jangan commit.
