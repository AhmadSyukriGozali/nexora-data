-- =============================================================================
-- Nexora Data — Tahap 3: Ganti nama role "teknisi" menjadi "admin"
-- Jalankan SETELAH 002_nexora_rls.sql.
--
-- Akses TIDAK berubah: "admin" tetap staf biasa (setara teknisi sebelumnya),
-- "owner" tetap memegang akses penuh. Yang berubah hanya label role.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Ganti nilai enum. Baris profiles yang sudah ada ikut berubah otomatis,
--    begitu juga default kolom profiles.role.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'staff_role'
      and e.enumlabel = 'teknisi'
  ) then
    alter type public.staff_role rename value 'teknisi' to 'admin';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Trigger pembuatan user baru harus memakai label baru. Kalau masih
--    memakai 'teknisi', insert akan gagal setelah enum diubah.
-- ---------------------------------------------------------------------------
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
    'admin'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

commit;
