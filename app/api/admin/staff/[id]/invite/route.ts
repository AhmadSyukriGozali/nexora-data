import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { jsonError, jsonOk } from "@/lib/supabase/http";
import { uuidParamSchema } from "@/lib/supabase/schemas";

type Context = { params: Promise<{ id: string }> };

/** Kirim ulang undangan untuk staf yang belum membuat password. */
export async function POST(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const admin = createSupabaseAdminClient();
  const { data: target, error: targetError } =
    await admin.auth.admin.getUserById(parsedId.data);

  if (targetError || !target.user?.email) {
    return jsonError("Email staf tidak ditemukan.", 404);
  }

  const origin = new URL(request.url).origin;
  const { error } = await admin.auth.admin.inviteUserByEmail(
    target.user.email,
    {
      data: {
        full_name:
          (target.user.user_metadata?.full_name as string | undefined) ?? "",
      },
      redirectTo: `${origin}/auth/confirm?next=/admin/set-password`,
    },
  );

  if (error) {
    return jsonError(
      `Undangan gagal dikirim: ${error.message}. Periksa SMTP dan Site URL Supabase.`,
      400,
    );
  }

  return jsonOk({ sent: true });
}
