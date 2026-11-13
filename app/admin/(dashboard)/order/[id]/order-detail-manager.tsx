"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  buttonDanger,
  buttonPrimary,
  Field,
  FormActions,
  FormError,
  inputClass,
} from "@/components/admin/form-controls";
import { Card, ServiceStatusBadge } from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import { emptyToNull, numberValue, textValue } from "@/lib/admin/form-utils";
import {
  fromJakartaInput,
  serviceStatusLabels,
  toJakartaInput,
} from "@/lib/admin/format";
import { ORDER_SEQUENCE, nextOrderStatuses } from "@/lib/admin/status-flow";
import type { Order, ServiceStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

export function OrderDetailManager({
  order,
  canManage,
  canDelete,
  canCancel,
  hasInvoice,
  canAssign,
  technicians,
}: {
  order: Order;
  canManage: boolean;
  canDelete: boolean;
  canCancel: boolean;
  hasInvoice: boolean;
  canAssign: boolean;
  technicians: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [target, setTarget] = useState<ServiceStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const options = nextOrderStatuses(order.status);
  const forward = options.filter((status) => status !== "batal");
  const cancellable = options.includes("batal");
  const seqIndex = ORDER_SEQUENCE.indexOf(order.status);

  async function handleStatus() {
    if (!target) return;
    setStatusError(null);
    setStatusBusy(true);

    const result = await apiRequest<Order>(
      `/api/admin/orders/${order.id}/status`,
      {
        method: "POST",
        body: JSON.stringify({
          status: target,
          note: emptyToNull(statusNote),
        }),
      },
    );

    setStatusBusy(false);

    if (!result.ok) {
      setStatusError(result.message);
      return;
    }

    setTarget(null);
    setStatusNote("");
    router.refresh();
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditError(null);
    setEditBusy(true);

    const form = new FormData(event.currentTarget);
    const payload = canAssign
      ? {
          complaint: textValue(form.get("complaint")),
          diagnosis: emptyToNull(form.get("diagnosis")),
          estimated_finish_at: fromJakartaInput(
            textValue(form.get("estimated_finish_at")),
          ),
          total_amount: numberValue(form.get("total_amount"), 0),
          assigned_technician_id:
            textValue(form.get("assigned_technician_id")) || null,
        }
      : {
          diagnosis: emptyToNull(form.get("diagnosis")),
          estimated_finish_at: fromJakartaInput(
            textValue(form.get("estimated_finish_at")),
          ),
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
    setDeleteBusy(true);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/orders/${order.id}`,
      { method: "DELETE" },
    );
    setDeleteBusy(false);

    if (!result.ok) {
      setStatusError(result.message);
      setDeleteOpen(false);
      return;
    }

    router.push("/admin/order");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13.5px] font-semibold">Alur status</h2>
          <ServiceStatusBadge status={order.status} />
        </div>

        <ol className="mt-4 space-y-0">
          {ORDER_SEQUENCE.map((status, index) => {
            const done = seqIndex >= 0 && index < seqIndex;
            const current = order.status === status;
            const isLast = index === ORDER_SEQUENCE.length - 1;
            return (
              <li key={status} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border text-[9px] font-bold",
                      done
                        ? "border-[var(--color-live)] bg-[var(--blk-success-soft)] text-[color:var(--blk-success)]"
                        : current
                          ? "border-[color:var(--bjork-accent)] bg-[var(--blk-accent-fill)] text-[color:var(--blk-accent-fill-ink)]"
                          : "border-[color:var(--bjork-border-strong)] text-[color:var(--bjork-text-faint)]",
                    )}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-px flex-1 bg-[var(--bjork-border)]",
                        done && "bg-[var(--color-live)]/50",
                      )}
                    />
                  ) : null}
                </span>
                <span className={cn("min-w-0", !isLast && "pb-3.5")}>
                  <span
                    className={cn(
                      "block text-[13px] leading-tight",
                      current
                        ? "font-semibold text-[color:var(--bjork-text)]"
                        : "text-[color:var(--bjork-text-muted)]",
                    )}
                  >
                    {serviceStatusLabels[status]}
                  </span>
                  {current ? (
                    <span className="text-[11px] text-[color:var(--blk-accent-ink)]">
                      Status saat ini
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>

        {order.status === "menunggu_sparepart" ? (
          <p className="mt-3 rounded-lg border border-[color:var(--blk-warning)]/35 bg-[var(--blk-warning-soft)] px-3 py-2 text-[12px] text-[color:var(--blk-warning)]">
            Menunggu sparepart. Lanjutkan ke Dikerjakan setelah part tersedia.
          </p>
        ) : null}
        {order.status === "batal" ? (
          <p className="mt-3 rounded-lg border border-[var(--blk-error)]/35 bg-[var(--blk-error-soft)] px-3 py-2 text-[12px] text-[color:var(--blk-error)]">
            Order dibatalkan. Status tidak bisa diubah lagi.
          </p>
        ) : null}

        {canManage && forward.length > 0 ? (
          <div className="mt-4 space-y-2 border-t border-[color:var(--bjork-border)] pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--bjork-text-muted)]">
              Langkah berikutnya
            </p>
            <FormActions>
              {forward.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusError(null);
                    setTarget(status);
                  }}
                  className={buttonPrimary}
                >
                  {serviceStatusLabels[status]}
                </button>
              ))}
            </FormActions>
          </div>
        ) : null}

        {canManage && canCancel && cancellable ? (
          <button
            type="button"
            className={`${buttonDanger} mt-3`}
            onClick={() => {
              setStatusError(null);
              setTarget("batal");
            }}
          >
            Batalkan order
          </button>
        ) : null}

        <FormError message={statusError} />
        {!canManage ? (
          <p className="mt-3 text-[12px] text-[color:var(--bjork-text-muted)]">
            Anda hanya bisa melihat order ini. Minta owner memberi izin kelola
            order servis untuk mengubah status.
          </p>
        ) : null}
      </Card>

      {canManage ? (
        <Card>
          <h2 className="text-[13.5px] font-semibold">Ubah detail order</h2>
          <p className="mt-0.5 text-[12px] text-[color:var(--bjork-text-muted)]">
            {canAssign
              ? "Perbarui keluhan, diagnosa, estimasi selesai, biaya, dan teknisi."
              : "Perbarui diagnosa dan estimasi selesai."}
          </p>

          <form onSubmit={handleEdit} className="mt-4 space-y-4">
            {canAssign ? (
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
            ) : null}

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

            {canAssign ? (
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
            ) : null}

            {canAssign ? (
              <Field
                label="Teknisi"
                hint="Hanya teknisi yang ditugaskan yang bisa membuka order ini."
              >
                <select
                  name="assigned_technician_id"
                  className={inputClass}
                  defaultValue={order.assigned_technician_id ?? ""}
                >
                  <option value="">Belum ditugaskan</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.full_name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <FormError message={editError} />

            <FormActions>
              <button
                type="submit"
                disabled={editBusy}
                className={buttonPrimary}
              >
                {editBusy ? "Menyimpan…" : "Simpan detail"}
              </button>
            </FormActions>
          </form>
        </Card>
      ) : null}

      {canDelete ? (
        <Card>
          <h2 className="text-[13.5px] font-semibold">Zona berbahaya</h2>
          <p className="mt-1 text-[12px] text-[color:var(--bjork-text-muted)]">
            Hapus order hanya jika dibuat salah. Order dengan invoice tidak bisa
            dihapus sebelum invoicenya dihapus.
          </p>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteBusy}
            className={`${buttonDanger} mt-4`}
          >
            Hapus order
          </button>
        </Card>
      ) : null}

      <ConfirmDialog
        open={target !== null}
        title={
          target === "batal"
            ? "Batalkan order?"
            : `Ubah ke ${target ? serviceStatusLabels[target] : ""}?`
        }
        description={
          target === "batal"
            ? "Order yang dibatalkan tidak bisa dilanjutkan lagi. Riwayat tetap tersimpan."
            : "Status hanya bisa maju sesuai urutan. Perubahan dicatat di riwayat."
        }
        confirmLabel={
          target === "batal"
            ? "Ya, batalkan"
            : `Ya, ubah ke ${target ? serviceStatusLabels[target] : ""}`
        }
        tone={target === "batal" ? "danger" : "default"}
        busy={statusBusy}
        onClose={() => {
          if (statusBusy) return;
          setTarget(null);
          setStatusNote("");
        }}
        onConfirm={handleStatus}
      >
        {target !== "batal" ? (
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
        ) : null}
        {statusError ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-[var(--blk-error)]/40 bg-[var(--blk-error-soft)] px-3 py-2 text-[12px] text-[color:var(--blk-error)]"
          >
            {statusError}
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        title={`Hapus order ${order.ticket_number}?`}
        description={
          hasInvoice
            ? "Order ini sudah punya invoice. Hapus invoice dulu sebelum menghapus order."
            : "Riwayat status ikut terhapus. Tindakan ini tidak bisa dibatalkan."
        }
        confirmLabel="Hapus permanen"
        tone="danger"
        busy={deleteBusy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
