import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/ui";
import { getStaffSession } from "@/lib/supabase/auth";
import { listStaffMembers } from "@/lib/supabase/staff";

import { StaffManager } from "./staff-manager";

export const instant = false;

export const metadata = { title: "Staf" };

export default async function StaffPage() {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "owner") redirect("/admin");

  const { members, error } = await listStaffMembers();

  return (
    <>
      <PageHeader
        title="Staf"
        description="Kelola akun owner dan admin. Hanya owner yang dapat membuka halaman ini."
      />
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200"
        >
          Gagal memuat daftar staf: {error}
        </p>
      ) : (
        <StaffManager members={members} currentUserId={session.userId} />
      )}
    </>
  );
}
