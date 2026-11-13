# Architecture — Nexora Data

## 1. Tujuan

Menerjemahkan kebutuhan PRD menjadi struktur aplikasi modular yang dapat berkembang. Ini adalah panduan implementasi, bukan klaim bahwa repository saat ini sudah memakai struktur ini.

## 2. Stack sumber PRD

- Next.js App Router
- Tailwind CSS
- PostgreSQL
- Prisma ORM disebut dalam PRD
- Next.js Server Actions / Route Handlers
- Auth.js / Bcrypt disebut sebagai opsi autentikasi
- Cloudinary / S3 disebut sebagai opsi penyimpanan foto

**Wajib audit terlebih dahulu:** periksa `package.json`, lockfile, konfigurasi Next.js, ORM, auth, dan koneksi database. Jangan mengganti stack yang sudah berjalan tanpa keputusan pemilik proyek.

## 3. Batas domain

Pisahkan fitur berdasarkan domain bisnis:

- `services`: tiket servis, workflow, diagnosa, komponen, biaya, garansi.
- `bookings`: booking publik dan konversi booking ke tiket.
- `customers`: data pelanggan dan privasi.
- `staff`: akun, role, penugasan teknisi.
- `catalog`: katalog layanan, tarif, konten.
- `reports`: omzet, margin, performa teknisi, ekspor.
- `notifications`: template dan tautan WhatsApp.
- `audit`: catatan aktivitas sensitif.
- `tracking`: akses tracking publik yang dibatasi.

## 4. Struktur folder target (sesuaikan dengan repository)

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── layanan/
│   │   ├── booking/
│   │   ├── tracking/
│   │   ├── garansi/
│   │   ├── faq/
│   │   └── tentang/
│   ├── (auth)/
│   │   └── login/
│   ├── dashboard/
│   │   ├── owner/
│   │   ├── admin/
│   │   └── teknisi/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
│   ├── services/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   ├── bookings/
│   ├── customers/
│   ├── staff/
│   ├── catalog/
│   ├── reports/
│   ├── notifications/
│   ├── audit/
│   └── tracking/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── security/
│   ├── env/
│   └── utils/
└── ...
```

Jangan memindahkan seluruh repository ke struktur ini sekaligus. Gunakan struktur aktual dan migrasikan bertahap saat ada manfaat yang jelas.

## 5. Aturan dependency

- UI memanggil application action/service, bukan query database langsung.
- Business logic tidak bergantung pada komponen React.
- Akses database berada pada server-only module.
- Validasi input digunakan ulang di server boundary; validasi client hanya untuk UX.
- Integrasi WhatsApp, storage, dan provider eksternal dibungkus adapter.
- Hindari circular dependency.
- Jangan import server-only module ke Client Component.

## 6. Rendering

Mengikuti PRD:
- Halaman profil dan katalog: ISR bila kontennya cocok untuk caching.
- Halaman tracking: SSR/dynamic rendering agar status tidak stale.

Pastikan cache tidak menyimpan data pribadi atau hasil tracking antar pelanggan. Jangan cache respons privat secara publik.

## 7. Otorisasi

Role:
- `owner`
- `admin`
- `technician`

Buat satu policy/authorization layer di server untuk memeriksa user dan permission. Semua Route Handler, Server Action, dan query sensitif harus melakukan pemeriksaan akses. Middleware boleh mengarahkan pengguna, tetapi tidak menggantikan pemeriksaan server-side.

Matriks permission rinci perlu diselesaikan sebelum setiap modul RBAC dibangun. Owner memiliki akses tertinggi sesuai PRD; Admin dan Teknisi mengikuti ruang lingkup tugas masing-masing.

## 8. Strategi testing

- Unit test untuk generator kode, kalkulasi biaya, transisi status, dan permission.
- Integration test untuk transaksi pembuatan tiket dan query akses.
- E2E untuk booking, tracking, POS, update teknisi, dan alur approval.
- Security test untuk akses lintas role, IDOR, rate limit, dan kebocoran data.
- Concurrency test untuk memastikan nomor urut tidak duplikat.

## 9. Prinsip perubahan

Lakukan perubahan kecil, terisolasi, dan dapat direview. Migration database harus memiliki rencana rollback atau prosedur pemulihan yang jelas. Jangan melakukan refactor luas bersamaan dengan implementasi fitur baru.
