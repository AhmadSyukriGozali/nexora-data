import Link from "next/link";
import { Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { site, waDefault } from "@/lib/site";

export function CallToAction() {
  return (
    <Section tone="navy">
      <div className="container-page section-pad">
        <Reveal>
          <div className="grid gap-8 rounded-[20px] border border-white/10 p-7 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="display-lg text-[clamp(1.7rem,3.2vw,2.5rem)] text-white">
                Belum yakin rusaknya di mana?
              </h2>
              <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-dim">
                Kirim foto dan ceritakan keluhannya. Admin akan balas dengan
                estimasi awal pada jam buka. Diagnosa tetap gratis.
              </p>
              <p className="mt-4 text-[14px] text-dim">
                {site.address.line1}, {site.address.city} · {site.hours.days},{" "}
                {site.hours.open}–{site.hours.close}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={waDefault}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat WhatsApp
              </a>
              <a
                href={`tel:+${site.phone.intl}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-white/50"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                {site.phone.display}
              </a>
              <Link
                href="/kontak"
                className="text-center text-[14px] font-semibold text-dim underline underline-offset-4 hover:text-white"
              >
                Lihat alamat dan peta
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
