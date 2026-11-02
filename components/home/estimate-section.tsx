import { Estimate } from "@/components/estimate";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";

export function EstimateSection() {
  return (
    <Section id="estimasi" tone="paper" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <div className="grid grid-cols-12 gap-y-6">
          <Reveal className="col-span-12 md:col-span-7">
            <h2 className="display-lg text-[clamp(2.1rem,4.6vw,4rem)]">
              Berapa biayanya?
            </h2>
          </Reveal>

          <Reveal delay={80} className="col-span-12 md:col-span-5 md:pt-2">
            <p className="max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
              Pilih perangkat dan keluhannya untuk melihat rentang biaya. Angka
              ini dari kasus yang paling sering kami tangani, bukan penawaran
              final.
            </p>
          </Reveal>
        </div>

        <div className="mt-12">
          <Estimate />
        </div>
      </div>
    </Section>
  );
}
