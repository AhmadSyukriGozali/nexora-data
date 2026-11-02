import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { site } from "@/lib/site";

/** The three promises, stated once in display type instead of a bullet list. */
const facts = [
  { value: "0", label: "biaya diagnosa" },
  { value: site.guarantee, label: "garansi jasa & part" },
  { value: "7", label: "hari buka setiap minggu" },
];

export function OurPromise() {
  return (
    <Section tone="electric" className="section-pad">
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-12 md:gap-x-14">
          <Reveal className="md:col-span-7">
            <h2 className="display-xl text-[clamp(2rem,4.6vw,4.2rem)]">
              Diagnosa gratis,
              <br />
              harga disepakati.
            </h2>
          </Reveal>

          <Reveal delay={100} className="md:col-span-5 md:pt-2">
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-ink/90">
              Tidak ada biaya pemeriksaan dan tidak ada tambahan yang muncul
              belakangan. Semua pekerjaan ditutup garansi {site.guarantee}{" "}
              untuk jasa dan part yang kami pasang.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <dl className="mt-14 grid gap-8 sm:grid-cols-3 md:mt-20">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dd className="font-display text-[clamp(2.75rem,4.6vw,4rem)] font-bold leading-none tracking-[-0.03em] tabular-nums">
                  {fact.value}
                </dd>
                <dt className="mt-2 max-w-[22ch] text-[15px] leading-relaxed text-ink/80">
                  {fact.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
