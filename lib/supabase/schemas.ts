import { z } from "zod";

import { MODULES } from "@/lib/admin/access";
import { normalizeEquipment } from "@/lib/admin/equipment";
import { isTicketNumber } from "@/lib/tickets/ticket-number";

/** Normalisasi nomor HP Indonesia menjadi digit saja (contoh: +62 815 → 0815). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith("8")) {
    return `0${digits}`;
  }
  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Nomor HP wajib diisi")
  .transform(normalizePhone)
  .refine(
    (value) => /^[0-9]{8,15}$/.test(value),
    "Nomor HP harus 8-15 digit",
  );

export const deviceTypeSchema = z.enum(["hp", "laptop", "pc", "printer"]);

export const serviceStatusSchema = z.enum([
  "masuk",
  "diagnosa",
  "menunggu_persetujuan",
  "dikerjakan",
  "menunggu_sparepart",
  "selesai",
  "diambil",
  "batal",
]);

export const invoiceStatusSchema = z.enum([
  "draft",
  "terkirim",
  "lunas",
  "batal",
]);

export const paymentMethodSchema = z.enum([
  "tunai",
  "transfer",
  "qris",
  "kartu",
  "lainnya",
]);

export const stockMovementTypeSchema = z.enum([
  "masuk",
  "keluar",
  "penyesuaian",
]);

export const testimonialModerationSchema = z.enum(["disetujui", "ditolak"]);

const uuidSchema = z.uuid("ID tidak valid");
export const uuidParamSchema = uuidSchema;
const optionalTimestamp = z.iso.datetime({ offset: true }).nullish();

const paginationFields = {
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
};

export const paginationQuerySchema = z.strictObject({ ...paginationFields });

// ---------------------------------------------------------------------------
// Auth admin
// ---------------------------------------------------------------------------
export const loginSchema = z.strictObject({
  email: z.email("Email tidak valid").max(160),
  password: z.string().min(8, "Password minimal 8 karakter").max(200),
});

// ---------------------------------------------------------------------------
// Pelanggan & perangkat
// ---------------------------------------------------------------------------
export const customerCreateSchema = z.strictObject({
  full_name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: z.email("Email tidak valid").max(160).nullish(),
  address: z.string().trim().max(500).nullish(),
  notes: z.string().trim().max(1000).nullish(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customersQuerySchema = z.strictObject({
  search: z.string().trim().max(120).optional(),
  ...paginationFields,
});

export const deviceCreateSchema = z.strictObject({
  customer_id: uuidSchema,
  device_type: deviceTypeSchema,
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().max(120).optional(),
  serial_number: z.string().trim().max(120).nullish(),
  notes: z.string().trim().max(1000).nullish(),
});

export const deviceUpdateSchema = deviceCreateSchema
  .omit({ customer_id: true })
  .partial();

export const devicesQuerySchema = z.strictObject({
  customer_id: uuidSchema.optional(),
  ...paginationFields,
});

// ---------------------------------------------------------------------------
// Order servis
// ---------------------------------------------------------------------------
const equipmentItemSchema = z.strictObject({
  label: z.string().trim().min(1).max(40),
  returned: z.boolean().default(false),
});

/** Daftar bawaan pelanggan; normalisasi yang sama dipakai UI. */
export const equipmentSchema = z
  .array(equipmentItemSchema)
  .max(10)
  .transform(normalizeEquipment);

export const orderCreateSchema = z.strictObject({
  customer_id: uuidSchema,
  device_id: uuidSchema,
  complaint: z.string().trim().min(3).max(2000),
  diagnosis: z.string().trim().max(2000).nullish(),
  estimated_finish_at: optionalTimestamp,
  total_amount: z.number().int().min(0).max(1_000_000_000_000).optional(),
  equipment: equipmentSchema.optional(),
});

export const orderUpdateSchema = z.strictObject({
  complaint: z.string().trim().min(3).max(2000).optional(),
  diagnosis: z.string().trim().max(2000).nullish(),
  estimated_finish_at: optionalTimestamp,
  total_amount: z.number().int().min(0).max(1_000_000_000_000).optional(),
  assigned_technician_id: z.string().uuid().nullable().optional(),
  equipment: equipmentSchema.optional(),
});

export const orderStatusSchema = z.strictObject({
  status: serviceStatusSchema,
  note: z.string().trim().max(500).nullish(),
});

export const ordersQuerySchema = z.strictObject({
  status: serviceStatusSchema.optional(),
  customer_id: uuidSchema.optional(),
  ...paginationFields,
});

// ---------------------------------------------------------------------------
// Invoice, item, pembayaran
// ---------------------------------------------------------------------------
export const invoiceCreateSchema = z.strictObject({
  order_id: uuidSchema,
  discount_amount: z.number().int().min(0).max(1_000_000_000_000).optional(),
  due_at: optionalTimestamp,
  notes: z.string().trim().max(1000).nullish(),
});

export const invoiceUpdateSchema = z.strictObject({
  status: invoiceStatusSchema.optional(),
  discount_amount: z.number().int().min(0).max(1_000_000_000_000).optional(),
  due_at: optionalTimestamp,
  notes: z.string().trim().max(1000).nullish(),
});

export const invoicesQuerySchema = z.strictObject({
  status: invoiceStatusSchema.optional(),
  ...paginationFields,
});

export const invoiceItemCreateSchema = z.strictObject({
  sparepart_id: uuidSchema.nullish(),
  description: z.string().trim().min(1).max(300),
  quantity: z.number().int().min(1).max(100_000),
  unit_price: z.number().int().min(0).max(1_000_000_000_000),
});

export const invoiceItemUpdateSchema = invoiceItemCreateSchema.partial();

export const paymentCreateSchema = z.strictObject({
  amount: z.number().int().min(1).max(1_000_000_000_000),
  method: paymentMethodSchema.default("tunai"),
  reference: z.string().trim().max(120).nullish(),
  paid_at: optionalTimestamp,
});

export const paymentUpdateSchema = z.strictObject({
  amount: z.number().int().min(1).max(1_000_000_000_000).optional(),
  method: paymentMethodSchema.optional(),
  reference: z.string().trim().max(120).nullish(),
  paid_at: optionalTimestamp,
});

// ---------------------------------------------------------------------------
// Staf
// ---------------------------------------------------------------------------
export const permissionEntrySchema = z.strictObject({
  module: z.enum(MODULES),
  can_view: z.boolean(),
  can_manage: z.boolean(),
  can_delete: z.boolean(),
  can_view_cost: z.boolean().optional(),
});

const presetSchema = z.enum(["teknisi", "kasir", "operasional"]);

export const staffCreateSchema = z
  .strictObject({
    email: z.email("Email tidak valid").max(160),
    full_name: z.string().trim().min(2).max(120),
    mode: z.enum(["password", "invite"]).default("password"),
    password: z.string().min(8, "Password minimal 8 karakter").max(72).optional(),
    role: z.enum(["owner", "admin", "teknisi"]).default("admin"),
    preset: presetSchema.optional(),
    permissions: z.array(permissionEntrySchema).max(MODULES.length).optional(),
  })
  .refine((value) => value.mode !== "password" || Boolean(value.password), {
    message: "Password wajib diisi untuk mode password.",
    path: ["password"],
  });

export const staffUpdateSchema = z.strictObject({
  role: z.enum(["owner", "admin", "teknisi"]).optional(),
  is_active: z.boolean().optional(),
  preset: presetSchema.optional(),
  permissions: z.array(permissionEntrySchema).max(MODULES.length).optional(),
});

export const staffPasswordResetSchema = z
  .strictObject({
    mode: z.enum(["password", "email"]).default("password"),
    password: z.string().min(8, "Password minimal 8 karakter").max(72).optional(),
  })
  .refine((value) => value.mode !== "password" || Boolean(value.password), {
    message: "Password baru wajib diisi.",
    path: ["password"],
  });

// ---------------------------------------------------------------------------
// Sparepart & stok
// ---------------------------------------------------------------------------
export const sparepartCreateSchema = z.strictObject({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(80).nullish(),
  unit: z.string().trim().max(20).optional(),
  cost_price: z.number().int().min(0).max(1_000_000_000_000).optional(),
  sell_price: z.number().int().min(0).max(1_000_000_000_000).optional(),
  min_stock: z.number().int().min(0).max(1_000_000).optional(),
  is_active: z.boolean().optional(),
});

// stock_quantity sengaja tidak ada: stok hanya lewat stock_movements.
export const sparepartUpdateSchema = sparepartCreateSchema.partial();

export const sparepartsQuerySchema = z.strictObject({
  search: z.string().trim().max(120).optional(),
  is_active: z.enum(["true", "false"]).optional(),
  ...paginationFields,
});

export const stockMovementCreateSchema = z
  .strictObject({
    movement_type: stockMovementTypeSchema,
    quantity: z.number().int().min(-1_000_000).max(1_000_000),
    order_id: uuidSchema.nullish(),
    note: z.string().trim().max(500).nullish(),
  })
  .refine(
    (value) =>
      value.movement_type === "penyesuaian"
        ? value.quantity !== 0
        : value.quantity > 0,
    "Jumlah masuk/keluar harus > 0; penyesuaian tidak boleh 0",
  );

export const stockMovementsQuerySchema = z.strictObject({
  ...paginationFields,
});

// ---------------------------------------------------------------------------
// Garansi
// ---------------------------------------------------------------------------
export const warrantyCreateSchema = z.strictObject({
  order_id: uuidSchema,
  duration_days: z.number().int().min(1).max(3650),
  starts_at: optionalTimestamp,
  terms: z.string().trim().max(1000).nullish(),
});

export const warrantyUpdateSchema = z.strictObject({
  duration_days: z.number().int().min(1).max(3650).optional(),
  starts_at: optionalTimestamp,
  terms: z.string().trim().max(1000).nullish(),
});

export const warrantiesQuerySchema = z.strictObject({
  order_id: uuidSchema.optional(),
  ...paginationFields,
});

// ---------------------------------------------------------------------------
// Testimoni
// ---------------------------------------------------------------------------
export const testimonialsQuerySchema = z.strictObject({
  status: z.enum(["menunggu", "disetujui", "ditolak"]).optional(),
  ...paginationFields,
});

// ---------------------------------------------------------------------------
// Endpoint publik
// ---------------------------------------------------------------------------
const ticketNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine(isTicketNumber, "Format nomor tiket tidak valid");

export const publicServiceStatusSchema = z.strictObject({
  ticket_number: ticketNumberSchema,
  phone_last4: z
    .string()
    .trim()
    .regex(/^[0-9]{4}$/, "Isi 4 digit terakhir nomor HP"),
});

export const publicTestimonialSchema = z.strictObject({
  customer_name: z.string().trim().min(2).max(80),
  phone: phoneSchema.optional(),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(10).max(2000),
  ticket_number: ticketNumberSchema.nullish(),
});
