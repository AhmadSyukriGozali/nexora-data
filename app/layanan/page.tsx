import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
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
  tone: "paper" | "navy";
};

const serviceBlocks: ServiceBlock[] = [
  {
    device: "hp",
    title: "Servis HP",
    lead: "Dari layar pecah sampai ponsel yang tidak mau menyala setelah kena air. Pengerjaan board dikerjakan di tempat, bukan dikirim ke pihak ketiga.",
    image: "/images/repair-lab.webp",
    alt: "Teknisi membuka cangkang ponsel dengan alat presisi di meja kerja",
    tone: "paper",
  },
  {
    device: "laptop",
    title: "Servis Laptop",
    lead: "Laptop lambat, layar bergaris, engsel patah, atau mati total. Kami cek dulu apakah perbaikannya masih sepadan dengan harga perangkat.",
    image: "/images/laptop-repair-tall.webp",
    alt: "Bagian dalam laptop terbuka memperlihatkan baterai, kipas, dan slot memori",
    tone: "navy",
  },
  {
    device: "pc",
    title: "Servis PC",
    lead: "PC rakitan yang tidak menyala, panas berlebih, atau butuh upgrade. Untuk rakit baru, kami bantu pilih part sesuai budget dan kebutuhan.",
    image: "/images/motherboard-6.webp",
    alt: "Motherboard komputer dengan soket prosesor dan slot memori terlihat dari dekat",
    tone: "paper",
  },
  {
    device: "printer",
    title: "Servis Printer",
    lead: "Cetakan bergaris, kertas macet, tinta tidak keluar, atau printer yang tidak terdeteksi. Kami tangani inkjet, laser, dan multifungsi, termasuk reset waste ink dan penggantian print head.",
    image: "/images/printer-repair.webp",
    alt: "Teknisi memeriksa bagian dalam printer yang sudah dibuka",
    tone: "navy",
  },
];

export default function LayananPage() {
  return (
    <>
      <Section tone="navy" className="pb-16 pt-[140px] md:pb-24 md:pt-[190px]">
        <div className="container-page">
          <Reveal>
            <h1 className="display-xl text-[clamp(2.9rem,8vw,7.5rem)] text-chrome">
              Layanan
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-[54ch] text-[18px] leading-relaxed text-dim md:text-[19px]">
              Servis HP, laptop, PC, dan printer di Pulo Gebang, Cakung,
              Jakarta Timur. Diagnosa gratis, harga disepakati lebih dulu.
            </p>
          </Reveal>
        </div>
      </Section>

      {serviceBlocks.map((block, index) => {
        const data = estimates[block.device];
        const isPaper = block.tone === "paper";
        const imageFirst = index % 2 === 0;

        return (
          <Section
            key={block.device}
            id={block.device}
            tone={block.tone}
            className="scroll-mt-24"
          >
            <div className="container-page section-pad">
              <div className="grid items-start gap-y-10 md:grid-cols-12 md:gap-x-14">
                <Reveal
                  className={
                    imageFirst
                      ? "md:col-span-5"
                      : "md:col-span-5 md:order-2"
                  }
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={block.image}
                      alt={block.alt}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="drift object-cover"
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
                    <h2 className="display-lg text-[clamp(2.1rem,4.4vw,3.9rem)]">
                      {block.title}
                    </h2>
                    <p
                      className={`mt-4 max-w-[52ch] text-[16px] leading-relaxed md:text-[17px] ${
                        isPaper ? "text-ink-soft" : "text-dim"
                      }`}
                    >
                      {block.lead}
                    </p>
                  </Reveal>

                  <Reveal delay={80}>
                    <ul className="mt-8 space-y-1">
                      {data.items.map((item) => (
                        <li
                          key={item.issue}
                          className={cn(
                            "flex items-baseline justify-between gap-6 py-2.5 text-[15px] md:text-[16px]",
                            isPaper ? "text-ink-soft" : "text-dim",
                          )}
                        >
                          <span>{item.issue}</span>
                          <span
                            className={cn(
                              "shrink-0 tabular-nums",
                              isPaper ? "text-ink" : "text-chrome",
                            )}
                          >
                            {item.price}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p
                      className={`mt-4 max-w-[58ch] text-[14px] leading-relaxed ${
                        isPaper ? "text-ink-soft" : "text-dim"
                      }`}
                    >
                      {data.note}
                    </p>

                    <ButtonLink
                      href={waLink(
                        `Halo Nexora Data, saya mau servis ${data.full.toLowerCase()}. Bisa dibantu cek estimasinya?`,
                      )}
                      tone={isPaper ? "on-light" : "on-dark"}
                      className="mt-7"
                    >
                      Tanya soal {data.label}
                    </ButtonLink>
                  </Reveal>
                </div>
              </div>
            </div>
          </Section>
        );
      })}

      <Section tone="electric">
        <div className="container-page grid gap-10 py-16 md:grid-cols-12 md:gap-x-14 md:py-20">
          <div className="md:col-span-7">
            <h2 className="display-lg text-[clamp(1.75rem,4.4vw,3.6rem)]">
              Belum yakin rusaknya?
            </h2>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-ink/90 md:text-[18px]">
              Bawa perangkatnya ke {site.address.line2}. Diagnosa gratis, dan
              kamu tetap boleh pulang tanpa perbaikan.
            </p>
          </div>

          <div className="flex flex-col items-start gap-5 md:col-span-5 md:justify-center">
            <ButtonLink
              href={waLink(
                "Halo Nexora Data, saya belum tahu kerusakan perangkat saya. Bisa dibantu diagnosa?",
              )}
              tone="on-blue"
            >
              Chat WhatsApp
            </ButtonLink>

            <Link
              href="/#estimasi"
              className="text-[15px] font-semibold text-white underline decoration-white/60 decoration-2 underline-offset-4"
            >
              Cek estimasi biaya
            </Link>

            <a
              href={`tel:+${site.phone.intl}`}
              className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-semibold tracking-[-0.02em] text-white underline decoration-white/60 decoration-2 underline-offset-4"
            >
              {site.phone.display}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
