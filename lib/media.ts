/**
 * Photography note: these are openly licensed pictures of the repair world,
 * not photos of the Nexora Data shop or team. Replace them with real shop
 * photos before launch and keep the credit list in the footer in sync.
 */

export const imageCredits = [
  {
    title: "Laptop Repair",
    author: "Augustin Wafflart",
    licence: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Laptop_Repair.jpg",
  },
  {
    title: "Repair Lab (48115819418)",
    author: "Redaktion NdW",
    licence: "CC BY 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Repair_Lab_(48115819418).jpg",
  },
  {
    title: "Computer motherboard 6",
    author: "Kurt Kaiser",
    licence: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Computer_motherboard_6.jpg",
  },
  {
    title: "Computer motherboard 11",
    author: "Kurt Kaiser",
    licence: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Computer_motherboard_11.jpg",
  },
] as const;

/** Wide atmosphere images used between the home page sections. */
export const atmospherePhotos = {
  bench: {
    src: "/images/laptop-repair-wide.webp",
    width: 1500,
    height: 956,
    alt: "Tangan memasang modul memori ke dalam laptop yang sudah dibuka",
    caption:
      "Perangkat dibongkar untuk penggantian RAM dan pembersihan bagian dalam.",
    credit: "Augustin Wafflart, CC BY 4.0",
    motion: true,
  },
  board: {
    src: "/images/motherboard-11.webp",
    width: 1400,
    height: 1050,
    alt: "Jalur dan komponen pada motherboard komputer yang diperiksa dari dekat",
    caption:
      "Pemeriksaan jalur board dilakukan sebelum komponen apa pun diganti.",
    credit: "Kurt Kaiser, CC0",
    motion: false,
  },
} as const;

export type AtmospherePhoto =
  (typeof atmospherePhotos)[keyof typeof atmospherePhotos];
