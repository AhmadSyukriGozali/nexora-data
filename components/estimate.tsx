"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { deviceOrder, estimates, type DeviceKey } from "@/lib/content";
import { ease, spring } from "@/lib/motion";
import { waLink } from "@/lib/site";

/**
 * Small interactive price range: pick a device, then the closest symptom.
 * The message sent to WhatsApp repeats both choices, so the admin has context.
 * The moving pill and the swapped result make the tool feel like a control
 * panel rather than a form.
 */
export function Estimate() {
  const [device, setDevice] = useState<DeviceKey>("laptop");
  const [index, setIndex] = useState(0);

  const data = estimates[device];
  const item = data.items[index] ?? data.items[0];

  function pickDevice(next: DeviceKey) {
    setDevice(next);
    setIndex(0);
  }

  return (
    <div className="grid grid-cols-12 gap-y-12 md:gap-x-12">
      <div className="col-span-12 md:col-span-5">
        <div
          role="group"
          aria-label="Pilih perangkat"
          className="flex flex-wrap gap-2"
        >
          {deviceOrder.map((key) => {
            const active = key === device;

            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => pickDevice(key)}
                className={cn(
                  "relative px-5 py-3 text-[15px] font-semibold transition-colors duration-200",
                  active ? "text-white" : "text-ink hover:bg-ink/10",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="estimate-device"
                    transition={spring.snappy}
                    className="absolute inset-0 bg-ink"
                  />
                ) : null}
                <span className="relative z-10">{estimates[key].label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Pilih keluhan yang paling mendekati kondisi {data.full.toLowerCase()}.
        </p>

        <ul className="mt-5 space-y-1">
          {data.items.map((entry, entryIndex) => {
            const active = entryIndex === index;

            return (
              <li key={entry.issue} className="relative">
                {active ? (
                  <motion.span
                    layoutId="estimate-issue"
                    transition={spring.snappy}
                    className="absolute inset-0 bg-ink"
                  />
                ) : null}

                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setIndex(entryIndex)}
                  className={cn(
                    "relative flex w-full items-baseline justify-between gap-6 px-4 py-3.5 text-left text-[16px] transition-colors duration-200",
                    active
                      ? "text-white"
                      : "text-ink hover:bg-paper-deep",
                  )}
                >
                  <span>{entry.issue}</span>

                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 text-[13px]",
                      active ? "text-chrome" : "text-ink-soft",
                    )}
                  >
                    {active ? "dipilih" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="col-span-12 md:col-span-7">
        <div className="bg-navy p-7 text-chrome sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[14px] font-medium text-dim">Estimasi biaya</p>
            <p className="text-[14px] text-dim">{data.full}</p>
          </div>

          <div aria-live="polite" className="min-h-[232px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${device}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: ease.out }}
              >
                <p className="mt-5 text-[14px] font-medium text-electric-soft">
                  {item.issue}
                </p>

                <p className="display-lg mt-3 text-[clamp(2.2rem,4.6vw,3.9rem)] tabular-nums text-white">
                  {item.price}
                </p>

                <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-chrome">
                  {item.detail}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-dim">
            {data.note} Harga final ditentukan setelah pemeriksaan langsung.
          </p>

          <a
            href={waLink(
              `Halo Nexora Data, saya mau servis ${data.full.toLowerCase()} dengan keluhan: ${item.issue}. Estimasi di situs ${item.price}. Bisa dibantu?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
          >
            Tanya lewat WhatsApp
          </a>
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
          Estimasi ini bukan penawaran final. Setelah diagnosa gratis, kamu
          menerima rincian part dan jasa sebelum perbaikan dimulai.
        </p>
      </div>
    </div>
  );
}
