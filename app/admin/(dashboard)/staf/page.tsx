import { PageHeader } from "@/components/admin/ui";
import { requireOwnerPage } from "@/lib/admin/guard";
import { listStaffMembers } from "@/lib/supabase/staff";

import { StaffManager } from "./staff-manager";

export const instant = false;

export const metadata = { title: "Staf" };

export default async function StaffPage() {
  const session = await requireOwnerPage();

  const { members, error } = await listStaffMembers();

  return (
    <>
      <PageHeader
        eyebrow="Khusus owner"
        title="Staf"
        description="Kelola akun owner dan admin, atur izin per modul, reset password, dan kirim ulang undangan."
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
