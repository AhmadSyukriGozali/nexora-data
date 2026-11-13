begin;

create table if not exists public.service_attachments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  kind text not null check (kind in ('before', 'after')),
  storage_path text not null unique,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint service_attachments_path_shape
    check (storage_path like order_id::text || '/' || kind || '/%')
);

create index if not exists service_attachments_order_idx
  on public.service_attachments (order_id);

alter table public.service_attachments enable row level security;
revoke all on public.service_attachments from anon;
grant select, insert, delete on public.service_attachments to authenticated;

drop policy if exists service_attachments_select_staff on public.service_attachments;
create policy service_attachments_select_staff on public.service_attachments
for select to authenticated
using (
  public.has_permission('orders', 'view')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_attachments.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

drop policy if exists service_attachments_insert_staff on public.service_attachments;
create policy service_attachments_insert_staff on public.service_attachments
for insert to authenticated
with check (
  public.has_permission('orders', 'manage')
  and exists (
    select 1 from public.service_orders so
    where so.id = service_attachments.order_id
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

drop policy if exists service_attachments_delete_admin on public.service_attachments;
create policy service_attachments_delete_admin on public.service_attachments
for delete to authenticated
using (public.has_permission('orders', 'manage') and public.is_admin_or_owner());

-- Bucket privat; berkas diunggah lewat Route Handler dengan sesi staf.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-photos',
  'service-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists service_photos_select_staff on storage.objects;
create policy service_photos_select_staff on storage.objects
for select to authenticated
using (
  bucket_id = 'service-photos'
  and exists (
    select 1 from public.service_attachments a
    join public.service_orders so on so.id = a.order_id
    where a.storage_path = storage.objects.name
      and public.has_permission('orders', 'view')
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

drop policy if exists service_photos_insert_staff on storage.objects;
create policy service_photos_insert_staff on storage.objects
for insert to authenticated
with check (
  bucket_id = 'service-photos'
  and public.has_permission('orders', 'manage')
  and exists (
    select 1 from public.service_orders so
    where so.id::text = split_part(storage.objects.name, '/', 1)
      and (public.is_admin_or_owner() or so.assigned_technician_id = auth.uid())
  )
);

drop policy if exists service_photos_delete_admin on storage.objects;
create policy service_photos_delete_admin on storage.objects
for delete to authenticated
using (
  bucket_id = 'service-photos'
  and public.has_permission('orders', 'manage')
  and public.is_admin_or_owner()
);

notify pgrst, 'reload schema';

commit;
