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
    <Section tone="paper">
      <div className="container-page section-pad">
        <Reveal>
          <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
            Kata pelanggan
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              key={`${item.name}-${item.created_at}`}
              delay={index * 40}
              className="h-full"
            >
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
                <div
                  aria-label={`${item.rating} dari 5 bintang`}
                  className="text-[13px] tracking-[0.2em] text-electric"
                >
                  {"★".repeat(item.rating)}
                  <span className="text-ink/20">
                    {"★".repeat(5 - item.rating)}
                  </span>
                </div>

                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  {item.message}
                </blockquote>

                <figcaption className="mt-auto pt-5 text-[13px] text-ink-soft">
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
