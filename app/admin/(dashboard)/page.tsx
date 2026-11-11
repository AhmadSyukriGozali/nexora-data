import { OverviewView } from "@/components/admin/overview-view";
import type { Point } from "@/components/admin/charts";
import { can } from "@/lib/admin/access";
import {
  serviceStatusLabels,
} from "@/lib/admin/format";
import { requireStaffPage } from "@/lib/admin/guard";
import type { Invoice, Order, ServiceStatus, Sparepart } from "@/lib/admin/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

const ACTIVE_STATUSES = [
  "masuk",
  "diagnosa",
  "menunggu_persetujuan",
  "dikerjakan",
  "menunggu_sparepart",
] as const;

const STATUS_COLORS: Record<string, string> = {
  masuk: "var(--color-dim)",
  diagnosa: "var(--color-electric)",
  menunggu_persetujuan: "var(--blk-warning)",
  dikerjakan: "var(--color-electric-soft)",
  menunggu_sparepart: "var(--blk-error)",
};

const DAY_MS = 86_400_000;
const DAYS = 14;

function jakartaKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function pct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export default async function AdminDashboardPage() {
  const session = await requireStaffPage("dashboard");
  if (!can(session.permissions, "dashboard", "view")) return null;
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const keys: string[] = [];
  for (let index = DAYS - 1; index >= 0; index -= 1) {
    keys.push(jakartaKey(new Date(now.getTime() - index * DAY_MS)));
  }
  const startKey = keys[0];
  const startIso = new Date(
    Date.parse(`${startKey}T00:00:00+07:00`),
  ).toISOString();
  const labels = keys.map(dayLabel);

  const [
    activeCount,
    waitingApproval,
    inProgress,
    unpaidInvoices,
    pendingTestimonials,
    ordersResult,
    paymentsResult,
    sparepartsResult,
    recentOrdersResult,
    recentInvoicesResult,
  ] = await Promise.all([
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .in("status", ACTIVE_STATUSES),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu_persetujuan"),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "dikerjakan"),
    supabase
      .from("invoices")
      .select("id, total_amount, paid_amount", { count: "exact" })
      .in("status", ["draft", "terkirim"]),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu"),
    supabase
      .from("service_orders")
      .select("status, created_at")
      .gte("created_at", startIso),
    supabase
      .from("payments")
      .select("amount, paid_at")
      .gte("paid_at", startIso),
    supabase
      .from("spareparts")
      .select("id, sku, name, stock_quantity, min_stock, is_active")
      .eq("is_active", true),
    supabase
      .from("service_orders")
      .select(
        "id, ticket_number, status, estimated_finish_at, customer:customers(full_name), device:devices(device_type, brand, model)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, status, total_amount, paid_amount, issued_at, order:service_orders(ticket_number)",
      )
      .order("issued_at", { ascending: false })
      .limit(5),
  ]);

  const orders = (ordersResult.data ?? []) as Array<{
    status: string;
    created_at: string;
  }>;
  const payments = (paymentsResult.data ?? []) as Array<{
    amount: number;
    paid_at: string;
  }>;

  const orderCounts = new Map<string, number>();
  for (const order of orders) {
    const key = jakartaKey(new Date(order.created_at));
    orderCounts.set(key, (orderCounts.get(key) ?? 0) + 1);
  }

  const revenueCounts = new Map<string, number>();
  for (const payment of payments) {
    const key = jakartaKey(new Date(payment.paid_at));
    revenueCounts.set(key, (revenueCounts.get(key) ?? 0) + Number(payment.amount));
  }

  const ordersTrend: Point[] = keys.map((key, index) => ({
    label: labels[index],
    value: orderCounts.get(key) ?? 0,
  }));
  const revenueTrend: Point[] = keys.map((key, index) => ({
    label: labels[index],
    value: revenueCounts.get(key) ?? 0,
  }));

  const lastWeek = keys.slice(-7);
  const prevWeek = keys.slice(0, 7);
  const sum = (list: string[], map: Map<string, number>) =>
    list.reduce((total, key) => total + (map.get(key) ?? 0), 0);

  const orderDelta = pct(sum(lastWeek, orderCounts), sum(prevWeek, orderCounts));
  const paidDelta = pct(sum(lastWeek, revenueCounts), sum(prevWeek, revenueCounts));

  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    if (!ACTIVE_STATUSES.includes(order.status as (typeof ACTIVE_STATUSES)[number])) {
      continue;
    }
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }
  const statusBreakdown = ACTIVE_STATUSES.filter((status) =>
    statusCounts.has(status),
  ).map((status) => ({
    label: serviceStatusLabels[status as ServiceStatus],
    value: statusCounts.get(status) ?? 0,
    color: STATUS_COLORS[status],
  }));

  const invoices = (unpaidInvoices.data ?? []) as Array<{
    total_amount: number;
    paid_amount: number;
  }>;
  const paidTotal = payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
  const unpaidTotal = invoices.reduce(
    (total, invoice) =>
      total + Math.max(0, Number(invoice.total_amount) - Number(invoice.paid_amount)),
    0,
  );

  const lowStock = ((sparepartsResult.data ?? []) as Sparepart[])
    .filter((item) => item.stock_quantity <= item.min_stock)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(now);

  return (
    <OverviewView
      data={{
        name: session.fullName.split(" ")[0] ?? "",
        today,
        activeOrders: activeCount.count ?? 0,
        waitingApproval: waitingApproval.count ?? 0,
        inProgress: inProgress.count ?? 0,
        unpaidCount: unpaidInvoices.count ?? 0,
        unpaidTotal,
        paidTotal,
        paidDelta,
        orderDelta,
        pendingTestimonials: pendingTestimonials.count ?? 0,
        ordersTrend,
        revenueTrend,
        statusBreakdown,
        lowStock,
        recentOrders: (recentOrdersResult.data ?? []) as unknown as Order[],
        recentInvoices: (recentInvoicesResult.data ??
          []) as unknown as Invoice[],
      }}
    />
  );
}
