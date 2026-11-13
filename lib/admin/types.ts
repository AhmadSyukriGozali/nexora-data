import type { EquipmentItem } from "./equipment";

export type StaffRole = "owner" | "admin" | "teknisi";

export type DeviceType = "hp" | "laptop" | "pc" | "printer";

export type ServiceStatus =
  | "masuk"
  | "diagnosa"
  | "menunggu_persetujuan"
  | "dikerjakan"
  | "menunggu_sparepart"
  | "selesai"
  | "diambil"
  | "batal";

export type InvoiceStatus = "draft" | "terkirim" | "lunas" | "batal";

export type PaymentMethod = "tunai" | "transfer" | "qris" | "kartu" | "lainnya";

export type StockMovementType = "masuk" | "keluar" | "penyesuaian";

export type TestimonialStatus = "menunggu" | "disetujui" | "ditolak";

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type CustomerOption = {
  id: string;
  full_name: string;
  phone: string;
};

export type Device = {
  id: string;
  customer_id: string;
  device_type: DeviceType;
  brand: string;
  model: string;
  serial_number: string | null;
  notes: string | null;
  created_at: string;
  customer?: { full_name: string; phone: string } | null;
};

export type Order = {
  id: string;
  ticket_number: string;
  customer_id: string;
  device_id: string;
  complaint: string;
  diagnosis: string | null;
  status: ServiceStatus;
  estimated_finish_at: string | null;
  total_amount: number;
  assigned_technician_id: string | null;
  equipment: EquipmentItem[];
  created_at: string;
  customer?: {
    full_name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  } | null;
  device?: {
    device_type: DeviceType;
    brand: string;
    model: string;
    serial_number?: string | null;
    notes?: string | null;
  } | null;
  technician?: { full_name: string } | null;
};

export type OrderHistory = {
  id: number;
  from_status: ServiceStatus | null;
  to_status: ServiceStatus;
  note: string | null;
  created_at: string;
  staff?: { full_name: string } | null;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  order_id: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  issued_at: string;
  due_at: string | null;
  notes: string | null;
  order?: {
    ticket_number: string;
    customer?: { full_name: string } | null;
  } | null;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  sparepart_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
};

export type InvoiceDetail = Invoice & {
  invoice_items: InvoiceItem[];
  payments: Payment[];
};

export type Sparepart = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  unit: string;
  /** Hanya diisi bila sesi adalah owner; admin tidak menerima nilainya. */
  cost_price?: number;
  sell_price: number;
  stock_quantity: number;
  min_stock: number;
  is_active: boolean;
};

export type StaffMember = {
  id: string;
  email: string | null;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  email_confirmed_at?: string | null;
  invited_at?: string | null;
  last_sign_in_at?: string | null;
  permissions?: import("./access").PermissionRow[];
};

export type StockMovement = {
  id: number;
  sparepart_id: string;
  movement_type: StockMovementType;
  quantity: number;
  note: string | null;
  order_id: string | null;
  created_at: string;
  staff?: { full_name: string } | null;
  sparepart?: { name: string; sku: string } | null;
  order?: { ticket_number: string } | null;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  phone: string | null;
  rating: number;
  message: string;
  status: TestimonialStatus;
  created_at: string;
  moderated_at: string | null;
  order?: { ticket_number: string } | null;
};

export type Warranty = {
  id: string;
  order_id: string;
  duration_days: number;
  starts_at: string;
  expires_at: string;
  terms: string | null;
  created_at: string;
  order?: {
    ticket_number: string;
    customer?: { full_name: string } | null;
  } | null;
};

export type OrderOption = {
  id: string;
  ticket_number: string;
  customer?: { full_name: string } | null;
};
