# Development Roadmap — Nexora Data

Roadmap ini mengurutkan pekerjaan berdasarkan dependensi. Ini bukan klaim status implementasi. OpenCode harus mengaudit repository dan menandai setiap item: `Done`, `Partial`, `Not Started`, atau `Blocked`.

## Phase 0 — Repository audit

- [ ] Audit framework, versi Node.js, package manager, dan scripts.
- [ ] Audit struktur folder dan pola komponen.
- [ ] Audit database schema dan migration.
- [ ] Audit authentication/session dan RBAC yang sudah ada.
- [ ] Audit halaman publik dan dashboard yang sudah ada.
- [ ] Audit environment variable tanpa menampilkan nilainya.
- [ ] Audit upload/storage, WhatsApp, QR, dan PDF/thermal.
- [ ] Laporkan gap terhadap PRD tanpa mengubah kode.

**Output:** audit report, daftar gap, risiko, dan urutan implementasi.

## Phase 1 — Fondasi

- [ ] Tetapkan keputusan stack berdasarkan audit.
- [ ] Tetapkan domain model dan permission matrix.
- [ ] Siapkan design tokens dan shared UI.
- [ ] Siapkan validasi server dan error handling standar.
- [ ] Siapkan logging dan audit event foundation.

## Phase 2 — Database dan kode servis

- [ ] Finalisasi schema setelah audit.
- [ ] Buat counter per periode `YYMM`.
- [ ] Buat generator `NXD-YYMM-XXX-YYYY`.
- [ ] Tambahkan unique constraints dan indeks.
- [ ] Uji concurrent ticket creation.
- [ ] Uji pergantian bulan dan tahun.
- [ ] Uji token alphabet dan collision handling.
- [ ] Uji format dan batas nomor urut.

**Acceptance:** tidak ada kode duplikat pada uji concurrency; periode baru dimulai dari 001; kode tersimpan atomik bersama tiket.

## Phase 3 — Authentication dan dashboard role

- [ ] Login dan session.
- [ ] Owner, Admin/Kasir, Teknisi.
- [ ] Server-side authorization.
- [ ] Manajemen akun staf oleh Owner.
- [ ] Pembatasan akses berdasarkan role dan assignment.
- [ ] Audit log aktivitas sensitif.

## Phase 4 — Operasional tiket servis

- [ ] POS penerimaan unit.
- [ ] Data pelanggan dan perangkat.
- [ ] Kelengkapan unit dan keluhan.
- [ ] Penugasan teknisi.
- [ ] Diagnosa, estimasi, persetujuan biaya.
- [ ] Komponen/sparepart dan biaya jasa.
- [ ] Workflow status dan histori.
- [ ] Foto before-after.
- [ ] QC, selesai, penyerahan, dan garansi.

## Phase 5 — Tracking, QR, dan notifikasi

- [ ] Halaman tracking SSR/dynamic.
- [ ] Masking data pribadi.
- [ ] Rate limiting shared-store: target awal 5 kegagalan/IP/menit.
- [ ] QR Code pada nota.
- [ ] URL tracking dari konfigurasi domain.
- [ ] Template WhatsApp dan tautan tracking.
- [ ] Pengujian kebocoran data dan brute-force.

## Phase 6 — Booking dan website publik

- [ ] Landing page.
- [ ] Katalog layanan dan tarif.
- [ ] Form booking.
- [ ] Manajemen booking.
- [ ] Konversi booking ke tiket.
- [ ] FAQ, Tentang Kami, garansi.
- [ ] Galeri before-after dan ulasan.
- [ ] SEO lokal dan LocalBusiness JSON-LD.
- [ ] Responsif dan performance audit.

## Phase 7 — CMS, laporan, dan approval

- [ ] CMS hero/konten/layanan/galeri.
- [ ] Usulan dan approval perubahan tarif.
- [ ] Dashboard Owner.
- [ ] Omzet dan margin jasa vs sparepart.
- [ ] KPI teknisi.
- [ ] Laporan bulanan/tahunan.
- [ ] Ekspor Excel/CSV/PDF khusus Owner.

## Phase 8 — Quality gate

- [ ] ESLint.
- [ ] TypeScript check.
- [ ] Unit/integration/E2E test sesuai cakupan.
- [ ] Build production.
- [ ] Security test dan RBAC matrix.
- [ ] Accessibility check.
- [ ] Mobile responsiveness.
- [ ] Backup/restore rehearsal.
- [ ] Manual UAT untuk Owner, Admin, Teknisi, pelanggan.

## Aturan prioritas

Selesaikan fondasi data, otorisasi, dan alur tiket sebelum dashboard analitik kompleks. Jangan mengimplementasikan semua phase sekaligus dalam satu prompt. Setiap phase harus menghasilkan perubahan kecil yang dapat diuji dan direview.
