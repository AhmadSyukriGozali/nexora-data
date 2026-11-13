<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nexora Data — agent notes

Situs publik + dashboard admin untuk servis HP/laptop/PC/printer di Cakung, Jakarta Timur. Next.js 16 App Router, React 19, Tailwind v4 (via Turbopack), Supabase, zod. Semua komentar kode dan copy UI dalam **Bahasa Indonesia**.

## Commands

```bash
npm run dev            # dev server (Turbopack)
npm run build          # verifikasi produksi
npm test               # vitest (unit test murni)
npx tsc --noEmit       # typecheck
npx eslint .           # lint (package.json: lint = "eslint")
```

Verifikasi = `npm test` + `tsc --noEmit` + `eslint` (+ `build` untuk perubahan struktur halaman/Route Handler).

## Arsitektur

- **Halaman publik**: `app/` — beranda, `layanan`, `tarif`, `kontak`, `faq`, `tentang`, `cek-status`, `selamat-datang` (welcome gate). Konten bisnis di `lib/content.ts` + `lib/site.ts`; JSON-LD di `lib/structured-data.ts`.
- **Admin**: `app/admin/(dashboard)/` dengan path bahasa Indonesia (`order`, `pelanggan`, `perangkat`, `sparepart`, `invoice`, `garansi`, `testimoni`, `staf`). Client component per modul di `components/admin/*-manager.tsx`.
- **`proxy.ts`** (middleware) mengurus dua hal: welcome-gate kunjungan pertama ke `/` (skip untuk bot, RSC/prefetch) dan guard sesi untuk `/admin/*`. **API admin TIDAK lewat proxy** — setiap Route Handler wajib cek sesi & permission sendiri (lihat `app/api/admin/orders/route.ts` sebagai pola).
- **API**: `app/api/admin/*` dan `app/api/public/*`. Pola wajib: `getStaffSession()` → `requirePermission(session, module, action)` → `parseBody`/`parseQuery` (skema zod di `lib/supabase/schemas.ts`) → `dbErrorResponse`/`jsonOk`/`jsonError` dari `lib/supabase/http`.
- **Klien → API** dari komponen admin memakai `apiRequest()` di `lib/admin/client-api.ts` (balikan `{ ok, data | message }`), bukan fetch mentah.

## Supabase

- `supabase/migrations/001..011` = sumber kebenaran skema: `counters`, `profiles`, `customers`, `devices`, `service_orders`, `service_status_history`, `spareparts`, `stock_movements`, `sparepart_costs`, `invoices`, `invoice_items`, `payments`, `service_warranties`, `testimonials`, `staff_permissions`, `rate_limits`, `audit_logs`. RLS ada di `002` + penyesuaian di `006`/`009`. Jika mengubah skema, tulis migrasi baru — jangan ubah migrasi lama. Urutan deploy: migrasi dulu, kode sesudahnya (lihat `docs/runbooks/2026-11-13-foundation-migrations.md`).
- Klien Supabase di `lib/supabase/`: `server.ts` (server component/Route Handler), `client.ts` (browser), `auth.ts` (`getStaffSession`, `requirePermission`). Jangan buat instance sendiri.
- Env di `.env.local` (di-gitignore): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Akses lewat helper `lib/supabase/env.ts` (error jelas jika kosong). Service role key **hanya server, jangan pernah `NEXT_PUBLIC_`**.
- Rate limit endpoint publik memakai `lib/supabase/rate-limit.ts` → RPC `consume_rate_limit` (migrasi `010`), jadi batas berlaku lintas instance. Gagal query = tolak (fail closed).

## Aturan domain (jangan dikarang sendiri)

- **Alur status order/invoice** disimpan di `lib/admin/status-flow.ts` (`ORDER_FLOW`, `INVOICE_FLOW`) sebagai satu sumber kebenaran untuk UI, API, dan trigger DB (migrasi `005`). `lunas` untuk invoice hanya dihasilkan otomatis oleh sistem pembayaran — tidak boleh dipilih staf.
- **Kode servis** berformat `NXD-YYMM-XXX-YYYY` (contoh `NXD-2611-001-K9M4`); format lama `NXD-YYMM-XXXX` tetap diterima saat pelacakan. Validasi klien/server memakai `lib/tickets/ticket-number.ts`, generator ada di migrasi `007`.
- **Permission** di `lib/admin/access.ts`: modul × `view/manage/delete/viewCost`. `viewCost` menyembunyikan harga modal dari admin; modul `staf` hanya untuk owner. Guard halaman: `requireStaffPage()` / `requireOwnerPage()` di `lib/admin/guard.ts`.
- **Role teknisi** hanya melihat order dengan `assigned_technician_id` = dirinya (RLS `009` + `lib/admin/order-access.ts`) dan hanya boleh mengubah `diagnosis`, `estimated_finish_at`, `status`; trigger DB menolak field lain dengan `ORDER_FIELD_FORBIDDEN`. Aksi sensitif dicatat lewat `lib/admin/audit.ts` ke `audit_logs`.

## Gotcha Next.js

`cacheComponents: true` aktif (plus `reactCompiler`, `partialPrefetching`). Tidak boleh pakai `new Date()` / data dinamis di server component saat prerender — copyright footer sengaja statis `2026`. Baca panduan terkait di `node_modules/next/dist/docs/` sebelum menulis kode Next.

## Referensi lain

- `README.md` — struktur file & checklist "sebelum publikasi" (harga, `site.url`, foto placeholder Wikimedia, koordinat peta).
- `panduan_refactor/docs/` — PRD, ARCHITECTURE, DATABASE, DESIGN-SYSTEM, SECURITY, DEVELOPMENT-ROADMAP.
- `.taste-skill/` hanya artefak skill desain (screenshot & direction), bukan kode app — jangan diubah.
- Path alias `@/*` = root repo (`tsconfig.json`).
