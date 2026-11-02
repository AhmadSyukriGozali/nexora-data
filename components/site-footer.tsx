import Image from "next/image";
import Link from "next/link";
import { imageCredits } from "@/lib/media";
import { mapsLinkUrl, site, waDefault } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer data-chapter="light" className="bg-paper text-ink">
      <div className="container-page py-20 md:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[420px]">
            <Image
              src="/brand/logo-wordmark.png"
              alt="Nexora Data"
              width={679}
              height={264}
              className="h-auto w-full max-w-[340px]"
            />
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
              Servis HP, laptop, dan PC di Pulo Gebang. Diagnosa gratis, harga
              disepakati sebelum dikerjakan, bergaransi {site.guarantee}.
            </p>
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-electric"
            >
              Chat WhatsApp
            </a>
          </div>

          <div className="grid flex-1 gap-10 sm:grid-cols-2 lg:max-w-[620px] lg:grid-cols-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-soft">
                Lokasi
              </h2>
              <address className="mt-4 not-italic text-[15px] leading-relaxed">
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
                Buka di Google Maps
              </a>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-ink-soft">
                Jam buka
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed">
                {site.hours.days}
                <br />
                {site.hours.open} – {site.hours.close}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {site.hours.note}
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-ink-soft">
                Kontak
              </h2>
              <a
                href={`tel:+${site.phone.intl}`}
                className="mt-4 block text-[15px] font-semibold"
              >
                {site.phone.display}
              </a>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-[15px] underline decoration-electric decoration-2 underline-offset-4"
              >
                {site.instagram.handle}
              </a>
              <Link href="/kontak" className="mt-2 block text-[15px]">
                Formulir kontak
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 text-[14px] leading-relaxed text-ink-soft">
          <p className="max-w-[52ch]">
            Foto di situs ini berasal dari koleksi terbuka dan hanya
            menggambarkan dunia servis, bukan perangkat atau tim Nexora Data:{" "}
            {imageCredits.map((credit, index) => (
              <span key={credit.title}>
                {index > 0 ? " · " : " "}
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {credit.title}
                </a>{" "}
                oleh {credit.author} ({credit.licence})
              </span>
            ))}
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 {site.name}. Semua harga adalah estimasi dan dikonfirmasi
              setelah diagnosa.
            </p>
            <a href="#konten" className="font-semibold text-ink">
              Kembali ke atas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
