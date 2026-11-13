import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { rateLimit } from "@/lib/supabase/rate-limit";
import { publicTestimonialSchema } from "@/lib/supabase/schemas";

type OrderRow = {
  id: string;
  customer_id: string;
};

type ApprovedRow = {
  customer_name: string;
  rating: number;
  message: string;
  created_at: string;
};

const LIST_LIMIT = 12;

/** Nama publik dipotong jadi "Budi S." supaya nama lengkap tidak tersebar. */
function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]} ${parts
    .slice(1)
    .map((part) => `${part[0]}.`)
    .join(" ")}`;
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("customer_name, rating, message, created_at")
    .eq("status", "disetujui")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);

  if (error) {
    console.error("public testimonial list:", error);
    return jsonError("Gagal memuat testimoni", 500);
  }

  // Hanya nama tersamar, rating, isi, dan tanggal. Nomor HP tidak pernah keluar.
  const items = ((data ?? []) as ApprovedRow[]).map((row) => ({
    name: maskName(row.customer_name),
    rating: row.rating,
    message: row.message,
    created_at: row.created_at,
  }));

  const response = jsonOk(items);
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600",
  );
  return response;
}

export async function POST(request: Request) {
  const ipLimit = await rateLimit(
    `testimonial:ip:${getClientIp(request)}`,
    5,
    60 * 60_000,
  );

  if (!ipLimit.ok) {
    const response = jsonError(
      "Terlalu banyak pengiriman testimoni. Coba lagi nanti.",
      429,
    );
    response.headers.set("Retry-After", String(ipLimit.retryAfterSeconds));
    return response;
  }

  const body = await parseBody(request, publicTestimonialSchema);
  if ("error" in body) return body.error;

  const { customer_name, phone, rating, message, ticket_number } = body.data;
  const supabase = createSupabaseAdminClient();

  let orderId: string | null = null;

  // Tiket opsional: dipakai hanya untuk menautkan testimoni ke order.
  // Tidak ada data pelanggan yang dikembalikan ke pemanggil.
  if (ticket_number) {
    const { data: order } = await supabase
      .from("service_orders")
      .select("id, customer_id")
      .eq("ticket_number", ticket_number)
      .maybeSingle<OrderRow>();

    if (order) {
      if (!phone) {
        orderId = order.id;
      } else {
        const { data: customer } = await supabase
          .from("customers")
          .select("phone")
          .eq("id", order.customer_id)
          .maybeSingle<{ phone: string }>();

        if (customer?.phone && customer.phone.slice(-4) === phone.slice(-4)) {
          orderId = order.id;
        }
      }
    }
  }

  const { error } = await supabase.from("testimonials").insert({
    order_id: orderId,
    customer_name,
    phone: phone ?? null,
    rating,
    message,
    status: "menunggu",
  });

  if (error) {
    console.error("public testimonial insert:", error);
    return jsonError("Gagal mengirim testimoni", 500);
  }

  // Tidak mengembalikan isi testimoni maupun data pelanggan.
  return jsonOk({ received: true }, 201);
}
