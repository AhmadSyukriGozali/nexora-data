import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { staffCreateSchema } from "@/lib/supabase/schemas";
import { listStaffMembers } from "@/lib/supabase/staff";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const { members, error } = await listStaffMembers();
  if (error) return jsonError(error, 500);

  return jsonOk({ items: members });
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const body = await parseBody(request, staffCreateSchema);
  if ("error" in body) return body.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: body.data.email,
    password: body.data.password,
    email_confirm: true,
    user_metadata: { full_name: body.data.full_name },
  });

  if (error || !data.user) {
    const message = error?.message ?? "";
    if (/already|registered|exists/i.test(message)) {
      return jsonError("Email sudah terdaftar.", 409);
    }
    return jsonError(message || "Gagal membuat akun staf.", 400);
  }

  // Trigger handle_new_user membuat profil dengan role default "admin".
  if (body.data.role !== "admin") {
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: body.data.role })
      .eq("id", data.user.id);

    if (roleError) {
      // Batalkan pembuatan akun agar tidak tersisa user tanpa role yang benar.
      await admin.auth.admin.deleteUser(data.user.id);
      return (
        dbErrorResponse(roleError) ??
        jsonError("Gagal menetapkan role akun.", 500)
      );
    }
  }

  return jsonOk(
    {
      id: data.user.id,
      email: data.user.email ?? null,
      role: body.data.role,
    },
    201,
  );
}
