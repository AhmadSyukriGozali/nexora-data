import { ShinyLink } from "@/components/ui/shiny-link";
import { Section } from "@/components/ui/section";
import { site, waDefault } from "@/lib/site";

/**
 * The closing block is one enormous button: a solid electric slab whose edge
 * carries a travelling light. The whole surface is the target.
 */
export function CallToAction() {
  return (
    <Section tone="navy" className="pb-16 pt-10 md:pb-24 md:pt-14">
      <h2 className="sr-only">Hubungi Nexora Data sekarang</h2>

      <div className="container-page">
        <div className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[40ch] text-[17px] leading-relaxed text-chrome md:text-[20px]">
            Ceritakan keluhan perangkatmu. Diagnosanya gratis, dan kamu tetap
            boleh pulang tanpa perbaikan.
          </p>
          <p className="text-[14px] text-dim">
            Admin membalas {site.hours.open}–{site.hours.close}
          </p>
        </div>

        <ShinyLink
          href={waDefault}
          tone="electric"
          size="none"
          className="shiny-block"
          faceClassName="w-full items-center justify-center py-6 md:py-8"
          labelClassName="w-full justify-center"
          cursor="Chat WhatsApp"
        >
          <span className="sr-only">Chat WhatsApp Nexora Data</span>

          <span
            aria-hidden="true"
            className="block font-display text-[clamp(3.8rem,20vw,16rem)] font-extrabold uppercase leading-[0.78] tracking-[-0.05em]"
          >
            Servis
          </span>

          <span
            aria-hidden="true"
            className="hidden font-display text-[clamp(1.6rem,3vw,2.6rem)] font-semibold md:block"
          >
            →
          </span>
        </ShinyLink>
      </div>
    </Section>
  );
}
