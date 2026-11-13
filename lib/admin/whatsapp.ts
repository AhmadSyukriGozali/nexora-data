import { site, trackingUrl } from "@/lib/site";

import { serviceStatusLabels } from "./format";
import type { Order, ServiceStatus } from "./types";

/**
 * Nomor HP Indonesia → format wa.me tanpa tanda plus.
 * Menerima `0815…`, `+62 815…`, atau `815…`; null bila terlalu pendek.
 */
export function waNumber(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

const STATUS_MESSAGES: Record<ServiceStatus, string> = {
  masuk: "Unit sudah kami terima dan menunggu pemeriksaan teknisi.",
  diagnosa: "Teknisi sedang memeriksa penyebab kerusakan.",
  menunggu_persetujuan:
    "Kami sudah punya estimasi biaya. Mohon konfirmasi agar pengerjaan bisa dimulai.",
  dikerjakan: "Perbaikan sedang dikerjakan.",
  menunggu_sparepart: "Pengerjaan tertunda karena menunggu sparepart.",
  selesai: "Unit sudah selesai dan siap diambil pada jam operasional.",
  diambil: "Unit sudah diserahkan kembali. Garansi mengikuti kesepakatan saat pengambilan.",
  batal: "Servis dibatalkan. Hubungi kami kalau ingin mengambil unit.",
};

export function orderStatusMessage(order: Order): string {
  const device = order.device
    ? `${order.device.brand} ${order.device.model}`.trim()
    : "perangkat Anda";
  const name = order.customer?.full_name ?? "Bapak/Ibu";
  const last4 = (order.customer?.phone ?? "").replace(/\D/g, "").slice(-4);

  return [
    `Halo ${name}, update servis ${device} Anda di ${site.name}.`,
    "",
    `Kode servis: ${order.ticket_number}`,
    `Status: ${serviceStatusLabels[order.status]}`,
    "",
    STATUS_MESSAGES[order.status],
    "",
    `Cek progres: ${trackingUrl(order.ticket_number, last4)}`,
    "Balas pesan ini kalau ada pertanyaan.",
  ].join("\n");
}

/** Tautan wa.me ke pelanggan; null bila nomor tidak bisa dipakai. */
export function waCustomerLink(order: Order): string | null {
  const number = waNumber(order.customer?.phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(
    orderStatusMessage(order),
  )}`;
}
