"use client";

import { CalendarSearch, Settings, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ease } from "@/lib/motion";
import { site, waDefault } from "@/lib/site";

const badges = [
  { icon: Zap, label: "Diagnosa", strong: "Gratis" },
  { icon: ShieldCheck, label: "Garansi", strong: "Servis" },
  { icon: Settings, label: "Spare Part", strong: "Berkualitas" },
];

const stage = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const rise = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.out } },
};

/**
 * Hero dua kolom: teks di kiri, foto perangkat di kanan yang memudar ke latar
 * biru. Tepi bawah berbentuk gelombang yang menyambung ke section "Layanan Kami".
 */
export function Hero() {
  return (
    <Section
      tone="navy"
      className="relative overflow-hidden bg-[#061836] bg-gradient-to-br from-[#061836] via-[#0a2a5e] to-[#0d47b8]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-32 h-[620px] w-[620px] rounded-full bg-[#2f7bff]/30 blur-[130px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1340px] items-center gap-6 px-5 pb-28 pt-[104px] md:px-10 md:pb-36 md:pt-[120px] lg:min-h-[640px] lg:grid-cols-[1fr_1.05fr] lg:gap-0">
        <motion.div
          variants={stage}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.p
            variants={rise}
            className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.28em] text-white/90 sm:text-[13px]"
          >
            Solusi Teknologi Profesional
            <span
              aria-hidden="true"
              className="hidden h-[2px] w-20 rounded-full bg-[#2f7bff] sm:block"
            />
          </motion.p>

          <motion.h1
            variants={rise}
            className="mt-5 font-display text-[clamp(2.5rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white"
          >
            Servis HP, Laptop,
            <br />
            PC &amp; Printer
            <span className="sr-only"> di Jakarta Timur</span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/90 md:text-[19px]"
          >
            Perbaikan, perawatan, dan pemulihan data dengan teknisi
            berpengalaman, proses cepat, dan bergaransi {site.guarantee}.
          </motion.p>

          <motion.ul
            variants={rise}
            className="mt-8 flex flex-wrap gap-x-8 gap-y-4"
          >
            {badges.map(({ icon: Icon, label, strong }) => (
              <li key={strong} className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#123a82] text-[#6aa6ff] ring-1 ring-white/10">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-[14px] font-semibold leading-tight text-white">
                  {label}
                  <br />
                  {strong}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={rise}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Chat WhatsApp"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-b from-[#22c55e] to-[#15a34a] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(34,197,94,0.85)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Konsultasi Sekarang
            </a>

            <Link
              href="/cek-status"
              data-cursor="Cek status"
              className="inline-flex items-center gap-3 rounded-xl border border-white/40 px-7 py-4 text-[16px] font-semibold text-white transition hover:bg-white/10"
            >
              <CalendarSearch className="h-5 w-5" aria-hidden="true" />
              Cek Status Servis
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: ease.out, delay: 0.25 }}
          className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[58%]"
        >
          <div className="relative aspect-[794/451] w-full overflow-hidden rounded-3xl lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:rounded-none [mask-image:linear-gradient(to_right,transparent_0%,#000_28%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_30%)]">
            <Image
              src="/images/hero-devices.jpg"
              alt="Laptop, handphone, PC, dan printer yang kami servis"
              width={794}
              height={451}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full w-full object-cover object-center lg:object-right"
            />
          </div>
        </motion.div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[-1px] h-[56px] w-full text-[#f4f8ff] md:h-[90px]"
      >
        <path
          fill="currentColor"
          d="M0 62C240 12 520 0 820 18c260 15 440 46 620 22V90H0z"
        />
      </svg>
    </Section>
  );
}