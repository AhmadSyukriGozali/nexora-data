import { CalendarCheck, ChevronRight, Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { site, waDefault } from "@/lib/site";

/** Banner biru penutup: ajakan konsultasi, tombol WhatsApp, dan nomor telepon. */
export function CallToAction() {
  return (
    <Section tone="paper" className="bg-[#f4f8ff] pb-16 pt-6 md:pb-20 md:pt-8">
      <h2 className="sr-only">Hubungi Nexora Data sekarang</h2>

      <div className="mx-auto w-full max-w-[1340px] px-5 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-7 rounded-[28px] bg-gradient-to-r from-[#061836] via-[#0a2a5e] to-[#0d47b8] px-7 py-8 text-white shadow-[0_24px_48px_-24px_rgba(6,24,54,0.9)] md:px-10 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex flex-1 items-center gap-6">
              <CalendarCheck
                aria-hidden="true"
                strokeWidth={1.5}
                className="hidden h-16 w-16 shrink-0 text-white sm:block"
              />
              <div>
                <p className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-bold tracking-tight">
                  Butuh Servis Sekarang?
                </p>
                <p className="mt-2 max-w-[44ch] text-[16px] leading-snug text-white/90">
                  Konsultasikan kendala perangkat Anda, dapatkan diagnosa gratis
                  dan estimasi biaya terlebih dahulu.
                </p>
              </div>
            </div>

            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Chat WhatsApp"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-[#22c55e] to-[#15a34a] px-7 py-4 text-[17px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(34,197,94,0.85)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <WhatsAppIcon className="h-7 w-7" />
              Hubungi via WhatsApp
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </a>

            <a
              href={`tel:+${site.phone.intl}`}
              className="flex items-center gap-4 lg:border-l lg:border-white/25 lg:pl-8"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/80">
                <Phone className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[14px] text-white/85">
                  Telepon / Sales
                </span>
                <span className="block font-display text-[clamp(1.3rem,2vw,1.7rem)] font-bold tracking-tight">
                  {site.phone.display}
                </span>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}