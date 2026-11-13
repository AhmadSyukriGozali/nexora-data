# AGENTS.md — Instruksi untuk OpenCode

## Misi

Bangun dan kembangkan Nexora Data sebagai website company profile sekaligus sistem manajemen tiket servis untuk layanan PC, HP, laptop, dan printer. PRD v2.2 adalah acuan kebutuhan produk. Dokumentasi teknis di `docs/` menjelaskan keputusan dan rekomendasi implementasi.

## Wajib sebelum mengubah kode

1. Baca dokumen di `docs/` yang relevan dengan tugas.
2. Audit repository: framework, package manager, struktur folder, dependensi, environment variable, autentikasi, database, dan pola coding yang sudah digunakan.
3. Periksa apakah fitur sudah ada. Jangan membuat duplikasi.
4. Tampilkan ringkasan temuan, file yang akan disentuh, risiko, dan rencana perubahan untuk pekerjaan yang berdampak besar.
5. Jangan mengasumsikan isi database. Periksa migration/schema yang tersedia.

## Batas kewenangan

- Kerjakan secara lokal pada workspace yang sedang dibuka.
- Jangan deploy, push, membuat commit, atau mengubah repository GitHub secara langsung kecuali diminta secara eksplisit.
- Jangan menjalankan migration destruktif, menghapus data, truncate tabel, atau mengubah data production.
- Jangan mengubah kredensial, environment rahasia, konfigurasi payment, atau integrasi eksternal tanpa kebutuhan yang jelas dan persetujuan.
- Jangan mengklaim tindakan berhasil sebelum memeriksa hasil command/tool.
- Jangan menampilkan nilai secret dari `.env*`, token, service-role key, atau kredensial lain.

## Prinsip arsitektur

- Prioritaskan arsitektur modular, reusable, dan mudah diuji.
- Pisahkan UI, business logic, validasi, akses data, dan integrasi eksternal.
- Hindari satu file halaman yang memuat seluruh fitur.
- Gunakan komponen kecil dengan tanggung jawab jelas.
- Gunakan server-side authorization untuk setiap operasi sensitif. Middleware hanya lapisan tambahan, bukan satu-satunya pengaman.
- Validasi input di batas server dan tegakkan integritas data di PostgreSQL.
- Gunakan transaksi dan constraint database untuk operasi yang harus konsisten.
- Ikuti pola dan versi dependency yang sudah ada di repository; jangan upgrade massal tanpa alasan.

## Keamanan

- Terapkan RBAC untuk Owner, Admin/Kasir, dan Teknisi.
- Terapkan prinsip least privilege.
- Jangan mempercayai role atau user ID dari client.
- Lindungi route handler/server action dengan autentikasi dan otorisasi server-side.
- Gunakan query terparameterisasi/ORM; jangan menyusun SQL dari input mentah.
- Validasi dan batasi tipe, ukuran, serta konten file upload.
- Hindari kebocoran data pribadi pelanggan pada halaman tracking publik.
- Rate limit endpoint tracking dan endpoint sensitif.
- Catat aktivitas sensitif ke audit log.
- Jangan menyimpan password atau token dalam plaintext.

## Standar kode

- Gunakan TypeScript bila proyek menggunakannya.
- Ikuti ESLint, formatter, dan konvensi repository.
- Beri nama variabel/fungsi yang deskriptif.
- Tangani loading, empty state, error state, dan success state.
- Buat komponen aksesibel dan responsif.
- Hindari `any` kecuali ada alasan teknis yang terdokumentasi.
- Tambahkan test untuk business logic dan alur kritis jika infrastruktur test tersedia.

## Kode servis — keputusan wajib

Format resmi:

`NXD-YYMM-XXX-YYYY`

- `NXD`: identitas Nexora Data.
- `YYMM`: tahun dan bulan transaksi.
- `XXX`: nomor urut bulanan, dimulai dari `001`.
- `YYYY`: empat karakter token acak yang aman secara kriptografis.
- Counter di-reset setiap pergantian periode `YYMM`, bukan setiap hari.
- Alphabet token: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- Contoh: `NXD-2611-001-K9M4`.

Generator harus aman terhadap request bersamaan. Gunakan transaksi/fungsi PostgreSQL dan constraint unik; jangan membuat nomor urut dengan pola `SELECT MAX(...) + 1` dari aplikasi. Detail ada di `docs/DATABASE.md`.

## Alur kerja implementasi

1. Audit dan rencana.
2. Implementasi perubahan sekecil mungkin.
3. Jalankan lint, typecheck, test, dan build sesuai script yang tersedia.
4. Periksa diff dan pastikan tidak ada perubahan tidak relevan.
5. Laporkan file yang berubah, keputusan, hasil validasi, dan pekerjaan tersisa.

## Format laporan akhir

- Ringkasan perubahan.
- Daftar file yang dibuat/diubah.
- Perubahan database/migration (jika ada).
- Perintah validasi yang dijalankan dan hasilnya.
- Risiko atau hal yang belum diverifikasi.
- Langkah menjalankan/menguji secara lokal.

## Jika dokumen dan repository berbeda

Repository aktual dan instruksi terbaru pemilik proyek harus diperiksa. Jangan diam-diam mengubah kebutuhan PRD. Catat konflik, jelaskan dampaknya, lalu minta keputusan bila konflik memengaruhi data, keamanan, arsitektur, atau alur bisnis.
