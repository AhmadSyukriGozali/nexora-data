type PublicStatus = {
  ticket_number: string;
  device_type: string | null;
  status: string;
  estimated_finish_at: string | null;
};

/**
 * Pilih hanya field aman untuk pelacakan publik. Field lain dari query
 * (id, telepon, nama pelanggan, keluhan) sengaja tidak ikut keluar.
 */
export function toPublicStatus(
  input: PublicStatus & { [key: string]: unknown },
): PublicStatus {
  return {
    ticket_number: input.ticket_number,
    device_type: input.device_type,
    status: input.status,
    estimated_finish_at: input.estimated_finish_at,
  };
}
