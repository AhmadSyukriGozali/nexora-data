import {
  ArrowUpRight,
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
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

const devices: ServiceCard[] = [
  {
    title: "Servis HP",
    description: "Layar, baterai, konektor, sampai perbaikan board.",
    icon: Smartphone,
    href: "/layanan#hp",
  },
  {
    title: "Servis Laptop",
    description: "Layar, keyboard, engsel, upgrade RAM dan SSD.",
    icon: Laptop,
    href: "/layanan#laptop",
  },
  {
    title: "Servis PC",
    description: "Tidak menyala, panas berlebih, rakit, dan upgrade.",
    icon: Monitor,
    href: "/layanan#pc",
  },
  {
    title: "Servis Printer",
    description: "Head bergaris, kertas macet, tinta, dan board.",
    icon: Printer,
    href: "/layanan#printer",
  },
];

const extraServices = [
  { label: "Pemulihan data", icon: Database, href: "/layanan" },
  { label: "Jaringan & network", icon: Wifi, href: "/kontak" },
  { label: "Maintenance & upgrade", icon: Wrench, href: "/layanan" },
  { label: "IT support kantor", icon: Building2, href: "/kontak" },
];

export function ServicesGrid() {
  return (
    <Section id="layanan" tone="paper" className="scroll-mt-24 border-t border-line">
      <div className="container-page section-pad">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.6rem)] text-ink">
              Layanan utama
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <Link
              href="/layanan"
              className="inline-flex items-center gap-1 text-[15px] font-semibold text-electric hover:text-navy"
            >
              Detail semua layanan
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {devices.map(({ title, description, icon: Icon, href }, index) => (
            <li key={title}>
              <Reveal delay={index * 50} className="h-full">
                <Link
                  href={href}
                  className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/25"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.7}
                    className="h-7 w-7 text-electric"
                  />
                  <h3 className="mt-5 font-display text-[19px] font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {description}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {extraServices.map(({ label, icon: Icon, href }) => (
            <li key={label} className="bg-white">
              <Link
                href={href}
                className="flex items-center gap-3 px-5 py-4 text-[14px] font-medium text-ink transition-colors hover:bg-paper"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.7}
                  className="h-5 w-5 text-ink-soft"
                />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
