import { getStaffSession } from "@/lib/supabase/auth";
import { jsonError, jsonOk } from "@/lib/supabase/http";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return jsonError("Tidak terautentikasi", 401);

  return jsonOk({
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
      full_name: session.fullName,
    },
  });
}
