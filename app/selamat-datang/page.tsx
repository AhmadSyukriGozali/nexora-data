import type { Metadata } from "next";
import { WelcomePortal } from "@/components/welcome/welcome-portal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Selamat Datang",
  description: `Selamat datang di ${site.name}. ${site.description}`,
  alternates: { canonical: "/selamat-datang" },
};

export default function WelcomePage() {
  return <WelcomePortal />;
}
