"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/**
 * Opening hours in Jakarta time, whatever the visitor's own clock says.
 * The first render is neutral so server and client markup match; the real
 * state arrives a frame later.
 */
export function OpenStatus({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => {
      const clock = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      const [hour, minute] = clock.split(":").map(Number);
      const now = hour * 60 + minute;
      const opens = 9 * 60 + 30;
      const closes = 21 * 60 + 30;

      setOpen(now >= opens && now < closes);
    };

    read();
    const timer = window.setInterval(read, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const live = open === true;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          live ? "bg-live" : "bg-dim",
        )}
      />
      <span className="text-[14px] font-semibold text-chrome">
        {open === null
          ? site.hours.days
          : live
            ? "Buka sekarang"
            : "Tutup sekarang"}
      </span>
      <span className="text-[14px] text-dim">
        {site.hours.open}–{site.hours.close}
      </span>
    </div>
  );
}
