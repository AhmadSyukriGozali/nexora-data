import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { staffPasswordResetSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

/** Owner mereset password staf: set langsung atau kirim email reset. */
export async function POST(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, staffPasswordResetSchema);
  if ("error" in body) return body.error;

  const targetId = parsedId.data;
  if (targetId === session.userId) {
    return jsonError("Gunakan alur login biasa untuk akun sendiri.", 400);
  }

  const admin = createSupabaseAdminClient();

  if (body.data.mode === "password") {
    const { error } = await admin.auth.admin.updateUserById(targetId, {
      password: body.data.password ?? "",
    });
    if (error) return jsonError(error.message || "Gagal mengganti password.", 400);
    return jsonOk({ updated: true, mode: "password" });
  }

  const { data: target, error: targetError } =
    await admin.auth.admin.getUserById(targetId);
  if (targetError || !target.user?.email) {
    return jsonError("Email staf tidak ditemukan.", 404);
  }

  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    target.user.email,
    { redirectTo: `${origin}/auth/confirm?next=/admin/set-password` },
  );

  if (error) {
    return jsonError(
      `Email reset gagal dikirim: ${error.message}. Periksa SMTP dan Site URL Supabase.`,
      400,
    );
  }

  return jsonOk({ updated: true, mode: "email" });
}
