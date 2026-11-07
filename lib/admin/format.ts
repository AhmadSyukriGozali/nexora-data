import type {
  DeviceType,
  InvoiceStatus,
  PaymentMethod,
  ServiceStatus,
  StockMovementType,
  TestimonialStatus,
} from "./types";

export const serviceStatusLabels: Record<ServiceStatus, string> = {
  masuk: "Masuk",
  diagnosa: "Diagnosa",
  menunggu_persetujuan: "Menunggu persetujuan",
  dikerjakan: "Dikerjakan",
  menunggu_sparepart: "Menunggu sparepart",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  terkirim: "Terkirim",
  lunas: "Lunas",
  batal: "Batal",
};

export const deviceTypeLabels: Record<DeviceType, string> = {
  hp: "HP",
  laptop: "Laptop",
  pc: "PC",
  printer: "Printer",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  tunai: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
  kartu: "Kartu",
  lainnya: "Lainnya",
};

export const stockMovementLabels: Record<StockMovementType, string> = {
  masuk: "Masuk",
  keluar: "Keluar",
  penyesuaian: "Penyesuaian",
};

export const testimonialStatusLabels: Record<TestimonialStatus, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const dateOnly = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export function formatRupiah(value: number | null | undefined): string {
  return rupiah.format(value ?? 0);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTime.format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateOnly.format(date);
}

/** Nilai untuk <input type="datetime-local"> dalam zona Asia/Jakarta. */
export function toJakartaInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Mengubah input datetime-local (waktu Jakarta) menjadi ISO UTC. */
export function fromJakartaInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00+07:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function isWarrantyActive(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() > Date.now();
}
