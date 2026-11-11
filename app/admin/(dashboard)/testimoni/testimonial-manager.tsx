"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  buttonSmall,
  buttonSmallDanger,
  buttonSmallSuccess,
  inputClass,
} from "@/components/admin/form-controls";
import {
  Card,
  EmptyState,
  StatStrip,
  TestimonialStatusBadge,
} from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  formatDateTime,
  testimonialStatusLabels,
} from "@/lib/admin/format";
import type {
  Testimonial,
  TestimonialStatus,
} from "@/lib/admin/types";

const STATUSES = Object.keys(testimonialStatusLabels) as TestimonialStatus[];

function Stars({ rating }: { rating: number }) {
  const filled = Math.min(Math.max(rating, 0), 5);
  return (
    <span
      className="text-sm text-amber-200"
      aria-label={`Rating ${filled} dari 5`}
    >
      {"★".repeat(filled)}
      <span className="text-white/20">{"★".repeat(5 - filled)}</span>
    </span>
  );
}

export function TestimonialManager({
  testimonials,
  canManage,
  canDelete,
}: {
  testimonials: Testimonial[];
  canManage: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | TestimonialStatus
  >("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return testimonials.filter((testimonial) => {
      if (statusFilter !== "all" && testimonial.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return (
        testimonial.customer_name.toLowerCase().includes(term) ||
        testimonial.message.toLowerCase().includes(term) ||
        (testimonial.phone ?? "").includes(term) ||
        (testimonial.order?.ticket_number ?? "").toLowerCase().includes(term)
      );
    });
  }, [testimonials, search, statusFilter]);

  async function moderate(
    testimonial: Testimonial,
    status: "disetujui" | "ditolak",
  ) {
    setBusyId(testimonial.id);
    const result = await apiRequest<Testimonial>(
      `/api/admin/testimonials/${testimonial.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    setBusyId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.refresh();
  }

  async function handleDelete(testimonial: Testimonial) {
    if (
      !window.confirm(
        `Hapus testimoni dari "${testimonial.customer_name}"? Tindakan ini permanen.`,
      )
    ) {
      return;
    }

    setBusyId(testimonial.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/testimonials/${testimonial.id}`,
      { method: "DELETE" },
    );
    setBusyId(null);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-5">
      <StatStrip
        items={[
          { label: "Total testimoni", value: testimonials.length },
          {
            label: "Menunggu",
            value: testimonials.filter((item) => item.status === "menunggu")
              .length,
            tone: "warning",
          },
          {
            label: "Disetujui",
            value: testimonials.filter((item) => item.status === "disetujui")
              .length,
            tone: "success",
          },
          {
            label: "Ditolak",
            value: testimonials.filter((item) => item.status === "ditolak")
              .length,
            tone: "danger",
          },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className={`${inputClass} sm:max-w-sm`}
          placeholder="Cari nama, isi testimoni, nomor HP, tiket…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className={`${inputClass} sm:max-w-[11rem]`}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | TestimonialStatus)
          }
        >
          <option value="all">Semua status</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {testimonialStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada testimoni"
          description="Testimoni dari pelanggan akan muncul di sini untuk dimoderasi."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-bold text-[color:var(--bjork-text)]">
                    {testimonial.customer_name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Stars rating={testimonial.rating} />
                    <span className="text-xs text-[color:var(--bjork-text-muted)]">
                      {testimonial.phone ?? "tanpa nomor HP"}
                    </span>
                  </div>
                </div>
                <TestimonialStatusBadge status={testimonial.status} />
              </div>

              <p className="mt-3 flex-1 whitespace-pre-line text-sm text-[color:var(--bjork-text)]">
                {testimonial.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[color:var(--bjork-border)] pt-3 text-[11px] text-[color:var(--bjork-text-muted)]">
                <span>Masuk {formatDateTime(testimonial.created_at)}</span>
                {testimonial.order?.ticket_number ? (
                  <span className="font-mono">
                    {testimonial.order.ticket_number}
                  </span>
                ) : null}
                {testimonial.moderated_at ? (
                  <span>
                    Dimoderasi {formatDateTime(testimonial.moderated_at)}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {canManage ? (
                  <>
                    <button
                      type="button"
                      className={buttonSmallSuccess}
                      disabled={busyId === testimonial.id}
                      onClick={() => moderate(testimonial, "disetujui")}
                    >
                      Setujui
                    </button>
                    <button
                      type="button"
                      className={buttonSmallDanger}
                      disabled={busyId === testimonial.id}
                      onClick={() => moderate(testimonial, "ditolak")}
                    >
                      Tolak
                    </button>
                  </>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    className={buttonSmall}
                    disabled={busyId === testimonial.id}
                    onClick={() => handleDelete(testimonial)}
                  >
                    {busyId === testimonial.id ? "…" : "Hapus"}
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-[color:var(--bjork-text-muted)]">
        Menampilkan maksimal 200 testimoni terbaru. Hapus testimoni hanya
        tersedia untuk owner.
      </p>
    </div>
  );
}
