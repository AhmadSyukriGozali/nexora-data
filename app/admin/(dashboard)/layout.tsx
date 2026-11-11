import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

const ACTIVE_STATUSES = [
  "masuk",
  "diagnosa",
  "menunggu_persetujuan",
  "dikerjakan",
  "menunggu_sparepart",
];

function todayLabel(): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");

  const supabase = await createSupabaseServerClient();
  const wantsOrders = session.permissions.orders.view;
  const wantsTestimonials = session.permissions.testimonials.view;

  const [orders, testimonials] = await Promise.all([
    wantsOrders
      ? supabase
          .from("service_orders")
          .select("id", { count: "exact", head: true })
          .in("status", ACTIVE_STATUSES)
      : Promise.resolve({ count: 0 }),
    wantsTestimonials
      ? supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .eq("status", "menunggu")
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <AdminShell
      user={{
        fullName: session.fullName,
        email: session.email,
        role: session.role,
      }}
      permissions={session.permissions}
      today={todayLabel()}
      badges={{
        orders: orders.count ?? 0,
        testimonials: testimonials.count ?? 0,
      }}
    >
      {children}
    </AdminShell>
  );
}
