"use client";

import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Smartphone,
  ShieldCheck,
  Users,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";

import {
  BlockDrawer,
  IconButton,
  InitialsAvatar,
  blockRoot,
  focusRing,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { type Module, type Permissions } from "@/lib/admin/access";
import type { StaffRole } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  module: Module | "staff";
  ownerOnly?: boolean;
  badge?: "orders" | "testimonials";
};

type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, module: "dashboard" },
      { href: "/admin/order", label: "Order Servis", icon: Wrench, module: "orders", badge: "orders" },
      { href: "/admin/pelanggan", label: "Pelanggan", icon: Users, module: "customers" },
      { href: "/admin/perangkat", label: "Perangkat", icon: Smartphone, module: "devices" },
    ],
  },
  {
    label: "Keuangan & stok",
    items: [
      { href: "/admin/invoice", label: "Invoice", icon: FileText, module: "invoices" },
      { href: "/admin/sparepart", label: "Sparepart", icon: Package, module: "spareparts" },
      { href: "/admin/garansi", label: "Garansi", icon: ShieldCheck, module: "warranties" },
    ],
  },
  {
    label: "Lainnya",
    items: [
      {
        href: "/admin/testimoni",
        label: "Testimoni",
        icon: MessageSquareQuote,
        module: "testimonials",
        badge: "testimonials",
      },
      {
        href: "/admin/staf",
        label: "Staf",
        icon: UsersRound,
        module: "staff",
        ownerOnly: true,
      },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ShellUser = { fullName: string; email: string | null; role: StaffRole };

type Badges = { orders?: number; testimonials?: number };

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/admin"
      aria-label="Nexora, Panel Admin"
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-[10px] p-1.5 transition-colors duration-150 hover:bg-[var(--bjork-surface-hover)]",
        focusRing,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--blk-accent-fill)] font-display text-[12px] font-bold text-[color:var(--blk-accent-fill-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.2)]"
      >
        NX
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate font-display text-[13px] font-bold leading-tight tracking-[0.18em]">
            NEXORA
          </span>
          <span className="block truncate text-[11px] leading-tight text-[color:var(--bjork-text-muted)]">
            Panel Admin
          </span>
        </span>
      )}
    </Link>
  );
}

function badgeValue(
  item: NavItem,
  badges: Badges | undefined,
): number | null {
  if (!item.badge || !badges) return null;
  const value = badges[item.badge] ?? 0;
  return value > 0 ? value : null;
}

function SidebarContent({
  mode,
  collapsed,
  user,
  permissions,
  badges,
  pathname,
  onNavigate,
  onToggleCollapsed,
  onClose,
  onLogout,
  loggingOut,
}: {
  mode: "rail" | "drawer";
  collapsed: boolean;
  user: ShellUser;
  permissions: Permissions;
  badges?: Badges;
  pathname: string;
  onNavigate: () => void;
  onToggleCollapsed: () => void;
  onClose: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const isOwner = user.role === "owner";
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.ownerOnly
        ? isOwner
        : item.module !== "staff" && permissions[item.module]?.view === true,
    ),
  })).filter((group) => group.items.length > 0);
  const displayName = user.fullName || user.email || "Staf";

  return (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-[color:var(--bjork-border)]",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <Brand collapsed={collapsed} />
        {mode === "drawer" && (
          <IconButton label="Tutup menu" size="sm" className="ml-auto" onClick={onClose}>
            <X />
          </IconButton>
        )}
      </div>

      <nav
        aria-label="Menu admin"
        className={cn(
          "hide-scrollbar flex-1 overflow-y-auto py-3",
          collapsed ? "px-2" : "px-2.5",
        )}
      >
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className={cn(gi > 0 && "mt-5")}>
            {group.label &&
              (collapsed ? (
                <div aria-hidden="true" className="mx-auto mb-2 h-px w-6 bg-[var(--bjork-border)]" />
              ) : (
                <h2 className="mb-1.5 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--bjork-text-soft)]">
                  {group.label}
                </h2>
              ))}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                const count = badgeValue(item, badges);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-2.5 rounded-[9px] text-[13.5px] transition-colors duration-150",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        active
                          ? "bg-[var(--bjork-surface)] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-soft),0_0_0_1px_var(--bjork-border)]"
                          : "text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
                        focusRing,
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-2.5 top-2 h-5 w-[3px] rounded-r-full bg-[var(--bjork-accent)]"
                        />
                      )}
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "size-[17px] shrink-0",
                          active
                            ? "text-[color:var(--blk-accent-ink)]"
                            : "text-[color:var(--bjork-text-muted)] group-hover:text-[color:var(--bjork-text-medium)]",
                        )}
                      />
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && count !== null ? (
                        <span className="shrink-0 rounded-full border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-1.5 text-[10.5px] font-semibold tabular-nums text-[color:var(--bjork-text-muted)]">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-[color:var(--bjork-border)] p-2.5",
          collapsed && "px-2",
        )}
      >
        <div
          className={cn("flex items-center gap-2.5 p-1.5", collapsed && "justify-center")}
          title={collapsed ? displayName : undefined}
        >
          <InitialsAvatar name={displayName} size={28} />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium leading-tight">
                {displayName}
              </span>
              <span className="block truncate text-[11.5px] leading-tight text-[color:var(--bjork-text-muted)]">
                {isOwner ? "Owner" : "Admin"}
                {user.email ? ` · ${user.email}` : ""}
              </span>
            </span>
          )}
        </div>
        <div className={cn("mt-1 flex items-center gap-1", collapsed && "flex-col")}>
          <IconButton
            label={loggingOut ? "Keluar…" : "Keluar"}
            size="sm"
            onClick={onLogout}
            disabled={loggingOut}
            className="hover:text-[color:var(--blk-error)]"
          >
            <LogOut />
          </IconButton>
          {mode === "rail" && (
            <IconButton
              label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
              size="sm"
              onClick={onToggleCollapsed}
              aria-expanded={!collapsed}
              className="ml-auto max-lg:hidden"
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </IconButton>
          )}
        </div>
      </div>
    </>
  );
}

export function AdminShell({
  user,
  permissions,
  badges,
  today,
  children,
}: {
  user: ShellUser;
  permissions: Permissions;
  badges?: Badges;
  today: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (query.matches) setDrawerOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const isOwner = user.role === "owner";
  const visibleNav = NAV.flatMap((group) => group.items).filter((item) =>
    item.ownerOnly
      ? isOwner
      : item.module !== "staff" && permissions[item.module]?.view === true,
  );
  const currentLabel =
    visibleNav.find((item) => isActive(pathname, item.href))?.label ??
    "Panel Admin";
  const displayName = user.fullName || user.email || "Staf";
  const pending = badges?.orders ?? 0;

  const sidebar = (mode: "rail" | "drawer") => (
    <SidebarContent
      mode={mode}
      collapsed={mode === "rail" && collapsed}
      user={user}
      permissions={permissions}
      badges={badges}
      pathname={pathname}
      onNavigate={() => setDrawerOpen(false)}
      onToggleCollapsed={() => setCollapsed((value) => !value)}
      onClose={() => setDrawerOpen(false)}
      onLogout={handleLogout}
      loggingOut={loggingOut}
    />
  );

  return (
    <div className={cn(blockRoot, "fixed inset-0 z-[110]")}>
      <aside
        aria-label="Navigasi utama"
        className={cn(
          "relative z-20 hidden h-full shrink-0 flex-col border-r border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none lg:flex",
          collapsed ? "w-[64px]" : "w-[244px]",
        )}
      >
        {sidebar("rail")}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col" inert={drawerOpen}>
        <header className="relative z-10 flex h-14 shrink-0 items-center gap-2 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-bg)]/85 px-3 backdrop-blur lg:px-5">
          <IconButton
            label="Buka menu"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="lg:hidden"
          >
            <Menu />
          </IconButton>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <li className="hidden truncate text-[color:var(--bjork-text-muted)] sm:block">
                Nexora Data
              </li>
              <li aria-hidden="true" className="hidden text-[color:var(--bjork-text-faint)] sm:block">
                /
              </li>
              <li
                aria-current="page"
                className="truncate font-medium text-[color:var(--bjork-text)]"
              >
                {currentLabel}
              </li>
            </ol>
          </nav>

          <span className="ml-auto hidden text-[11.5px] text-[color:var(--bjork-text-muted)] xl:block">
            {today}
          </span>

          {pending > 0 ? (
            <Link
              href="/admin/order"
              className={cn(
                "relative grid size-8 place-items-center rounded-[9px] text-[color:var(--bjork-text-muted)] transition-colors hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
                focusRing,
              )}
              aria-label={`${pending} order perlu ditangani`}
            >
              <Bell className="size-[17px]" aria-hidden="true" />
              <span className="absolute right-1 top-1 grid min-w-3.5 place-items-center rounded-full bg-[var(--blk-error)] px-1 text-[9px] font-bold text-[#1b0b0b]">
                {pending > 99 ? "99+" : pending}
              </span>
            </Link>
          ) : null}

          <span className="hidden rounded-full border border-[color:var(--bjork-border)] px-2.5 py-0.5 text-[11px] text-[color:var(--bjork-text-muted)] sm:inline">
            {isOwner ? "Owner" : "Admin"}
          </span>
          <InitialsAvatar name={displayName} size={28} />
        </header>

        <main className="@container/main relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 lg:px-8 lg:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(60%_100%_at_70%_0%,rgba(30,94,255,0.14),transparent_70%)]"
          />
          <div className="relative mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>

      <div className="lg:hidden">
        <BlockDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          label="Menu admin"
        >
          {sidebar("drawer")}
        </BlockDrawer>
      </div>
    </div>
  );
}
