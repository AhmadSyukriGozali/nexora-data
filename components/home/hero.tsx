"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { OpenStatus } from "@/components/home/open-status";
import { Magnetic } from "@/components/motion/magnetic";
import { ShinyLink } from "@/components/ui/shiny-link";
import { Section } from "@/components/ui/section";
import { ease } from "@/lib/motion";
import { site, waDefault } from "@/lib/site";

const lines = ["Servis", "HP, Laptop,", "PC & Printer"];

const stage = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const line = {
  hidden: { y: "112%" },
  visible: {
    y: "0%",
    transition: { duration: 1.05, ease: ease.out },
  },
};

const meta = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: ease.out, delay: 0.5 },
  },
};

/**
 * The opening scene. The headline is cut into three bands that rise out of
 * their own masks, while the electric field below drifts at a different speed
 * on scroll. The status panel is the "object" in the frame: it gives the eye
 * something to land on besides type.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fieldY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -46]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -22]);

  return (
    <Section tone="navy" className="relative overflow-hidden">
      <div
        ref={ref}
        className="relative flex min-h-[100svh] flex-col pb-10 pt-[96px] md:pb-14 md:pt-[124px]"
      >
        <motion.div
          aria-hidden="true"
          style={{ y: fieldY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-electric [clip-path:polygon(0_46%,100%_0,100%_100%,0_100%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-24 h-[380px] w-[380px] rounded-full bg-electric/25 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-[42%] h-[460px] w-[460px] rounded-full bg-electric-soft/25 blur-[140px]"
        />

        <div className="container-page relative z-10 flex flex-1 flex-col">
          <motion.div
            variants={meta}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-[14px]"
          >
            <p>
              <span className="text-chrome">{site.address.line2}</span>
              <span className="text-dim"> · {site.address.city}</span>
            </p>
            <OpenStatus />
          </motion.div>

          <div className="mt-auto grid items-end gap-10 pt-16 md:grid-cols-12 md:gap-x-10 md:pt-24">
            <motion.div
              style={{ y: headlineY }}
              className="md:col-span-8"
              variants={stage}
              initial="hidden"
              animate="visible"
            >
              <h1 className="font-display text-[clamp(2.9rem,8.2vw,8.1rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.045em] text-chrome">
                {lines.map((text, index) => (
                  <span key={text} className="block overflow-hidden pb-[0.05em]">
                    <motion.span
                      variants={line}
                      className={
                        index === 2 ? "block type-outline" : "block"
                      }
                    >
                      {text}
                      {index === 2 ? (
                        <span className="sr-only"> di Jakarta Timur</span>
                      ) : null}
                    </motion.span>
                  </span>
                ))}
              </h1>
            </motion.div>

            <motion.aside
              style={{ y: panelY }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: ease.out, delay: 0.55 }}
              className="md:col-span-4 md:pb-2"
            >
              <div className="border border-white/12 bg-navy/95 p-6 md:p-7">
                <p className="text-[13px] font-medium text-dim">Status toko</p>

                <OpenStatus className="mt-3" />

                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="font-display text-[18px] font-semibold text-chrome">
                      Diagnosa gratis
                    </dt>
                    <dd className="mt-1 text-[14px] leading-relaxed text-dim">
                      Tanpa biaya pemeriksaan, tanpa kewajiban melanjutkan.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-display text-[18px] font-semibold text-chrome">
                      Garansi {site.guarantee}
                    </dt>
                    <dd className="mt-1 text-[14px] leading-relaxed text-dim">
                      Untuk jasa dan part yang kami pasang.
                    </dd>
                  </div>
                </dl>

                <a
                  href="#tarif"
                  data-cursor="Lihat tarif"
                  className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-chrome transition-colors hover:text-electric-soft"
                >
                  Lihat rentang harga
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </motion.aside>
          </div>

          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end md:gap-x-10">
            <motion.p
              variants={meta}
              initial="hidden"
              animate="visible"
              className="max-w-[52ch] text-[16px] leading-relaxed text-white md:col-span-6 md:text-[18px]"
            >
              Servis HP, laptop, PC, dan printer di Pulo Gebang. Harga disepakati
              sebelum dikerjakan, dan setiap perbaikan ditutup garansi{" "}
              {site.guarantee}.
            </motion.p>

            <motion.div
              variants={meta}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 md:justify-end"
            >
              <Magnetic>
                <ShinyLink
                  href={waDefault}
                  tone="chrome"
                  size="lg"
                  cursor="Chat WhatsApp"
                >
                  Chat WhatsApp
                </ShinyLink>
              </Magnetic>

              <a
                href="#layanan"
                className="text-[15px] font-semibold text-ink underline decoration-ink/40 decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
              >
                Lihat layanan
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
