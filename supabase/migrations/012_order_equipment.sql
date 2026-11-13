begin;

alter table public.service_orders
  add column if not exists equipment jsonb not null default '[]'::jsonb;

alter table public.service_orders
  drop constraint if exists service_orders_equipment_shape;
alter table public.service_orders
  add constraint service_orders_equipment_shape
  check (jsonb_typeof(equipment) = 'array' and jsonb_array_length(equipment) <= 10);

-- Teknisi tidak boleh mengubah daftar bawaan.
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
      or new.total_amount is distinct from old.total_amount
      or new.equipment is distinct from old.equipment then
      raise exception 'ORDER_FIELD_FORBIDDEN' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';

commit;
