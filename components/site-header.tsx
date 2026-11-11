"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState, type MouseEvent } from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { site, waDefault } from "@/lib/site";

const serviceLinks = [
  { href: "/layanan#laptop", label: "Servis Laptop" },
  { href: "/layanan#hp", label: "Servis Handphone" },
  { href: "/layanan#pc", label: "Servis PC / Komputer" },
  { href: "/layanan#printer", label: "Servis Printer" },
  { href: "/layanan", label: "Semua layanan" },
];

const links = [
  { href: "/cek-status", label: "Cek Servis" },
  { href: "/#proses", label: "Proses" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/#faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
];

const navLinkClass =
  "relative py-2 text-white/85 transition-colors hover:text-white " +
  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left " +
  "after:scale-x-0 after:rounded-full after:bg-[#2f7bff] after:transition-transform after:duration-300 " +
  "hover:after:scale-x-100";

const activeNavLinkClass = "text-white after:scale-x-100";

/** Menutup menu seluler setelah ketukan, karena <details> menyimpan state-nya. */
function closeMenu(event: MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Membaca ke bawah menyembunyikan bar; scroll ke atas langsung memunculkannya.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > 180 && current > previous);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: ease.out }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#061836]/95 text-white backdrop-blur-md"
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1340px] items-center justify-between gap-6 px-5 md:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label={`${site.name}, beranda`}
        >
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={184}
            height={232}
            priority
            className="h-9 w-auto"
          />
          <span className="font-display text-[20px] font-semibold tracking-tight">
            Nexora Data
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-6 text-[15px] font-medium md:flex lg:gap-8"
        >
          <div className="group relative">
            <Link
              href="/layanan"
              aria-current={pathname === "/layanan" ? "page" : undefined}
              className={cn(
                navLinkClass,
                "inline-flex items-center gap-1",
                pathname === "/layanan" && activeNavLinkClass,
              )}
            >
              Layanan
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </Link>

            <div className="invisible absolute left-1/2 top-full w-[230px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <ul className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a2248] p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)]">
                {serviceLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-xl px-4 py-2.5 text-[14px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {links.map((link) => {
            const active = link.href === pathname;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(navLinkClass, active && activeNavLinkClass)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <a
            href={waDefault}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#22c55e] to-[#15a34a] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(34,197,94,0.8)] transition hover:brightness-110 sm:px-5"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>

          <details className="group/menu relative md:hidden">
            <summary
              aria-label="Buka menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-white/15 [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-5 w-5 group-open/menu:hidden" aria-hidden="true" />
              <X className="hidden h-5 w-5 group-open/menu:block" aria-hidden="true" />
            </summary>

            <nav
              aria-label="Navigasi seluler"
              className="absolute right-0 top-full mt-3 w-[236px] rounded-2xl border border-white/10 bg-[#0a2248] p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)]"
            >
              {[{ href: "/layanan", label: "Layanan" }, ...links].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-[15px] text-white/90 transition-colors hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </motion.header>
  );
}