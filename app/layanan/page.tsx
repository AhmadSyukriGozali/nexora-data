import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { estimates, type DeviceKey } from "@/lib/content";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Layanan Servis HP, Laptop, PC & Printer",
  description:
    "Rincian layanan servis HP, laptop, PC, dan printer di Nexora Data Pulo Gebang: layar, baterai, motherboard, upgrade RAM/SSD, rakit PC, servis printer, dan pemulihan data.",
  alternates: { canonical: "/layanan" },
  openGraph: {
    title: "Layanan Servis HP, Laptop, PC & Printer · Nexora Data",
    description:
      "Layar, baterai, motherboard, upgrade RAM/SSD, rakit PC, servis printer, dan pemulihan data di Jakarta Timur.",
    url: "/layanan",
  },
};

type ServiceBlock = {
  device: DeviceKey;
  title: string;
  lead: string;
  image: string;
  alt: string;
};

const serviceBlocks: ServiceBlock[] = [
  {
    device: "hp",
    title: "Servis HP",
    lead: "Dari layar pecah sampai ponsel yang tidak mau menyala setelah kena air. Pengerjaan board dikerjakan di tempat, bukan dikirim ke pihak ketiga.",
    image: "/images/repair-lab.webp",
    alt: "Teknisi membuka cangkang ponsel dengan alat presisi di meja kerja",
  },
  {
    device: "laptop",
    title: "Servis Laptop",
    lead: "Laptop lambat, layar bergaris, engsel patah, atau mati total. Kami cek dulu apakah perbaikannya masih sepadan dengan harga perangkat.",
    image: "/images/laptop-repair-tall.webp",
    alt: "Bagian dalam laptop terbuka memperlihatkan baterai, kipas, dan slot memori",
  },
  {
    device: "pc",
    title: "Servis PC",
    lead: "PC rakitan yang tidak menyala, panas berlebih, atau butuh upgrade. Untuk rakit baru, kami bantu pilih part sesuai budget dan kebutuhan.",
    image: "/images/motherboard-6.webp",
    alt: "Motherboard komputer dengan soket prosesor dan slot memori terlihat dari dekat",
  },
  {
    device: "printer",
    title: "Servis Printer",
    lead: "Cetakan bergaris, kertas macet, tinta tidak keluar, atau printer yang tidak terdeteksi. Kami tangani inkjet, laser, dan multifungsi.",
    image: "/images/printer-repair.webp",
    alt: "Teknisi memeriksa bagian dalam printer yang sudah dibuka",
  },
];

export default function LayananPage() {
  return (
    <>
      <Section tone="paper" className="page-top">
        <div className="container-page pb-8 md:pb-12">
          <Reveal>
            <h1 className="display-xl text-[clamp(2.2rem,5vw,3.6rem)] text-ink">
              Layanan
            </h1>
          </Reveal>
          <Reveal delay={60}>
            <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
              Servis HP, laptop, PC, dan printer di Pulo Gebang, Cakung,
              Jakarta Timur. Diagnosa gratis, harga disepakati lebih dulu.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <nav aria-label="Layanan per perangkat" className="mt-6 flex flex-wrap gap-2">
              {serviceBlocks.map((block) => (
                <a
                  key={block.device}
                  href={`#${block.device}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:border-ink/30"
                >
                  {estimates[block.device].label}
                </a>
              ))}
            </nav>
          </Reveal>
        </div>
      </Section>

      {serviceBlocks.map((block, index) => {
        const data = estimates[block.device];
        const imageFirst = index % 2 === 0;

        return (
          <Section
            key={block.device}
            id={block.device}
            tone="paper"
            className={
              index > 0
                ? "scroll-mt-24 border-t border-line"
                : "scroll-mt-24"
            }
          >
            <div className="container-page section-pad">
              <div className="grid items-start gap-y-8 md:grid-cols-12 md:gap-x-12">
                <Reveal
                  className={
                    imageFirst
                      ? "md:col-span-5"
                      : "md:col-span-5 md:order-2"
                  }
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep">
                    <Image
                      src={block.image}
                      alt={block.alt}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <div
                  className={
                    imageFirst
                      ? "md:col-span-7"
                      : "md:col-span-7 md:order-1"
                  }
                >
                  <Reveal>
                    <h2 className="display-lg text-[clamp(1.8rem,3.4vw,2.8rem)] text-ink">
                      {block.title}
                    </h2>
                    <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft md:text-[17px]">
                      {block.lead}
                    </p>
                  </Reveal>

                  <Reveal delay={60}>
                    <ul className="mt-6 border-t border-line">
                      {data.items.map((item) => (
                        <li
                          key={item.issue}
                          className="flex items-baseline justify-between gap-6 border-b border-line py-3 text-[15px] md:text-[16px]"
                        >
                          <span className="text-ink-soft">{item.issue}</span>
                          <span className="shrink-0 tabular-nums text-ink">
                            {item.price}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 max-w-[58ch] text-[14px] leading-relaxed text-ink-soft">
                      {data.note}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <a
                        href={waLink(
                          `Halo Nexora Data, saya mau servis ${data.full.toLowerCase()}. Bisa dibantu cek estimasinya?`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-navy"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Tanya soal {data.label}
                      </a>
                      <Link
                        href="/tarif"
                        className="text-[14px] font-semibold text-ink underline underline-offset-4 hover:text-electric"
                      >
                        Lihat estimasi biaya
                      </Link>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </Section>
        );
      })}

      <Section tone="navy">
        <div className="container-page section-pad">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="display-lg text-[clamp(1.7rem,3vw,2.4rem)] text-white">
                Belum yakin rusaknya?
              </h2>
              <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-dim">
                Bawa perangkatnya ke {site.address.line2}. Diagnosa gratis, dan
                kamu tetap boleh pulang tanpa perbaikan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={waLink(
                  "Halo Nexora Data, saya belum tahu kerusakan perangkat saya. Bisa dibantu diagnosa?",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat WhatsApp
              </a>
              <a
                href={`tel:+${site.phone.intl}`}
                className="text-[15px] font-semibold text-white underline underline-offset-4"
              >
                {site.phone.display}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
