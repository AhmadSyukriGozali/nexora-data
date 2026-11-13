# Security Requirements — Nexora Data

## 1. Prinsip

- Defense in depth.
- Least privilege.
- Server-side authorization.
- Validasi di server dan integritas di database.
- Data pelanggan hanya diakses sesuai kebutuhan tugas.
- Jangan menganggap kode yang disembunyikan di UI sebagai kontrol keamanan.

## 2. Authentication dan RBAC

Role produk:
- Owner
- Admin/Kasir
- Teknisi

Wajib:
- Verifikasi session/token di server.
- Ambil identitas dan role dari sumber tepercaya, bukan request body.
- Periksa permission pada setiap operasi sensitif.
- Terapkan pembatasan akses objek (misalnya teknisi hanya dapat mengakses tiket yang ditugaskan/diizinkan).
- Cabut akses staf yang dinonaktifkan.
- Lindungi operasi manajemen role agar hanya Owner yang dapat melakukannya.
- Jangan hanya mengandalkan middleware atau redirect.

Pilihan provider auth belum dikunci oleh PRD. Audit implementasi yang ada sebelum memilih Auth.js atau opsi lain.

## 3. Proteksi tracking publik

Rekomendasi awal:
- Maksimal 5 kegagalan kode per IP dalam 1 menit.
- Gunakan shared/centralized rate-limit store untuk multi-instance.
- Tambahkan batas ukuran request dan validasi format kode sebelum query.
- Gunakan pesan kegagalan generik.
- Jangan membedakan "kode tidak ada" dan "token salah" pada respons publik.
- Pertimbangkan cooldown bertahap dan monitoring pola penyalahgunaan.
- Jangan log kode servis lengkap atau data pribadi dalam log aplikasi.
- Hindari cache publik untuk hasil tracking.

IP address dapat berada di balik NAT/proxy. Gunakan header IP hanya dari konfigurasi trusted proxy/platform yang benar; jangan mempercayai header arbitrary dari client.

## 4. Data pribadi

- Tracking publik menyamarkan nama sesuai PRD.
- Jangan tampilkan nomor HP pelanggan.
- Batasi catatan teknisi internal dan rincian sensitif.
- Batasi retensi data dan akses staff sesuai kebijakan bisnis yang ditetapkan.
- Jangan menaruh data pribadi dalam URL selain kode/token yang memang dipakai sebagai kredensial; evaluasi risiko kebocoran melalui browser history, analytics, dan referrer.

## 5. Input, output, dan file upload

- Validasi seluruh input pada server boundary.
- Gunakan schema validation bila tersedia.
- Query database harus terparameterisasi.
- Escape/render output sesuai konteks untuk mencegah XSS.
- Batasi ukuran, MIME type, ekstensi, dan isi file upload.
- Jangan mempercayai `Content-Type` dari browser.
- Gunakan nama file acak dan storage private untuk bukti servis.
- Gunakan signed URL dengan masa berlaku bila file privat harus ditampilkan.

## 6. Audit log

Catat sekurangnya:
- perubahan role dan status akun;
- perubahan tarif dan approval;
- diskon besar;
- pembatalan tiket;
- perubahan biaya yang telah disetujui;
- perubahan status penting;
- akses/ekspor laporan sensitif.

Audit log harus memiliki actor, aksi, objek, waktu, dan metadata minimum. Jangan menyimpan password, token, atau secret.

## 7. Secrets dan environment

- Simpan secret di environment server atau secret manager.
- Jangan gunakan prefix public untuk secret.
- Jangan commit `.env.local`.
- Sediakan `.env.example` berisi nama variabel dan placeholder, tanpa nilai rahasia.
- Validasi environment saat startup.
- Jangan pernah mencetak nilai secret pada log atau laporan.

## 8. Checklist keamanan sebelum rilis

- [ ] Role matrix ditinjau dan diuji.
- [ ] IDOR test pada tiket, booking, lampiran, dan laporan.
- [ ] Tracking rate limit teruji pada shared store.
- [ ] Tidak ada data pribadi berlebih di response publik.
- [ ] Upload dibatasi dan storage tidak terbuka tanpa sengaja.
- [ ] Audit log untuk operasi sensitif aktif.
- [ ] Tidak ada secret di repository/client bundle/log.
- [ ] Error response tidak membocorkan detail internal.
- [ ] SQL injection dan XSS checks dilakukan.
- [ ] CSRF/origin protections sesuai mekanisme auth dan deployment.
- [ ] Backup dan prosedur pemulihan diverifikasi.
