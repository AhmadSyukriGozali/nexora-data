-- =============================================================================
-- Nexora Data — Tahap 1: skema inti
-- Jalankan file ini SEBELUM 20261107000200_nexora_rls.sql di Supabase SQL Editor.
-- Semua waktu memakai timestamptz (tampilan Asia/Jakarta diatur di aplikasi).
-- Semua uang disimpan sebagai bigint Rupiah (tanpa desimal).
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ENUM
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('owner', 'teknisi');
create type public.device_type as enum ('hp', 'laptop', 'pc', 'printer');
create type public.service_status as enum (
  'masuk',
  'diagnosa',
  'menunggu_persetujuan',
  'dikerjakan',
  'menunggu_sparepart',
  'selesai',
  'diambil',
  'batal'
);
create type public.invoice_status as enum ('draft', 'terkirim', 'lunas', 'batal');
create type public.payment_method as enum ('tunai', 'transfer', 'qris', 'kartu', 'lainnya');
create type public.stock_movement_type as enum ('masuk', 'keluar', 'penyesuaian');
create type public.testimonial_status as enum ('menunggu', 'disetujui', 'ditolak');

-- ---------------------------------------------------------------------------
-- 2. FUNGSI UTILITAS
-- ---------------------------------------------------------------------------

-- updated_at otomatis untuk semua tabel yang punya kolom updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Penghitung internal (nomor tiket & nomor invoice). Tidak dapat diakses klien.
create table public.counters (
  name text primary key,
  value bigint not null default 0 check (value >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.next_counter(p_name text)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_value bigint;
begin
  insert into public.counters as c (name, value)
  values (p_name, 1)
  on conflict (name) do update
    set value = c.value + 1,
        updated_at = now()
  returning value into v_value;

  return v_value;
end;
$$;

-- Format: NXD-YYMM-XXXX (periode mengikuti Asia/Jakarta).
create or replace function public.next_ticket_number()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text := to_char((now() at time zone 'Asia/Jakarta'), 'YYMM');
  v_seq bigint;
begin
  v_seq := public.next_counter('ticket:' || v_period);
  return 'NXD-' || v_period || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Format: NXD-INV-YYMM-XXXX (periode mengikuti Asia/Jakarta).
create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text := to_char((now() at time zone 'Asia/Jakarta'), 'YYMM');
  v_seq bigint;
begin
  v_seq := public.next_counter('invoice:' || v_period);
  return 'NXD-INV-' || v_period || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Nomor tiket selalu dibuat database, bukan dari input klien.
create or replace function public.set_ticket_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.ticket_number := public.next_ticket_number();
  return new;
end;
$$;

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.invoice_number := public.next_invoice_number();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. PROFIL ADMIN (terhubung ke auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.staff_role not null default 'teknisi',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(btrim(full_name)) <= 120)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Setiap user auth baru otomatis menjadi teknisi. Promosi ke owner hanya
-- lewat SQL manual oleh pemilik proyek (tidak bisa dari aplikasi).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'teknisi'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Fungsi bantu role dipakai oleh RLS (file Tahap 2) dan route handler.
-- Dibuat setelah public.profiles ada agar body SQL tervalidasi.
create or replace function public.current_user_role()
returns public.staff_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_role() is not null;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_role() = 'owner';
$$;

-- ---------------------------------------------------------------------------
-- 4. PELANGGAN & PERANGKAT
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_full_name_length check (char_length(btrim(full_name)) between 2 and 120),
  -- Nomor disimpan sebagai digit saja; normalisasi dilakukan route handler.
  constraint customers_phone_format check (phone ~ '^[0-9]{8,15}$'),
  constraint customers_phone_unique unique (phone)
);

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  device_type public.device_type not null,
  brand text not null,
  model text not null default '',
  serial_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint devices_brand_length check (char_length(btrim(brand)) between 1 and 80),
  constraint devices_id_customer_unique unique (id, customer_id)
);

create index devices_customer_id_idx on public.devices (customer_id);
create index devices_device_type_idx on public.devices (device_type);

create trigger devices_set_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. ORDER SERVIS & RIWAYAT STATUS
-- ---------------------------------------------------------------------------
create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null default '',
  customer_id uuid not null references public.customers (id) on delete restrict,
  device_id uuid not null,
  complaint text not null,
  diagnosis text,
  status public.service_status not null default 'masuk',
  estimated_finish_at timestamptz,
  total_amount bigint not null default 0,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  picked_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_orders_ticket_unique unique (ticket_number),
  constraint service_orders_ticket_format check (ticket_number ~ '^NXD-[0-9]{4}-[0-9]{4,}$'),
  constraint service_orders_complaint_length check (char_length(btrim(complaint)) >= 3),
  constraint service_orders_total_non_negative check (total_amount >= 0),
  constraint service_orders_device_customer_fkey
    foreign key (device_id, customer_id)
    references public.devices (id, customer_id)
    on delete restrict
);

create index service_orders_customer_id_idx on public.service_orders (customer_id);
create index service_orders_device_id_idx on public.service_orders (device_id, customer_id);
create index service_orders_status_idx on public.service_orders (status);
create index service_orders_created_at_idx on public.service_orders (created_at desc);

create trigger service_orders_set_ticket_number
before insert on public.service_orders
for each row execute function public.set_ticket_number();

create trigger service_orders_set_updated_at
before update on public.service_orders
for each row execute function public.set_updated_at();

create table public.service_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.service_orders (id) on delete restrict,
  from_status public.service_status,
  to_status public.service_status not null,
  note text,
  changed_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index service_status_history_order_idx
  on public.service_status_history (order_id, created_at desc);

-- Riwayat tidak boleh diubah/dihapus (append-only).
create or replace function public.prevent_row_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'ROW_IMMUTABLE' using errcode = '42501';
end;
$$;

create trigger service_status_history_immutable
before update or delete on public.service_status_history
for each row execute function public.prevent_row_mutation();

-- Perubahan status + riwayat dalam satu transaksi.
create or replace function public.change_order_status(
  p_order_id uuid,
  p_new_status public.service_status,
  p_note text default null
)
returns public.service_orders
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_old_status public.service_status;
  v_row public.service_orders;
begin
  select status into v_old_status
  from public.service_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_old_status = p_new_status then
    raise exception 'STATUS_UNCHANGED' using errcode = '22023';
  end if;

  update public.service_orders
  set status = p_new_status,
      started_at = case
        when p_new_status = 'dikerjakan' and started_at is null then now()
        else started_at
      end,
      completed_at = case
        when p_new_status = 'selesai' and completed_at is null then now()
        else completed_at
      end,
      picked_up_at = case
        when p_new_status = 'diambil' and picked_up_at is null then now()
        else picked_up_at
      end
  where id = p_order_id
  returning * into v_row;

  insert into public.service_status_history
    (order_id, from_status, to_status, note, changed_by)
  values
    (p_order_id, v_old_status, p_new_status, p_note, auth.uid());

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. SPAREPART & STOK
-- ---------------------------------------------------------------------------
create table public.spareparts (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  name text not null,
  category text,
  unit text not null default 'pcs',
  cost_price bigint not null default 0,
  sell_price bigint not null default 0,
  stock_quantity integer not null default 0,
  min_stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spareparts_sku_unique unique (sku),
  constraint spareparts_name_length check (char_length(btrim(name)) >= 2),
  constraint spareparts_cost_non_negative check (cost_price >= 0),
  constraint spareparts_sell_non_negative check (sell_price >= 0),
  constraint spareparts_stock_non_negative check (stock_quantity >= 0),
  constraint spareparts_min_stock_non_negative check (min_stock >= 0)
);

create index spareparts_active_idx on public.spareparts (is_active);
create index spareparts_name_idx on public.spareparts (lower(name));

create trigger spareparts_set_updated_at
before update on public.spareparts
for each row execute function public.set_updated_at();

create table public.stock_movements (
  id bigint generated always as identity primary key,
  sparepart_id uuid not null references public.spareparts (id) on delete restrict,
  movement_type public.stock_movement_type not null,
  quantity integer not null,
  order_id uuid references public.service_orders (id) on delete set null,
  note text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  -- masuk/keluar memakai jumlah positif; penyesuaian memakai selisih bertanda.
  constraint stock_movements_quantity_check check (
    (movement_type = 'masuk' and quantity > 0)
    or (movement_type = 'keluar' and quantity > 0)
    or (movement_type = 'penyesuaian' and quantity <> 0)
  )
);

create index stock_movements_sparepart_idx
  on public.stock_movements (sparepart_id, created_at desc);
create index stock_movements_order_idx on public.stock_movements (order_id);

create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_stock integer;
  v_delta integer;
begin
  v_delta := case new.movement_type
    when 'masuk' then new.quantity
    when 'keluar' then -new.quantity
    else new.quantity
  end;

  select stock_quantity into v_stock
  from public.spareparts
  where id = new.sparepart_id
  for update;

  if v_stock is null then
    raise exception 'SPAREPART_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_stock + v_delta < 0 then
    raise exception 'STOK_TIDAK_CUKUP' using errcode = '23514';
  end if;

  -- Penanda transaksi agar guard di bawah mengizinkan perubahan stok ini.
  perform set_config('nexora.stock_apply', '1', true);

  update public.spareparts
  set stock_quantity = v_stock + v_delta
  where id = new.sparepart_id;

  perform set_config('nexora.stock_apply', '0', true);

  return new;
end;
$$;

create trigger stock_movements_apply
before insert on public.stock_movements
for each row execute function public.apply_stock_movement();

-- Kolom stok hanya boleh berubah lewat trigger stock_movements.
create or replace function public.guard_sparepart_stock()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.stock_quantity is distinct from old.stock_quantity
     and coalesce(current_setting('nexora.stock_apply', true), '') <> '1' then
    raise exception 'STOCK_MUTATION_FORBIDDEN' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger spareparts_guard_stock
before update on public.spareparts
for each row execute function public.guard_sparepart_stock();

-- Buku stok bersifat append-only; koreksi dilakukan lewat 'penyesuaian'.
create trigger stock_movements_immutable
before update or delete on public.stock_movements
for each row execute function public.prevent_row_mutation();

-- ---------------------------------------------------------------------------
-- 7. INVOICE, ITEM, PEMBAYARAN
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null default '',
  order_id uuid not null references public.service_orders (id) on delete restrict,
  status public.invoice_status not null default 'draft',
  subtotal bigint not null default 0,
  discount_amount bigint not null default 0,
  total_amount bigint not null default 0,
  paid_amount bigint not null default 0,
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  notes text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_number_unique unique (invoice_number),
  constraint invoices_number_format check (invoice_number ~ '^NXD-INV-[0-9]{4}-[0-9]{4,}$'),
  constraint invoices_order_unique unique (order_id),
  constraint invoices_subtotal_non_negative check (subtotal >= 0),
  constraint invoices_discount_non_negative check (discount_amount >= 0),
  constraint invoices_total_non_negative check (total_amount >= 0),
  constraint invoices_paid_non_negative check (paid_amount >= 0)
);

create index invoices_status_idx on public.invoices (status);
create index invoices_issued_at_idx on public.invoices (issued_at desc);

create trigger invoices_set_number
before insert on public.invoices
for each row execute function public.set_invoice_number();

create or replace function public.set_invoice_total()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.total_amount := greatest(new.subtotal - new.discount_amount, 0);
  return new;
end;
$$;

create trigger invoices_set_total
before insert or update on public.invoices
for each row execute function public.set_invoice_total();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  sparepart_id uuid references public.spareparts (id) on delete set null,
  description text not null,
  quantity integer not null,
  unit_price bigint not null,
  line_total bigint generated always as ((quantity::bigint) * unit_price) stored,
  created_at timestamptz not null default now(),
  constraint invoice_items_description_length check (char_length(btrim(description)) >= 1),
  constraint invoice_items_quantity_positive check (quantity > 0),
  constraint invoice_items_unit_price_non_negative check (unit_price >= 0)
);

create index invoice_items_invoice_idx on public.invoice_items (invoice_id);
create index invoice_items_sparepart_idx on public.invoice_items (sparepart_id);

create or replace function public.recalc_invoice_totals()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_subtotal bigint;
begin
  select coalesce(sum(line_total), 0)
  into v_subtotal
  from public.invoice_items
  where invoice_id = v_invoice_id;

  update public.invoices
  set subtotal = v_subtotal,
      total_amount = greatest(v_subtotal - discount_amount, 0),
      status = case
        when status in ('draft', 'terkirim')
             and v_subtotal - discount_amount > 0
             and paid_amount >= greatest(v_subtotal - discount_amount, 0)
          then 'lunas'::public.invoice_status
        when status = 'lunas'
             and paid_amount < greatest(v_subtotal - discount_amount, 0)
          then 'terkirim'::public.invoice_status
        else status
      end
  where id = v_invoice_id;

  return null;
end;
$$;

create trigger invoice_items_recalc_totals
after insert or update or delete on public.invoice_items
for each row execute function public.recalc_invoice_totals();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  amount bigint not null,
  method public.payment_method not null default 'tunai',
  reference text,
  paid_at timestamptz not null default now(),
  received_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0)
);

create index payments_invoice_idx on public.payments (invoice_id, paid_at desc);

create or replace function public.recalc_invoice_paid()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_paid bigint;
begin
  select coalesce(sum(amount), 0)
  into v_paid
  from public.payments
  where invoice_id = v_invoice_id;

  update public.invoices
  set paid_amount = v_paid,
      status = case
        when status in ('draft', 'terkirim')
             and total_amount > 0
             and v_paid >= total_amount
          then 'lunas'::public.invoice_status
        when status = 'lunas' and v_paid < total_amount
          then 'terkirim'::public.invoice_status
        else status
      end
  where id = v_invoice_id;

  return null;
end;
$$;

create trigger payments_recalc_invoice
after insert or update or delete on public.payments
for each row execute function public.recalc_invoice_paid();

-- ---------------------------------------------------------------------------
-- 8. GARANSI SERVIS
-- ---------------------------------------------------------------------------
create table public.service_warranties (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  duration_days integer not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null default now(),
  terms text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_warranties_order_unique unique (order_id),
  constraint service_warranties_duration_check check (duration_days between 1 and 3650)
);

create index service_warranties_expires_idx on public.service_warranties (expires_at);

create or replace function public.set_warranty_expiry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.expires_at := new.starts_at + make_interval(days => new.duration_days);
  return new;
end;
$$;

create trigger service_warranties_set_expiry
before insert or update on public.service_warranties
for each row execute function public.set_warranty_expiry();

create trigger service_warranties_set_updated_at
before update on public.service_warranties
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. TESTIMONI (dimoderasi admin)
-- ---------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.service_orders (id) on delete set null,
  customer_name text not null,
  phone text,
  rating smallint not null,
  message text not null,
  status public.testimonial_status not null default 'menunggu',
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_name_length check (char_length(btrim(customer_name)) between 2 and 80),
  constraint testimonials_phone_format check (phone is null or phone ~ '^[0-9]{8,15}$'),
  constraint testimonials_rating_range check (rating between 1 and 5),
  constraint testimonials_message_length check (char_length(btrim(message)) between 10 and 2000),
  constraint testimonials_moderation_consistent check (
    (status = 'menunggu' and moderated_by is null and moderated_at is null)
    or (status <> 'menunggu' and moderated_by is not null and moderated_at is not null)
  )
);

create index testimonials_status_idx on public.testimonials (status, created_at desc);
create index testimonials_order_idx on public.testimonials (order_id);

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. HAK EKSEKUSI FUNGSI INTERNAL
-- ---------------------------------------------------------------------------
-- Generator nomor & penghitung hanya dipanggil oleh trigger (security definer).
revoke all on function public.next_counter(text) from public, anon, authenticated;
revoke all on function public.next_ticket_number() from public, anon, authenticated;
revoke all on function public.next_invoice_number() from public, anon, authenticated;
revoke all on function public.set_ticket_number() from public, anon, authenticated;
revoke all on function public.set_invoice_number() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.apply_stock_movement() from public, anon, authenticated;

-- Perubahan status dipanggil dari Route Handler dengan sesi admin (RLS aktif).
revoke all on function public.change_order_status(uuid, public.service_status, text) from public, anon;
grant execute on function public.change_order_status(uuid, public.service_status, text) to authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_owner() to authenticated;

commit;
