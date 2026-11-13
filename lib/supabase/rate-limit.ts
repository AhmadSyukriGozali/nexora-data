import { createSupabaseServerClient } from "./server";

/**
 * Rate limit bersama lewat tabel `rate_limits` (migrasi 010). Gagal membaca
 * database dianggap ditolak supaya endpoint tidak terbuka tanpa batas.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; retryAfterSeconds: number }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    .single<{ allowed: boolean; retry_after_seconds: number }>();

  if (error || !data) {
    console.error("rate limit error:", error);
    return { ok: false, retryAfterSeconds: 30 };
  }

  return { ok: data.allowed, retryAfterSeconds: data.retry_after_seconds };
}
