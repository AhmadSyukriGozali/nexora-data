import { Section } from "@/components/ui/section";
import { waDefault } from "@/lib/site";

/** One word is the button: the whole band is a WhatsApp link. */
export function CallToAction() {
  return (
    <Section tone="electric">
      <h2 className="sr-only">Hubungi Nexora Data sekarang</h2>

      <a
        href={waDefault}
        target="_blank"
        rel="noopener noreferrer"
        className="group block px-5 pb-6 pt-12 md:px-11 md:pb-8 md:pt-16"
      >
        <span className="block text-[15px] font-semibold">
          Ceritakan keluhan perangkatmu, diagnosanya gratis.
        </span>
        <span className="mt-5 block font-display text-[clamp(4rem,24vw,21rem)] font-extrabold leading-[0.78] tracking-[-0.05em] transition-colors group-hover:text-white">
          SERVIS
        </span>
      </a>
    </Section>
  );
}
