import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { getStaffSession } from "@/lib/supabase/auth";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        fullName: session.fullName,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
