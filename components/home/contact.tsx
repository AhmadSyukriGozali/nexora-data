import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { mapsEmbedUrl, mapsLinkUrl, site, waDefault } from "@/lib/site";

export function Contact() {
  return (
    <Section id="kontak" tone="navy" className="scroll-mt-20 section-pad">
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-12 md:gap-x-12">
          <Reveal className="md:col-span-7" variant="mask">
            <h2 className="display-lg text-[clamp(2.1rem,4.8vw,4.2rem)] text-chrome">
              Bawa perangkatnya, atau kirim foto dulu.
            </h2>
          </Reveal>

          <Reveal delay={90} className="md:col-span-5 md:pt-2" variant="right">
            <p className="max-w-[42ch] text-[16px] leading-relaxed text-dim">
              Kirim foto kerusakan dan ceritakan keluhannya. Admin akan balas
              dengan estimasi awal pada jam buka.
            </p>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <a
            href={waDefault}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Chat WhatsApp"
            className="mt-10 block font-display text-[clamp(2.2rem,8.4vw,7.6rem)] font-bold leading-[0.95] tracking-[-0.04em] text-chrome transition-colors hover:text-electric-soft"
          >
            {site.phone.display}
          </a>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-[15px] font-semibold text-dim">Alamat</h3>
            <address className="mt-4 not-italic text-[15px] leading-relaxed text-chrome">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.city} {site.address.postal}
            </address>
            <a
              href={mapsLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[15px] font-semibold underline decoration-electric decoration-2 underline-offset-4"
            >
              Petunjuk arah
            </a>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-dim">Jam buka</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-chrome">
              {site.hours.days}
              <br />
              {site.hours.open} – {site.hours.close}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-dim">
              {site.hours.note}
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-dim">Lainnya</h3>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-[15px] text-chrome underline decoration-electric decoration-2 underline-offset-4"
            >
              Instagram {site.instagram.handle}
            </a>
            <Link href="/kontak" className="mt-3 block text-[15px] text-chrome">
              Formulir kontak
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-8">
            <div className="bg-surface p-2">
              <iframe
                title="Peta lokasi Nexora Data di Jl. Raya Pulo Gebang No. 8, Jakarta Timur"
                src={mapsEmbedUrl}
                className="h-[260px] w-full border-0 sm:h-[300px] md:h-[360px]"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <Reveal delay={60} className="md:col-span-4 md:pt-1">
            <h3 className="text-[15px] font-semibold text-dim">Lokasi toko</h3>
            <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-chrome">
              Toko berada di Jl. Raya Pulo Gebang, seberang jalur angkutan
              umum. Parkir motor tersedia di depan.
            </p>
            <a
              href={mapsLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-chrome underline decoration-electric decoration-2 underline-offset-4 transition-colors hover:text-electric-soft"
            >
              Buka di Google Maps
              <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
