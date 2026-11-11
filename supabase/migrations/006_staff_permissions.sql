-- =============================================================================
-- Nexora Data — Tahap 6: izin staf per modul
-- Jalankan SETELAH 005_status_flow_and_stock.sql.
--
-- Owner selalu penuh. Staf admin memakai baris staff_permissions per modul.
-- Modul "staf" tidak ada di daftar: halaman Staf tetap owner-only.
-- =============================================================================

begin;

create table if not exists public.staff_permissions (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  module text not null check (module in (
    'dashboard', 'orders', 'customers', 'devices',
    'invoices', 'spareparts', 'warranties', 'testimonials'
  )),
  can_view boolean not null default false,
  can_manage boolean not null default false,
  can_delete boolean not null default false,
  can_view_cost boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  primary key (profile_id, module)
);

alter table public.staff_permissions enable row level security;

grant select, insert, update, delete on public.staff_permissions to authenticated;

drop policy if exists staff_permissions_select on public.staff_permissions;
create policy staff_permissions_select
on public.staff_permissions
for select
to authenticated
using (profile_id = auth.uid() or public.is_owner());

drop policy if exists staff_permissions_owner_write on public.staff_permissions;
create policy staff_permissions_owner_write
on public.staff_permissions
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create or replace function public.has_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.current_user_role() = 'owner' then true
    when public.current_user_role() is null then false
    else exists (
      select 1
      from public.staff_permissions sp
      where sp.profile_id = auth.uid()
        and sp.module = p_module
        and case p_action
          when 'view' then sp.can_view
          when 'manage' then sp.can_manage and sp.can_view
          when 'delete' then sp.can_delete and sp.can_view
          else false
        end
    )
  end;
$$;

create or replace function public.can_view_costs()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_role() = 'owner'
    or exists (
      select 1
      from public.staff_permissions sp
      where sp.profile_id = auth.uid()
        and sp.module = 'spareparts'
        and sp.can_view_cost
        and sp.can_view
    );
$$;

grant execute on function public.has_permission(text, text) to authenticated;
grant execute on function public.can_view_costs() to authenticated;

-- ---------------------------------------------------------------------------
-- Ganti policy tulis: dari "semua staf" menjadi izin modul.
-- SELECT tetap is_staff() agar join antar tabel tidak rusak.
-- ---------------------------------------------------------------------------

-- customers
drop policy if exists customers_insert_staff on public.customers;
create policy customers_insert_staff on public.customers for insert to authenticated
with check (public.has_permission('customers', 'manage'));
drop policy if exists customers_update_staff on public.customers;
create policy customers_update_staff on public.customers for update to authenticated
using (public.has_permission('customers', 'manage'))
with check (public.has_permission('customers', 'manage'));
drop policy if exists customers_delete_owner on public.customers;
create policy customers_delete_owner on public.customers for delete to authenticated
using (public.is_owner() or public.has_permission('customers', 'delete'));

-- devices
drop policy if exists devices_insert_staff on public.devices;
create policy devices_insert_staff on public.devices for insert to authenticated
with check (public.has_permission('devices', 'manage'));
drop policy if exists devices_update_staff on public.devices;
create policy devices_update_staff on public.devices for update to authenticated
using (public.has_permission('devices', 'manage'))
with check (public.has_permission('devices', 'manage'));
drop policy if exists devices_delete_owner on public.devices;
create policy devices_delete_owner on public.devices for delete to authenticated
using (public.is_owner() or public.has_permission('devices', 'delete'));

-- service_orders
drop policy if exists service_orders_insert_staff on public.service_orders;
create policy service_orders_insert_staff on public.service_orders for insert to authenticated
with check (public.has_permission('orders', 'manage'));
drop policy if exists service_orders_update_staff on public.service_orders;
create policy service_orders_update_staff on public.service_orders for update to authenticated
using (public.has_permission('orders', 'manage'))
with check (public.has_permission('orders', 'manage'));
drop policy if exists service_orders_delete_owner on public.service_orders;
create policy service_orders_delete_owner on public.service_orders for delete to authenticated
using (public.is_owner() or public.has_permission('orders', 'delete'));

-- service_status_history
drop policy if exists service_status_history_insert_staff on public.service_status_history;
create policy service_status_history_insert_staff on public.service_status_history for insert to authenticated
with check (public.has_permission('orders', 'manage'));

-- spareparts
drop policy if exists spareparts_insert_staff on public.spareparts;
create policy spareparts_insert_staff on public.spareparts for insert to authenticated
with check (public.has_permission('spareparts', 'manage'));
drop policy if exists spareparts_update_staff on public.spareparts;
create policy spareparts_update_staff on public.spareparts for update to authenticated
using (public.has_permission('spareparts', 'manage'))
with check (public.has_permission('spareparts', 'manage'));
drop policy if exists spareparts_delete_owner on public.spareparts;
create policy spareparts_delete_owner on public.spareparts for delete to authenticated
using (public.is_owner() or public.has_permission('spareparts', 'delete'));

-- stock_movements
drop policy if exists stock_movements_insert_staff on public.stock_movements;
create policy stock_movements_insert_staff on public.stock_movements for insert to authenticated
with check (public.has_permission('spareparts', 'manage'));

-- invoices
drop policy if exists invoices_insert_staff on public.invoices;
create policy invoices_insert_staff on public.invoices for insert to authenticated
with check (public.has_permission('invoices', 'manage'));
drop policy if exists invoices_update_staff on public.invoices;
create policy invoices_update_staff on public.invoices for update to authenticated
using (public.has_permission('invoices', 'manage'))
with check (public.has_permission('invoices', 'manage'));
drop policy if exists invoices_delete_owner on public.invoices;
create policy invoices_delete_owner on public.invoices for delete to authenticated
using (public.is_owner() or public.has_permission('invoices', 'delete'));

-- invoice_items
drop policy if exists invoice_items_insert_staff on public.invoice_items;
create policy invoice_items_insert_staff on public.invoice_items for insert to authenticated
with check (public.has_permission('invoices', 'manage'));
drop policy if exists invoice_items_update_staff on public.invoice_items;
create policy invoice_items_update_staff on public.invoice_items for update to authenticated
using (public.has_permission('invoices', 'manage'))
with check (public.has_permission('invoices', 'manage'));
drop policy if exists invoice_items_delete_owner on public.invoice_items;
create policy invoice_items_delete_owner on public.invoice_items for delete to authenticated
using (public.is_owner() or public.has_permission('invoices', 'delete'));

-- payments (insert ikut izin invoice; update/hapus tetap owner)
drop policy if exists payments_insert_staff on public.payments;
create policy payments_insert_staff on public.payments for insert to authenticated
with check (public.has_permission('invoices', 'manage'));

-- service_warranties
drop policy if exists service_warranties_insert_staff on public.service_warranties;
create policy service_warranties_insert_staff on public.service_warranties for insert to authenticated
with check (public.has_permission('warranties', 'manage'));
drop policy if exists service_warranties_update_staff on public.service_warranties;
create policy service_warranties_update_staff on public.service_warranties for update to authenticated
using (public.has_permission('warranties', 'manage'))
with check (public.has_permission('warranties', 'manage'));
drop policy if exists service_warranties_delete_owner on public.service_warranties;
create policy service_warranties_delete_owner on public.service_warranties for delete to authenticated
using (public.is_owner() or public.has_permission('warranties', 'delete'));

-- testimonials
drop policy if exists testimonials_insert_staff on public.testimonials;
create policy testimonials_insert_staff on public.testimonials for insert to authenticated
with check (
  public.has_permission('testimonials', 'manage')
  and status = 'menunggu'
  and moderated_by is null
  and moderated_at is null
);
drop policy if exists testimonials_update_staff on public.testimonials;
create policy testimonials_update_staff on public.testimonials for update to authenticated
using (public.has_permission('testimonials', 'manage'))
with check (
  public.has_permission('testimonials', 'manage')
  and (
    (status = 'menunggu' and moderated_by is null and moderated_at is null)
    or (
      status in ('disetujui', 'ditolak')
      and moderated_by is not null
      and moderated_at is not null
    )
  )
);
drop policy if exists testimonials_delete_owner on public.testimonials;
create policy testimonials_delete_owner on public.testimonials for delete to authenticated
using (public.is_owner() or public.has_permission('testimonials', 'delete'));

-- ---------------------------------------------------------------------------
-- Backfill: staf lama tetap punya akses seperti sebelumnya.
-- view + manage semua modul, tanpa hapus, tanpa harga modal.
-- ---------------------------------------------------------------------------
insert into public.staff_permissions
  (profile_id, module, can_view, can_manage, can_delete, can_view_cost)
select
  p.id,
  m.module,
  true,
  true,
  false,
  false
from public.profiles p
cross join unnest(array[
  'dashboard', 'orders', 'customers', 'devices',
  'invoices', 'spareparts', 'warranties', 'testimonials'
]) as m(module)
where p.role = 'admin'
  and p.is_active
on conflict (profile_id, module) do nothing;

commit;
