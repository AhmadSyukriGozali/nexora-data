"use client";

import { useState, type FormEvent } from "react";

import { cn } from "@/lib/cn";

const fieldClass =
  "w-full border border-white/12 bg-white/[0.06] px-4 py-3.5 text-[16px] " +
  "text-white placeholder:text-dim/70 transition-colors " +
  "focus:border-electric focus:bg-white/[0.1]";

const labelClass = "text-[15px] font-medium text-dim";

export function TestimonialForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Isi testimoni minimal 10 karakter.");
      return;
    }
    if (rating < 1) {
      setError("Pilih rating 1 sampai 5 bintang.");
      return;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits && (digits.length < 8 || digits.length > 15)) {
      setError("Nomor HP harus 8-15 digit.");
      return;
    }

    const ticketNumber = ticket.trim().toUpperCase();
    if (ticketNumber && !/^NXD-[0-9]{4}-[0-9]{4,}$/.test(ticketNumber)) {
      setError("Format nomor tiket seperti NXD-2611-0001.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          rating,
          message: message.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(ticketNumber ? { ticket_number: ticketNumber } : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(payload?.error?.message ?? "Gagal mengirim testimoni.");
        return;
      }

      setSent(true);
      setName("");
      setPhone("");
      setTicket("");
      setRating(0);
      setMessage("");
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi internet.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-white/12 bg-white/[0.04] p-6 sm:p-8">
        <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-electric-soft">
          Terkirim
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold tracking-[-0.02em] text-chrome">
          Terima kasih atas ulasannya
        </h2>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-dim">
          Testimoni Anda menunggu pemeriksaan admin. Setelah disetujui, ulasan
          tampil di halaman depan dengan nama yang disingkat.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 border border-white/20 px-5 py-3 text-[14px] font-semibold text-chrome transition-colors hover:border-white/50"
        >
          Kirim testimoni lain
        </button>
      </div>
    );
  }

  return (
    <div className="border border-white/12 bg-white/[0.04] p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold tracking-[-0.02em] text-chrome">
        Kirim testimoni
      </h2>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-dim">
        Bagikan pengalaman servis Anda. Testimoni diperiksa admin lebih dulu
        sebelum tampil di situs.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="testimonial_name" className={labelClass}>
            Nama
          </label>
          <input
            id="testimonial_name"
            name="customer_name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="testimonial_phone" className={labelClass}>
            Nomor HP <span className="text-dim/70">(opsional)</span>
          </label>
          <input
            id="testimonial_phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="0812…"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={`${fieldClass} font-mono`}
          />
          <p className="text-[13px] leading-relaxed text-dim">
            Tidak dipublikasikan. Dipakai admin kalau perlu konfirmasi.
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor="testimonial_ticket" className={labelClass}>
            Nomor tiket <span className="text-dim/70">(opsional)</span>
          </label>
          <input
            id="testimonial_ticket"
            name="ticket_number"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={24}
            placeholder="NXD-2611-0001"
            value={ticket}
            onChange={(event) =>
              setTicket(event.target.value.toUpperCase().replace(/\s+/g, ""))
            }
            className={`${fieldClass} font-mono tracking-[0.06em]`}
          />
          <p className="text-[13px] leading-relaxed text-dim">
            Sertakan nomor tiket supaya ulasan tertaut ke order Anda.
          </p>
        </div>

        <fieldset className="grid gap-2">
          <legend className={labelClass}>Rating</legend>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} bintang`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className={cn(
                  "text-[28px] leading-none transition-colors",
                  value <= rating ? "text-amber-300" : "text-white/20",
                  "hover:text-amber-200",
                )}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label htmlFor="testimonial_message" className={labelClass}>
            Isi testimoni
          </label>
          <textarea
            id="testimonial_message"
            name="message"
            required
            rows={5}
            minLength={10}
            maxLength={2000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={`${fieldClass} resize-y`}
          />
          <p className="text-right font-mono text-[12px] text-dim">
            {message.trim().length}/2000
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="border border-red-400/40 bg-red-400/10 px-4 py-3 text-[15px] leading-relaxed text-red-200"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-electric px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
        >
          {busy ? "Mengirim…" : "Kirim testimoni"}
        </button>
      </form>
    </div>
  );
}
