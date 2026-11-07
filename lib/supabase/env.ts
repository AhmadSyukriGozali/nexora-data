/**
 * Hanya nama variabel yang perlu diisi di `.env.local` / Vercel.
 * Tidak ada nilai rahasia di file ini.
 *
 * - NEXT_PUBLIC_SUPABASE_URL      : aman di browser
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY : aman di browser (dibatasi RLS)
 * - SUPABASE_SERVICE_ROLE_KEY     : HANYA server; jangan pernah beri prefix NEXT_PUBLIC_
 */
export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diisi.");
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi.");
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY hanya boleh dipakai di server.");
  }

  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi.");
  }
  return value;
}
