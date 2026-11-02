"use client";

import { motion } from "motion/react";
import { WordsReveal } from "@/components/motion/words-reveal";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { ease, spring } from "@/lib/motion";
import { site } from "@/lib/site";

/** The three promises, stated once in display type instead of a bullet list. */
const facts = [
  { value: "0", label: "biaya diagnosa" },
  { value: site.guarantee, label: "garansi jasa & part" },
  { value: "7", label: "hari buka setiap minggu" },
];

export function OurPromise() {
  return (
    <Section tone="electric" className="section-pad">
      <div className="container-page">
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-7">
            <h2 className="display-xl text-[clamp(2.1rem,4.8vw,4.4rem)]">
              <WordsReveal text="Diagnosa gratis, harga disepakati." />
            </h2>

            <Reveal delay={120} className="mt-7">
              <p className="max-w-[50ch] text-[16px] leading-relaxed text-ink/90 md:text-[18px]">
                Tidak ada biaya pemeriksaan dan tidak ada tambahan yang muncul
                belakangan. Semua pekerjaan ditutup garansi {site.guarantee}{" "}
                untuk jasa dan part yang kami pasang.
              </p>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={spring.soft}
            className="md:col-span-5 md:translate-y-10"
          >
            <div className="bg-navy p-7 text-chrome md:p-9">
              <dl>
                {facts.map((fact, index) => (
                  <motion.div
                    key={fact.label}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.5,
                      ease: ease.out,
                      delay: 0.15 + index * 0.09,
                    }}
                    className="flex items-baseline justify-between gap-6 py-4 first:pt-0 last:pb-0"
                  >
                    <dd className="font-display text-[clamp(2.1rem,3.6vw,3.1rem)] font-bold leading-none tracking-[-0.03em] tabular-nums">
                      {fact.value}
                    </dd>
                    <dt className="max-w-[18ch] text-right text-[14px] leading-relaxed text-dim">
                      {fact.label}
                    </dt>
                  </motion.div>
                ))}
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
