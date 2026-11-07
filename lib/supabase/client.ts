"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Klien Supabase untuk komponen client. Belum dipakai oleh UI mana pun;
 * disediakan agar dashboard admin bisa memakai sesi yang sama.
 */
export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
    );
  }

  return browserClient;
}
