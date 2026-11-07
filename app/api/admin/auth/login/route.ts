import { dbErrorResponse, getClientIp, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { rateLimit } from "@/lib/supabase/rate-limit";
import { loginSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limit = rateLimit(`admin-login:${getClientIp(request)}`, 10, 5 * 60_000);
  if (!limit.ok) {
    return jsonError("Terlalu banyak percobaan login. Coba lagi nanti.", 429);
  }

  const body = await parseBody(request, loginSchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });

  if (error || !data.user) {
    return jsonError("Email atau password salah", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, is_active")
    .eq("id", data.user.id)
    .maybeSingle<{ role: string; full_name: string | null; is_active: boolean }>();

  if (profileError) {
    return dbErrorResponse(profileError) ?? jsonError("Gagal membaca profil", 500);
  }

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return jsonError("Akun tidak aktif atau bukan staf", 403);
  }

  if (profile.role !== "owner" && profile.role !== "teknisi") {
    await supabase.auth.signOut();
    return jsonError("Akun tidak memiliki akses admin", 403);
  }

  return jsonOk({
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      role: profile.role,
      full_name: profile.full_name ?? "",
    },
  });
}
