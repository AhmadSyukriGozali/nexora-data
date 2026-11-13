# Product Requirements Document — Nexora Data

**Sumber:** `PRD_Website_Company_Profile_Sistem_Servis_v2.2.pdf`  
**Versi sumber:** v2.2  
**Status:** transkripsi ringkas terstruktur dari PRD yang diberikan pemilik proyek.

> Dokumen ini mempertahankan kebutuhan yang tertulis pada PRD. Rekomendasi teknis tambahan dipisahkan di dokumen arsitektur, database, dan keamanan. Bagian yang tidak ditentukan oleh PRD tidak boleh dianggap sebagai keputusan final.

## 1. Ringkasan produk

Website company profile sekaligus sistem manajemen tiket servis internal berbasis Next.js untuk jasa servis dan maintenance PC, HP, laptop, dan printer.

Konsep utama: **“Klinik Teknologi yang Transparan, Cepat & Seirama.”**

Produk harus membangun kepercayaan pelanggan melalui estimasi biaya, pelacakan status perbaikan, dan komunikasi yang transparan.

## 2. Target pengguna dan role

### Pengunjung / Pelanggan (tanpa login)

- Melihat profil usaha dan katalog layanan.
- Melihat estimasi harga.
- Melakukan booking jadwal servis/jemput-antar.
- Mengecek masa garansi.
- Melacak progres perbaikan menggunakan Kode Servis.

### Teknisi (login dashboard terbatas)

- Melihat antrean unit yang ditugaskan.
- Memperbarui status pengerjaan.
- Mengunggah foto bukti perbaikan before-after.
- Menambahkan catatan teknis dan rincian komponen yang diganti.

### Admin / Kasir (login dashboard operasional)

- Mengelola konten website (CMS).
- Membuat tiket servis baru (POS).
- Mengelola booking masuk.
- Mengonfirmasi biaya kepada pelanggan melalui WhatsApp.
- Memantau transaksi harian.

### Owner (login dashboard eksekutif / full access)

- Memantau ringkasan performa bisnis.
- Melihat grafik omzet dan margin keuntungan.
- Mengekspor laporan keuangan bulanan/tahunan.
- Mengelola akun dan hak akses Admin/Kasir serta Teknisi.
- Meninjau audit log.
- Menyetujui perubahan tarif dasar layanan.
- Menyetujui pembatalan/diskon tiket berskala besar.

## 3. Design system dari PRD

### Palet warna

| Token | Warna | Penggunaan |
|---|---|---|
| Deep Navy | `#061E47` – `#0A2E6E` | Navbar, hero, sidebar dashboard, footer CTA |
| Tech Blue | `#1D63DC` / `#2563EB` | Aksen ikon, indikator judul, status aktif |
| Emerald CTA | `#22C55E` / `#16A34A` | CTA utama, WhatsApp, ikon centang |
| Clean Surface | `#FFFFFF` / `#F1F5F9` | Latar dan kartu |

### Tipografi dan layout

- Font geometris modern: Plus Jakarta Sans atau Inter melalui `next/font/google`.
- Ritme jarak vertikal konsisten.
- Kartu membulat `rounded-xl` / `rounded-2xl`.
- Judul section memiliki aksen garis horizontal biru.

### Konsistensi halaman

- Sticky navbar dan bottom conversion banner pada seluruh halaman publik.
- Tombol WhatsApp hijau di kanan atas.
- Sub-halaman menggunakan compact navy page header dan kartu konten putih/abu-abu.
- Dashboard Owner, Admin, dan Teknisi memakai palet yang sama.
- Dashboard: sidebar Deep Navy, area kerja bersih, kartu statistik `#F8FAFC`, aksen biru, tombol aksi hijau.
- Bahasa untuk pelanggan harus ramah awam dan menggunakan contoh keluhan nyata.

## 4. Fitur halaman publik

| ID | Fitur | Kebutuhan | Prioritas |
|---|---|---|---|
| FE-01 | Split Hero & Quick Tracking Bar | Hero dua kolom Deep Navy; headline, trust badges (Diagnosa Gratis, Garansi Servis, Spare Part Berkualitas), CTA konsultasi, cek status servis, visual perangkat | Tinggi |
| FE-02 | Grid Katalog Layanan & Tarif | Grid layanan: laptop, handphone, PC, printer, jaringan, pemulihan data, maintenance & upgrade, IT support kantor; detail kerusakan, estimasi waktu, starting price | Tinggi |
| FE-03 | Detail Tracking Servis | SSR; timeline status, nama perangkat disamarkan, diagnosa, biaya disetujui, foto kondisi unit | Tinggi |
| FE-04 | Booking & Jemput-Antar | Nama, WhatsApp, perangkat, merek/tipe, keluhan, metode datang ke toko/panggil teknisi/kurir jemput-antar; nomor referensi otomatis | Tinggi |
| FE-05 | Keunggulan & Galeri Before-After | Lima keunggulan, slider foto hasil perbaikan, ulasan terverifikasi terhubung Google Maps | Sedang |
| FE-06 | Cek Garansi | Input kode nota lama; tampilkan masa garansi, tanggal berakhir, syarat dan ketentuan | Sedang |
| FE-07 | Bottom Conversion Banner & Floating WA | CTA Deep Navy di bawah halaman publik, WhatsApp, telepon/sales interaktif, Google Maps, floating WhatsApp | Tinggi |

Halaman publik yang disebutkan dalam PRD: Beranda, Katalog Layanan, Detail Tracking, Cek Garansi, FAQ, dan Tentang Kami.

## 5. Fitur dashboard internal

| ID | Modul | Kebutuhan | Prioritas |
|---|---|---|---|
| BE-01 | Dashboard Operasional & Eksekutif | Statistik antre dicek, sedang dikerjakan, selesai/siap diambil, booking masuk. Owner mendapat tren pendapatan bulanan, margin jasa vs sparepart, KPI teknisi | Tinggi |
| BE-02 | POS Servis | Nota penerimaan, data pelanggan, serial number, kelengkapan unit (tas/charger), keluhan; kode servis unik; cetak struk PDF/thermal | Tinggi |
| BE-03 | Progres & Notifikasi WhatsApp | Teknisi update status, diagnosa, biaya sparepart/jasa, foto bukti; tombol kirim update WhatsApp dengan pesan dan tautan tracking | Tinggi |
| BE-04 | Manajemen Booking | Daftar booking dan filter Baru, Dikonfirmasi, Dijadwalkan, Dibatalkan; konversi booking menjadi tiket servis | Tinggi |
| BE-05 | CMS & Tarif | Ubah hero, layanan, tarif dasar, galeri; perubahan tarif dicatat dan memerlukan persetujuan Owner | Tinggi |
| BE-06 | Pengguna, RBAC & Audit Log | Owner menambah/menonaktifkan Admin/Kasir dan Teknisi, mengatur akses rute, memantau pembatalan, diskon, dan perubahan harga | Sedang |
| BE-07 | Laporan & Ekspor | Rekap servis selesai, kerusakan terbanyak, performa teknisi, laba/omzet; ekspor Excel/CSV/PDF khusus Owner | Sedang |

## 6. Workflow status servis

Urutan baku dari PRD:

1. **Unit Diterima** — perangkat diterima di toko/kurir, kelengkapan dicatat, kode servis diterbitkan.
2. **Sedang Dicek (Diagnosa)** — teknisi memeriksa kerusakan hardware/software.
3. **Menunggu Konfirmasi Biaya** — Admin menyampaikan biaya dan estimasi waktu sebelum pengerjaan.
4. **Sedang Dikerjakan** — pelanggan menyetujui biaya dan teknisi memperbaiki/mengganti komponen.
5. **Selesai / Siap Diambil** — QC lulus, notifikasi dikirim, masa garansi mulai dihitung saat unit diserahkan.

Status tambahan seperti dibatalkan, ditolak, atau menunggu sparepart belum didefinisikan dalam workflow utama PRD; jangan menambahkannya tanpa keputusan produk.

## 7. Arsitektur dan non-functional requirements dari PRD

- Next.js App Router.
- Tailwind CSS.
- PostgreSQL.
- ISR untuk profil dan katalog layanan.
- SSR untuk tracking tiket.
- Next.js Server Actions / Route Handlers.
- PostgreSQL dengan Prisma ORM (disebut dalam PRD).
- Foto bukti disimpan di Cloudinary / S3 (pilihan belum ditetapkan).
- Auth.js / Bcrypt (disebut dalam PRD; pilihan implementasi perlu diputuskan).
- Proteksi rute `/dashboard/owner`, `/dashboard/admin`, `/dashboard/teknisi`.
- Mobile-first; dashboard teknisi nyaman digunakan di ponsel.
- Target halaman utama terbuka di bawah 2,5 detik.
- Optimasi gambar `next/image` dan font lokal `next/font`.
- Tracking publik menyamarkan sebagian nama dan menyembunyikan nomor HP.
- SEO lokal dengan meta tag dinamis dan LocalBusiness JSON-LD.

## 8. Keputusan tambahan yang disepakati setelah PRD

### Format Kode Servis

`NXD-YYMM-XXX-YYYY`

- `NXD`: identitas Nexora Data.
- `YYMM`: tahun dan bulan transaksi.
- `XXX`: nomor urut bulanan, dimulai dari `001`.
- `YYYY`: token acak empat karakter.
- Counter di-reset setiap bulan berdasarkan kombinasi `YYMM`.
- Alphabet token: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (menghindari karakter yang mudah tertukar).
- Contoh: `NXD-2611-001-K9M4`.

Implementasi wajib aman terhadap concurrency dan memiliki unique constraint database. Rincian ada di `DATABASE.md`.

### Rate limiting tracking

Rekomendasi yang disampaikan: maksimal lima percobaan kode salah per IP per satu menit. Implementasi harus terpusat/shared-store pada lingkungan multi-instance, bukan hanya memory lokal.

### QR dan WhatsApp

- QR pada struk thermal/PDF mengarah ke URL tracking.
- Pesan WhatsApp menyertakan tautan tracking langsung.
- URL domain final harus berasal dari konfigurasi environment, bukan hardcoded.

## 9. Acceptance checklist tingkat produk

- [ ] Semua halaman publik yang disepakati tersedia dan responsif.
- [ ] Booking menghasilkan referensi yang dapat ditelusuri.
- [ ] Pelanggan dapat tracking dengan kode servis.
- [ ] Data publik tidak membocorkan nomor HP atau identitas lengkap.
- [ ] Admin/Kasir dapat membuat tiket dan mencetak nota.
- [ ] Teknisi hanya melihat tiket yang ditugaskan atau yang diizinkan.
- [ ] Owner memiliki akses eksekutif dan kontrol staf.
- [ ] Alur status mengikuti workflow yang disepakati.
- [ ] Tarif dasar memerlukan approval Owner sesuai aturan.
- [ ] Aktivitas sensitif masuk audit log.
- [ ] Laporan Owner dapat diekspor.
- [ ] Pengujian keamanan, akses role, dan concurrency lulus.
