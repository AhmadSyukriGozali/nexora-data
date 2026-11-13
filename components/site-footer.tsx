import Image from "next/image";
import Link from "next/link";
import { imageCredits } from "@/lib/media";
import { mapsLinkUrl, site, waDefault } from "@/lib/site";

const navLinks = [
  { href: "/layanan", label: "Layanan" },
  { href: "/tarif", label: "Tarif" },
  { href: "/tentang", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
  { href: "/cek-status", label: "Cek status servis" },
  { href: "/kontak", label: "Kontak" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.7fr_0.9fr] lg:gap-16">
          <div>
            <Link href="/" aria-label={`${site.name}, beranda`}>
              <Image
                src="/brand/logo-wordmark.png"
                alt="Nexora Data"
                width={679}
                height={264}
                className="h-auto w-full max-w-[260px]"
              />
            </Link>
            <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
              Servis HP, laptop, PC, dan printer di Pulo Gebang. Diagnosa
              gratis, harga disepakati sebelum dikerjakan, bergaransi{" "}
              {site.guarantee}.
            </p>
            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center rounded-full bg-electric px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-navy"
            >
              Chat WhatsApp
            </a>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Halaman
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-ink transition-colors hover:text-electric"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Kunjungi
            </h2>
            <address className="mt-4 not-italic text-[15px] leading-relaxed text-ink">
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
              className="mt-2 inline-block text-[15px] font-semibold text-electric underline underline-offset-4"
            >
              Buka di Google Maps
            </a>

            <p className="mt-5 text-[15px] leading-relaxed text-ink">
              {site.hours.days}, {site.hours.open}–{site.hours.close}
            </p>
            <a
              href={`tel:+${site.phone.intl}`}
              className="mt-2 block text-[15px] font-semibold text-ink"
            >
              {site.phone.display}
            </a>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-[15px] text-ink-soft underline underline-offset-4"
            >
              {site.instagram.handle}
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-soft">
          <p className="max-w-[72ch]">
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

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
