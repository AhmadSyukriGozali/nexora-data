# Runbook migrasi fondasi (2026-11-13)

Migrasi `007`–`011` menambah format kode servis baru, role teknisi + penugasan
order, rate limit bersama, dan audit log. Semuanya sudah dijalankan di Supabase
saat refactor fondasi. Dokumen ini dipakai untuk environment baru atau
verifikasi ulang.

## Prasyarat

- Migrasi `001`–`006` sudah diterapkan (skema inti, RLS, status flow, izin staf).
- Akses SQL Editor project Supabase (role `postgres`).
- Aplikasi belum memakai fitur baru sampai migrasi selesai: **terapkan migrasi
  dulu, deploy kode sesudahnya.**

## Cara menjalankan

1. Buka Supabase Dashboard → SQL Editor → New query.
2. Tempel isi satu file migrasi **utuh** (setiap file sudah punya
   `begin;`/`commit;`).
3. Klik Run, pastikan hasilnya `Success. No rows returned`.
4. Lanjut ke file berikutnya, urut sesuai nomor.

Jangan menggabungkan beberapa file dalam satu query: `008` menambah nilai enum
dan PostgreSQL tidak mengizinkan nilai enum baru dipakai di transaksi yang sama.

| Urutan | File | Isi |
|---|---|---|
| 1 | `007_ticket_code_format.sql` | `ticket_token()`, `next_ticket_number()` format `NXD-YYMM-XXX-YYYY`, constraint format tiket |
| 2 | `008_staff_role_technician.sql` | Nilai enum `teknisi` pada `staff_role` |
| 3 | `009_technician_assignment.sql` | Kolom `assigned_technician_id`, RLS per-penugasan, trigger `guard_order_technician_update` |
| 4 | `010_shared_rate_limit.sql` | Tabel `rate_limits`, fungsi `consume_rate_limit()` |
| 5 | `011_audit_log.sql` | Tabel `audit_logs`, RLS owner, trigger audit status order |

## Verifikasi

```sql
-- 007: fungsi generator ada dan formatnya baru
select public.next_ticket_number();
-- Harus seperti NXD-2611-001-K9M4. Ini memajukan counter; wajar.

-- 008: role teknisi diterima
select enumlabel from pg_enum
join pg_type on pg_type.oid = pg_enum.enumtypid
where pg_type.typname = 'staff_role'
order by enumsortorder;
-- Harus memuat owner, admin, teknisi.

-- 009: kolom penugasan + trigger
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'service_orders'
  and column_name = 'assigned_technician_id';

select tgname from pg_trigger
where tgname = 'service_orders_guard_technician';

-- 010: fungsi rate limit
select * from public.consume_rate_limit('runbook:check', 5, 60000);

-- 011: tabel audit + trigger status
select to_regclass('public.audit_logs');
select tgname from pg_trigger where tgname = 'service_orders_audit_status';
```

`notify pgrst, 'reload schema'` sudah ada di akhir `009` dan `011`; kalau
PostgREST masih membalas error kolom/tabel tidak dikenal, jalankan:

```sql
notify pgrst, 'reload schema';
```

lalu tunggu beberapa detik dan ulangi permintaan.

## Arti error

| Pesan | Penyebab | Tindakan |
|---|---|---|
| `TICKET_SEQUENCE_EXHAUSTED` | Nomor urut bulanan sudah lewat 999 | Tunggu periode `YYMM` berikutnya. Jika perlu lebih dari 999 tiket/bulan, longgarkan batas di `next_ticket_number()` dan constraint (minimal 4 digit sudah diterima pola). |
| `ORDER_FIELD_FORBIDDEN` | Teknisi mencoba mengubah `total_amount`, `customer_id`, `device_id`, `complaint`, `equipment`, `assigned_technician_id`, atau menyerahkan unit (`diambil`) | Bukan bug. Field itu hanya untuk owner/admin. |
| `WARRANTY_DURATION_REQUIRED` | Penyerahan unit tanpa `warranty_days` (1–3650 hari) | Isi durasi garansi di dialog penyerahan; tidak ada default. |
| `new row violates check constraint "service_orders_ticket_format"` | Format tiket di luar pola | Pakai `NXD-YYMM-XXX-YYYY` atau format lama `NXD-YYMM-XXXX`. |
| `permission denied for table rate_limits` | Klien memanggil tabel langsung | Rate limit hanya lewat `consume_rate_limit()` (grant execute untuk `anon`/`authenticated`). |
| `permission denied for function consume_rate_limit` | Migrasi `010` belum jalan | Jalankan `010`. |
| `relation "audit_logs" does not exist` | Migrasi `011` belum jalan, atau cache PostgREST | Jalankan `011`, lalu `notify pgrst, 'reload schema';`. |

## Rollback

`010` dan `011` bisa dilepas tanpa menyentuh data bisnis. Baris `audit_logs`
sengaja dibiarkan agar riwayat tidak hilang.

```sql
begin;

-- 011: lepas trigger audit; tabel audit_logs tetap ada
drop trigger if exists service_orders_audit_status on public.service_orders;
drop function if exists public.audit_order_status();

-- 010: hentikan rate limit bersama
drop function if exists public.consume_rate_limit(text, integer, integer);
drop table if exists public.rate_limits;

commit;
```

`007`–`009` dianggap **maju saja (forward-only)**: policy RLS dan fungsi baru
bergantung pada kolom `assigned_technician_id`, jadi melepasnya butuh
membangun ulang seluruh blok policy `002`/`006` lebih dulu. Untuk database uji,
lebih cepat buat project baru dan jalankan `001`–`011` dari awal. Jangan
rollback `007` selama masih ada tiket berformat baru: constraint lama akan
menolaknya.

Kalau perlu kembali ke versi aplikasi lama, lakukan **setelah** migrasi di atas,
bukan sebaliknya.

## Migrasi fitur order (012–014)

Dijalankan setelah `011`, urut, file utuh seperti di atas.

| Urutan | File | Isi |
|---|---|---|
| 6 | `012_order_equipment.sql` | Kolom `service_orders.equipment` (jsonb, maks 10 item), constraint bentuk, trigger teknisi menolak perubahan `equipment` |
| 7 | `013_service_photos.sql` | Tabel `service_attachments`, RLS per-penugasan, bucket privat `service-photos`, policy Storage |
| 8 | `014_warranty_on_pickup.sql` | `change_order_status` versi baru: penyerahan wajib durasi garansi, hanya owner/admin, garansi dibuat atomik |

Verifikasi:

```sql
-- 012: kolom kelengkapan unit
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'service_orders'
  and column_name = 'equipment';

-- 013: tabel, bucket, dan policy storage
select to_regclass('public.service_attachments');
select id, public from storage.buckets where id = 'service-photos';
select policyname from pg_policies
where schemaname = 'storage' and policyname like 'service_photos_%';

-- 014: signature fungsi status yang baru
select pg_get_function_identity_arguments(p.oid)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'change_order_status';
-- Harus memuat p_warranty_days dan p_warranty_terms.
```

`013` butuh `has_permission()` (dari `006`) dan `is_admin_or_owner()` (dari
`009`). Bucket dibuat oleh SQL yang sama; tidak perlu klik manual di dashboard.
Rollback `013`: hapus tabel dan policy, lalu
`delete from storage.buckets where id = 'service-photos';` setelah berkas
dihapus. Rollback `012` aman selama tidak ada kode yang membaca `equipment`.
Rollback `014` butuh membuat ulang `change_order_status` versi 3 argumen dari
`001` sebelum kode lama dipakai lagi.

## Urutan deploy

1. Jalankan `007` → `011` di Supabase.
2. Deploy aplikasi.
3. Buat satu akun `teknisi` lewat menu Staf, tugaskan satu order, lalu cek:
   teknisi hanya melihat order miliknya, tidak bisa mengubah biaya, dan tidak
   bisa membuka menu invoice/testimoni.
4. Pantau `audit_logs` dan `rate_limits` beberapa hari pertama.
