import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { mapsEmbedUrl, mapsLinkUrl, site, waDefault } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak & Lokasi",
  description:
    "Alamat, jam buka, dan kontak Nexora Data di Jl. Raya Pulo Gebang No. 8, Cakung, Jakarta Timur. Buka setiap hari 09.30–21.30.",
  alternates: { canonical: "/kontak" },
  openGraph: {
    title: "Kontak & Lokasi · Nexora Data",
    description:
      "Jl. Raya Pulo Gebang No. 8, Cakung, Jakarta Timur. Buka setiap hari 09.30–21.30.",
    url: "/kontak",
  },
};

export default function KontakPage() {
  return (
    <>
      <Section tone="navy" className="pb-16 pt-[140px] md:pb-24 md:pt-[180px]">
        <div className="container-page grid gap-12 md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-7">
            <Reveal>
              <h1 className="display-xl text-[clamp(2.9rem,8vw,7.5rem)] text-chrome">
                Kontak
              </h1>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-6 max-w-[52ch] text-[18px] leading-relaxed text-dim md:text-[19px]">
                Datang ke Jl. Raya Pulo Gebang No. 8, Cakung, Jakarta Timur,
                atau hubungi admin lewat WhatsApp setiap hari 09.30–21.30.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <dl className="mt-10 grid max-w-[520px] gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[15px] font-semibold text-chrome">
                    WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={waDefault}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[17px] text-chrome underline decoration-electric decoration-2 underline-offset-4"
                    >
                      {site.phone.display}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[15px] font-semibold text-chrome">
                    Instagram
                  </dt>
                  <dd className="mt-1 text-[17px] text-chrome">
                    <a
                      href={site.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-electric decoration-2 underline-offset-4"
                    >
                      {site.instagram.handle}
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={120} className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/repair-lab.webp"
                alt="Teknisi membuka cangkang ponsel dengan alat presisi di meja kerja"
                fill
                sizes="(min-width: 768px) 38vw, 100vw"
                className="drift object-cover"
              />
            </div>

            <div className="relative mt-4 aspect-[16/9] overflow-hidden">
              <Image
                src="/images/motherboard-6.webp"
                alt="Motherboard komputer dengan soket prosesor dan slot memori terlihat dari dekat"
                fill
                sizes="(min-width: 768px) 38vw, 100vw"
                className="drift object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="navy" className="pb-20 md:pb-28">
        <div className="container-page grid gap-14 md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-7">
            <Reveal>
              <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-semibold text-chrome">
                Ceritakan keluhanmu
              </h2>
              <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-dim">
                Isi tiga kolom di bawah, lalu pesan WhatsApp akan terbuka
                dengan ringkasan yang sudah siap dikirim.
              </p>
            </Reveal>

            <Reveal delay={80} className="mt-8">
              <ContactForm />
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={120}>
              <div className="bg-surface p-7 md:p-8">
                <h2 className="text-[15px] font-semibold text-dim">
                  Kunjungi
                </h2>

                <address className="mt-4 not-italic text-[16px] leading-relaxed text-chrome">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                  <br />
                  {site.address.city} {site.address.postal}
                </address>

                <a
                  href={waDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 block font-display text-[clamp(1.7rem,2.6vw,2.2rem)] font-semibold tracking-[-0.02em] text-chrome transition-colors hover:text-electric-soft"
                >
                  {site.phone.display}
                </a>

                <p className="mt-6 text-[16px] leading-relaxed text-chrome">
                  {site.hours.days}
                  <br />
                  {site.hours.open} – {site.hours.close}
                </p>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-dim">
                  {site.hours.note}
                </p>

                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-[15px] text-chrome underline decoration-electric decoration-2 underline-offset-4"
                >
                  {site.instagram.handle}
                </a>

                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex w-fit bg-electric px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink"
                >
                  Buka di Google Maps
                </a>
              </div>
            </Reveal>

            <Reveal delay={160} className="relative mt-6 aspect-[4/3] overflow-hidden">
              <Image
                src="/images/motherboard-11.webp"
                alt="Detail jalur dan komponen pada motherboard komputer"
                fill
                sizes="(min-width: 768px) 34vw, 100vw"
                className="object-cover"
              />
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-semibold">
              Peta lokasi
            </h2>
          </Reveal>

          <Reveal delay={70}>
            <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
              Toko berada di Jl. Raya Pulo Gebang, seberang jalur angkutan
              umum. Parkir motor tersedia di depan.
            </p>
          </Reveal>

          <Reveal delay={130} className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="aspect-[16/10] overflow-hidden bg-paper-deep lg:col-span-8 lg:aspect-[16/9]">
              <iframe
                title="Peta lokasi Nexora Data di Jl. Raya Pulo Gebang No. 8, Jakarta Timur"
                src={mapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="relative aspect-[4/3] overflow-hidden lg:col-span-4 lg:aspect-auto">
              <Image
                src="/images/laptop-repair-tall.webp"
                alt="Bagian dalam laptop terbuka memperlihatkan baterai, kipas, dan slot memori"
                fill
                sizes="(min-width: 1024px) 32vw, 100vw"
                className="drift object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
