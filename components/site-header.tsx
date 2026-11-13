"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { cn } from "@/lib/cn";
import { site, waDefault } from "@/lib/site";

const serviceLinks = [
  { href: "/layanan#hp", label: "Servis HP" },
  { href: "/layanan#laptop", label: "Servis Laptop" },
  { href: "/layanan#pc", label: "Servis PC" },
  { href: "/layanan#printer", label: "Servis Printer" },
  { href: "/layanan", label: "Semua layanan" },
];

const links = [
  { href: "/tarif", label: "Tarif" },
  { href: "/tentang", label: "Tentang" },
  { href: "/cek-status", label: "Cek Servis" },
  { href: "/kontak", label: "Kontak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [shrunk, setShrunk] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!servicesOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setServicesOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [servicesOpen]);

  

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-4 md:flex">
        <div
          className={cn(
            "flex w-full max-w-[1120px] items-center justify-between gap-5 rounded-full border border-white/10 bg-navy/85 pl-5 pr-2 text-white shadow-[0_12px_32px_-18px_rgba(6,16,36,0.8)] backdrop-blur-xl transition-[height,padding] duration-300",
            shrunk ? "h-[52px]" : "h-[64px]",
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${site.name}, beranda`}
          >
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={184}
              height={232}
              priority
              className={cn(
                "w-auto transition-[height] duration-300",
                shrunk ? "h-7" : "h-8",
              )}
            />
            <span className="font-display text-[17px] font-semibold tracking-tight">
              Nexora Data
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex items-center gap-1 text-[14px] font-medium"
          >
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((value) => !value)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3.5 py-2 transition-colors hover:bg-white/10",
                  pathname === "/layanan" && "bg-white/10 text-white",
                )}
              >
                Layanan
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    servicesOpen && "rotate-180",
                  )}
                />
              </button>

              {servicesOpen ? (
                <div className="absolute left-0 top-full w-[220px] pt-3">
                  <ul className="overflow-hidden rounded-2xl border border-white/10 bg-navy p-1.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
                    {serviceLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setServicesOpen(false)}
                          className="block rounded-xl px-3.5 py-2.5 text-[14px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 transition-colors hover:bg-white/10",
                    active ? "bg-white/10 text-white" : "text-white/80",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={waDefault}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
            WhatsApp
          </a>
        </div>
      </header>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/95 backdrop-blur md:hidden">
        <div className="flex h-[60px] items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={`${site.name}, beranda`}
          >
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={184}
              height={232}
              priority
              className="h-7 w-auto"
            />
            <span className="font-display text-[16px] font-semibold tracking-tight text-ink">
              Nexora Data
            </span>
          </Link>

          <a
            href={waDefault}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-electric text-white"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </header>
    </>
  );
}
