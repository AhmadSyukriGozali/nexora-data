"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNavMobile } from "@/components/site-nav-mobile";

/** Header, footer, and mobile tabs do not render inside the admin panel. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))] md:pb-0">
        <main id="konten">{children}</main>
        <SiteFooter />
      </div>
      <SiteNavMobile />
    </>
  );
}