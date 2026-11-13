import { toPublicStatus } from "@/lib/public/tracking";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { rateLimit } from "@/lib/supabase/rate-limit";
import { publicServiceStatusSchema } from "@/lib/supabase/schemas";

type OrderRow = {
  id: string;
  ticket_number: string;
  status: string;
  estimated_finish_at: string | null;
  device_id: string;
  customer_id: string;
};

function tooManyRequests(retryAfterSeconds: number) {
  const response = jsonError(
    "Terlalu banyak permintaan. Coba lagi beberapa saat lagi.",
    429,
  );
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = await rateLimit(`status:ip:${ip}`, 20, 10 * 60_000);
  if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfterSeconds);

  const body = await parseBody(request, publicServiceStatusSchema);
  if ("error" in body) return body.error;

  const { ticket_number, phone_last4 } = body.data;

  // Batasi juga per tiket agar satu tiket tidak bisa ditebak berkali-kali.
  const ticketLimit = await rateLimit(
    `status:ticket:${ticket_number}`,
    10,
    10 * 60_000,
  );
  if (!ticketLimit.ok) return tooManyRequests(ticketLimit.retryAfterSeconds);

  const supabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .select(
      "id, ticket_number, status, estimated_finish_at, device_id, customer_id",
    )
    .eq("ticket_number", ticket_number)
    .maybeSingle<OrderRow>();

  if (orderError) {
    console.error("public service-status order query:", orderError);
    return jsonError("Terjadi kesalahan pada server", 500);
  }

  if (!order) {
    return jsonError(
      "Data servis tidak ditemukan. Periksa nomor tiket dan 4 digit terakhir nomor HP.",
      404,
    );
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("phone")
    .eq("id", order.customer_id)
    .maybeSingle<{ phone: string }>();

  if (customerError) {
    console.error("public service-status customer query:", customerError);
    return jsonError("Terjadi kesalahan pada server", 500);
  }

  const phoneMatches =
    !!customer?.phone && customer.phone.slice(-4) === phone_last4;

  if (!phoneMatches) {
    // Pesan sama dengan "tiket tidak ada" agar tidak bisa dipakai menebak.
    return jsonError(
      "Data servis tidak ditemukan. Periksa nomor tiket dan 4 digit terakhir nomor HP.",
      404,
    );
  }

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("device_type")
    .eq("id", order.device_id)
    .maybeSingle<{ device_type: string }>();

  if (deviceError) {
    console.error("public service-status device query:", deviceError);
    return jsonError("Terjadi kesalahan pada server", 500);
  }

  // Hanya field aman: tiket, jenis perangkat, status, estimasi selesai.
  return jsonOk(
    toPublicStatus({
      ticket_number: order.ticket_number,
      device_type: device?.device_type ?? null,
      status: order.status,
      estimated_finish_at: order.estimated_finish_at,
    }),
  );
}
