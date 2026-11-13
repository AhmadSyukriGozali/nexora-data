import { logAudit } from "@/lib/admin/audit";
import { canManualInvoiceTransition } from "@/lib/admin/status-flow";
import type { InvoiceStatus } from "@/lib/admin/types";
import {
  getStaffSession,
  isOwner,
  ownerOnly,
  requirePermission,
} from "@/lib/supabase/auth";
import { dbErrorResponse, jsonError, jsonOk, parseBody } from "@/lib/supabase/http";
import { invoiceUpdateSchema, uuidParamSchema } from "@/lib/supabase/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const INVOICE_SELECT = "*, invoice_items(*), payments(*)";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .eq("id", parsedId.data)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Invoice tidak ditemukan", 404);

  return jsonOk(data);
}

export async function PATCH(request: Request, context: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  const forbidden = requirePermission(session, "invoices", "manage");
  if (forbidden) return forbidden;

  const rawId = await context.params;
  const parsedId = uuidParamSchema.safeParse(rawId.id);
  if (!parsedId.success) return jsonError("ID tidak valid", 422);

  const body = await parseBody(request, invoiceUpdateSchema);
  if ("error" in body) return body.error;
  if (Object.keys(body.data).length === 0) {
    return jsonError("Tidak ada field untuk diubah", 422);
  }

  const supabase = await createSupabaseServerClient();

  if (body.data.status !== undefined) {
    const { data: current, error: currentError } = await supabase
      .from("invoices")
      .select("status")
      .eq("id", parsedId.data)
      .maybeSingle<{ status: InvoiceStatus }>();

    const currentMapped = dbErrorResponse(currentError);
    if (currentMapped) return currentMapped;
    if (!current) return jsonError("Invoice tidak ditemukan", 404);

    if (body.data.status === "batal" && !isOwner(session)) {
      return jsonError("Hanya owner yang boleh membatalkan invoice.", 403);
    }

    if (
      body.data.status !== current.status &&
      !canManualInvoiceTransition(current.status, body.data.status)
    ) {
      return jsonError(
        `Status invoice tidak bisa berpindah dari ${current.status} ke ${body.data.status}. Status lunas hanya otomatis dari pembayaran penuh.`,
        422,
      );
    }
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(body.data)
    .eq("id", parsedId.data)
    .select(INVOICE_SELECT)
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Invoice tidak ditemukan", 404);

  if (body.data.status === "batal") {
    await logAudit({
      action: "invoice.cancel",
      entity: "invoices",
      entityId: data.id,
      metadata: { invoice_number: data.invoice_number },
    });
  }

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
    .from("invoices")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  const mapped = dbErrorResponse(error);
  if (mapped) return mapped;
  if (!data) return jsonError("Invoice tidak ditemukan", 404);

  return jsonOk({ deleted: true, id: data.id });
}
