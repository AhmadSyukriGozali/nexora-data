"use client";

import { Home, MapPin, Receipt, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/layanan", label: "Layanan", icon: Wrench },
  { href: "/tarif", label: "Tarif", icon: Receipt },
  { href: "/cek-status", label: "Cek Servis", icon: Search },
  { href: "/kontak", label: "Kontak", icon: MapPin },
];

export function SiteNavMobile() {
  const pathname = usePathname();

  if (pathname.startsWith("/selamat-datang")) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-none transition-colors",
                  active ? "text-electric" : "text-ink-soft hover:text-ink",
                )}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={active ? 2.2 : 1.7}
                  className="h-5 w-5"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
