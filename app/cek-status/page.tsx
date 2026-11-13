import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusChecker } from "@/components/order-status-checker";
import { Reveal } from "@/components/reveal";
import { TestimonialForm } from "@/components/testimonial-form";
import { ButtonLink } from "@/components/ui/button-link";
import { Section } from "@/components/ui/section";
import { site, waDefault } from "@/lib/site";
import { TICKET_NUMBER_PLACEHOLDER } from "@/lib/tickets/ticket-number";

export const metadata: Metadata = {
  title: "Cek Status Servis",
  description:
    "Lacak progres servis HP, laptop, PC, atau printer di Nexora Data. Masukkan nomor tiket dan 4 digit terakhir nomor HP untuk melihat status terbaru.",
  alternates: { canonical: "/cek-status" },
  openGraph: {
    title: "Cek Status Servis · Nexora Data",
    description:
      "Masukkan nomor tiket dan 4 digit terakhir nomor HP untuk melihat progres perbaikan perangkat Anda.",
    url: "/cek-status",
  },
};

const statusGuide = [
  {
    label: "Masuk",
    detail: "Perangkat sudah diterima dan dicatat oleh admin.",
  },
  {
    label: "Diagnosa",
    detail: "Teknisi memeriksa penyebab kerusakan dan kebutuhan part.",
  },
  {
    label: "Menunggu persetujuan",
    detail: "Estimasi biaya menunggu konfirmasi dari pelanggan.",
  },
  {
    label: "Dikerjakan",
    detail: "Perbaikan sedang berlangsung di meja teknisi.",
  },
  {
    label: "Menunggu sparepart",
    detail: "Perbaikan tertunda karena sparepart sedang dipesan.",
  },
  {
    label: "Selesai",
    detail: "Perangkat sudah lolos pengecekan dan siap diambil.",
  },
  {
    label: "Diambil",
    detail: "Perangkat sudah diserahkan kembali ke pelanggan.",
  },
];

export default function CekStatusPage() {
  return (
    <>
      <Section tone="navy" className="pb-16 pt-[140px] md:pb-24 md:pt-[180px]">
        <div className="container-page grid gap-12 md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-5">
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-electric-soft">
                Status servis
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display-xl mt-4 text-[clamp(2.9rem,8vw,7rem)] text-chrome">
                Cek Servis
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-6 max-w-[48ch] text-[18px] leading-relaxed text-dim md:text-[19px]">
                Lihat sudah sampai mana perangkat Anda dikerjakan. Cukup
                masukkan nomor tiket dan 4 digit terakhir nomor HP yang dipakai
                saat servis.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 border-l-2 border-electric pl-5">
                <p className="text-[15px] font-semibold text-chrome">
                  Nomor tiket ada di struk servis
                </p>
                <p className="mt-1 max-w-[42ch] text-[14px] leading-relaxed text-dim">
                  Formatnya seperti {TICKET_NUMBER_PLACEHOLDER}. Kalau struk
                  hilang, hubungi admin lewat WhatsApp dengan menyebutkan nama
                  dan perangkat Anda.
                </p>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={waDefault} tone="on-dark">
                  Tanya via WhatsApp
                </ButtonLink>
                <Link
                  href="/layanan"
                  className="inline-flex items-center border border-white/20 px-6 py-3.5 text-[15px] font-semibold text-chrome transition-colors hover:border-white/50"
                >
                  Lihat layanan
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={140} className="md:col-span-7">
            <OrderStatusChecker />
          </Reveal>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page section-pad">
          <Reveal>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.6rem)] font-semibold tracking-[-0.02em] text-ink">
              Arti status servis
            </h2>
          </Reveal>

          <Reveal delay={70}>
            <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
              Setiap perubahan status dicatat oleh teknisi. Status yang tampil
              di halaman cek servis adalah status terbaru perangkat Anda.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {statusGuide.map((item, index) => (
              <Reveal key={item.label} delay={index * 40}>
                <div className="h-full bg-paper p-6">
                  <p className="font-mono text-[12px] text-electric">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-[18px] font-semibold text-ink">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-8 border border-ink/15 p-5">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">
                  Status dibatalkan
                </span>{" "}
                berarti servis tidak dilanjutkan, misalnya karena biaya tidak
                disepakati atau perangkat diambil kembali. Hubungi admin di{" "}
                <a
                  href={waDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-electric decoration-2 underline-offset-4"
                >
                  {site.phone.display}
                </a>{" "}
                untuk detailnya.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="navy" className="section-pad">
        <div className="container-page grid gap-12 md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-5">
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-electric-soft">
                Testimoni
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-[-0.02em] text-chrome">
                Ceritakan pengalaman servis Anda
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-dim">
                Ulasan Anda membantu pelanggan lain memilih tempat servis. Admin
                memeriksa setiap testimoni sebelum tayang di halaman depan.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <ul className="mt-8 space-y-3 border-l-2 border-electric pl-5 text-[14px] leading-relaxed text-dim">
                <li>Nama tampil disingkat, misalnya “Budi S.”.</li>
                <li>Nomor HP tidak pernah dipublikasikan.</li>
                <li>Hanya testimoni yang disetujui yang tampil.</li>
              </ul>
            </Reveal>
          </div>

          <Reveal delay={140} className="md:col-span-7">
            <TestimonialForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
