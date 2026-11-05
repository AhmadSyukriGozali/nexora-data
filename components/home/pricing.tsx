"use client";

import {
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { deviceOrder, estimates, priceRows, type DeviceKey } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/**
 * One table on desktop, one folding list per device on smaller screens.
 * Both render the same `priceRows`, so prices are edited in one place.
 */
export function Pricing() {
  const tableRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState<DeviceKey | null>("hp");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glowX = useSpring(x, { stiffness: 160, damping: 22, mass: 0.4 });
  const glowY = useSpring(y, { stiffness: 160, damping: 22, mass: 0.4 });

  function trackPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <Section id="tarif" tone="navy" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal variant="mask">
            <h2 className="display-lg text-[clamp(2.1rem,4.6vw,4rem)] text-chrome">
              Daftar tarif
            </h2>
          </Reveal>

          <Reveal delay={80} variant="right">
            <p className="max-w-[40ch] text-[15px] leading-relaxed text-dim">
              Rentang harga jasa dan part yang paling sering diminta, dalam
              Rupiah. Semua angka dikonfirmasi setelah diagnosa gratis.
            </p>
          </Reveal>
        </div>

        <div
          ref={tableRef}
          onPointerMove={trackPointer}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className="relative mt-10 hidden lg:mt-12 lg:block"
        >
          <motion.div
            aria-hidden="true"
            style={{ x: glowX, y: glowY }}
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
          />

          <table className="price-table relative w-full border-collapse text-left">
            <caption className="sr-only">
              Estimasi tarif servis HP, laptop, PC, dan printer di Nexora Data
            </caption>

            <thead>
              <tr>
                <th
                  scope="col"
                  className="pb-5 pr-4 text-[14px] font-medium text-dim"
                >
                  Tindakan
                </th>
                {deviceOrder.map((device) => (
                  <th
                    key={device}
                    scope="col"
                    className="px-3 pb-5 font-display text-[clamp(1.1rem,2.2vw,1.9rem)] font-semibold text-chrome"
                  >
                    {estimates[device].label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {priceRows.map((row, index) => (
                <motion.tr
                  key={row.action}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.5,
                    ease: ease.out,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                  className="transition-colors hover:bg-white/[0.04]"
                >
                  <th
                    scope="row"
                    className="py-5 pr-4 text-[16px] font-medium text-chrome md:text-[19px]"
                  >
                    {row.action}
                  </th>
                  {deviceOrder.map((device) => (
                    <td
                      key={device}
                      className="px-3 py-5 text-[16px] tabular-nums text-chrome md:text-[19px]"
                    >
                      {row[device]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-3 lg:hidden">
          {deviceOrder.map((device) => {
            const isOpen = open === device;
            const rows = priceRows.filter((row) => row[device] !== "—");

            return (
              <div key={device} className="bg-surface">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`tarif-${device}`}
                  onClick={() => setOpen(isOpen ? null : device)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="font-display text-[21px] font-semibold text-chrome">
                    {estimates[device].label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-[22px] leading-none text-electric-soft transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  >
                    +
                  </span>
                </button>

                <div
                  id={`tarif-${device}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-[420ms] ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="px-5 pb-5">
                      {rows.map((row) => (
                        <li
                          key={row.action}
                          className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]"
                        >
                          <span className="text-chrome">{row.action}</span>
                          <span className="tabular-nums text-dim">
                            {row[device]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
