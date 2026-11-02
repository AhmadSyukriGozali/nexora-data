"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState, type MouseEvent } from "react";
import { useChapterTheme, type Chapter } from "@/components/use-chapter-theme";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { site, waDefault } from "@/lib/site";

const links = [
  { href: "/layanan", label: "Layanan" },
  { href: "/#proses", label: "Proses" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/#faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
];

/** Each chapter gets a bar colour, a button style and a mobile menu panel. */
const themeClass: Record<
  Chapter,
  { bar: string; action: string; panel: string }
> = {
  dark: {
    bar: "bg-navy text-chrome",
    action: "bg-electric text-white hover:bg-white hover:text-ink",
    panel: "border-white/12 bg-navy text-chrome",
  },
  light: {
    bar: "bg-paper text-ink",
    action: "bg-ink text-white hover:bg-electric",
    panel: "border-ink/10 bg-paper text-ink",
  },
  blue: {
    bar: "bg-electric text-ink",
    action: "bg-ink text-white hover:bg-navy",
    panel: "border-ink/10 bg-electric text-ink",
  },
};

const navLinkClass =
  "relative py-2 opacity-80 transition-opacity hover:opacity-100 " +
  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left " + // taste-skill-ignore: penanda halaman aktif, bukan garis pemisah
  "after:scale-x-0 after:bg-current after:transition-transform after:duration-300 " +
  "hover:after:scale-x-100";

const activeNavLinkClass = "opacity-100 after:scale-x-100";

/** Closes the mobile menu after a tap, since <details> keeps its state. */
function closeMenu(event: MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

export function SiteHeader() {
  const chapter = useChapterTheme();
  const pathname = usePathname();
  const theme = themeClass[chapter];

  const [hidden, setHidden] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  // Reading down hides the bar; any upward scroll brings it straight back.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > 180 && current > previous);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: ease.out }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        theme.bar,
      )}
    >
      <div className="container-page flex h-[76px] items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3"
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
          <span className="font-display text-[13px] font-semibold tracking-[0.02em] sm:text-[14px]">
            Nexora Data
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-8 text-[15px] md:flex"
        >
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

        <div className="flex items-center gap-1 md:gap-4">
          <details className="group relative md:hidden">
            <summary className="cursor-pointer list-none px-3 py-3 text-[14px] font-semibold [&::-webkit-details-marker]:hidden">
              Menu
            </summary>

            <nav
              aria-label="Navigasi seluler"
              className={cn(
                "absolute right-0 top-full w-[196px] p-2",
                theme.panel,
              )}
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block px-3 py-3 text-[15px] transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>

          <a
            href={waDefault}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "px-4 py-3 text-[14px] font-semibold transition-colors sm:px-5",
              theme.action,
            )}
          >
            WhatsApp
          </a>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-current opacity-60"
      />
    </motion.header>
  );
}
