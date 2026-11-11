import { redirect } from "next/navigation";

import { AuthShell } from "@/components/admin/auth-shell";
import { SetPasswordForm } from "@/components/admin/set-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata = {
  title: "Atur Password",
  robots: { index: false, follow: false },
};

export default async function SetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <AuthShell
      eyebrow="Aktivasi akun"
      title="Buat password Anda"
      description={`Akun ${user.email} sudah aktif. Tentukan password untuk masuk ke dashboard.`}
    >
      <SetPasswordForm />
    </AuthShell>
  );
}
