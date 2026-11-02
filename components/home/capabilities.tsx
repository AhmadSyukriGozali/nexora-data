import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { capabilities } from "@/lib/content";

/**
 * Each repair is one line of type: title on the left, description on the
 * right. Whitespace and scale do the separating, so there are no rules or
 * index numbers to read past.
 */
export function Capabilities() {
  return (
    <Section id="layanan" tone="paper" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <Reveal>
          <p className="display-lg text-[clamp(1.7rem,4.4vw,3.9rem)] text-ink-soft">
            Yang kami tangani
          </p>
        </Reveal>

        <ul className="mt-10 space-y-8 md:mt-14 md:space-y-10">
          {capabilities.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={Math.min(index * 40, 160)}>
                <div className="group grid grid-cols-12 items-baseline gap-y-2 md:gap-x-10">
                  <h2 className="col-span-12 font-display text-[clamp(1.75rem,4.9vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] transition-colors group-hover:text-electric md:col-span-7">
                    {item.title}
                  </h2>

                  <p className="col-span-12 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft md:col-span-5 md:text-[17px]">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={80} className="mt-12">
          <ButtonLink href="/layanan" tone="on-light">
            Detail layanan per perangkat
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
