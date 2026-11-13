begin;

-- Token 4 karakter dari RNG kuat PostgreSQL (gen_random_uuid), tanpa huruf/angka ambigu.
create or replace function public.ticket_token()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_hex text := replace(gen_random_uuid()::text, '-', '');
  v_token text := '';
  i int;
  b int;
begin
  for i in 0..3 loop
    b := ('x' || substr(v_hex, 25 + i * 2, 2))::bit(8)::int;
    v_token := v_token || substr(v_alphabet, (b % 32) + 1, 1);
  end loop;
  return v_token;
end;
$$;

revoke all on function public.ticket_token() from public, anon, authenticated;

-- Format baru: NXD-YYMM-XXX-YYYY (periode Asia/Jakarta).
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
  if v_seq > 999 then
    raise exception 'TICKET_SEQUENCE_EXHAUSTED' using errcode = '22003';
  end if;
  return 'NXD-' || v_period || '-' || lpad(v_seq::text, 3, '0')
    || '-' || public.ticket_token();
end;
$$;

-- Tiket lama berformat NXD-YYMM-XXXX tetap valid.
alter table public.service_orders
  drop constraint service_orders_ticket_format;

alter table public.service_orders
  add constraint service_orders_ticket_format
  check (
    ticket_number ~ '^NXD-[0-9]{4}-(?:[0-9]{4,}|[0-9]{3,}-[A-HJ-NP-Z2-9]{4})$'
  );

notify pgrst, 'reload schema';

commit;
