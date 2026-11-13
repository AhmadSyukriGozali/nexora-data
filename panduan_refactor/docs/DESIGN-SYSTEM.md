# Design System — Nexora Data

## 1. Arah visual

Corporate Tech Modern dengan karakter:
- profesional;
- transparan;
- modern;
- cepat dipahami pelanggan awam;
- konsisten antara halaman publik dan dashboard internal.

## 2. Warna dari PRD

| Token | Value | Peran |
|---|---|---|
| `deep-navy` | `#061E47` | Warna utama |
| `deep-navy-alt` | `#0A2E6E` | Variasi navy |
| `tech-blue` | `#1D63DC` | Aksen |
| `tech-blue-alt` | `#2563EB` | Aksen alternatif |
| `emerald` | `#22C55E` | CTA utama |
| `emerald-alt` | `#16A34A` | CTA/ikon sukses |
| `white` | `#FFFFFF` | Surface |
| `surface` | `#F1F5F9` | Background |
| `dashboard-card` | `#F8FAFC` | Kartu statistik dashboard |

## 3. Tipografi dan bentuk

- Plus Jakarta Sans atau Inter; pilihan final mengikuti audit font dan kebutuhan performa.
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
