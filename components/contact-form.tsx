"use client";

import { useState, type FormEvent } from "react";
import { waLink } from "@/lib/site";

const devices = ["HP", "Laptop", "PC / Desktop", "Printer", "Belum tahu"];

const fieldClass =
  "w-full border border-white/12 bg-white/[0.06] px-4 py-3.5 text-[16px] " +
  "text-white placeholder:text-dim/70 transition-colors " +
  "focus:border-electric focus:bg-white/[0.1]";

/** The form never posts anywhere: it composes a WhatsApp message instead. */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("nama") ?? "").trim();
    const device = String(data.get("perangkat") ?? "").trim();
    const problem = String(data.get("keluhan") ?? "").trim();

    const message = [
      `Halo Nexora Data, saya ${name}.`,
      `Perangkat: ${device}.`,
      `Keluhan: ${problem}`,
      "Saya mau tanya estimasi dan ketersediaan part.",
    ].join("\n");

    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setOpened(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label htmlFor="nama" className="text-[15px] font-medium text-dim">
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder="Nama kamu"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="perangkat"
          className="text-[15px] font-medium text-dim"
        >
          Perangkat
        </label>
        <select
          id="perangkat"
          name="perangkat"
          required
          defaultValue=""
          className={`${fieldClass} appearance-none`}
        >
          <option value="" disabled className="text-ink">
            Pilih perangkat
          </option>
          {devices.map((device) => (
            <option key={device} value={device} className="text-ink">
              {device}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="keluhan" className="text-[15px] font-medium text-dim">
          Keluhan
        </label>
        <textarea
          id="keluhan"
          name="keluhan"
          required
          rows={4}
          minLength={10}
          placeholder="Contoh: laptop menyala tapi layar blank sejak kena air"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="bg-electric px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink"
        >
          Kirim lewat WhatsApp
        </button>

        <p className="max-w-[46ch] text-[15px] leading-relaxed text-dim">
          Formulir ini membuka WhatsApp dengan pesan yang sudah terisi. Tidak
          ada data yang disimpan di situs.
        </p>
      </div>

      <p
        aria-live="polite"
        className="min-h-[1.25rem] text-[14px] text-electric-soft"
      >
        {opened
          ? "WhatsApp dibuka di tab baru. Kalau tidak muncul, cek pemblokir pop-up."
          : ""}
      </p>
    </form>
  );
}
