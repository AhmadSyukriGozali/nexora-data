import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { faqs } from "@/lib/content";

export function Faq() {
  return (
    <Section id="faq" tone="paper" className="scroll-mt-20 section-pad">
      <div className="container-page grid grid-cols-12 gap-y-8">
        <Reveal className="col-span-12 md:col-span-3">
          <h2 className="font-display text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold">
            Pertanyaan umum
          </h2>
        </Reveal>

        <div className="col-span-12 md:col-span-9 md:columns-2 md:gap-14">
          {faqs.map((item, index) => (
            <Reveal key={item.question} delay={Math.min(index * 30, 150)}>
              <p className="mb-5 break-inside-avoid text-[16px] leading-[1.6] text-ink-soft">
                <strong className="font-semibold text-ink">
                  {item.question}
                </strong>{" "}
                {item.answer}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
