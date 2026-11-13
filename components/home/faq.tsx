"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { faqs } from "@/lib/content";
import { waDefault } from "@/lib/site";

type FaqProps = {
  limit?: number;
  id?: string;
  moreHref?: string;
};

/**
 * A real accordion: the answer stays in the document so it is still indexable
 * and searchable, while `inert` keeps closed panels out of the tab order.
 */
export function Faq({ limit, id, moreHref }: FaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <Section id={id} tone="paper" className="scroll-mt-24">
      <div className="container-page section-pad grid grid-cols-12 gap-y-10 md:gap-x-14">
        <div className="col-span-12 md:sticky md:top-[112px] md:col-span-4 md:self-start">
          <Reveal>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
              Pertanyaan umum
            </h2>
          </Reveal>

          <Reveal delay={60}>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
              Kalau yang kamu cari belum ada di sini, tanyakan langsung. Admin
              menjawab pada jam buka.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-[15px] font-semibold text-electric hover:text-navy"
            >
              Tanya lewat WhatsApp
            </a>
          </Reveal>

          {moreHref ? (
            <Reveal delay={140}>
              <Link
                href={moreHref}
                className="mt-3 inline-block text-[15px] font-semibold text-ink underline underline-offset-4 hover:text-electric"
              >
                Lihat semua pertanyaan
              </Link>
            </Reveal>
          ) : null}
        </div>

        <ul className="col-span-12 space-y-3 md:col-span-8">
          {items.map((item, index) => {
            const isOpen = open === index;

            return (
              <Reveal key={item.question} delay={Math.min(index * 30, 150)}>
                <li className="rounded-2xl border border-line bg-white">
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-6 rounded-2xl p-5 text-left transition-colors hover:bg-paper md:p-6"
                  >
                    <span className="font-display text-[17px] font-semibold leading-snug text-ink md:text-[18px]">
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
                      "grid transition-[grid-template-rows] duration-300 ease-out",
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
