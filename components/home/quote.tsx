"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { WordsReveal } from "@/components/motion/words-reveal";
import { Section } from "@/components/ui/section";

/** An attributed brand statement, not a customer testimonial. */
export function Quote() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <Section tone="navy">
      <div ref={ref} className="grid md:grid-cols-12">
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-[320px] overflow-hidden md:col-span-5 md:min-h-[560px]"
        >
          <motion.div style={{ y: imageY }} className="absolute inset-[-10%]">
            <Image
              src="/images/repair-lab.webp"
              alt="Teknisi membuka cangkang ponsel dengan alat presisi di meja kerja"
              fill
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
          </motion.div>

          <div aria-hidden="true" className="absolute inset-0 bg-navy/20" />
        </motion.div>

        <div className="flex flex-col justify-between bg-surface p-8 md:col-span-7 md:p-14">
          <div>
            <span
              aria-hidden="true"
              className="block font-display text-[64px] leading-[0.6] text-electric-soft"
            >
              &ldquo;
            </span>

            <blockquote className="mt-6 max-w-[24ch] font-display text-[clamp(1.6rem,2.6vw,2.6rem)] font-medium leading-[1.12] tracking-[-0.02em] text-chrome">
              <WordsReveal text="Kami tidak mengganti part sebelum kamu setuju dengan harganya." />
            </blockquote>
          </div>

          <div className="mt-12">
            <p className="text-[15px] font-semibold text-chrome">
              Tim Nexora Data
            </p>
            <p className="text-[14px] text-dim">
              Pulo Gebang, Cakung, Jakarta Timur
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
