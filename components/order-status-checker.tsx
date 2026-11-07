"use client";

import { useState, type FormEvent } from "react";

import { cn } from "@/lib/cn";
import { waLink } from "@/lib/site";

type ServiceStatus =
  | "masuk"
  | "diagnosa"
  | "menunggu_persetujuan"
  | "dikerjakan"
  | "menunggu_sparepart"
  | "selesai"
  | "diambil"
  | "batal";

type DeviceType = "hp" | "laptop" | "pc" | "printer";

type StatusResult = {
  ticket_number: string;
  device_type: DeviceType | null;
  status: ServiceStatus;
  estimated_finish_at: string | null;
};

const statusLabels: Record<ServiceStatus, string> = {
  masuk: "Masuk",
  diagnosa: "Diagnosa",
  menunggu_persetujuan: "Menunggu persetujuan",
  dikerjakan: "Dikerjakan",
  menunggu_sparepart: "Menunggu sparepart",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Dibatalkan",
};

const deviceLabels: Record<DeviceType, string> = {
  hp: "HP",
  laptop: "Laptop",
  pc: "PC",
  printer: "Printer",
};

const steps: { key: ServiceStatus; label: string; hint: string }[] = [
  { key: "masuk", label: "Masuk", hint: "Perangkat diterima di toko." },
  {
    key: "diagnosa",
    label: "Diagnosa",
    hint: "Teknisi memeriksa penyebab kerusakan.",
  },
  {
    key: "menunggu_persetujuan",
    label: "Persetujuan",
    hint: "Menunggu konfirmasi biaya dari pelanggan.",
  },
  {
    key: "dikerjakan",
    label: "Dikerjakan",
    hint: "Perbaikan sedang berlangsung.",
  },
  {
    key: "selesai",
    label: "Selesai",
    hint: "Perangkat siap diambil.",
  },
  {
    key: "diambil",
    label: "Diambil",
    hint: "Perangkat sudah diterima pelanggan.",
  },
];

const currentStepIndex: Record<ServiceStatus, number> = {
  masuk: 0,
  diagnosa: 1,
  menunggu_persetujuan: 2,
  dikerjakan: 3,
  menunggu_sparepart: 3,
  selesai: 4,
  diambil: 5,
  batal: -1,
};

const fieldClass =
  "w-full border border-white/12 bg-white/[0.06] px-4 py-3.5 text-[16px] " +
  "text-white placeholder:text-dim/70 transition-colors " +
  "focus:border-electric focus:bg-white/[0.1]";

const dateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDateTime(value: string | null): string {
  if (!value) return "Belum ditentukan";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum ditentukan";
  return dateTime.format(date);
}

export function OrderStatusChecker() {
  const [ticket, setTicket] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/public/service-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_number: ticket.trim().toUpperCase(),
          phone_last4: phoneLast4.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { data?: StatusResult; error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(
          payload?.error?.message ??
            "Gagal mengecek status. Coba lagi beberapa saat.",
        );
        return;
      }

      if (!payload?.data) {
        setError("Data status tidak lengkap. Coba lagi.");
        return;
      }

      setResult(payload.data);
      setCheckedAt(new Date().toISOString());
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi internet.");
    } finally {
      setBusy(false);
    }
  }

  const stepIndex = result ? currentStepIndex[result.status] : -1;

  return (
    <div className="border border-white/12 bg-white/[0.04] p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold tracking-[-0.02em] text-chrome">
        Lacak progres perbaikan
      </h2>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-dim">
        Masukkan nomor tiket dan 4 digit terakhir nomor HP yang dipakai saat
        servis. Data pelanggan tidak ditampilkan.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
        <div className="grid gap-2">
          <label
            htmlFor="ticket_number"
            className="text-[15px] font-medium text-dim"
          >
            Nomor tiket
          </label>
          <input
            id="ticket_number"
            name="ticket_number"
            type="text"
            required
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
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="phone_last4"
            className="text-[15px] font-medium text-dim"
          >
            4 digit terakhir nomor HP
          </label>
          <input
            id="phone_last4"
            name="phone_last4"
            type="text"
            required
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="7890"
            value={phoneLast4}
            onChange={(event) =>
              setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className={`${fieldClass} font-mono tracking-[0.2em]`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={busy || phoneLast4.length !== 4 || ticket.length < 9}
            className="bg-electric px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Mencari…" : "Cek status"}
          </button>
          <p className="max-w-[40ch] text-[13px] leading-relaxed text-dim">
            Setiap pengecekan dibatasi untuk mencegah percobaan nomor tiket
            secara acak.
          </p>
        </div>
      </form>

      <div aria-live="polite" aria-busy={busy}>
        {error ? (
          <p
            role="alert"
            className="mt-6 border border-red-400/40 bg-red-400/10 px-4 py-3 text-[15px] leading-relaxed text-red-200"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-7 border-t border-white/12 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[13px] tracking-[0.08em] text-electric-soft">
                  {result.ticket_number}
                </p>
                <p className="mt-1 text-[15px] text-dim">
                  {result.device_type
                    ? deviceLabels[result.device_type]
                    : "Perangkat"}{" "}
                  · Estimasi selesai:{" "}
                  <span className="text-chrome">
                    {formatDateTime(result.estimated_finish_at)}
                  </span>
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]",
                  result.status === "batal"
                    ? "border-red-400/40 bg-red-400/10 text-red-200"
                    : result.status === "selesai" ||
                        result.status === "diambil"
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                      : "border-electric/50 bg-electric/15 text-electric-soft",
                )}
              >
                {statusLabels[result.status]}
              </span>
            </div>

            {result.status === "batal" ? (
              <div className="mt-6 border border-red-400/40 bg-red-400/10 p-5">
                <p className="text-[15px] font-semibold text-red-200">
                  Servis dibatalkan
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-red-200/80">
                  Hubungi admin lewat WhatsApp untuk informasi lebih lanjut
                  mengenai perangkat Anda.
                </p>
              </div>
            ) : (
              <ol className="mt-7">
                {steps.map((step, index) => {
                  const done = index < stepIndex;
                  const active = index === stepIndex;
                  const waitingPart =
                    active && result.status === "menunggu_sparepart";

                  return (
                    <li
                      key={step.key}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index < steps.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px",
                            done ? "bg-electric" : "bg-white/15",
                          )}
                        />
                      ) : null}

                      <span
                        className={cn(
                          "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                          done
                            ? "border-electric bg-electric text-white"
                            : active
                              ? "border-electric bg-navy text-electric-soft"
                              : "border-white/20 bg-navy text-dim",
                        )}
                      >
                        {done ? "✓" : index + 1}
                      </span>

                      <div className="min-w-0 pb-1">
                        <p
                          className={cn(
                            "text-[15px] font-semibold",
                            done || active ? "text-chrome" : "text-dim",
                          )}
                        >
                          {step.label}
                          {waitingPart ? (
                            <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.1em] text-amber-200">
                              sedang berlangsung
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-dim">
                          {waitingPart
                            ? "Perbaikan tertunda menunggu ketersediaan sparepart."
                            : step.hint}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-white/12 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={waLink(
                  `Halo Nexora Data, saya mau tanya progres servis tiket ${result.ticket_number}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit bg-white/10 px-5 py-3 text-[14px] font-semibold text-chrome transition-colors hover:bg-electric hover:text-white"
              >
                Tanya admin via WhatsApp
              </a>
              {checkedAt ? (
                <p className="text-[12px] text-dim">
                  Dicek {formatDateTime(checkedAt)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
