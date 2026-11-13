begin;

-- Ganti fungsi status: penyerahan unit wajib menyertakan durasi garansi dan
-- hanya boleh dilakukan owner/admin. Garansi dibuat di transaksi yang sama.
drop function if exists public.change_order_status(uuid, public.service_status, text);

create function public.change_order_status(
  p_order_id uuid,
  p_new_status public.service_status,
  p_note text default null,
  p_warranty_days integer default null,
  p_warranty_terms text default null
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

  if p_new_status = 'diambil' then
    if public.current_user_role() = 'teknisi' then
      raise exception 'ORDER_FIELD_FORBIDDEN' using errcode = '42501';
    end if;
    if p_warranty_days is null or p_warranty_days < 1 or p_warranty_days > 3650 then
      raise exception 'WARRANTY_DURATION_REQUIRED' using errcode = '22023';
    end if;
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

  if p_new_status = 'diambil' then
    insert into public.service_warranties
      (order_id, duration_days, starts_at, terms, created_by)
    values
      (p_order_id, p_warranty_days, v_row.picked_up_at, p_warranty_terms, auth.uid())
    on conflict (order_id) do nothing;
  end if;

  return v_row;
end;
$$;

revoke all on function public.change_order_status(
  uuid, public.service_status, text, integer, text
) from public, anon;
grant execute on function public.change_order_status(
  uuid, public.service_status, text, integer, text
) to authenticated;

notify pgrst, 'reload schema';

commit;
