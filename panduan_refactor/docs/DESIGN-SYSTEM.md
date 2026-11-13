# Design System — Nexora Data

## 1. Arah visual

Corporate Tech Modern dengan karakter:
- profesional;
- transparan;
- modern;
- cepat dipahami pelanggan awam;
- konsisten antara halaman publik dan dashboard internal.

## 2. Warna

Token aktual ada di `app/globals.css` (`--color-*`). Ini yang dipakai situs dan
dashboard saat ini:

| Token | Value | Peran |
|---|---|---|
| `navy` | `#061024` | Latar gelap utama (hero, footer) |
| `navy-soft` | `#0A1730` | Variasi navy |
| `surface` | `#0D1C36` | Panel di atas navy |
| `paper` | `#F6F7F9` | Background halaman terang |
| `paper-deep` | `#E9EDF2` | Background sekunder |
| `card` | `#FFFFFF` | Permukaan kartu |
| `ink` | `#0B1220` | Teks utama |
| `ink-soft` | `#475569` | Teks sekunder |
| `line` | `#E2E8F0` | Garis dan batas |
| `electric` | `#1E5EFF` | Aksen utama, CTA, focus ring |
| `electric-soft` | `#4F8BFF` | Aksen hover/sekunder |
| `chrome` | `#EEF2F7` | Latar kontrol |
| `dim` | `#9AA8BC` | Teks redup di latar gelap |
| `live` | `#16A34A` | Status sukses/aktif |

Palet PRD (`deep-navy #061E47`, `tech-blue #1D63DC`, `emerald #22C55E`) adalah
usulan awal, bukan acuan implementasi. Jangan mengganti token visual yang sudah
dipakai tanpa keputusan desain baru.

## 3. Tipografi dan bentuk

- Judul dan angka besar: **Sora** (`--font-display`).
- Teks isi dan UI: **Plus Jakarta Sans** (`--font-sans`).
- Heading tegas dengan hirarki jelas.
- Spacing antar-section konsisten.
- Kartu `rounded-xl` atau `rounded-2xl`.
- Gunakan garis aksen biru horizontal pada judul section.

## 4. Komponen publik

- Sticky navbar.
- CTA WhatsApp.
- Hero split dua kolom.
- Trust badges.
- Quick tracking input.
- Kartu katalog layanan.
- Compact navy page header untuk sub-halaman.
- Bottom conversion banner.
- Floating WhatsApp.
- Timeline tracking.
- Form booking.
- Gallery before-after.

## 5. Komponen dashboard

- Sidebar Deep Navy.
- Main content putih/abu-abu terang.
- Kartu statistik dengan surface `#F8FAFC`.
- Status aktif biru.
- Aksi simpan/selesai hijau.
- Tabel yang dapat digunakan di layar kecil.
- Form dengan label, validasi, loading, dan error yang jelas.

## 6. Bahasa dan aksesibilitas

- Gunakan bahasa Indonesia yang ramah pelanggan.
- Hindari jargon teknis tanpa penjelasan.
- Contoh label: “Laptop Lemot / Panas”, “HP Mati Total / Layar Pecah”, “Printer Tinta Tidak Keluar”.
- Pastikan kontras warna memadai, navigasi keyboard, label form, focus state, dan ukuran target sentuh nyaman.

## 7. Aturan konsistensi

- Buat design token terpusat.
- Hindari hardcode warna berbeda-beda di setiap komponen.
- Komponen UI dasar reusable.
- Jangan membuat variasi tombol/kartu baru tanpa alasan.
- Uji breakpoint mobile, tablet, dan desktop.
