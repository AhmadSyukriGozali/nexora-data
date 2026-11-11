import { Check, Laptop, Settings } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";

const reasons = [
  ["Teknisi", "Berpengalaman"],
  ["Proses Cepat", "dan Transparan"],
  ["Data", "Aman & Terjaga"],
  ["Garansi", "Servis"],
  ["Layanan", "On-Call (Jakarta)"],
];

/** Pita "Kenapa Memilih Nexora Data?": ilustrasi di kiri, lima alasan di kanan. */
export function WhyChoose() {
  return (
    <Section tone="paper" className="bg-[#f4f8ff] py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1340px] px-5 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-[28px] border border-[#e1ebff] bg-gradient-to-r from-white to-[#eaf2ff] px-6 py-7 shadow-[0_18px_40px_-28px_rgba(13,71,184,0.45)] md:flex-row md:items-center md:gap-8 md:px-10">
            <div
              aria-hidden="true"
              className="relative hidden h-24 w-32 shrink-0 md:block"
            >
              <Laptop
                strokeWidth={1.4}
                className="absolute bottom-0 left-0 h-24 w-24 text-[#1e5eff]"
              />
              <span className="absolute right-3 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d47b8] text-white">
                <Settings className="h-7 w-7" />
              </span>
              <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#22c55e] text-white ring-4 ring-[#eaf2ff]">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
            </div>

            <div className="min-w-0 flex-1 md:border-l md:border-[#c9d9f5] md:pl-8">
              <h2 className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-bold tracking-tight text-[#061836]">
                Kenapa Memilih Nexora Data?
              </h2>

              <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
                {reasons.map(([first, second]) => (
                  <li key={first} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                      <Check
                        className="h-5 w-5"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[15px] leading-tight text-[#1a2b4a]">
                      {first}
                      <br />
                      {second}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}