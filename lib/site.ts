/**
 * Everything a visitor can act on: who the business is, where it is,
 * and how to reach it. Prices and service copy live in `content.ts`.
 */
export const site = {
  name: "Nexora Data",
  url: "https://nexora-data-service.vercel.app",
  description:
    "Servis HP, laptop, PC, dan printer di Pulo Gebang, Cakung, Jakarta Timur. Diagnosa gratis, harga disepakati sebelum dikerjakan, garansi 2 minggu.",

  phone: {
    display: "0815 1616 343",
    intl: "628151616343",
  },

  email: {
    address: "Nexora.dat4@gmail.com",
    url: "mailto:Nexora.dat4@gmail.com"
  },

  instagram: {
    handle: "@nexora.data.official",
    url: "https://www.instagram.com/nexora.data.official",
  },

  address: {
    line1: "Jl. Raya Pulo Gebang No. 8, RT.5/RW.6",
    line2: "Pulo Gebang, Kec. Cakung",
    city: "Jakarta Timur",
    region: "DKI Jakarta",
    postal: "13950",
    full: "Jl. Raya Pulo Gebang No. 8, RT.5/RW.6, Pulo Gebang, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13950",
    url: "https://maps.app.goo.gl/KQG9dxC7FcW3DvvU8"
  },

  hours: {
    days: "Setiap hari",
    open: "09.30",
    close: "21.30",
    note: "Termasuk Sabtu, Minggu, dan hari libur nasional.",
  },

  guarantee: "Perpanjang",
} as const;

/** Builds a wa.me link with a pre-filled message. */
export function waLink(message: string) {
  return `https://wa.me/${site.phone.intl}?text=${encodeURIComponent(message)}`;
}

export const waDefault = waLink(
  "Halo Nexora Data, saya mau tanya soal servis perangkat saya.",
);

/**
 * A plain-text place query is what the embed endpoint can actually resolve;
 * the share link alone renders an empty map with a warning.
 */
const mapQuery = encodeURIComponent(`${site.name}, ${site.address.full}`);

export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&z=17&output=embed`;

/** The owner-provided share link opens the exact business listing. */
export const mapsLinkUrl = site.address.url;
