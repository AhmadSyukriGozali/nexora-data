import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export type ApiErrorBody = {
  error: {
    message: string;
    details?: unknown;
  };
};

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  const body: ApiErrorBody = {
    error: details === undefined ? { message } : { message, details },
  };
  return NextResponse.json(body, { status });
}

function validationDetails(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return { error: jsonError("Body harus JSON yang valid", 400) };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: jsonError("Validasi gagal", 422, validationDetails(parsed.error)),
    };
  }

  return { data: parsed.data };
}

export function parseQuery<T>(
  request: Request,
  schema: ZodType<T>,
): { data: T } | { error: NextResponse } {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: jsonError("Query tidak valid", 422, validationDetails(parsed.error)),
    };
  }

  return { data: parsed.data };
}

/**
 * Menerjemahkan error PostgREST/Supabase menjadi respons HTTP yang konsisten.
 * Hanya dipakai endpoint admin (pesan DB boleh terlihat oleh staf).
 */
export function dbErrorResponse(
  error: { message: string; code?: string | null } | null,
): NextResponse | null {
  if (!error) return null;

  const known: Record<string, { status: number; message: string }> = {
    "23505": { status: 409, message: "Data sudah ada (duplikat)." },
    "23503": { status: 409, message: "Data masih dipakai oleh data lain." },
    "23514": { status: 422, message: "Data melanggar aturan validasi." },
    "42501": { status: 403, message: "Akses ditolak." },
    P0002: { status: 404, message: "Data tidak ditemukan." },
    PGRST116: { status: 404, message: "Data tidak ditemukan." },
    "22023": { status: 422, message: "Perubahan tidak valid." },
  };

  const mapped = error.code ? known[error.code] : undefined;
  if (mapped) {
    return jsonError(mapped.message, mapped.status);
  }

  return jsonError(error.message || "Gagal memproses data", 400);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
