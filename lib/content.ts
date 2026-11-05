/**
 * Customer-facing copy and price estimates.
 * The numbers are starting points: replace them with the shop's real
 * prices before the site goes live.
 */

import { site } from "./site";

export const capabilities = [
  {
    title: "Ganti LCD & layar",
    description:
      "Panel LCD, OLED, dan touchscreen untuk HP, laptop, dan All-in-One. Dites menyala dan tanpa garis sebelum diserahkan.",
  },
  {
    title: "Baterai & pengisian",
    description:
      "Baterai drop, konektor longgar, atau IC charger yang sudah tidak mengalirkan daya ke perangkat.",
  },
  {
    title: "Motherboard & cairan",
    description:
      "Cuci board, reball, dan perbaikan jalur akibat kena air, korsleting, atau panas berlebih.",
  },
  {
    title: "Upgrade RAM & SSD",
    description:
      "Cara paling murah membuat laptop lama terasa baru, tanpa harus mengganti perangkatnya.",
  },
  {
    title: "Rakit & servis PC",
    description:
      "Dari pemilihan part, perakitan, instalasi sistem, sampai bersih-bersih debu dan repasta.",
  },
  {
    title: "Pemulihan data",
    description:
      "Drive yang tidak terbaca, file terhapus, atau sistem yang tidak mau boot masih bisa diselamatkan.",
  },
  {
    title: "Servis printer",
    description:
      "Head bergaris, kertas macet, tinta tidak keluar, sampai unit yang tidak terdeteksi. Inkjet, laser, dan printer multifungsi.",
  },
] as const;

export const processSteps = [
  {
    title: "Pertama, ceritakan keluhannya.",
    description:
      "Datang langsung atau kirim pesan WhatsApp. Kami tanya riwayat dan kondisi perangkatnya dulu.",
  },
  {
    title: "Lalu kami diagnosa gratis.",
    description:
      "Pemeriksaan awal tanpa biaya: cek komponen, tes beban, dan pastikan sumber masalahnya.",
  },
  {
    title: "Harga disepakati sebelum dibongkar.",
    description:
      "Kamu terima rincian part dan jasa. Tidak ada biaya tambahan tanpa persetujuanmu.",
  },
  {
    title: "Selesai, bergaransi dua minggu.",
    description:
      "Kami uji ulang sebelum diserahkan. Garansi 14 hari untuk jasa dan part yang kami pasang.",
  },
] as const;

export const promiseItems = [
  {
    term: "Diagnosa",
    detail: "Gratis, tanpa kewajiban melanjutkan perbaikan.",
  },
  {
    term: "Rincian biaya",
    detail: "Part dan jasa disebut satu per satu sebelum dibongkar.",
  },
  {
    term: "Garansi",
    detail: `${site.guarantee} untuk pemasangan dan part dari kami.`,
  },
] as const;

export type DeviceKey = "hp" | "laptop" | "pc" | "printer";

type DeviceEstimates = {
  label: string;
  full: string;
  note: string;
  items: { issue: string; price: string; detail: string }[];
};

export const estimates: Record<DeviceKey, DeviceEstimates> = {
  hp: {
    label: "HP",
    full: "Handphone",
    note: "Harga panel dan baterai sangat tergantung tipe perangkat. Diagnosa gratis memastikan part yang dibutuhkan.",
    items: [
      {
        issue: "Layar pecah atau blank",
        price: "Rp200 rb – Rp1,2 jt",
        detail: "Tergantung tipe panel dan apakah touchscreen ikut diganti.",
      },
      {
        issue: "Baterai cepat habis",
        price: "Rp150 rb – Rp450 rb",
        detail:
          "Baterai pengganti berkapasitas setara, dites pemakaian 30 menit.",
      },
      {
        issue: "Tidak mau mengisi daya",
        price: "Rp100 rb – Rp350 rb",
        detail: "Dari konektor, flex, sampai IC charger di board.",
      },
      {
        issue: "Kena air atau mati total",
        price: "Rp150 rb – Rp500 rb",
        detail: "Cuci board dan pengecekan jalur yang terkena korosi.",
      },
      {
        issue: "Kamera atau sensor",
        price: "Rp200 rb – Rp600 rb",
        detail: "Kamera depan, belakang, dan modul yang terhubung dengannya.",
      },
      {
        issue: "Bootloop atau software",
        price: "Rp100 rb – Rp250 rb",
        detail: "Instalasi ulang, pemulihan data, dan cek kesehatan hardware.",
      },
    ],
  },

  laptop: {
    label: "Laptop",
    full: "Laptop & notebook",
    note: "Ukuran dan tipe panel menentukan harga layar. Kami konfirmasi part sebelum memesan.",
    items: [
      {
        issue: "Layar pecah atau bergaris",
        price: "Rp700 rb – Rp2 jt",
        detail: "Panel 11–15 inci; harga ikut ukuran dan tipe panel.",
      },
      {
        issue: "Baterai drop",
        price: "Rp300 rb – Rp800 rb",
        detail: "Baterai baru, dites sampai indikator pengisian normal.",
      },
      {
        issue: "Keyboard tidak berfungsi",
        price: "Rp250 rb – Rp700 rb",
        detail: "Ganti keyboard atau perbaikan jalur pada board.",
      },
      {
        issue: "Upgrade RAM & SSD",
        price: "Rp250 rb – Rp900 rb",
        detail: "Termasuk cloning data dari drive lama ke drive baru.",
      },
      {
        issue: "Mati total atau kena air",
        price: "Rp500 rb – Rp2,5 jt",
        detail: "Diagnosa motherboard dan perbaikan komponen yang rusak.",
      },
      {
        issue: "Engsel atau casing patah",
        price: "Rp250 rb – Rp700 rb",
        detail: "Perbaikan rangka dan pemasangan ulang seluruh komponen.",
      },
    ],
  },

  pc: {
    label: "PC",
    full: "PC & desktop",
    note: "Untuk rakit PC, jasa tetap Rp750 rb. Harga part mengikuti spesifikasi pilihanmu.",
    items: [
      {
        issue: "Tidak mau menyala",
        price: "Rp150 rb – Rp500 rb",
        detail: "Cek PSU, RAM, dan jalur power secara berurutan.",
      },
      {
        issue: "Bersih debu & repasta",
        price: "Rp150 rb – Rp300 rb",
        detail: "Untuk PC dan laptop, termasuk pengecekan suhu setelahnya.",
      },
      {
        issue: "Upgrade RAM & SSD",
        price: "Rp250 rb – Rp1,2 jt",
        detail: "Termasuk instalasi dan cloning sistem operasi.",
      },
      {
        issue: "Ganti PSU atau casing",
        price: "Rp300 rb – Rp900 rb",
        detail: "Part disesuaikan dengan kebutuhan daya dan ukuran board.",
      },
      {
        issue: "Rakit PC baru",
        price: "Rp200 rb – Rp750 rb",
        detail: "Jasa rakit, instalasi sistem, dan tes beban sebelum diserahkan.",
      },
      {
        issue: "Recovery data",
        price: "Rp300 rb – Rp1,5 jt",
        detail: "Tergantung kondisi drive dan jumlah data yang diselamatkan.",
      },
    ],
  },

  printer: {
    label: "Printer",
    full: "Printer & multifungsi",
    note: "Harga print head sangat tergantung seri printer. Kalau biaya perbaikan mendekati harga unit baru, kami akan bilang terus terang sebelum kamu memutuskan.",
    items: [
      {
        issue: "Hasil cetak bergaris atau pudar",
        price: "Rp100 rb – Rp300 rb",
        detail:
          "Head cleaning sampai flushing; bila head rusak, penggantian dibahas terpisah.",
      },
      {
        issue: "Kertas macet atau tidak tertarik",
        price: "Rp100 rb – Rp300 rb",
        detail: "Roller, paper feed, dan sensor kertas dibersihkan atau diganti.",
      },
      {
        issue: "Printer tidak terdeteksi",
        price: "Rp100 rb – Rp300 rb",
        detail:
          "Cek kabel, port, driver, dan koneksi Wi-Fi sebelum menyentuh hardware.",
      },
      {
        issue: "Isi tinta atau refill toner",
        price: "Rp50 rb – Rp250 rb",
        detail:
          "Jasa isi dan bersih-bersih; harga tinta atau toner dihitung terpisah.",
      },
      {
        issue: "Reset waste ink pad",
        price: "Rp100 rb – Rp300 rb",
        detail:
          "Reset counter dan ganti pad bila sudah jenuh, supaya tidak bocor.",
      },
      {
        issue: "Ganti print head",
        price: "Rp400 rb – Rp1,5 jt",
        detail:
          "Part original atau OEM, dites nozzle check sebelum diserahkan.",
      },
      {
        issue: "Mati total atau board",
        price: "Rp300 rb – Rp2 jt",
        detail:
          "Adaptor/PSU diperiksa dulu; penggantian mainboard dikonfirmasi sebelum dikerjakan.",
      },
    ],
  },
};

export const deviceOrder: DeviceKey[] = ["hp", "laptop", "pc", "printer"];

/** Compact price table shown on large screens; the mobile layout reuses it. */
export const priceRows = [
  {
    action: "Ganti layar",
    hp: "350 rb – 1,2 jt",
    laptop: "700 rb – 2 jt",
    pc: "600 rb – 1,8 jt",
    printer: "—",
  },
  {
    action: "Ganti baterai",
    hp: "150 – 450 rb",
    laptop: "300 – 800 rb",
    pc: "—",
    printer: "—",
  },
  {
    action: "Servis kena air",
    hp: "150 – 500 rb",
    laptop: "500 rb – 2 jt",
    pc: "300 – 800 rb",
    printer: "—",
  },
  {
    action: "Upgrade RAM & SSD",
    hp: "250 – 700 rb",
    laptop: "250 – 900 rb",
    pc: "250 rb – 1,2 jt",
    printer: "—",
  },
  {
    action: "Bersih debu & repasta",
    hp: "100 – 200 rb",
    laptop: "150 – 300 rb",
    pc: "150 – 300 rb",
    printer: "100 – 300 rb",
  },
  {
    action: "Recovery data",
    hp: "300 rb – 1,5 jt",
    laptop: "300 rb – 1,5 jt",
    pc: "300 rb – 1,5 jt",
    printer: "—",
  },
  {
    action: "Servis head & flushing",
    hp: "—",
    laptop: "—",
    pc: "—",
    printer: "75 – 450 rb",
  },
  {
    action: "Kertas macet",
    hp: "—",
    laptop: "—",
    pc: "—",
    printer: "100 – 300 rb",
  },
  {
    action: "Isi tinta / toner",
    hp: "—",
    laptop: "—",
    pc: "—",
    printer: "50 – 250 rb",
  },
  {
    action: "Ganti print head / board",
    hp: "—",
    laptop: "—",
    pc: "—",
    printer: "400 rb – 2 jt",
  },
] as const;

export const faqs = [
  {
    question: "Berapa lama pengerjaannya?",
    answer:
      "Untuk kasus ringan seperti ganti baterai, keyboard, atau upgrade SSD, perangkat biasanya selesai di hari yang sama. Kerusakan board atau penggantian part khusus butuh satu sampai tiga hari kerja karena menunggu stok.",
  },
  {
    question: "Apakah diagnosa benar-benar gratis?",
    answer:
      "Ya. Pemeriksaan awal tidak dikenakan biaya, termasuk saat kamu memutuskan tidak melanjutkan perbaikan. Yang berbayar hanya jasa dan part yang kamu setujui.",
  },
  {
    question: "Apa saja yang ditanggung garansi dua minggu?",
    answer:
      "Garansi menutup jasa pemasangan dan part yang kami sediakan. Jika masalah yang sama muncul kembali dalam 14 hari, perangkat diperiksa dan diperbaiki ulang tanpa biaya tambahan. Kerusakan baru akibat jatuh atau cairan tidak termasuk.",
  },
  {
    question: "Bisakah saya menunggu di tempat?",
    answer:
      "Bisa, untuk pekerjaan singkat seperti upgrade RAM, SSD, atau pembersihan. Untuk perbaikan board, kami sarankan meninggalkan perangkat dan dihubungi lewat WhatsApp saat selesai.",
  },
  {
    question: "Apakah part yang dipakai original?",
    answer:
      "Kami menawarkan dua pilihan: part original atau OEM berkualitas, dan selalu menyebutkan mana yang dipakai beserta selisih harganya sebelum pengerjaan dimulai.",
  },
  {
    question: "Bagaimana kalau data saya hilang?",
    answer:
      "Sebelum membongkar, kami tanyakan apakah ada data yang harus diselamatkan. Untuk kasus drive rusak, pemulihan dikerjakan terpisah dan hasilnya tidak selalu bisa 100 persen, tergantung kondisi media.",
  },
  {
    question: "Bisa kirim perangkat dari luar kota?",
    answer:
      "Bisa. Hubungi WhatsApp admin untuk konfirmasi alamat dan ekspedisi yang dipakai. Biaya pengiriman pulang-pergi ditanggung pemilik perangkat.",
  },
  {
    question: "Printer saya hasil cetaknya bergaris, apakah bisa diperbaiki?",
    answer:
      "Bisa. Garis atau warna pudar biasanya berasal dari head yang kering atau tersumbat. Kami mulai dari head cleaning dan flushing; kalau hasilnya belum membaik, baru dibahas penggantian print head beserta biayanya. Printer laser yang hasilnya kotor juga bisa dibersihkan tanpa bongkar penuh.",
  },
  {
    question: "Metode pembayaran apa saja?",
    answer:
      "Tunai, transfer bank, dan QRIS. Pembayaran dilakukan setelah perangkat dites dan kamu pastikan kondisinya sesuai kesepakatan.",
  },
] as const;

/**
 * Placeholder claim numbers from the owner. Keep them out of the rendered
 * page until the business verifies each one.
 */
export const claimsPlaceholder = {
  founded: "08-mei-2026",
  devicesFixed: "500+",
  rating: "4,9/5",
} as const;
