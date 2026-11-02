import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { processSteps } from "@/lib/content";

/** Each step steps further right, so the eye walks down the section. */
const stepIndent = [
  "md:ml-0",
  "md:ml-[12%]",
  "md:ml-[24%]",
  "md:ml-[36%]",
];

export function Process() {
  return (
    <Section id="proses" tone="navy" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <ol className="space-y-12 md:space-y-14">
          {processSteps.map((step, index) => {
            const isLast = index === processSteps.length - 1;

            return (
              <li key={step.title} className={stepIndent[index]}>
                <Reveal>
                  <h2
                    className={cn(
                      "display-lg text-[clamp(1.85rem,4.3vw,4.4rem)]",
                      isLast ? "text-electric-soft" : "text-chrome",
                    )}
                  >
                    {step.title}
                  </h2>
                  <p className="mt-3 max-w-[38ch] text-[16px] leading-relaxed text-dim md:text-[17px]">
                    {step.description}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
