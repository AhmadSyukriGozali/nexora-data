import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { WELCOME_COOKIE, WELCOME_MAX_AGE } from "@/lib/welcome";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Crawler dan pratinjau tautan (WhatsApp, Facebook, dsb.) tidak boleh
 * dialihkan: beranda harus tetap bisa diindeks dan menampilkan og:image.
 */
const BOTS =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|twitter|linkedin|embedly|lighthouse/i;

/**
 * Kunjungan pertama ke "/" diarahkan ke halaman selamat datang. Cookie diset
 * pada respons pengalihan itu juga, jadi "Masuk ke beranda" langsung sampai
 * ke beranda tanpa putaran ulang.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isAdminLogin) {
    return guardAdmin(request);
  }

  if (request.cookies.has(WELCOME_COOKIE)) return NextResponse.next();

  // Prefetch dan navigasi antarhalaman dari dalam situs tidak ikut dialihkan.
  if (request.headers.has("rsc") || request.headers.has("next-router-prefetch")) {
    return NextResponse.next();
  }

  if (BOTS.test(request.headers.get("user-agent") ?? "")) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/selamat-datang", request.url));
  response.cookies.set(WELCOME_COOKIE, "1", {
    maxAge: WELCOME_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};

/**
 * Halaman /admin hanya untuk staf aktif (owner/teknisi), kecuali /admin/login
 * yang harus bisa dibuka tanpa sesi. API admin tidak lewat sini: setiap Route
 * Handler memeriksa sesi & role sendiri.
 */
async function guardAdmin(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle<{ role: string; is_active: boolean }>();

  const isStaff =
    profile?.is_active === true &&
    (profile.role === "owner" || profile.role === "teknisi");

  if (!isStaff) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}