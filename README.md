# Nexora Data

Situs profil dan katalog layanan Nexora Data: servis HP, laptop, PC, dan
printer di Pulo Gebang, Cakung, Jakarta Timur.

Dibangun dengan Next.js 16 (App Router), React 19, TypeScript, dan Tailwind CSS v4.

## Menjalankan

```bash
npm install
# buat .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY (service role hanya untuk server)
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm run start    # jalankan hasil build
npm test         # vitest (unit test murni, tanpa database)
npx tsc --noEmit # cek tipe
npx eslint .     # cek gaya kode
```

Skema database dan migrasi ada di `supabase/migrations/` (`001`–`011`), dijalankan
manual lewat Supabase SQL Editor. Urutan, verifikasi, dan rollback:
`docs/runbooks/2026-11-13-foundation-migrations.md`.

## Struktur

```
app/
  page.tsx              beranda
  layanan/ tarif/ faq/ tentang/ kontak/   halaman publik
  cek-status/           pelacakan tiket publik
  selamat-datang/       welcome gate kunjungan pertama
  admin/                login + dashboard (order, pelanggan, perangkat,
                        sparepart, invoice, garansi, testimoni, staf)
  api/admin/            Route Handler admin (cek sesi + izin per route)
  api/public/           testimoni + pelacakan status (rate limited)
  layout.tsx            font, metadata, header/footer, JSON-LD bisnis
  globals.css           token warna, tipografi, animasi
proxy.ts                welcome gate + guard sesi /admin/*
components/
  home/                 satu komponen per bagian beranda
  admin/                shell dashboard, form control, tabel, dialog
  ui/                   primitif bersama: Section, ButtonLink
  estimate.tsx          kalkulator estimasi biaya (interaktif)
  contact-form.tsx      formulir yang menyusun pesan WhatsApp
  site-header.tsx       header tetap + menu seluler
  site-footer.tsx       kontak, kredit foto, dan copyright
lib/
  site.ts               identitas bisnis, alamat, WhatsApp, peta
  content.ts            daftar layanan, proses, estimasi harga, FAQ
  admin/                izin modul, alur status, format, helper API klien
  tickets/              pola kode servis NXD-YYMM-XXX-YYYY
  public/               mapper respons tracking publik
  supabase/             klien server/browser, auth, skema zod, rate limit
  media.ts              kredit foto dan foto suasana
  structured-data.ts    JSON-LD LocalBusiness dan FAQPage
scripts/
  verify-ticket-concurrency.mjs   uji 20 tiket paralel (butuh env Supabase)
```

## Peran staf

- **Owner** — akses penuh, termasuk menu Staf dan harga modal.
- **Admin** — mengikuti izin per modul yang diatur owner.
- **Teknisi** — hanya order yang ditugaskan; boleh mengubah diagnosa, estimasi
  selesai, dan status. Tidak bisa membuat/menghapus order, melihat invoice,
  testimoni, atau biaya.


## Mengubah konten

- **Harga dan daftar kerusakan** ada di `lib/content.ts`
  (`estimates`, `priceRows`). Tabel desktop dan daftar seluler memakai data
  yang sama; daftar seluler menyembunyikan baris bertanda `—`.
- **Alamat, jam buka, WhatsApp, Instagram** ada di `lib/site.ts`.
- **Teks halaman** berada langsung di komponennya; bagian beranda ada di
  `components/home/`.
- **Foto** disimpan di `public/images/`. Ganti dengan foto asli toko, lalu
  perbarui `lib/media.ts` dan kredit di footer.

## Yang perlu diganti sebelum publikasi

1. **Harga** di `lib/content.ts` masih berupa estimasi, bukan tarif resmi.
2. **`site.url`** di `lib/site.ts` masih `https://nexoradata.id`; sesuaikan
   dengan domain final agar metadata dan sitemap benar.
3. **Tahun copyright** di `components/site-footer.tsx` masih `2026`
   (dibuat statis karena `cacheComponents` melarang `new Date()` saat
   prerender).
4. **`claimsPlaceholder`** di `lib/content.ts` sengaja tidak dirender.
   Isi dengan angka yang benar-benar bisa dibuktikan sebelum dipakai.
5. **Foto** saat ini berasal dari Wikimedia Commons (berlisensi terbuka) dan
   hanya menggambarkan suasana servis, bukan toko Nexora Data. Ganti dengan
   foto asli.
6. **Koordinat peta** di `lib/structured-data.ts` masih perkiraan area Pulo
   Gebang; sesuaikan dengan titik toko yang tepat.
