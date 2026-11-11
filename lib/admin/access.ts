/**
 * Izin staf per modul. Owner selalu penuh dan tidak memakai baris izin.
 * Modul "staf" sengaja tidak ada di daftar: hanya owner yang boleh membukanya.
 */
export const MODULES = [
  "dashboard",
  "orders",
  "customers",
  "devices",
  "invoices",
  "spareparts",
  "warranties",
  "testimonials",
] as const;

export type Module = (typeof MODULES)[number];

export const MODULE_LABELS: Record<Module, string> = {
  dashboard: "Ringkasan",
  orders: "Order Servis",
  customers: "Pelanggan",
  devices: "Perangkat",
  invoices: "Invoice",
  spareparts: "Sparepart",
  warranties: "Garansi",
  testimonials: "Testimoni",
};

export const MODULE_PATHS: Record<Module, string> = {
  dashboard: "/admin",
  orders: "/admin/order",
  customers: "/admin/pelanggan",
  devices: "/admin/perangkat",
  invoices: "/admin/invoice",
  spareparts: "/admin/sparepart",
  warranties: "/admin/garansi",
  testimonials: "/admin/testimoni",
};

export type PermissionAction = "view" | "manage" | "delete";

export type ModulePermission = {
  view: boolean;
  manage: boolean;
  delete: boolean;
  viewCost: boolean;
};

export type Permissions = Record<Module, ModulePermission>;

export type PermissionRow = {
  module: Module;
  can_view: boolean;
  can_manage: boolean;
  can_delete: boolean;
  can_view_cost: boolean;
};

const NONE: ModulePermission = {
  view: false,
  manage: false,
  delete: false,
  viewCost: false,
};

function fullPermission(): ModulePermission {
  return { view: true, manage: true, delete: true, viewCost: true };
}

export const FULL_PERMISSIONS: Permissions = Object.fromEntries(
  MODULES.map((module) => [module, fullPermission()]),
) as Permissions;

export const EMPTY_PERMISSIONS: Permissions = Object.fromEntries(
  MODULES.map((module) => [module, { ...NONE }]),
) as Permissions;

function build(granted: Partial<Record<Module, Partial<ModulePermission>>>) {
  const result = { ...EMPTY_PERMISSIONS } as Permissions;
  for (const moduleKey of MODULES) {
    if (granted[moduleKey]) {
      result[moduleKey] = { ...NONE, view: true, ...granted[moduleKey] };
    }
  }
  return result;
}

export type PresetKey = "teknisi" | "kasir" | "operasional";

export const PRESETS: Record<
  PresetKey,
  { label: string; description: string; permissions: Permissions }
> = {
  teknisi: {
    label: "Teknisi",
    description: "Kerjakan order, pelanggan, perangkat, dan garansi.",
    permissions: build({
      dashboard: {},
      orders: { manage: true },
      customers: { manage: true },
      devices: { manage: true },
      warranties: { manage: true },
      spareparts: {},
      testimonials: {},
    }),
  },
  kasir: {
    label: "Kasir",
    description: "Fokus tagihan, pembayaran, dan data pelanggan.",
    permissions: build({
      dashboard: {},
      orders: {},
      customers: { manage: true },
      devices: {},
      invoices: { manage: true },
      spareparts: {},
      warranties: {},
    }),
  },
  operasional: {
    label: "Admin operasional",
    description: "Hampir semua modul, tanpa hapus dan tanpa staf.",
    permissions: build({
      dashboard: {},
      orders: { manage: true },
      customers: { manage: true },
      devices: { manage: true },
      invoices: { manage: true },
      spareparts: { manage: true },
      warranties: { manage: true },
      testimonials: { manage: true },
    }),
  },
};

export function rowsToPermissions(rows: PermissionRow[]): Permissions {
  const result = { ...EMPTY_PERMISSIONS } as Permissions;
  for (const row of rows) {
    if (!MODULES.includes(row.module)) continue;
    result[row.module] = {
      view: row.can_view,
      manage: row.can_manage,
      delete: row.can_delete,
      viewCost: row.can_view_cost,
    };
  }
  return result;
}

export function permissionsToRows(permissions: Permissions): PermissionRow[] {
  return MODULES.map((module) => ({
    module,
    can_view: permissions[module].view,
    can_manage: permissions[module].manage,
    can_delete: permissions[module].delete,
    can_view_cost: permissions[module].viewCost,
  }));
}

export function can(
  permissions: Permissions,
  module: Module,
  action: PermissionAction,
): boolean {
  const entry = permissions[module];
  if (!entry.view) return false;
  if (action === "view") return true;
  if (action === "manage") return entry.manage;
  return entry.delete;
}

export function firstAllowedModule(permissions: Permissions): Module | null {
  return MODULES.find((module) => permissions[module].view) ?? null;
}

/** Modul yang memiliki halaman di sidebar, berurutan. */
export function visibleModules(permissions: Permissions): Module[] {
  return MODULES.filter((module) => permissions[module].view);
}
