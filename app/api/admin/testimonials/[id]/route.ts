import { getStaffSession, ownerOnly } from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { testimonialModerationSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };

const moderationBodySchema = z.strictObject({
  status: testimonialModerationSchema,
});

export async function PATCH(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, moderationBodySchema);
  if ("error" in body) return body.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({
      status: body.data.status,
      moderated_by: session.userId,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data)
    .select("*")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Testimoni tidak ditemukan", 404);

  return jsonOk(data);
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = ownerOnly(session);
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Testimoni tidak ditemukan", 404);

  return jsonOk({ deleted: true, id: data.id });
}
