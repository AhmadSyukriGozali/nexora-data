import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { site } from "@/lib/site";

const reasons = [
  {
    title: "Teknisi berpengalaman",
    detail:
      "Pengerjaan board, penggantian part, dan pemulihan data ditangani langsung di toko.",
  },
  {
    title: "Biaya transparan",
    detail:
      "Rincian part dan jasa disebut sebelum perangkat dibongkar. Tidak ada tambahan tanpa persetujuan.",
  },
  {
    title: "Data dijaga",
    detail:
      "Kami tanyakan data yang perlu diselamatkan sebelum membongkar perangkat.",
  },
  {
    title: `Garansi ${site.guarantee}`,
    detail: `Berlaku untuk jasa pemasangan dan part yang kami sediakan.`,
  },
];

export function WhyChoose() {
  return (
    <Section tone="navy">
      <div className="container-page section-pad">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-white">
              Kenapa memilih Nexora Data
            </h2>
            <p className="mt-4 max-w-[36ch] text-[16px] leading-relaxed text-dim">
              Servis yang jelas sejak awal: apa yang rusak, apa yang dikerjakan,
              dan berapa biayanya.
            </p>
          </Reveal>

          <ul className="grid gap-6 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <li key={reason.title}>
                <Reveal delay={index * 50}>
                  <p className="font-mono text-[12px] text-electric-soft">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-[18px] font-semibold text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-dim">
                    {reason.detail}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
