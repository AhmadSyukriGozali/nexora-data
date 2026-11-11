import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Layout for the admin auth pages (login, set password): full-bleed photo
 * background with a glass form card. `nx-block` activates the --bjork-* tokens.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "nx-block fixed inset-0 z-[110] overflow-hidden bg-[var(--bjork-bg)] text-[color:var(--bjork-text)]",
      )}
    >
      <Image
        src="/images/motherboard-6.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(6,16,36,0.5),rgba(6,16,36,0.95))]"
      />

      <div className="relative h-full overflow-y-auto overscroll-contain">
        <div className="grid min-h-full place-items-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/brand/logo-mark.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div>
                <p className="font-display text-sm font-bold tracking-[0.2em] text-[color:var(--bjork-text)]">
                  NEXORA DATA
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--bjork-text-muted)]">
                  {eyebrow}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--bjork-border-strong)] bg-[#0a1730]/60 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              <h1 className="font-display text-2xl font-bold text-[color:var(--bjork-text)]">
                {title}
              </h1>
              <p className="mt-1 text-sm text-[color:var(--bjork-text-muted)]">
                {description}
              </p>
              <div className="mt-6">{children}</div>
            </div>

            {footer ? (
              <div className="mt-5 text-center text-xs text-[color:var(--bjork-text-muted)]">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
