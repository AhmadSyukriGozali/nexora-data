import type { Metadata } from "next";
import { Faq } from "@/components/home/faq";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { faqs } from "@/lib/content";
import { faqJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Pertanyaan Umum Servis",
  description:
    "Pertanyaan umum tentang servis HP, laptop, PC, dan printer di Nexora Data: lama pengerjaan, garansi, diagnosa gratis, part, data, dan pembayaran.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Pertanyaan Umum · Nexora Data",
    description:
      "Lama pengerjaan, garansi, diagnosa gratis, part, data, dan pembayaran.",
    url: "/faq",
  },
};

const faqMarkup = faqJsonLd(faqs);

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqMarkup) }}
      />

      <Section tone="paper" className="page-top">
        <div className="container-page pb-6 md:pb-10">
          <Reveal>
            <h1 className="display-xl text-[clamp(2.2rem,5vw,3.6rem)] text-ink">
              Pertanyaan umum
            </h1>
          </Reveal>
          <Reveal delay={60}>
            <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
              Kalau yang kamu cari belum ada di sini, tanyakan langsung. Admin menjawab pada jam buka.
            </p>
          </Reveal>
        </div>
      </Section>

      <Faq limit={4} moreHref="/faq" />
    </>
  );
}