"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";

type PublicTestimonial = {
  name: string;
  rating: number;
  message: string;
  created_at: string;
};

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

/** Ulasan pelanggan yang sudah disetujui admin. Kosong = section disembunyikan. */
export function Testimonials() {
  const [items, setItems] = useState<PublicTestimonial[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/testimonials")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { data?: PublicTestimonial[] } | null) => {
        if (!cancelled) setItems(payload?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <Section tone="paper" className="section-pad">
      <div className="container-page">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-electric">
            Kata pelanggan
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-[-0.02em] text-ink">
            Servis yang mereka percayakan
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              key={`${item.name}-${item.created_at}`}
              delay={index * 40}
              className="bg-paper"
            >
              <figure className="flex h-full flex-col gap-4 p-6 sm:p-7">
                <div
                  aria-label={`${item.rating} dari 5 bintang`}
                  className="font-mono text-[13px] tracking-[0.2em] text-electric"
                >
                  {"★".repeat(item.rating)}
                  <span className="text-ink/20">
                    {"★".repeat(5 - item.rating)}
                  </span>
                </div>

                <blockquote className="text-[15px] leading-relaxed text-ink-soft">
                  {item.message}
                </blockquote>

                <figcaption className="mt-auto text-[13px] text-ink-soft">
                  <span className="font-semibold text-ink">{item.name}</span>
                  {" · "}
                  <time dateTime={item.created_at}>
                    {dateFormat.format(new Date(item.created_at))}
                  </time>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
