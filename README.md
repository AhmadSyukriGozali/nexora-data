# Nexora Data

Situs profil dan katalog layanan Nexora Data: servis HP, laptop, dan PC di
Pulo Gebang, Cakung, Jakarta Timur.

Dibangun dengan Next.js 16 (App Router), React 19, TypeScript, dan Tailwind CSS v4.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm run start    # jalankan hasil build
npx eslint .     # cek gaya kode
```

## Struktur

```
app/
  page.tsx              komposisi beranda
  layanan/page.tsx      rincian layanan per perangkat
  kontak/page.tsx       kontak, formulir, dan peta
  layout.tsx            font, metadata, header/footer, JSON-LD bisnis
  template.tsx          transisi antarhalaman
  globals.css           token warna, tipografi, animasi
components/
  home/                 satu komponen per bagian beranda
  ui/                   primitif bersama: Section, ButtonLink
  estimate.tsx          kalkulator estimasi biaya (interaktif)
  contact-form.tsx      formulir yang menyusun pesan WhatsApp
  site-header.tsx       header tetap + menu seluler
  site-footer.tsx       kontak, kredit foto, dan copyright
  reveal.tsx            animasi muncul saat digulir
lib/
  site.ts               identitas bisnis, alamat, WhatsApp, peta
  content.ts            daftar layanan, proses, estimasi harga, FAQ
  media.ts              kredit foto dan foto suasana
  structured-data.ts    JSON-LD LocalBusiness dan FAQPage
  cn.ts                 penggabung className
```

## Mengubah konten

- **Harga dan daftar kerusakan** ada di `lib/content.ts`
  (`estimates`, `priceRows`). Tabel desktop dan daftar seluler memakai data
  yang sama.
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
