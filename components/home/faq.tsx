"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { faqs } from "@/lib/content";
import { waDefault } from "@/lib/site";

/**
 * A real accordion: the answer stays in the document so it is still indexable
 * and searchable, while `inert` keeps closed panels out of the tab order.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone="paper" className="scroll-mt-20 section-pad">
      <div className="container-page grid grid-cols-12 gap-y-10 md:gap-x-14">
        <div className="col-span-12 md:sticky md:top-[132px] md:col-span-4 md:self-start">
          <Reveal variant="mask">
            <h2 className="display-lg text-[clamp(2rem,3.4vw,3rem)] text-ink">
              Pertanyaan umum
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
              Kalau yang kamu cari belum ada di sini, tanyakan langsung. Admin
              menjawab pada jam buka.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-electric decoration-2 underline-offset-4 transition-colors hover:text-electric"
            >
              Tanya lewat WhatsApp
              <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>

        <ul className="col-span-12 space-y-3 md:col-span-8">
          {faqs.map((item, index) => {
            const isOpen = open === index;

            return (
              <Reveal key={item.question} delay={Math.min(index * 30, 150)}>
                <li className="bg-white">
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-6 p-5 text-left transition-colors hover:bg-paper-deep/60 md:p-6"
                  >
                    <span className="font-display text-[17px] font-semibold leading-snug text-ink md:text-[19px]">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 shrink-0 text-[22px] leading-none text-electric transition-transform duration-300",
                        isOpen && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </button>

                  <div
                    id={`faq-a-${index}`}
                    role="region"
                    aria-labelledby={`faq-q-${index}`}
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-[420ms] ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-soft md:px-6 md:pb-6 md:text-[16px]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
