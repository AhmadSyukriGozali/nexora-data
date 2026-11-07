"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { StaffRole } from "@/lib/admin/types";

type NavItem = { href: string; label: string; ownerOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/order", label: "Order Servis" },
  { href: "/admin/pelanggan", label: "Pelanggan" },
  { href: "/admin/perangkat", label: "Perangkat" },
  { href: "/admin/invoice", label: "Invoice" },
  { href: "/admin/sparepart", label: "Sparepart" },
  { href: "/admin/garansi", label: "Garansi" },
  { href: "/admin/testimoni", label: "Testimoni" },
  { href: "/admin/staf", label: "Staf", ownerOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  onNavigate,
  isOwner,
}: {
  onNavigate?: () => void;
  isOwner: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.filter((item) => !item.ownerOnly || isOwner).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-electric/15 text-electric-soft"
                : "text-dim hover:bg-white/5 hover:text-chrome",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-3 py-1">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-electric font-display text-sm font-bold text-white">
        NX
      </span>
      <span>
        <span className="block font-display text-sm font-bold tracking-[0.18em] text-chrome">
          NEXORA
        </span>
        <span className="block text-[11px] uppercase tracking-[0.2em] text-dim">
          Panel Admin
        </span>
      </span>
    </Link>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: { fullName: string; email: string | null; role: StaffRole };
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const userBlock = (
    <div className="mt-auto border-t border-white/10 px-3 pt-4">
      <p className="truncate text-sm font-semibold text-chrome">
        {user.fullName || user.email || "Staf"}
      </p>
      <p className="truncate text-xs text-dim">{user.email}</p>
      <span className="mt-1 inline-flex rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-dim">
        {user.role === "owner" ? "Owner" : "Admin"}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-3 mb-4 w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-dim transition-colors hover:border-red-400/40 hover:text-red-200 disabled:opacity-50"
      >
        {loggingOut ? "Keluar…" : "Keluar"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex bg-navy text-chrome">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-navy-soft py-5 lg:flex">
        <Brand />
        <div className="mt-7 flex-1 overflow-y-auto px-2">
          <NavLinks isOwner={user.role === "owner"} />
        </div>
        {userBlock}
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 bg-black/60 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-white/10 bg-navy-soft py-5 transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Brand />
        <div className="mt-7 flex-1 overflow-y-auto px-2">
          <NavLinks
            onNavigate={() => setOpen(false)}
            isOwner={user.role === "owner"}
          />
        </div>
        {userBlock}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-navy/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm lg:hidden"
              aria-label="Buka menu"
            >
              Menu
            </button>
            <span className="font-display text-sm font-semibold tracking-wide text-dim">
              Dashboard Operasional
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-dim">
            <span className="hidden sm:inline">
              {user.role === "owner" ? "Owner" : "Admin"}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-chrome">
              {(user.fullName || user.email || "N").slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
