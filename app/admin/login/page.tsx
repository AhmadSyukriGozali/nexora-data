import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-navy px-4 py-10 text-chrome">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="font-display text-sm font-bold tracking-[0.2em] text-chrome">
              NEXORA DATA
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-dim">
              Panel Admin
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-chrome">
            Masuk ke dashboard
          </h1>
          <p className="mt-1 text-sm text-dim">
            Gunakan akun staf yang dibuat owner di menu Staf pada dashboard.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-dim">
          <Link href="/" className="underline-offset-4 hover:text-chrome hover:underline">
            Kembali ke situs
          </Link>
        </p>
      </div>
    </div>
  );
}
