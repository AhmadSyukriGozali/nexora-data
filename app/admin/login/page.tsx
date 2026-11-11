import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";
import { getStaffSession } from "@/lib/supabase/auth";

export const instant = false;

export const metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getStaffSession();
  if (session) redirect("/admin");

  return (
    <AuthShell
      eyebrow="Panel Admin"
      title="Masuk ke dashboard"
      description="Gunakan akun staf yang dibuat owner di menu Staf pada dashboard."
      footer={
        <Link
          href="/"
          className="underline-offset-4 hover:text-[color:var(--bjork-text)] hover:underline"
        >
          Kembali ke situs
        </Link>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
