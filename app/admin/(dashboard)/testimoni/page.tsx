import { PageHeader } from "@/components/admin/ui";
import type { Testimonial } from "@/lib/admin/types";
import { getStaffSession } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { TestimonialManager } from "./testimonial-manager";

export const instant = false;

export const metadata = { title: "Testimoni" };

export default async function TestimonialsPage() {
  const session = await getStaffSession();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("testimonials")
    .select("*, order:service_orders(ticket_number)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <PageHeader
        title="Testimoni"
        description="Moderasi testimoni yang dikirim pelanggan. Hanya testimoni berstatus disetujui yang tampil di situs publik."
      />
      <TestimonialManager
        testimonials={(data ?? []) as Testimonial[]}
        canDelete={session?.role === "owner"}
      />
    </>
  );
}
