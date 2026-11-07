"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  buttonGhost,
  buttonPrimary,
  buttonSmall,
  buttonSmallDanger,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Badge, Card, EmptyState } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  formatDateTime,
  fromJakartaInput,
  isWarrantyActive,
  toJakartaInput,
} from "@/lib/admin/format";
import type { OrderOption, Warranty } from "@/lib/admin/types";

type WarrantyFilter = "all" | "active" | "expired";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysRemaining(expiresAt: string): number {
  return Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / DAY_MS,
  );
}

export function WarrantyManager({
  warranties,
  availableOrders,
  canDelete,
}: {
  warranties: Warranty[];
  availableOrders: OrderOption[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WarrantyFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warranty | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return warranties.filter((warranty) => {
      const active = isWarrantyActive(warranty.expires_at);
      if (filter === "active" && !active) return false;
      if (filter === "expired" && active) return false;
      if (!term) return true;
      return (
        (warranty.order?.ticket_number ?? "").toLowerCase().includes(term) ||
        (warranty.order?.customer?.full_name ?? "")
          .toLowerCase()
          .includes(term) ||
        (warranty.terms ?? "").toLowerCase().includes(term)
      );
    });
  }, [warranties, search, filter]);

  function openCreate() {
    setEditing(null);
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("warranty-form")?.scrollIntoView({ block: "start" });
    });
  }

  function openEdit(warranty: Warranty) {
    setEditing(warranty);
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("warranty-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const startsAt = fromJakartaInput(textValue(form.get("starts_at")));

    const base = {
      duration_days: numberValue(form.get("duration_days"), 0),
      terms: emptyToNull(form.get("terms")),
      ...(startsAt ? { starts_at: startsAt } : {}),
    };

    const payload = editing
      ? base
      : { ...base, order_id: textValue(form.get("order_id")) };

    const result = await apiRequest<Warranty>(
      editing ? `/api/admin/warranties/${editing.id}` : "/api/admin/warranties",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setShowForm(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(warranty: Warranty) {
    if (
      !window.confirm(
        `Hapus garansi untuk ${warranty.order?.ticket_number ?? "order ini"}?`,
      )
    ) {
      return;
    }

    setBusyId(warranty.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/warranties/${warranty.id}`,
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={`${inputClass} sm:max-w-xs`}
            placeholder="Cari tiket, pelanggan, ketentuan…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={`${inputClass} sm:max-w-[10rem]`}
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as WarrantyFilter)
            }
          >
            <option value="all">Semua</option>
            <option value="active">Masih aktif</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={buttonPrimary}
          disabled={availableOrders.length === 0}
        >
          Tambah garansi
        </button>
      </div>

      {availableOrders.length === 0 ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
          Semua order sudah punya garansi. Satu order hanya boleh punya satu
          catatan garansi.
        </p>
      ) : null}

      {showForm ? (
        <div id="warranty-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-chrome">
                  {editing ? "Ubah garansi" : "Garansi baru"}
                </h2>
                <p className="text-xs text-dim">
                  Tanggal berakhir = tanggal mulai + durasi hari.
                </p>
              </div>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Tutup
              </button>
            </div>

            <form
              key={`${editing?.id ?? "new"}-${formKey}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {editing ? (
                  <Field label="Order">
                    <input
                      className={`${inputClass} opacity-70`}
                      value={editing.order?.ticket_number ?? ""}
                      readOnly
                      disabled
                    />
                  </Field>
                ) : (
                  <Field label="Order servis">
                    <select
                      name="order_id"
                      className={inputClass}
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Pilih order
                      </option>
                      {availableOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.ticket_number}
                          {order.customer?.full_name
                            ? ` · ${order.customer.full_name}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label="Durasi (hari)">
                  <input
                    name="duration_days"
                    type="number"
                    min={1}
                    max={3650}
                    step={1}
                    required
                    className={inputClass}
                    defaultValue={editing?.duration_days ?? 30}
                  />
                </Field>

                <Field
                  label="Mulai"
                  hint={
                    editing
                      ? "Ubah bila garansi diperpanjang."
                      : "Kosongkan = mulai sekarang."
                  }
                >
                  <input
                    name="starts_at"
                    type="datetime-local"
                    className={inputClass}
                    defaultValue={
                      editing ? toJakartaInput(editing.starts_at) : ""
                    }
                  />
                </Field>

                <Field label="Ketentuan (opsional)">
                  <input
                    name="terms"
                    className={inputClass}
                    maxLength={1000}
                    defaultValue={editing?.terms ?? ""}
                    placeholder="Contoh: tidak termasuk kerusakan akibat cairan"
                  />
                </Field>
              </div>

              <FormError message={error} />

              <FormActions>
                <button type="submit" disabled={busy} className={buttonPrimary}>
                  {busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah"}
                </button>
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada garansi"
          description="Tambahkan garansi untuk order servis yang sudah selesai dikerjakan."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold">Durasi</th>
                  <th className="px-4 py-3 font-semibold">Mulai</th>
                  <th className="px-4 py-3 font-semibold">Berakhir</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Ketentuan</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((warranty) => {
                  const active = isWarrantyActive(warranty.expires_at);
                  const remaining = daysRemaining(warranty.expires_at);
                  return (
                    <tr key={warranty.id} className="border-t border-white/8">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-electric-soft">
                        {warranty.order?.ticket_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-chrome">
                        {warranty.order?.customer?.full_name ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-dim">
                        {warranty.duration_days} hari
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-dim">
                        {formatDateTime(warranty.starts_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-dim">
                        {formatDateTime(warranty.expires_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={active ? "green" : "red"}>
                          {active ? "Aktif" : "Kedaluwarsa"}
                        </Badge>
                        {active ? (
                          <span className="mt-1 block text-[11px] text-dim">
                            sisa {Math.max(remaining, 0)} hari
                          </span>
                        ) : null}
                      </td>
                      <td className="max-w-[16rem] px-4 py-3 text-dim">
                        {warranty.terms ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={buttonSmall}
                            onClick={() => openEdit(warranty)}
                          >
                            Ubah
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              className={buttonSmallDanger}
                              disabled={busyId === warranty.id}
                              onClick={() => handleDelete(warranty)}
                            >
                              {busyId === warranty.id ? "…" : "Hapus"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
