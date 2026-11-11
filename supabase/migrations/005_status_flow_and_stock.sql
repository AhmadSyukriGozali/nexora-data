-- =============================================================================
-- Nexora Data — Tahap 5: alur status berurutan + potong stok otomatis
-- Jalankan SETELAH 004_sparepart_costs.sql.
--
-- Perubahan:
--   1. Trigger transisi status order dan invoice (tidak bisa meloncat).
--   2. Batal order hanya owner.
--   3. Konsistensi status invoice dengan jumlah pembayaran.
--   4. Pembayaran hanya boleh dicatat setelah invoice terkirim.
--   5. Item invoice memakai sparepart otomatis memotong/mengembalikan stok.
--   6. Normalisasi data invoice lama yang tidak konsisten.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ORDER: transisi berurutan
-- ---------------------------------------------------------------------------
create or replace function public.enforce_service_status_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_allowed text[];
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_allowed := case old.status
    when 'masuk' then array['diagnosa', 'batal']
    when 'diagnosa' then array['menunggu_persetujuan', 'dikerjakan', 'batal']
    when 'menunggu_persetujuan' then array['dikerjakan', 'batal']
    when 'dikerjakan' then array['menunggu_sparepart', 'selesai', 'batal']
    when 'menunggu_sparepart' then array['dikerjakan', 'batal']
    when 'selesai' then array['diambil']
    else array[]::text[]
  end;

  if not (new.status::text = any (v_allowed)) then
    raise exception 'TRANSISI_STATUS_TIDAK_VALID: % ke %', old.status, new.status
      using errcode = '22023';
  end if;

  if new.status = 'batal' and not public.is_owner() then
    raise exception 'BATAL_ORDER_KHUSUS_OWNER' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists service_orders_status_flow on public.service_orders;
create trigger service_orders_status_flow
before update of status on public.service_orders
for each row execute function public.enforce_service_status_transition();

-- ---------------------------------------------------------------------------
-- 2. INVOICE: transisi + konsistensi pembayaran
-- ---------------------------------------------------------------------------
create or replace function public.enforce_invoice_status_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_allowed text[];
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_allowed := case old.status
    when 'draft' then array['terkirim', 'lunas', 'batal']
    when 'terkirim' then array['lunas', 'batal']
    when 'lunas' then array['terkirim']
    else array[]::text[]
  end;

  if not (new.status::text = any (v_allowed)) then
    raise exception 'TRANSISI_STATUS_TIDAK_VALID: % ke %', old.status, new.status
      using errcode = '22023';
  end if;

  if new.status = 'batal' and not public.is_owner() then
    raise exception 'BATAL_INVOICE_KHUSUS_OWNER' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists invoices_status_flow on public.invoices;
create trigger invoices_status_flow
before update of status on public.invoices
for each row execute function public.enforce_invoice_status_transition();

-- Nama diawali zz agar berjalan setelah invoices_set_total menghitung ulang
-- total_amount pada statement yang sama.
create or replace function public.enforce_invoice_status_consistency()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'draft' and new.paid_amount <> 0 then
    raise exception 'INVOICE_DRAFT_TIDAK_BOLEH_PUNYA_PEMBAYARAN'
      using errcode = '22023';
  end if;

  if new.status = 'terkirim'
     and new.total_amount > 0
     and new.paid_amount >= new.total_amount then
    raise exception 'INVOICE_TERKIRIM_SUDAH_LUNAS' using errcode = '22023';
  end if;

  if new.status = 'lunas'
     and (new.total_amount <= 0 or new.paid_amount < new.total_amount) then
    raise exception 'INVOICE_LUNAS_BELUM_DIBAYAR_PENUH' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists zz_invoices_status_consistency on public.invoices;
create trigger zz_invoices_status_consistency
before update of status, paid_amount, total_amount, subtotal, discount_amount
on public.invoices
for each row execute function public.enforce_invoice_status_consistency();

-- Pembayaran hanya untuk invoice yang sudah dikirim.
create or replace function public.guard_payment_invoice_status()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_status public.invoice_status;
begin
  select status into v_status
  from public.invoices
  where id = new.invoice_id;

  if v_status is distinct from 'terkirim' then
    raise exception 'INVOICE_BELUM_TERKIRIM' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_require_sent_invoice on public.payments;
create trigger payments_require_sent_invoice
before insert on public.payments
for each row execute function public.guard_payment_invoice_status();

-- ---------------------------------------------------------------------------
-- 3. STOK OTOMATIS DARI ITEM INVOICE
-- ---------------------------------------------------------------------------
alter table public.stock_movements
  add column if not exists invoice_item_id uuid;

create index if not exists stock_movements_invoice_item_idx
  on public.stock_movements (invoice_item_id);

create or replace function public.apply_invoice_item_stock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_invoice_number text;
begin
  if tg_op = 'INSERT' then
    if new.sparepart_id is null then
      return new;
    end if;

    select order_id, invoice_number
      into v_order_id, v_invoice_number
    from public.invoices
    where id = new.invoice_id;

    insert into public.stock_movements
      (sparepart_id, movement_type, quantity, order_id, invoice_item_id, note, created_by)
    values
      (new.sparepart_id, 'keluar', new.quantity, v_order_id, new.id,
       'Pemakaian item invoice ' || coalesce(v_invoice_number, ''), auth.uid());

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.sparepart_id is not distinct from new.sparepart_id
       and old.quantity = new.quantity then
      return new;
    end if;

    select order_id, invoice_number
      into v_order_id, v_invoice_number
    from public.invoices
    where id = new.invoice_id;

    if old.sparepart_id is not null then
      insert into public.stock_movements
        (sparepart_id, movement_type, quantity, order_id, invoice_item_id, note, created_by)
      values
        (old.sparepart_id, 'masuk', old.quantity, v_order_id, old.id,
         'Koreksi item invoice ' || coalesce(v_invoice_number, ''), auth.uid());
    end if;

    if new.sparepart_id is not null then
      insert into public.stock_movements
        (sparepart_id, movement_type, quantity, order_id, invoice_item_id, note, created_by)
      values
        (new.sparepart_id, 'keluar', new.quantity, v_order_id, new.id,
         'Pemakaian item invoice ' || coalesce(v_invoice_number, ''), auth.uid());
    end if;

    return new;
  end if;

  -- DELETE: kembalikan stok. Parent invoice mungkin sudah dihapus (cascade),
  -- jadi nomor invoice boleh kosong.
  if old.sparepart_id is null then
    return old;
  end if;

  select order_id, invoice_number
    into v_order_id, v_invoice_number
  from public.invoices
  where id = old.invoice_id;

  insert into public.stock_movements
    (sparepart_id, movement_type, quantity, order_id, invoice_item_id, note, created_by)
  values
    (old.sparepart_id, 'masuk', old.quantity, v_order_id, old.id,
     'Pengembalian item invoice ' || coalesce(v_invoice_number, ''), auth.uid());

  return old;
end;
$$;

drop trigger if exists invoice_items_stock on public.invoice_items;
create trigger invoice_items_stock
after insert or update or delete on public.invoice_items
for each row execute function public.apply_invoice_item_stock();

-- Item invoice pada invoice batal tidak boleh diubah.
create or replace function public.guard_invoice_item_mutable()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_status public.invoice_status;
begin
  select status into v_status
  from public.invoices
  where id = coalesce(new.invoice_id, old.invoice_id);

  if v_status = 'batal' then
    raise exception 'INVOICE_BATAL_TIDAK_BOLEH_DIUBAH' using errcode = '22023';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists invoice_items_mutable on public.invoice_items;
create trigger invoice_items_mutable
before insert or update on public.invoice_items
for each row execute function public.guard_invoice_item_mutable();

-- ---------------------------------------------------------------------------
-- 4. NORMALISASI DATA LAMA
-- ---------------------------------------------------------------------------
update public.invoices
set status = 'terkirim'
where status = 'lunas'
  and (total_amount = 0 or paid_amount < total_amount);

update public.invoices
set status = 'terkirim'
where status = 'draft'
  and paid_amount > 0;

update public.invoices
set status = 'lunas'
where status in ('draft', 'terkirim')
  and total_amount > 0
  and paid_amount >= total_amount;

commit;
