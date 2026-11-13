import type { Metadata } from "next";
import Link from "next/link";
import { Estimate } from "@/components/estimate";
import { Reveal } from "@/components/reveal";
import { PriceTable } from "@/components/tarif/pricing";
import { Section } from "@/components/ui/section";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { site, waDefault } from "@/lib/site";

export const metadata: Metadata = {
  title: "Estimasi Biaya Servis HP, Laptop, PC & Printer",
  description:
    "Rentang biaya servis HP, laptop, PC, dan printer di Nexora Data Pulo Gebang. Pilih perangkat dan keluhan untuk melihat estimasi, lalu konfirmasi lewat WhatsApp.",
  alternates: { canonical: "/tarif" },
  openGraph: {
    title: "Estimasi Biaya Servis · Nexora Data",
    description:
      "Estimasi biaya servis HP, laptop, PC, dan printer di Jakarta Timur. Diagnosa gratis dan harga disepakati sebelum dikerjakan.",
    url: "/tarif",
  },
};

export default function TarifPage() {
  return (
    <>
      <Section tone="paper" className="page-top">
        <div className="container-page pb-10 md:pb-14">
          <Reveal>
            <h1 className="display-xl text-[clamp(2.2rem,5vw,3.6rem)] text-ink">
              Estimasi biaya
            </h1>
          </Reveal>
          <Reveal delay={60}>
            <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
              Pilih perangkat dan keluhan yang paling mendekati. Angka ini dari
              kasus yang paling sering kami tangani, bukan penawaran final.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page pb-14 md:pb-20">
          <Reveal>
            <Estimate />
          </Reveal>
        </div>
      </Section>

      <PriceTable />

      <Section tone="navy">
        <div className="container-page section-pad">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="display-lg text-[clamp(1.6rem,2.8vw,2.2rem)] text-white">
                Pembayaran setelah perangkat dites
              </h2>
              <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-dim">
                Tunai, transfer bank, dan QRIS. Pembayaran dilakukan setelah
                kamu pastikan kondisi perangkat sesuai kesepakatan.
              </p>
              <p className="mt-3 text-[14px] text-dim">
                Buka {site.hours.days.toLowerCase()}, {site.hours.open}–
                {site.hours.close}.
              </p>
              <Link
                href="/faq"
                className="mt-4 inline-block text-[14px] font-semibold text-white underline underline-offset-4"
              >
                Baca pertanyaan umum
              </Link>
            </div>

            <a
              href={waDefault}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-electric px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Tanya estimasi
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
