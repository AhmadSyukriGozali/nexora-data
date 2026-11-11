import {
  PRESETS,
  permissionsToRows,
  type PermissionRow,
  type PresetKey,
} from "@/lib/admin/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { staffCreateSchema } from "@/lib/supabase/schemas";
import {
  listStaffMembers,
  replaceStaffPermissions,
} from "@/lib/supabase/staff";

function resolveRows(input: {
  preset?: PresetKey;
  permissions?: { module: PermissionRow["module"]; can_view: boolean; can_manage: boolean; can_delete: boolean; can_view_cost?: boolean }[];
}): PermissionRow[] {
  if (input.permissions && input.permissions.length > 0) {
    return input.permissions.map((row) => ({
      module: row.module,
      can_view: row.can_view,
      can_manage: row.can_manage,
      can_delete: row.can_delete,
      can_view_cost: row.can_view_cost ?? false,
    }));
  }
  return permissionsToRows(PRESETS[input.preset ?? "teknisi"].permissions);
}

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
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/auth/confirm?next=/admin/set-password`;

  const invite = body.data.mode === "invite";
  const created = invite
    ? await admin.auth.admin.inviteUserByEmail(body.data.email, {
        data: { full_name: body.data.full_name },
        redirectTo,
      })
    : await admin.auth.admin.createUser({
        email: body.data.email,
        password: body.data.password ?? "",
        email_confirm: true,
        user_metadata: { full_name: body.data.full_name },
      });

  const createdUser = "data" in created ? created.data.user : null;

  if (created.error || !createdUser) {
    const message = created.error?.message ?? "";
    if (/already|registered|exists/i.test(message)) {
      return jsonError("Email sudah terdaftar.", 409);
    }
    if (invite) {
      return jsonError(
        `Undangan gagal dikirim: ${message || "periksa SMTP dan Site URL Supabase"}. Gunakan mode password manual bila email belum dikonfigurasi.`,
        400,
      );
    }
    return jsonError(message || "Gagal membuat akun staf.", 400);
  }

  const userId = createdUser.id;

  // Trigger handle_new_user membuat profil dengan role default "admin".
  if (body.data.role !== "admin") {
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: body.data.role })
      .eq("id", userId);

    if (roleError) {
      await admin.auth.admin.deleteUser(userId);
      return (
        dbErrorResponse(roleError) ??
        jsonError("Gagal menetapkan role akun.", 500)
      );
    }
  }

  if (body.data.role === "admin") {
    const rows = resolveRows(body.data);
    const { error: permissionError } = await replaceStaffPermissions(
      admin,
      userId,
      rows,
      session.userId,
    );

    if (permissionError) {
      await admin.auth.admin.deleteUser(userId);
      return (
        dbErrorResponse(permissionError) ??
        jsonError("Gagal menyimpan izin staf.", 500)
      );
    }
  }

  return jsonOk(
    {
      id: userId,
      email: createdUser.email ?? null,
      role: body.data.role,
      mode: body.data.mode,
    },
    201,
  );
}
