import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { rateLimit } from "@/lib/supabase/rate-limit";
import { publicTestimonialSchema } from "@/lib/supabase/schemas";

type OrderRow = {
  id: string;
  customer_id: string;
};

export async function POST(request: Request) {
  const ipLimit = rateLimit(
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
