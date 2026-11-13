# Nexora Data — OpenCode Starter Documentation

Paket dokumentasi ini menjadi titik awal pengembangan Website Company Profile & Sistem Manajemen Servis Nexora Data.

## Cara menggunakan

1. Ekstrak folder paket ke root repository proyek.
2. Letakkan `AGENTS.md` di root repository.
3. Letakkan folder `docs/` di root repository.
4. Simpan PDF PRD asli sebagai `docs/source/PRD-v2.2.pdf` (opsional, tetapi disarankan).
5. Minta OpenCode membaca `AGENTS.md` terlebih dahulu sebelum melakukan perubahan.
6. Minta OpenCode melakukan audit repository dan melaporkan kondisi aktual sebelum implementasi.

## Urutan membaca

1. `AGENTS.md`
2. `docs/PRD.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE.md`
5. `docs/SECURITY.md`
6. `docs/DESIGN-SYSTEM.md`
7. `docs/DEVELOPMENT-ROADMAP.md`

## Status keputusan

- Format kode servis `NXD-YYMM-XXX-YYYY`: DISEPAKATI.
- Counter di-reset berdasarkan periode `YYMM`: DISEPAKATI.
- Zona waktu operasional: `Asia/Jakarta`: rekomendasi teknis yang perlu diterapkan konsisten.
- Stack detail, autentikasi, provider penyimpanan foto, WhatsApp API, dan strategi deployment: perlu diverifikasi terhadap repository dan diputuskan sebelum implementasi.

## Prinsip penting

Dokumentasi ini tidak membuktikan bahwa fitur sudah tersedia. OpenCode wajib mengaudit kode, konfigurasi, dan database aktual sebelum menyimpulkan status implementasi. Jangan menghapus atau mengganti teknologi yang sudah ada hanya karena dokumen ini memuat rekomendasi.
