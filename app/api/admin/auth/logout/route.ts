import { jsonError, jsonOk } from "@/lib/supabase/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return jsonError(error.message, 400);
  }

  return jsonOk({ signedOut: true });
}
