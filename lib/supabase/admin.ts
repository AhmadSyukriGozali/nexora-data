import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

/**
 * Klien service role: MELEWATI RLS. Hanya untuk Route Handler publik
 * (cek status servis & kirim testimoni) dan tidak boleh dipakai di browser.
 * Field yang dikembalikan tetap dibatasi oleh route handler.
 */
export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
