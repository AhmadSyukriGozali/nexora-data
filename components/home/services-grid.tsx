import {
  Building2,
  Database,
  Laptop,
  Monitor,
  Printer,
  Smartphone,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui/section";

type ServiceCard = {
  title: [string, string];
  icon: LucideIcon;
  href: string;
};

const services: ServiceCard[] = [
  { title: ["Servis", "Laptop"], icon: Laptop, href: "/layanan#laptop" },
  { title: ["Servis", "Handphone"], icon: Smartphone, href: "/layanan#hp" },
  { title: ["Servis", "PC / Komputer"], icon: Monitor, href: "/layanan#pc" },
  { title: ["Servis", "Printer"], icon: Printer, href: "/layanan#printer" },
  { title: ["Jaringan &", "Network"], icon: Wifi, href: "/kontak" },
  { title: ["Pemulihan", "Data"], icon: Database, href: "/layanan" },
  { title: ["Maintenance", "& Upgrade"], icon: Wrench, href: "/layanan" },
  { title: ["IT Support", "Kantor"], icon: Building2, href: "/kontak" },
];

/** Delapan kartu layanan, mengikuti urutan pada desain referensi. */
export function ServicesGrid() {
  return (
    <Section
      id="layanan"
      tone="paper"
      className="scroll-mt-20 bg-[#f4f8ff] pb-6 pt-6 md:pt-10"
    >
      <div className="mx-auto w-full max-w-[1340px] px-5 md:px-10">
        <Reveal variant="mask">
          <h2 className="flex items-center justify-center gap-5 text-center font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold tracking-tight text-[#061836]">
            <span
              aria-hidden="true"
              className="hidden h-[3px] w-24 rounded-full bg-[#2f7bff]/60 sm:block"
            />
            Layanan Kami
            <span
              aria-hidden="true"
              className="hidden h-[3px] w-24 rounded-full bg-[#2f7bff]/60 sm:block"
            />
          </h2>
        </Reveal>

        <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-4">
          {services.map(({ title, icon: Icon, href }, index) => (
            <li key={title.join(" ")}>
              <Reveal delay={index * 45} variant="scale" className="h-full">
                <Link
                  href={href}
                  className="group flex h-full min-h-[136px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#dbe7ff] bg-[#e8f1ff] px-2 py-5 text-center shadow-[0_10px_24px_-18px_rgba(30,94,255,0.6)] transition duration-300 hover:-translate-y-1.5 hover:border-[#2f7bff]/50 hover:bg-white hover:shadow-[0_20px_30px_-16px_rgba(30,94,255,0.5)]"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.7}
                    className="h-11 w-11 text-[#0d47b8] transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="text-[15px] font-bold leading-tight text-[#061836]">
                    {title[0]}
                    <br />
                    {title[1]}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}