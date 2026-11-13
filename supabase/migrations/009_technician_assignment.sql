begin;

alter table public.service_orders
  add column if not exists assigned_technician_id uuid
  references public.profiles (id) on delete set null;

create index if not exists service_orders_technician_idx
  on public.service_orders (assigned_technician_id);

create or replace function public.is_admin_or_owner()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.current_user_role() in ('owner', 'admin');
$$;
grant execute on function public.is_admin_or_owner() to authenticated;

-- Profil: admin/owner boleh membaca nama staf untuk penugasan.
drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin_or_owner());

-- Order: teknisi hanya yang ditugaskan.
drop policy if exists service_orders_select_staff on public.service_orders;
create policy service_orders_select_staff on public.service_orders
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and (
    public.is_admin_or_owner()
    or assigned_technician_id = auth.uid()
  )
);

drop policy if exists service_orders_insert_staff on public.service_orders;
create policy service_orders_insert_staff on public.service_orders
for insert to authenticated
with check (
  public.is_admin_or_owner()
  and public.has_permission('orders', 'manage')
);

drop policy if exists service_orders_update_staff on public.service_orders;
create policy service_orders_update_staff on public.service_orders
for update to authenticated
using (
  public.has_permission('orders', 'manage')
  and (public.is_admin_or_owner() or assigned_technician_id = auth.uid())
)
with check (
  public.has_permission('orders', 'manage')
  and (public.is_admin_or_owner() or assigned_technician_id = auth.uid())
);

-- Histori: ikut cakupan order.
drop policy if exists service_status_history_select_staff on public.service_status_history;
create policy service_status_history_select_staff on public.service_status_history
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_status_history.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

-- Pelanggan & perangkat: teknisi hanya yang terkait order-nya.
drop policy if exists customers_select_staff on public.customers;
create policy customers_select_staff on public.customers
for select to authenticated
using (
  public.has_permission('customers', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.customer_id = customers.id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

drop policy if exists devices_select_staff on public.devices;
create policy devices_select_staff on public.devices
for select to authenticated
using (
  public.has_permission('devices', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.device_id = devices.id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

drop policy if exists service_warranties_select_staff on public.service_warranties;
create policy service_warranties_select_staff on public.service_warranties
for select to authenticated
using (
  public.has_permission('warranties', 'view')
  and (
    public.is_admin_or_owner()
    or exists (
      select 1 from public.service_orders so
      where so.id = service_warranties.order_id
        and so.assigned_technician_id = auth.uid()
    )
  )
);

-- Tabel sensitif: ikut izin modul, bukan sekadar staf.
drop policy if exists invoices_select_staff on public.invoices;
create policy invoices_select_staff on public.invoices
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists invoice_items_select_staff on public.invoice_items;
create policy invoice_items_select_staff on public.invoice_items
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists payments_select_staff on public.payments;
create policy payments_select_staff on public.payments
for select to authenticated
using (public.has_permission('invoices', 'view'));

drop policy if exists spareparts_select_staff on public.spareparts;
create policy spareparts_select_staff on public.spareparts
for select to authenticated
using (public.has_permission('spareparts', 'view'));

drop policy if exists stock_movements_select_staff on public.stock_movements;
create policy stock_movements_select_staff on public.stock_movements
for select to authenticated
using (public.has_permission('spareparts', 'view'));

drop policy if exists testimonials_select_staff on public.testimonials;
create policy testimonials_select_staff on public.testimonials
for select to authenticated
using (public.has_permission('testimonials', 'view'));

-- Teknisi tidak boleh mengubah identitas order/biaya/penugasan.
create or replace function public.guard_order_technician_update()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if public.current_user_role() = 'teknisi' then
    if new.assigned_technician_id is distinct from old.assigned_technician_id
      or new.customer_id is distinct from old.customer_id
      or new.device_id is distinct from old.device_id
      or new.complaint is distinct from old.complaint
      or new.total_amount is distinct from old.total_amount then
      raise exception 'ORDER_FIELD_FORBIDDEN' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists service_orders_guard_technician on public.service_orders;
create trigger service_orders_guard_technician
before update on public.service_orders
for each row execute function public.guard_order_technician_update();

notify pgrst, 'reload schema';

commit;
