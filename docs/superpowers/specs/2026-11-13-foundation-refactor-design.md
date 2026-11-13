# Desain Refactor Fondasi — Nexora Data

Tanggal: 2026-11-13
Status: menunggu persetujuan pemilik proyek
Acuan: `panduan_refactor/` (PRD v2.2, ARCHITECTURE, DATABASE, SECURITY, DESIGN-SYSTEM, DEVELOPMENT-ROADMAP)

## 1. Intent dan alasan

Repo sudah punya dashboard admin, Supabase, RLS, API, invoice, stok, dan tracking. Yang belum sehat adalah fondasi yang akan menanggung fitur PRD berikutnya:

- format kode servis menyimpang dari keputusan resmi;
- role teknisi sudah dihapus (migrasi 003) padahal PRD membutuhkannya;
- rate limit hanya in-memory;
- tidak ada test suite;
- tidak ada audit log;
- dokumen (`AGENTS.md`, README) tidak sinkron dengan kode.

Tujuan refactor: membereskan fondasi ini dulu, tanpa menambah fitur produk baru, supaya fase fitur berikutnya tidak menumpuk utang teknis.

## 2. Goals

1. Test harness berjalan dan mengunci logika kritis (status flow, permission, format kode, validasi).
2. Kode servis baru memakai `NXD-YYMM-XXX-YYYY` sesuai keputusan resmi, aman terhadap concurrency.
3. Role `teknisi` hidup lagi, dengan penugasan tiket dan pembatasan akses server-side.
4. Rate limit tracking/login memakai store bersama, bukan memori per instance.
5. Audit log punya tabel + helper + titik pasang untuk operasi sensitif utama.
6. `AGENTS.md` dan README akurat.

## 3. Non-goals

Tidak dikerjakan di refactor ini (fase fitur berikutnya): booking + konversi tiket, cek garansi publik, upload foto before-after, laporan/ekspor Owner, approval tarif, CMS berbasis DB, QR/PDF/thermal, template WhatsApp status, timeline tracking lengkap.

## 4. Anti-goals

- Tidak menulis ulang UI publik atau memindahkan repo ke `features/*`.
- Tidak mengganti Supabase, Next.js, zod, atau pola Route Handler yang sudah ada.
- Tidak menjalankan migrasi destruktif atau menghapus data uji.
- Tidak mengubah format nomor invoice (`NXD-INV-YYMM-XXXX`); keputusan resmi hanya menyangkut kode servis.

## 5. Constraints

- Next.js 16 App Router, `cacheComponents: true`; jangan pakai `new Date()` di server component saat prerender.
- Supabase/PostgreSQL; migrasi baru bernomor urut, migrasi lama tidak diubah.
- Path alias `@/*` = root repo.
- Komentar dan copy UI berbahasa Indonesia.
- Tidak ada CI; verifikasi manual: `npm test`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

## 6. Pendekatan

Tiga opsi dipertimbangkan:

- **A. Irisan bertahap** (dipilih): 5 langkah kecil, tiap langkah lolos verifikasi sebelum lanjut.
- **B. Big-bang**: semua fondasi dalam satu branch. Ditolak: diff besar, sulit direview, kegagalan satu bagian menahan semua.
- **C. Struktur dulu** (`features/*`): ditolak: churn besar tanpa nilai pengguna; panduan sendiri melarang refactor luas bersamaan fitur.

## 7. Langkah 1 — Baseline dan test harness

**Keputusan:** Vitest (1 dev dependency) + alias `@` di config. Node 26 sebenarnya bisa `node --test`, tapi resolusi alias dan TS ESM menambah friksi.

File:

- `package.json`: devDependency `vitest`, script `test`, `test:watch`.
- `vitest.config.ts` (baru): `resolve.alias` untuk `@`.
- `lib/admin/status-flow.test.ts` (baru): transisi order valid/tidak, `ORDER_SEQUENCE`, alur invoice manual (tanpa `lunas`).
- `lib/admin/access.test.ts` (baru): `can()`, preset, `viewCost`, owner penuh.
- `lib/tickets/ticket-number.test.ts` (baru): format baru + lama diterima, format salah ditolak.
- `lib/supabase/schemas.test.ts` (baru): normalisasi nomor HP, validasi tiket publik.
- `AGENTS.md`: ganti rujukan `referensi_audit/docs/` menjadi `panduan_refactor/docs/`; tambah format kode servis dan model role.

Verifikasi: `npm test`, `npx tsc --noEmit`, `npx eslint .`.

## 8. Langkah 2 — Kode servis `NXD-YYMM-XXX-YYYY`

**Keputusan:**

- Counter tetap memakai `public.counters` + `next_counter()` yang sudah atomik (upsert `on conflict`).
- Periode `YYMM` dari `now() at time zone 'Asia/Jakarta'`.
- Nomor urut 3 digit minimum. Jika melewati 999, fungsi melempar error eksplisit `TICKET_SEQUENCE_EXHAUSTED`; tidak memotong angka. Perluasan ke 4 digit diputuskan nanti bila benar-benar terjadi.
- Token 4 karakter dari alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, dihasilkan di PostgreSQL dari `gen_random_uuid()` (RNG kuat bawaan PostgreSQL), bukan `random()` dan bukan `Math.random()`. Tidak perlu pgcrypto.
- Tiket lama tetap valid. Constraint menerima format lama **atau** baru. Tidak ada data uji yang dihapus.
- Collision token tidak perlu retry: kode selalu memuat nomor urut unik per periode, jadi pasangan `(periode, urut)` tidak pernah berulang. Unique constraint `ticket_number` tetap pengaman final.

File:

- `supabase/migrations/007_ticket_code_format.sql` (baru): `next_ticket_number()` baru, ganti constraint `service_orders_ticket_format` menjadi menerima dua format, komentar kebijakan 999.
- `lib/tickets/ticket-number.ts` (baru): `TICKET_NUMBER_PATTERN` (lama + baru), `NEW_TICKET_NUMBER_PATTERN`, `TICKET_NUMBER_PLACEHOLDER`, `isTicketNumber()`.
- `lib/supabase/schemas.ts`: `ticketNumberSchema` memakai pola bersama.
- `components/testimonial-form.tsx`: regex dan placeholder memakai konstanta bersama.
- `components/order-status-checker.tsx`, `app/cek-status/page.tsx`: placeholder `NXD-2611-001-K9M4`.
- `lib/tickets/ticket-number.test.ts`: tes format.

Verifikasi tambahan (manual, terhadap Supabase dev): `scripts/verify-ticket-concurrency.mjs` membuat N tiket paralel, memastikan tidak ada duplikat, nomor urut berurutan, dan format benar. Script tidak dijalankan otomatis.

**Alur migrasi (diputuskan):** tidak memakai Supabase CLI. SQL 007–011 dijalankan manual lewat SQL Editor oleh pemilik, berurutan, di project data uji. Saya menulis `docs/runbooks/2026-11-13-foundation-migrations.md` berisi urutan file, cara cek berhasil/gagal, dan rollback/recovery per langkah. Setelah migrasi, pemilik membuat akun uji owner/admin/teknisi lewat halaman Staf; verifikasi manual memakai akun itu.

## 9. Langkah 3 — Role teknisi dan assignment

**Keputusan:**

- `staff_role` mendapat nilai ketiga `teknisi` (migrasi terpisah karena `ALTER TYPE ... ADD VALUE` harus commit sebelum dipakai).
- `service_orders` mendapat `assigned_technician_id uuid references profiles(id) on delete set null` + index.
- Permission tetap per modul (`staff_permissions`); role menentukan cakupan objek, bukan menggantikan permission.
- **Izin default teknisi (least privilege):** dashboard lihat, orders manage, customers/devices/warranties/spareparts lihat. Tanpa invoice, pembayaran, testimoni, hapus, dan harga modal. Preset `PRESETS.teknisi` diubah agar sesuai; tambah `ROLE_PRESETS` sebagai sumber default.
- **Role berubah = izin di-reset** ke preset role tersebut, agar teknisi baru tidak masuk tanpa izin. Perubahan izin manual tetap bisa dilakukan owner setelahnya. UI staf menampilkan catatan ini.
- Teknisi hanya boleh melihat/mengubah order yang ditugaskan. Admin dan owner melihat semua.
- **Cakupan RLS, bukan hanya UI:** select `invoices`, `invoice_items`, `payments` memakai `has_permission('invoices','view')`; `testimonials` memakai izin modulnya; `spareparts`/`stock_movements` memakai `has_permission('spareparts','view')`. Jadi teknisi tidak bisa membaca data keuangan lewat PostgREST walau UI disembunyikan.
- `customers`, `devices`, dan `service_warranties` untuk teknisi dibatasi ke data yang terhubung ke order yang ditugaskan; owner/admin tetap semua.
- Hanya owner/admin yang boleh membuat dan menghapus order; teknisi hanya update field kerja pada order yang ditugaskan.
- **Field yang boleh ditulis teknisi:** `diagnosis`, `estimated_finish_at`, dan status lewat route status. `complaint`, `total_amount`, `assigned_technician_id`, `customer_id`, `device_id` ditolak 403. Admin/owner boleh semua.
- Teknisi tidak boleh mengubah `assigned_technician_id`; dijaga trigger database, bukan hanya UI.
- **Fallback permission gagal = fail closed.** Jika query `staff_permissions` error, sesi non-owner ditolak (owner tetap penuh). Urutan deploy: migrasi dulu, baru kode.
- `service_status_history` ikut dibatasi untuk teknisi.

File:

- `supabase/migrations/008_staff_role_technician.sql` (baru): tambah nilai enum.
- `supabase/migrations/009_technician_assignment.sql` (baru): kolom + index, helper role, policy select/update/insert order dan history, scoping customers/devices/warranties, policy select per modul untuk tabel sensitif, trigger penjaga assignment.
- `lib/supabase/auth.ts`: `StaffRole` + `"teknisi"`, izinkan sesi teknisi, helper `canAccessOrder(session, order)`, `canCreateOrders(session)`, `editableOrderFields(session)`, dan fail-closed.
- `lib/admin/access.ts`: `PRESETS.teknisi` least privilege + `ROLE_PRESETS`.
- `lib/admin/types.ts`: tipe role dan field assignment.
- `lib/supabase/schemas.ts`: enum role staf menerima `teknisi`.
- `proxy.ts`, `app/api/admin/auth/login/route.ts`: guard menerima teknisi.
- `app/api/admin/staff/route.ts`, `app/api/admin/staff/[id]/route.ts`: seed izin sesuai role; reset saat role berubah.
- `app/api/admin/orders/route.ts`: GET difilter untuk teknisi; POST khusus owner/admin.
- `app/api/admin/orders/[id]/route.ts`, `.../[id]/status/route.ts`, `.../[id]/history/route.ts`: tolak order yang bukan milik teknisi; whitelist field.
- `app/admin/(dashboard)/order/order-manager.tsx`, `.../[id]/order-detail-manager.tsx`: tampilkan + form penugasan (owner/admin).
- `app/admin/(dashboard)/staf/staff-manager.tsx`: opsi role teknisi + catatan reset izin.
- Test: scoping order dan whitelist field (helper murni terpisah).

Verifikasi manual per role (owner/admin/teknisi): login, daftar order, buka order yang ditugaskan vs tidak, ubah status, coba ubah assignment, coba buka invoice.

## 10. Langkah 4 — Hardening

### 4a. Rate limit bersama

- `supabase/migrations/010_shared_rate_limit.sql` (baru): tabel `rate_limits (key text primary key, count int, reset_at timestamptz)`, index `reset_at`, fungsi `consume_rate_limit(p_key, p_limit, p_window_ms)` security definer yang atomik (upsert + increment), dan pembersihan oportunistik baris kedaluwarsa.
- `lib/supabase/rate-limit.ts`: `rateLimit` menjadi async dan memanggil RPC. Jika RPC gagal, tolak permintaan (fail closed) karena query data juga butuh database yang sama.
- Update pemanggil: `app/api/public/service-status/route.ts`, `app/api/public/testimonials/route.ts`, `app/api/admin/auth/login/route.ts`.

### 4b. Audit log

- `supabase/migrations/011_audit_log.sql` (baru): tabel `audit_logs (id bigint identity, actor_id, action, entity, entity_id, metadata jsonb, created_at)`, index waktu, RLS select owner-only, insert hanya lewat security definer `log_audit(...)`, tanpa policy update/delete.
- `lib/admin/audit.ts` (baru): wrapper server `logAudit()`.
- Pasang di fondasi: perubahan role/status staf, hapus order, perubahan status order (lewat `change_order_status`), pembatalan invoice.
- Operasi sensitif lain dicatat sebagai backlog, bukan diklaim selesai.

### 4c. Kebocoran data publik

- Ekstrak pemetaan respons tracking ke fungsi murni `toPublicStatus()` + test yang memastikan tidak ada `phone`, `customer_name`, `id` internal, atau catatan teknisi.
- Placeholder mask nama disiapkan untuk fase fitur; belum ditampilkan.

File: `supabase/migrations/010_shared_rate_limit.sql`, `011_audit_log.sql`, `lib/supabase/rate-limit.ts`, `lib/admin/audit.ts`, tiga route pemanggil rate limit, `lib/public/tracking.ts` + test.

## 11. Langkah 5 — Rekonsiliasi dokumen dan token desain

- `AGENTS.md`: rujukan docs benar, tambah format kode servis, role, dan status test.
- `README.md`: struktur halaman publik dan admin terbaru.
- `panduan_refactor/docs/DESIGN-SYSTEM.md`: **diputuskan** pertahankan identitas visual sekarang (navy `#061024`, electric `#1e5eff`, Sora + Plus Jakarta Sans). Perbarui dokumen agar palet PRD tercatat sebagai referensi awal, bukan kontrak aktif.

## 12. Urutan eksekusi dan gate

Migrasi dijalankan manual lewat SQL Editor sesuai `docs/runbooks/2026-11-13-foundation-migrations.md`. Migrasi dulu, kode menyusul (terutama fail-closed permission).

| Langkah | Gate sebelum lanjut |
|---|---|
| 1. Baseline + test | `npm test`, typecheck, lint hijau |
| 2. Kode servis | migrasi 007 sukses; test format + typecheck + build hijau; cek manual tiket baru |
| 3. Teknisi + assignment | migrasi 008–009 sukses; uji manual 3 role; RLS tidak mengunci owner/admin |
| 4. Hardening | migrasi 010–011 sukses; test unit hijau; cek tracking + login + audit |
| 5. Dokumen | tidak ada rujukan salah; keputusan token tercatat |

Satu langkah = satu perubahan terfokus. Jika langkah membesar, dipecah lagi.

## 13. Risiko

- **Perubahan RLS** bisa mengunci staf jika policy salah. Mitigasi: uji manual tiap role sebelum lanjut; owner selalu lolos; runbook menyertakan query diagnosa policy.
- **Enum `staff_role`** tidak bisa dipakai dalam transaksi yang sama saat ditambahkan. Mitigasi: migrasi 008 terpisah.
- **Fail-closed permission** menolak staf bila migrasi 006 belum ada. Mitigasi: urutan deploy migrasi dulu; cek `has_permission` sebelum deploy kode.
- **Rate limit berbasis DB** menambah satu query per request publik. Volume tracking kecil; risiko diterima.
- **Tidak ada automated DB test**. Mitigasi: test unit untuk logika murni + skrip verifikasi concurrency manual + checklist SQL.
- **Data uji lama** memakai format tiket lama. Mitigasi: constraint menerima dua format; tidak ada penghapusan.
- **Teknisi tetap staf tepercaya** untuk data yang tidak terhubung order (mis. daftar testimoni publik). Scoping penuh seluruh tabel adalah backlog RBAC, bukan klaim selesai di refactor ini.

## 14. Yang diserahkan ke builder

- Nama fungsi/helper akhir dan penempatan file test.
- Detail UI form penugasan (dropdown vs aksi cepat) mengikuti pola `*-manager.tsx` yang ada.
- Apakah audit log status order dipasang di trigger SQL atau di wrapper API.
- Kebijakan pembersihan `rate_limits` (oportunistik vs terjadwal).
- Bentuk akhir runbook migrasi (query verifikasi per policy).
