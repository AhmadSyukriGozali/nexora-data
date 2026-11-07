-- =============================================================================
-- Nexora Data — Tahap 2: Row Level Security
-- Jalankan SETELAH 20261107000100_nexora_core_schema.sql.
--
-- Prinsip:
--   * anon tidak punya akses langsung ke tabel mana pun.
--   * authenticated hanya boleh mengakses data bila punya baris profiles
--     dengan is_active = true (owner atau teknisi).
--   * semua DELETE data keuangan hanya untuk owner.
--   * service_role (dipakai Route Handler publik) melewati RLS, tetapi
--     Route Handler tetap membatasi field yang dikembalikan.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. AKTIFKAN RLS DI SEMUA TABEL PUBLIC
-- ---------------------------------------------------------------------------
alter table public.counters enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.devices enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_status_history enable row level security;
alter table public.spareparts enable row level security;
alter table public.stock_movements enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.service_warranties enable row level security;
alter table public.testimonials enable row level security;

-- ---------------------------------------------------------------------------
-- 2. CABUT AKSES ANON
-- ---------------------------------------------------------------------------
revoke all on public.counters from anon;
revoke all on public.profiles from anon;
revoke all on public.customers from anon;
revoke all on public.devices from anon;
revoke all on public.service_orders from anon;
revoke all on public.service_status_history from anon;
revoke all on public.spareparts from anon;
revoke all on public.stock_movements from anon;
revoke all on public.invoices from anon;
revoke all on public.invoice_items from anon;
revoke all on public.payments from anon;
revoke all on public.service_warranties from anon;
revoke all on public.testimonials from anon;

-- ---------------------------------------------------------------------------
-- 3. COUNTERS — internal, tidak boleh diakses klien
-- ---------------------------------------------------------------------------
revoke all on public.counters from authenticated;

create policy counters_deny_clients
on public.counters
for all
to anon, authenticated
using (false)
with check (false);

-- ---------------------------------------------------------------------------
-- 4. PROFILES — baca diri sendiri/owner, ubah hanya owner
-- ---------------------------------------------------------------------------
grant select, insert, update on public.profiles to authenticated;

create policy profiles_select_self_or_owner
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy profiles_insert_owner
on public.profiles
for insert
to authenticated
with check (public.is_owner());

create policy profiles_update_owner
on public.profiles
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Tidak ada policy DELETE: profil hanya terhapus lewat auth.users.

-- ---------------------------------------------------------------------------
-- 5. CUSTOMERS
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.customers to authenticated;

create policy customers_select_staff
on public.customers
for select
to authenticated
using (public.is_staff());

create policy customers_insert_staff
on public.customers
for insert
to authenticated
with check (public.is_staff());

create policy customers_update_staff
on public.customers
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy customers_delete_owner
on public.customers
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 6. DEVICES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.devices to authenticated;

create policy devices_select_staff
on public.devices
for select
to authenticated
using (public.is_staff());

create policy devices_insert_staff
on public.devices
for insert
to authenticated
with check (public.is_staff());

create policy devices_update_staff
on public.devices
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy devices_delete_owner
on public.devices
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 7. SERVICE ORDERS
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.service_orders to authenticated;

create policy service_orders_select_staff
on public.service_orders
for select
to authenticated
using (public.is_staff());

create policy service_orders_insert_staff
on public.service_orders
for insert
to authenticated
with check (public.is_staff());

create policy service_orders_update_staff
on public.service_orders
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy service_orders_delete_owner
on public.service_orders
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 8. SERVICE STATUS HISTORY — append-only
-- ---------------------------------------------------------------------------
grant select, insert on public.service_status_history to authenticated;

create policy service_status_history_select_staff
on public.service_status_history
for select
to authenticated
using (public.is_staff());

create policy service_status_history_insert_staff
on public.service_status_history
for insert
to authenticated
with check (public.is_staff());

-- Tidak ada policy UPDATE/DELETE; trigger juga menolaknya.

-- ---------------------------------------------------------------------------
-- 9. SPAREPARTS
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.spareparts to authenticated;

create policy spareparts_select_staff
on public.spareparts
for select
to authenticated
using (public.is_staff());

create policy spareparts_insert_staff
on public.spareparts
for insert
to authenticated
with check (public.is_staff());

create policy spareparts_update_staff
on public.spareparts
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- cost_price dianggap data keuangan: hapus hanya owner.
create policy spareparts_delete_owner
on public.spareparts
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 10. STOCK MOVEMENTS — append-only, stok berubah lewat trigger
-- ---------------------------------------------------------------------------
grant select, insert on public.stock_movements to authenticated;

create policy stock_movements_select_staff
on public.stock_movements
for select
to authenticated
using (public.is_staff());

create policy stock_movements_insert_staff
on public.stock_movements
for insert
to authenticated
with check (public.is_staff());

-- Tidak ada policy UPDATE/DELETE; trigger juga menolaknya.

-- ---------------------------------------------------------------------------
-- 11. INVOICES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.invoices to authenticated;

create policy invoices_select_staff
on public.invoices
for select
to authenticated
using (public.is_staff());

create policy invoices_insert_staff
on public.invoices
for insert
to authenticated
with check (public.is_staff());

create policy invoices_update_staff
on public.invoices
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy invoices_delete_owner
on public.invoices
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 12. INVOICE ITEMS
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.invoice_items to authenticated;

create policy invoice_items_select_staff
on public.invoice_items
for select
to authenticated
using (public.is_staff());

create policy invoice_items_insert_staff
on public.invoice_items
for insert
to authenticated
with check (public.is_staff());

create policy invoice_items_update_staff
on public.invoice_items
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy invoice_items_delete_owner
on public.invoice_items
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 13. PAYMENTS
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.payments to authenticated;

create policy payments_select_staff
on public.payments
for select
to authenticated
using (public.is_staff());

create policy payments_insert_staff
on public.payments
for insert
to authenticated
with check (public.is_staff());

-- Koreksi nominal pembayaran hanya owner.
create policy payments_update_owner
on public.payments
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy payments_delete_owner
on public.payments
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 14. SERVICE WARRANTIES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.service_warranties to authenticated;

create policy service_warranties_select_staff
on public.service_warranties
for select
to authenticated
using (public.is_staff());

create policy service_warranties_insert_staff
on public.service_warranties
for insert
to authenticated
with check (public.is_staff());

create policy service_warranties_update_staff
on public.service_warranties
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy service_warranties_delete_owner
on public.service_warranties
for delete
to authenticated
using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 15. TESTIMONIALS — staf boleh baca & moderasi, hapus hanya owner
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.testimonials to authenticated;

create policy testimonials_select_staff
on public.testimonials
for select
to authenticated
using (public.is_staff());

create policy testimonials_insert_staff
on public.testimonials
for insert
to authenticated
with check (
  public.is_staff()
  and status = 'menunggu'
  and moderated_by is null
  and moderated_at is null
);

create policy testimonials_update_staff
on public.testimonials
for update
to authenticated
using (public.is_staff())
with check (
  public.is_staff()
  and (
    (status = 'menunggu' and moderated_by is null and moderated_at is null)
    or (
      status in ('disetujui', 'ditolak')
      and moderated_by is not null
      and moderated_at is not null
    )
  )
);

create policy testimonials_delete_owner
on public.testimonials
for delete
to authenticated
using (public.is_owner());

commit;
