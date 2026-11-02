import { site } from "./site";

/** Structured data for the shop. Coordinates are an approximation of Pulo Gebang. */
export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.url}/#bisnis`,
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/brand/og-nexora.jpg`,
  logo: `${site.url}/brand/logo-wordmark.png`,
  telephone: `+${site.phone.intl}`,
  priceRange: "Rp100.000 – Rp2.500.000",
  currenciesAccepted: "IDR",
  paymentAccepted: "Tunai, Transfer Bank, QRIS",
  serviceType: [
    "Servis handphone",
    "Servis laptop",
    "Servis PC dan desktop",
    "Upgrade RAM dan SSD",
    "Pemulihan data",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.line1,
    addressLocality: site.address.line2,
    addressRegion: site.address.region,
    postalCode: site.address.postal,
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -6.2106,
    longitude: 106.9417,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: site.hours.open.replace(".", ":"),
      closes: site.hours.close.replace(".", ":"),
    },
  ],
  sameAs: [site.instagram.url],
  areaServed: [
    { "@type": "City", name: "Jakarta Timur" },
    { "@type": "AdministrativeArea", name: "DKI Jakarta" },
  ],
  hasMap: site.address.url,
};

type FaqEntry = { question: string; answer: string };

/** FAQPage markup, built from the same list the page renders. */
export function faqJsonLd(items: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
