import { NextResponse, type NextRequest } from "next/server";
import { WELCOME_COOKIE, WELCOME_MAX_AGE } from "@/lib/welcome";

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
export function proxy(request: NextRequest) {
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
  matcher: "/",
};