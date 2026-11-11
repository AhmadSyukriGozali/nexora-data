import type { InvoiceStatus, ServiceStatus } from "./types";

/**
 * Alur status order. Hanya transisi di daftar ini yang diizinkan, sehingga
 * status tidak bisa meloncat atau dikarang. Disimpan sebagai satu sumber
 * kebenaran untuk UI, API, dan referensi migrasi SQL.
 */
export const ORDER_FLOW: Record<ServiceStatus, readonly ServiceStatus[]> = {
  masuk: ["diagnosa", "batal"],
  diagnosa: ["menunggu_persetujuan", "dikerjakan", "batal"],
  menunggu_persetujuan: ["dikerjakan", "batal"],
  dikerjakan: ["menunggu_sparepart", "selesai", "batal"],
  menunggu_sparepart: ["dikerjakan", "batal"],
  selesai: ["diambil"],
  diambil: [],
  batal: [],
};

/** Jalur utama untuk stepper. Cabang sparepart dan batal tidak ikut. */
export const ORDER_SEQUENCE: readonly ServiceStatus[] = [
  "masuk",
  "diagnosa",
  "menunggu_persetujuan",
  "dikerjakan",
  "selesai",
  "diambil",
];

export function nextOrderStatuses(status: ServiceStatus): ServiceStatus[] {
  return [...ORDER_FLOW[status]];
}

export function canTransitionOrder(
  from: ServiceStatus,
  to: ServiceStatus,
): boolean {
  return ORDER_FLOW[from].includes(to);
}

/**
 * Alur penuh invoice termasuk transisi otomatis dari trigger pembayaran
 * (lunas kembali ke terkirim saat pembayaran dibatalkan).
 */
export const INVOICE_FLOW: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ["terkirim", "lunas", "batal"],
  terkirim: ["lunas", "batal"],
  lunas: ["terkirim"],
  batal: [],
};

/**
 * Transisi yang boleh dipilih staf lewat UI/API. `lunas` tidak ada di sini:
 * status itu hanya dihasilkan otomatis oleh sistem pembayaran.
 */
export const MANUAL_INVOICE_FLOW: Record<
  InvoiceStatus,
  readonly InvoiceStatus[]
> = {
  draft: ["terkirim", "batal"],
  terkirim: ["batal"],
  lunas: [],
  batal: [],
};

export function canTransitionInvoice(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  return INVOICE_FLOW[from].includes(to);
}

export function canManualInvoiceTransition(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  return MANUAL_INVOICE_FLOW[from].includes(to);
}
