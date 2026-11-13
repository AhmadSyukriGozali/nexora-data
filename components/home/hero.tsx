import { CalendarSearch, ShieldCheck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { site, waDefault } from "@/lib/site";

const proofs = [
  { icon: CalendarSearch, label: "Diagnosa gratis" },
  { icon: Wallet, label: "Harga disepakati dulu" },
  { icon: ShieldCheck, label: `Garansi ${site.guarantee}` },
];

export function Hero() {
  return (
    <Section tone="paper" className="overflow-hidden">
      <div className="container-page grid items-center gap-10 pb-14 pt-[104px] md:pb-20 md:pt-[140px] lg:grid-cols-[1fr_0.95fr] lg:gap-14">
        <Reveal>
          <p className="text-[13px] font-semibold text-electric">
            Servis perangkat · Pulo Gebang, Jakarta Timur
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink">
            Servis HP, Laptop, PC &amp; Printer
            <span className="sr-only"> di Jakarta Timur</span>
          </h1>

          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft md:text-[18px]">
            Perbaikan, perawatan, dan pemulihan data dengan teknisi
            berpengalaman. Perangkat diperiksa dulu, biaya disepakati, baru
            dikerjakan.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {proofs.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-[14px] font-medium text-ink"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-electric" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Konsultasi WhatsApp
            </a>

            <Link
              href="/cek-status"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink/30"
            >
              Cek status servis
            </Link>
          </div>

          <p className="mt-6 text-[14px] text-ink-soft">
            Buka {site.hours.days.toLowerCase()}, {site.hours.open}–
            {site.hours.close}.
          </p>
        </Reveal>

        <Reveal delay={80} variant="right">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper-deep">
            <Image
              src="/images/hero-devices.jpg"
              alt="Laptop, handphone, PC, dan printer yang kami servis"
              width={794}
              height={451}
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
