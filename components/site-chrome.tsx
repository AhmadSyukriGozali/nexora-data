"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Header/footer situs tidak dirender di panel admin. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
