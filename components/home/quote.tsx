import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";

/** An attributed brand statement, not a customer testimonial. */
export function Quote() {
  return (
    <Section tone="navy">
      <div className="grid md:grid-cols-12">
        <div className="relative min-h-[320px] md:col-span-5 md:min-h-[560px]">
          <Image
            src="/images/repair-lab.webp"
            alt="Teknisi membuka cangkang ponsel dengan alat presisi di meja kerja"
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-between bg-surface p-8 md:col-span-7 md:p-14">
          <Reveal>
            <blockquote className="max-w-[26ch] font-display text-[clamp(1.4rem,2.2vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em] text-chrome">
              “Kami tidak mengganti part sebelum kamu setuju dengan harganya.”
            </blockquote>
          </Reveal>

          <div className="mt-12">
            <p className="text-[15px] font-semibold text-chrome">
              Tim Nexora Data
            </p>
            <p className="text-[14px] text-dim">
              Pulo Gebang, Cakung, Jakarta Timur
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
