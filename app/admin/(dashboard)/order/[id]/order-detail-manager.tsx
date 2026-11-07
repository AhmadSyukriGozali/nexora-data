"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  buttonDanger,
  buttonPrimary,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Card } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  fromJakartaInput,
  serviceStatusLabels,
  toJakartaInput,
} from "@/lib/admin/format";
import type { Order, ServiceStatus } from "@/lib/admin/types";

const STATUSES = Object.keys(serviceStatusLabels) as ServiceStatus[];

export function OrderDetailManager({
  order,
  canDelete,
  hasInvoice,
}: {
  order: Order;
  canDelete: boolean;
  hasInvoice: boolean;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<"" | ServiceStatus>("");
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);

  const [deleteBusy, setDeleteBusy] = useState(false);

  async function handleStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusError(null);
    setStatusBusy(true);

    const result = await apiRequest<Order>(
      `/api/admin/orders/${order.id}/status`,
      {
        method: "POST",
        body: JSON.stringify({
          status: nextStatus,
          note: emptyToNull(statusNote),
        }),
      },
    );

    setStatusBusy(false);

    if (!result.ok) {
      setStatusError(result.message);
      return;
    }

    setNextStatus("");
    setStatusNote("");
    router.refresh();
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditError(null);
    setEditBusy(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      complaint: textValue(form.get("complaint")),
      diagnosis: emptyToNull(form.get("diagnosis")),
      estimated_finish_at: fromJakartaInput(
        textValue(form.get("estimated_finish_at")),
      ),
      total_amount: numberValue(form.get("total_amount"), 0),
    };

    const result = await apiRequest<Order>(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    setEditBusy(false);

    if (!result.ok) {
      setEditError(result.message);
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    const warning = hasInvoice
      ? `Order ${order.ticket_number} sudah punya invoice. Hapus invoice dulu. Lanjutkan?`
      : `Hapus order ${order.ticket_number}? Riwayat status juga akan hilang.`;

    if (!window.confirm(warning)) return;

    setDeleteBusy(true);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/orders/${order.id}`,
      { method: "DELETE" },
    );
    setDeleteBusy(false);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.push("/admin/order");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-bold text-chrome">
          Ubah status
        </h2>
        <p className="text-xs text-dim">
          Status saat ini: {serviceStatusLabels[order.status]}. Perubahan akan
          dicatat di riwayat.
        </p>

        <form onSubmit={handleStatus} className="mt-4 space-y-4">
          <Field label="Status baru">
            <select
              className={inputClass}
              required
              value={nextStatus}
              onChange={(event) =>
                setNextStatus(event.target.value as "" | ServiceStatus)
              }
            >
              <option value="" disabled>
                Pilih status
              </option>
              {STATUSES.filter((status) => status !== order.status).map(
                (status) => (
                  <option key={status} value={status}>
                    {serviceStatusLabels[status]}
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Catatan (opsional)">
            <textarea
              className={inputClass}
              rows={2}
              maxLength={500}
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              placeholder="Contoh: pelanggan setuju biaya perbaikan."
            />
          </Field>

          <FormError message={statusError} />

          <FormActions>
            <button
              type="submit"
              disabled={statusBusy || !nextStatus}
              className={buttonPrimary}
            >
              {statusBusy ? "Menyimpan…" : "Simpan status"}
            </button>
          </FormActions>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-bold text-chrome">
          Ubah detail order
        </h2>
        <p className="text-xs text-dim">
          Perbarui keluhan, diagnosa, estimasi selesai, dan biaya.
        </p>

        <form onSubmit={handleEdit} className="mt-4 space-y-4">
          <Field label="Keluhan">
            <textarea
              name="complaint"
              className={inputClass}
              rows={3}
              required
              minLength={3}
              maxLength={2000}
              defaultValue={order.complaint}
            />
          </Field>

          <Field label="Diagnosa">
            <textarea
              name="diagnosis"
              className={inputClass}
              rows={3}
              maxLength={2000}
              defaultValue={order.diagnosis ?? ""}
            />
          </Field>

          <Field label="Estimasi selesai">
            <input
              name="estimated_finish_at"
              type="datetime-local"
              className={inputClass}
              defaultValue={toJakartaInput(order.estimated_finish_at)}
            />
          </Field>

          <Field label="Estimasi biaya (Rp)">
            <input
              name="total_amount"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              defaultValue={order.total_amount}
            />
          </Field>

          <FormError message={editError} />

          <FormActions>
            <button type="submit" disabled={editBusy} className={buttonPrimary}>
              {editBusy ? "Menyimpan…" : "Simpan detail"}
            </button>
          </FormActions>
        </form>
      </Card>

      {canDelete ? (
        <Card>
          <h2 className="font-display text-lg font-bold text-chrome">
            Zona berbahaya
          </h2>
          <p className="mt-1 text-xs text-dim">
            Hapus order hanya jika dibuat salah. Order dengan invoice tidak bisa
            dihapus sebelum invoicenya dihapus.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteBusy}
            className={`${buttonDanger} mt-4`}
          >
            {deleteBusy ? "Menghapus…" : "Hapus order"}
          </button>
        </Card>
      ) : null}
    </div>
  );
}
