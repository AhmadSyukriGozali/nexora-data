# Desain: kelengkapan unit (order equipment)

Tanggal: 2026-11-13
Status: disetujui

## Tujuan

Catat bawaan pelanggan saat unit diterima dan tandai mana yang sudah
dikembalikan saat serah, supaya tidak ada sengketa "charger saya hilang".

## Keputusan

- Satu kolom `service_orders.equipment jsonb`, bukan tabel baru: daftar selalu
  dibaca bersama order, tidak pernah dicari sendiri.
- Bentuk item: `{ "label": "Charger", "returned": false }`, maksimal 10 item,
  label maksimal 40 karakter.
- Preset checkbox: Charger, Kabel USB, Tas/case, SIM card, Kartu memori, plus
  satu isian bebas "Bawaan lain".
- Owner/admin mengubah daftar dan status kembali. Teknisi hanya melihat; trigger
  `guard_order_technician_update` menolak perubahan `equipment`.
- Tidak ditampilkan di halaman tracking publik.

## Bukan bagian dari ini

Foto before-after, QR nota, riwayat perubahan per item, cetak nota baru.

## File

- `supabase/migrations/012_order_equipment.sql`
- `lib/admin/equipment.ts` (+ test)
- `lib/admin/types.ts`, `lib/supabase/schemas.ts`
- `app/admin/(dashboard)/order/equipment-field.tsx`
- `app/admin/(dashboard)/order/order-manager.tsx`
- `app/admin/(dashboard)/order/[id]/order-detail-manager.tsx`
- `app/admin/(dashboard)/order/[id]/page.tsx`
