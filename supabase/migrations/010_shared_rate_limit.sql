begin;

-- Disimpan di database supaya batas berlaku di semua instance server.
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0 check (count >= 0),
  reset_at timestamptz not null
);
create index if not exists rate_limits_reset_idx on public.rate_limits (reset_at);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_reset timestamptz;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count = case when r.reset_at <= now() then 1 else r.count + 1 end,
        reset_at = case
          when r.reset_at <= now() then now() + make_interval(secs => p_window_ms / 1000.0)
          else r.reset_at
        end
  returning r.count, r.reset_at into v_count, v_reset;

  -- Bersihkan baris kedaluwarsa sesekali tanpa job terjadwal.
  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 hour';
  end if;

  return query
    select
      v_count <= p_limit,
      greatest(0, ceil(extract(epoch from (v_reset - now())))::int);
end;
$$;

grant execute on function public.consume_rate_limit(text, integer, integer)
  to anon, authenticated;

commit;
