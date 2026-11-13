# Database Design — Nexora Data

## 1. Status

PRD menetapkan PostgreSQL dan menyebut Prisma ORM. PRD belum menyediakan schema tabel final. Desain di bawah adalah rancangan awal yang harus disesuaikan dengan schema aktual dan disetujui sebelum migration diterapkan.

## 2. Entitas/domain yang diperlukan

Rancangan entitas konseptual:

- `customers`: identitas dan kontak pelanggan.
- `staff_profiles` atau relasi profil user: role dan status staf.
- `service_tickets`: tiket servis utama.
- `service_ticket_items` / `service_parts`: komponen/sparepart dan biaya.
- `service_status_history`: riwayat perubahan status.
- `service_assignments`: penugasan teknisi.
- `service_attachments`: foto before-after dan bukti.
- `bookings`: booking publik.
- `service_catalog`: katalog layanan dan tarif dasar.
- `price_change_requests`: usulan perubahan tarif dan approval Owner.
- `audit_logs`: aktivitas sensitif.
- `warranties`: masa dan ketentuan garansi, atau kolom terstruktur pada tiket jika domainnya sederhana.

Nama dan pemisahan tabel final ditentukan setelah audit kebutuhan query dan schema repository.

## 3. Field penting tiket

Minimal pertimbangkan:

- `id`: UUID primary key internal.
- `service_code`: kode publik unik.
- `period_ym`: periode `YYMM` atau representasi tanggal periode yang konsisten.
- `monthly_sequence`: nomor urut bulanan.
- `customer_id`.
- `device_type`, `brand`, `model`, `serial_number`.
- `reported_issue`.
- `accessories_received`.
- `diagnosis`.
- `service_status`.
- `assigned_technician_id`.
- `approved_estimate` / rincian biaya sesuai model biaya.
- `received_at`, `completed_at`, `handed_over_at`, `created_at`, `updated_at`.

Jangan mengirim seluruh field internal ke endpoint tracking publik.

## 4. Format Kode Servis resmi

`NXD-YYMM-XXX-YYYY`

Contoh: `NXD-2611-001-K9M4`.

| Segmen | Makna |
|---|---|
| `NXD` | Identitas Nexora Data |
| `YYMM` | Tahun dan bulan transaksi |
| `XXX` | Counter bulanan, mulai 001 |
| `YYYY` | Token acak 4 karakter |

Alphabet token:

`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`

Karakter `0`, `O`, `1`, `I`, dan `L` dikecualikan agar mudah dibaca.

### Ketentuan generator

1. Gunakan waktu transaksi `Asia/Jakarta` untuk menentukan periode.
2. Counter di-reset per kombinasi `YYMM`.
3. Counter harus aman terhadap request bersamaan.
4. Kode servis harus memiliki unique constraint.
5. Pembuatan counter, alokasi nomor, pembuatan token, dan insert tiket dilakukan dalam satu transaksi.
6. Jangan gunakan `SELECT MAX(monthly_sequence) + 1` tanpa locking/atomic allocation.
7. Jangan mengandalkan pengecekan unik di aplikasi saja.
8. Jika terjadi collision token, ulangi pembuatan token secara terbatas di dalam transaksi; unique constraint tetap menjadi pengaman final.
9. Jangan pernah memakai kode servis sebagai primary key internal.

### Strategi counter yang direkomendasikan

Gunakan tabel counter, misalnya:

- `period_ym` sebagai primary key (`2611`, `2612`, dst.).
- `last_value` sebagai integer.

Dalam transaksi, lakukan atomic upsert/increment pada baris periode tersebut lalu gunakan nilai hasilnya untuk tiket. Bentuk SQL final perlu disesuaikan dengan versi PostgreSQL dan ORM yang digunakan.

Format urutan harus selalu tiga digit minimum (`001`, `002`, `999`). Sebelum melewati `999`, tetapkan kebijakan eksplisit: perluasan menjadi empat digit atau penolakan pembuatan tiket dengan alert Owner. Jangan memotong angka menjadi tiga digit karena dapat menyebabkan duplikasi.

### Token acak

Gunakan cryptographically secure random generator di server atau PostgreSQL cryptographic facility yang telah diverifikasi. Bila generator berada di Node.js, gunakan `crypto.randomInt()` untuk memilih indeks alphabet, bukan `Math.random()`.

Jumlah karakter alphabet adalah 32; token 4 karakter memiliki 20 bit ruang kemungkinan. Karena token ini menjadi bagian dari kode yang dapat dipakai untuk tracking, kode lengkap tetap harus dilindungi rate limiting dan respons publik minimal. Untuk kebutuhan keamanan yang lebih tinggi, pertimbangkan token akses terpisah yang lebih panjang; keputusan ini memerlukan persetujuan produk karena mengubah format yang sudah disepakati.

## 5. Constraint dan indeks

Rekomendasi:
- Unique index pada `service_code`.
- Unique constraint pada `(period_ym, monthly_sequence)`.
- Index pada `created_at`, `service_status`, `assigned_technician_id`, dan foreign key yang sering difilter.
- Foreign key dengan kebijakan delete yang aman; hindari cascade delete pada histori servis/keuangan.
- CHECK constraint untuk nilai numerik non-negatif dan domain status yang disepakati.

## 6. Histori status

Simpan setiap perubahan status sebagai baris histori, bukan hanya menimpa nilai terakhir. Catat:
- tiket;
- status sebelumnya dan status baru;
- actor/user;
- timestamp;
- catatan;
- metadata yang diperlukan dan tidak sensitif.

Transisi status harus divalidasi di server/database berdasarkan workflow yang disepakati.

## 7. Integritas uang

- Gunakan tipe decimal/numeric dengan presisi yang sesuai, bukan floating point.
- Simpan mata uang secara eksplisit bila sistem berpotensi multi-currency.
- Pisahkan biaya jasa dan sparepart agar laporan margin dapat dihitung.
- Simpan snapshot harga saat transaksi; perubahan katalog tidak boleh mengubah nota historis.

## 8. Data dan tracking publik

- Kode servis dicari melalui jalur server yang dibatasi.
- Respons tracking hanya memuat data yang diperlukan pelanggan.
- Masking nama perangkat/pelanggan sesuai PRD.
- Jangan mengembalikan nomor HP pelanggan ke browser publik.
- Jangan mengekspos UUID internal, catatan internal teknisi, atau data staf yang tidak perlu.

## 9. Migration

Sebelum migration:
1. Audit schema aktual.
2. Periksa data lama dan potensi duplikasi.
3. Buat backup sesuai lingkungan.
4. Tulis migration non-destruktif.
5. Uji pada database development/staging.
6. Verifikasi constraint dan rollback/recovery.
7. Jangan menjalankan migration production tanpa persetujuan eksplisit.
