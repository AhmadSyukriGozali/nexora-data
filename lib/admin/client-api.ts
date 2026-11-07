export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

/** Pemanggil endpoint admin dari komponen client. */
export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string } }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      message: payload?.error?.message ?? "Gagal memproses permintaan.",
    };
  }

  return { ok: true, data: payload?.data as T };
}
