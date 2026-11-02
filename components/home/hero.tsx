import { ButtonLink } from "@/components/ui/button-link";
import { Section } from "@/components/ui/section";
import { site, waDefault } from "@/lib/site";

/**
 * The opening statement: the headline is split by the navy/electric horizon,
 * so the first line sits on navy and the second on electric.
 */
export function Hero() {
  return (
    <Section
      tone="navy"
      className="relative h-[100svh] min-h-[620px] overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-1/2 bg-electric"
      />

      <div className="container-page absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <h1 className="hero-in text-center font-display text-[clamp(2.75rem,9.4vw,9.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">
          <span className="block text-chrome">Servis HP,</span>
          <span className="block text-ink">
            Laptop &amp; PC
            <span className="sr-only"> di Jakarta Timur</span>
          </span>
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="container-page flex flex-col items-center gap-6 pb-10 text-center md:pb-14">
          <p className="max-w-[54ch] text-[16px] leading-relaxed text-white md:text-[19px]">
            Diagnosa gratis, harga disepakati sebelum dikerjakan, garansi{" "}
            {site.guarantee}. Buka setiap hari {site.hours.open}–
            {site.hours.close} di Pulo Gebang, Cakung.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <ButtonLink href={waDefault} tone="hero" size="lg">
              Chat WhatsApp
            </ButtonLink>
            <a
              href="#tarif"
              className="text-[15px] font-semibold text-ink underline decoration-ink/40 decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Lihat tarif
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
