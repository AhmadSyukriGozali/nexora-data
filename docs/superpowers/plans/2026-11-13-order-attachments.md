# Foto Before-After Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melampirkan foto kondisi unit sebelum dan sesudah servis per order, tersimpan privat di Supabase Storage.

**Architecture:** Tabel `service_attachments` menyimpan metadata; berkas di bucket privat `service-photos` dengan path `<order_id>/<kind>/<uuid>.<ext>`. API route memvalidasi sesi, izin, assignment, tipe, ukuran, dan jumlah; halaman detail menampilkan signed URL 1 jam. RLS membatasi teknisi ke order yang ditugaskan.

**Tech Stack:** Next.js 16 Route Handler, Supabase Postgres + Storage, zod, Vitest.

**Spec:** PRD BE-03 (`panduan_refactor/docs/PRD.md`) — foto bukti before-after.

## Global Constraints

- Komentar dan copy UI Bahasa Indonesia.
- Migrasi baru bernomor `013`, jangan ubah migrasi lama.
- Format JPG/PNG/WebP, maksimal 5 MB, maksimal 6 foto per jenis (`before`/`after`) per order.
- Unggah: owner/admin dan teknisi yang ditugaskan ke order tersebut. Hapus: owner/admin saja.
- Bucket privat; tampil lewat signed URL, bukan URL publik.
- Tidak tampil di tracking publik.

## Review Focus

- File bukan gambar atau >5 MB: ditolak 422, tidak ada berkas tersimpan.
- Teknisi membuka order milik teknisi lain: 404/403, tidak bisa unggah.
- Unggah ke-7 untuk jenis yang sama: ditolak tanpa menyisakan berkas.
- Insert metadata gagal setelah upload: berkas di Storage dihapus lagi.
- Order tanpa foto: seksi tampil dengan empty state, halaman tidak error.

---

### Task 1: Migrasi tabel, bucket, dan policy

**Files:**
- Create: `supabase/migrations/013_service_photos.sql`

**Interfaces:**
- Produces: tabel `public.service_attachments (id, order_id, kind, storage_path, uploaded_by, created_at)`; bucket `service-photos`.

- [ ] **Step 1: Tulis migrasi**

```sql
begin;

create table if not exists public.service_attachments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  kind text not null check (kind in ('before', 'after')),
  storage_path text not null unique,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists service_attachments_order_idx
  on public.service_attachments (order_id);

alter table public.service_attachments enable row level security;
revoke all on public.service_attachments from anon;
grant select, insert, delete on public.service_attachments to authenticated;

create policy service_attachments_select_staff on public.service_attachments
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_attachments.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

create policy service_attachments_insert_staff on public.service_attachments
for insert to authenticated
with check (
  public.has_permission('orders', 'manage')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_attachments.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

create policy service_attachments_delete_admin on public.service_attachments
for delete to authenticated
using (public.has_permission('orders', 'manage') and public.is_admin_or_owner());

insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', false)
on conflict (id) do nothing;

create policy service_photos_select_staff on storage.objects
for select to authenticated
using (
  bucket_id = 'service-photos'
  and exists (
    select 1 from public.service_attachments a
    join public.service_orders so on so.id = a.order_id
    where a.storage_path = storage.objects.name
      and public.has_permission('orders', 'view')
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

create policy service_photos_insert_staff on storage.objects
for insert to authenticated
with check (
  bucket_id = 'service-photos'
  and public.has_permission('orders', 'manage')
  and exists (
    select 1 from public.service_orders so
    where so.id::text = split_part(storage.objects.name, '/', 1)
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

create policy service_photos_delete_admin on storage.objects
for delete to authenticated
using (
  bucket_id = 'service-photos'
  and public.has_permission('orders', 'manage')
  and public.is_admin_or_owner()
);

notify pgrst, 'reload schema';

commit;
```

- [ ] **Step 2: Minta pengguna menjalankan migrasi di Supabase SQL Editor** (bucket dibuat oleh SQL yang sama).

---

### Task 2: Helper validasi dan path

**Files:**
- Create: `lib/admin/attachments.ts`
- Test: `lib/admin/attachments.test.ts`
- Modify: `lib/admin/types.ts` (`OrderAttachment`)

**Interfaces:**
- Produces: `ATTACHMENT_BUCKET = "service-photos"`; `ATTACHMENT_KINDS`; `type AttachmentKind = "before" | "after"`; `MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024`; `MAX_ATTACHMENTS_PER_KIND = 6`; `attachmentExtension(mime): string | null`; `validateAttachment({type,size}): string | null`; `attachmentPath(orderId, kind, mime): string`; `type OrderAttachment`.

- [ ] **Step 1: Tulis test yang gagal** (path berawalan `<orderId>/<kind>/` dan berekstensi sesuai mime; `validateAttachment` menolak gif, kosong, >5 MB, dan menerima jpeg 1 MB).

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/admin/attachments.test.ts`

- [ ] **Step 3: Implementasi**

```ts
export const ATTACHMENT_BUCKET = "service-photos";
export const ATTACHMENT_KINDS = ["before", "after"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_KIND = 6;

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function attachmentExtension(mime: string): string | null {
  return MIME_EXTENSION[mime] ?? null;
}

export function validateAttachment(file: { type: string; size: number }): string | null {
  if (!attachmentExtension(file.type)) return "Format foto harus JPG, PNG, atau WebP.";
  if (file.size <= 0) return "Berkas kosong.";
  if (file.size > MAX_ATTACHMENT_BYTES) return "Ukuran foto maksimal 5 MB.";
  return null;
}

export function attachmentPath(orderId: string, kind: AttachmentKind, mime: string): string {
  const extension = attachmentExtension(mime) ?? "bin";
  return `${orderId}/${kind}/${crypto.randomUUID()}.${extension}`;
}
```

`types.ts`: `export type OrderAttachment = { id: string; order_id: string; kind: AttachmentKind; storage_path: string; uploaded_by: string | null; created_at: string };`

- [ ] **Step 4: Jalankan test, pastikan lulus** + `npx tsc --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/013_service_photos.sql lib/admin/attachments.ts lib/admin/attachments.test.ts lib/admin/types.ts
git commit -m "feat(order): tabel dan helper foto before-after"
```

---

### Task 3: API unggah dan hapus

**Files:**
- Create: `app/api/admin/orders/[id]/attachments/route.ts`
- Create: `app/api/admin/orders/[id]/attachments/[attachmentId]/route.ts`

**Interfaces:**
- Consumes: helper Task 2, `getStaffSession`, `requirePermission`, `canAccessOrder`, `logAudit`.
- Produces: `POST` multipart (`file`, `kind`) → `{ data: OrderAttachment }`; `DELETE` → `{ data: { deleted: true } }`.

- [ ] **Step 1: Implementasi POST** — urutan: sesi → izin `orders/manage` → validasi `id` → ambil `assigned_technician_id` (404 jika tak terlihat) → `canAccessOrder` (403) → `formData()` → validasi kind & `validateAttachment` (422) → hitung foto jenis itu (409 jika ≥6) → `storage.upload` → insert metadata → jika insert gagal, `storage.remove` lalu `dbErrorResponse`.

- [ ] **Step 2: Implementasi DELETE** — sesi → izin `orders/manage` → tolak `teknisi` (403) → validasi dua id → ambil baris (`id`, `order_id`) → hapus baris → `storage.remove([storage_path])` (gagal hapus berkas cukup dicatat `console.error`) → `logAudit({ action: "attachment.delete", entity: "service_attachment", entityId })`.

- [ ] **Step 3: Verifikasi** `npx tsc --noEmit && npx eslint .` bersih.

- [ ] **Step 4: Commit**

```bash
git add "app/api/admin/orders/[id]/attachments"
git commit -m "feat(order): API unggah dan hapus foto"
```

---

### Task 4: Galeri di detail order

**Files:**
- Create: `app/admin/(dashboard)/order/[id]/order-attachments.tsx`
- Modify: `app/admin/(dashboard)/order/[id]/page.tsx`
- Modify: `lib/admin/types.ts` bila perlu (`OrderAttachment` sudah dari Task 2)

**Interfaces:**
- Consumes: `OrderAttachment`, `ATTACHMENT_KINDS`, `MAX_ATTACHMENTS_PER_KIND`, `validateAttachment`, `attachmentExtension`, `ConfirmDialog`.
- Produces: `<OrderAttachments orderId attachments canUpload canDelete />` dengan `attachments: (OrderAttachment & { url: string | null })[]`.

- [ ] **Step 1: Komponen client** — dua grup ("Sebelum", "Sesudah"): hitungan `n/6`, thumbnail `<img>` (signed URL), tombol unggah (`<input type="file" accept="image/jpeg,image/png,image/webp">` tersembunyi), tombol hapus (owner/admin) memakai `ConfirmDialog`. Unggah: validasi klien → `fetch` multipart → `router.refresh()`. Gagal → pesan error di grup.

- [ ] **Step 2: Halaman detail** — query `service_attachments` untuk order, buat signed URL (`createSignedUrls(paths, 3600)`), render `<OrderAttachments>` di kolom kiri setelah kartu informasi order. `canUpload = canAssign || order.assigned_technician_id === session.userId`; `canDelete = canAssign`.

- [ ] **Step 3: Verifikasi** `npm test`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/(dashboard)/order/[id]"
git commit -m "feat(order): galeri foto before-after di detail order"
```

---

### Task 5: Uji manual

- [ ] Owner: buka detail order → unggah 1 foto "Sebelum" → thumbnail tampil → hapus → hilang.
- [ ] Teknisi ditugaskan: bisa unggah, tidak melihat tombol hapus.
- [ ] Teknisi lain: tidak bisa membuka order tersebut.
- [ ] Unggah file .txt dan file >5 MB: muncul pesan error, tidak tersimpan.
