begin;

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid default auth.uid() references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon;
grant select, insert on public.audit_logs to authenticated;

create policy audit_logs_select_owner on public.audit_logs
for select to authenticated using (public.is_owner());

create policy audit_logs_insert_staff on public.audit_logs
for insert to authenticated with check (actor_id = auth.uid());

-- Perubahan status order otomatis tercatat.
create or replace function public.audit_order_status()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
    values (
      auth.uid(),
      'order.status',
      'service_orders',
      new.id::text,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists service_orders_audit_status on public.service_orders;
create trigger service_orders_audit_status
after update of status on public.service_orders
for each row execute function public.audit_order_status();

notify pgrst, 'reload schema';

commit;
