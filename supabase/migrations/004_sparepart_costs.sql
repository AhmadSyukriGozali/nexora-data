-- =============================================================================
-- Nexora Data — Tahap 4: Pisahkan harga modal sparepart (khusus owner)
-- Jalankan SETELAH 003_rename_teknisi_to_admin.sql.
--
-- Sebelumnya cost_price ada di public.spareparts dan bisa dibaca semua staf.
-- Sekarang dipindah ke tabel sendiri dengan RLS owner-only, sehingga admin
-- tidak bisa melihatnya sama sekali — termasuk lewat REST API langsung.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Tabel harga modal, hanya boleh diakses owner.
-- ---------------------------------------------------------------------------
create table public.sparepart_costs (
  sparepart_id uuid primary key references public.spareparts (id) on delete cascade,
  cost_price bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint sparepart_costs_cost_non_negative check (cost_price >= 0)
);

create trigger sparepart_costs_set_updated_at
before update on public.sparepart_costs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Pindahkan data yang sudah ada, lalu hapus kolom lama.
-- ---------------------------------------------------------------------------
insert into public.sparepart_costs (sparepart_id, cost_price)
select id, cost_price
from public.spareparts
on conflict (sparepart_id) do nothing;

alter table public.spareparts drop column cost_price;

-- ---------------------------------------------------------------------------
-- 3. RLS: anon tidak boleh, staf biasa tidak boleh, owner penuh.
-- ---------------------------------------------------------------------------
alter table public.sparepart_costs enable row level security;
revoke all on public.sparepart_costs from anon;
grant select, insert, update, delete on public.sparepart_costs to authenticated;

create policy sparepart_costs_owner_all
on public.sparepart_costs
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Segarkan cache skema PostgREST agar kolom/tabel baru langsung dikenali.
notify pgrst, 'reload schema';

commit;
