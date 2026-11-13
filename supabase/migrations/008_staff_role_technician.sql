begin;

-- Nilai enum baru tidak boleh dipakai di transaksi yang sama.
alter type public.staff_role add value if not exists 'teknisi';

commit;
