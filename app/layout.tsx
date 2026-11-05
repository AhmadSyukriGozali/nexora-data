import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { Cursor } from "@/components/motion/cursor";
import { MotionProvider } from "@/components/motion/motion-provider";
import { RouteWipe } from "@/components/motion/route-wipe";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import { localBusinessJsonLd } from "@/lib/structured-data";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Servis HP, Laptop, PC & Printer Jakarta Timur · Nexora Data",
    template: "%s · Nexora Data",
  },
  description: site.description,
  keywords: [
    "servis HP Jakarta Timur",
    "servis laptop Jakarta Timur",
    "servis PC Cakung",
    "servis printer Jakarta Timur",
    "ganti LCD laptop",
    "service HP Pulo Gebang",
    "upgrade SSD laptop",
    "Nexora Data",
  ],
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: site.url,
    siteName: site.name,
    title: "Servis HP, Laptop, PC & Printer Jakarta Timur · Nexora Data",
    description: site.description,
    images: [
      {
        url: "/brand/og-nexora.jpg",
        width: 1200,
        height: 630,
        alt: "Nexora Data: servis HP, laptop, PC, dan printer di Jakarta Timur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servis HP, Laptop, PC & Printer Jakarta Timur · Nexora Data",
    description: site.description,
    images: ["/brand/og-nexora.jpg"],
  },
  robots: { index: true, follow: true },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#061024",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${sora.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <script
          // Adds the class that enables reveal transitions, before first paint.
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </head>
      <body className="min-h-full bg-navy text-chrome">
        <MotionProvider>
          <a
            href="#konten"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-80 focus:bg-electric focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
          >
            Lompat ke konten
          </a>
          <div aria-hidden="true" className="grain" />
          <SiteHeader />
          <main id="konten">{children}</main>
          <SiteFooter />
          <RouteWipe />
          <Cursor />
        </MotionProvider>
      </body>
    </html>
  );
}
