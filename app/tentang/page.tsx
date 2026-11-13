import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import {
  capabilities,
  processSteps,
  promiseItems,
} from "@/lib/content";
import { mapsLinkUrl, site, waDefault } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang Nexora Data",
  description:
    "Nexora Data melayani servis HP, laptop, PC, dan printer di Pulo Gebang, Jakarta Timur. Diagnosa gratis, harga disepakati sebelum dikerjakan, garansi 2 minggu.",
  alternates: { canonical: "/tentang" },
  openGraph: {
    title: "Tentang Nexora Data · Servis di Jakarta Timur",
    description:
      "Cara kerja, prinsip, dan cakupan layanan Nexora Data di Pulo Gebang, Cakung.",
    url: "/tentang",
  },
};

export default function TentangPage() {
  return (
    <>
      <Section tone="paper" className="page-top">
        <div className="container-page pb-12 md:pb-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
            <Reveal>
              <h1 className="display-xl text-[clamp(2.2rem,5vw,3.6rem)] text-ink">
                Tentang Nexora Data
              </h1>
              <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
                Nexora Data melayani perbaikan HP, laptop, PC, dan printer di
                Pulo Gebang, Cakung, Jakarta Timur. Pengerjaan dilakukan di
                toko, bukan dikirim ke pihak ketiga.
              </p>
              <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft">
                Kami mulai dari diagnosa, menyebutkan rincian biaya, lalu
                mengerjakan setelah kamu setuju. Setiap pekerjaan ditutup
                garansi {site.guarantee} untuk jasa dan part yang kami pasang.
              </p>
            </Reveal>

            <Reveal delay={80} variant="right">
              <div className="rounded-2xl border border-line bg-white p-6">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Kunjungi toko
                </h2>
                <address className="mt-4 not-italic text-[15px] leading-relaxed text-ink">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                  <br />
                  {site.address.city} {site.address.postal}
                </address>
                <p className="mt-4 text-[15px] leading-relaxed text-ink">
                  {site.hours.days}, {site.hours.open}–{site.hours.close}
                </p>
                <p className="mt-1 text-[14px] text-ink-soft">
                  {site.hours.note}
                </p>
                <div className="mt-5 flex flex-col gap-2 text-[15px] font-semibold">
                  <a
                    href={mapsLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-electric hover:text-navy"
                  >
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                    Buka di Google Maps
                  </a>
                  <a
                    href={`tel:+${site.phone.intl}`}
                    className="inline-flex items-center gap-2 text-ink hover:text-electric"
                  >
                    <Phone aria-hidden="true" className="h-4 w-4" />
                    {site.phone.display}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="paper" className="border-t border-line">
        <div className="container-page section-pad">
          <Reveal>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
              Cara kami bekerja
            </h2>
          </Reveal>

          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 50}>
                  <p className="text-[13px] font-semibold tabular-nums text-electric">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {step.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="navy">
        <div className="container-page section-pad">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-white">
                Prinsip kerja
              </h2>
              <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-dim">
                Tiga hal yang selalu kami sampaikan sebelum perangkat dibongkar.
              </p>
            </Reveal>

            <dl className="grid gap-6 sm:grid-cols-3">
              {promiseItems.map((item, index) => (
                <div key={item.term}>
                  <Reveal delay={index * 50}>
                    <dt className="font-display text-[18px] font-semibold text-white">
                      {item.term}
                    </dt>
                    <dd className="mt-2 text-[14px] leading-relaxed text-dim">
                      {item.detail}
                    </dd>
                  </Reveal>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page section-pad">
          <Reveal>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
              Yang kami tangani
            </h2>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
              Kalau kerusakannya belum ada di daftar, tanyakan lewat WhatsApp.
              Diagnosa gratis dan kamu tetap boleh pulang tanpa perbaikan.
            </p>
          </Reveal>

          <ul className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {capabilities.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={Math.min(index * 30, 120)}>
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Tanya lewat WhatsApp
            </a>
            <Link
              href="/layanan"
              className="text-[15px] font-semibold text-ink underline underline-offset-4 hover:text-electric"
            >
              Lihat detail layanan
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
