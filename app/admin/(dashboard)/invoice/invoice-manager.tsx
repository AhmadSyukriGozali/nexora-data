"use client";

import Link from "next/link";
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
import {
  Card,
  EmptyState,
  InvoiceStatusBadge,
  StatStrip,
} from "@/components/admin/ui";
import { apiRequest } from "@/lib/admin/client-api";
import {
  emptyToNull,
  numberValue,
  textValue,
} from "@/lib/admin/form-utils";
import {
  formatDateTime,
  formatRupiah,
  fromJakartaInput,
  invoiceStatusLabels,
} from "@/lib/admin/format";
import type {
  Invoice,
  InvoiceStatus,
  OrderOption,
} from "@/lib/admin/types";

const STATUSES = Object.keys(invoiceStatusLabels) as InvoiceStatus[];

export function InvoiceManager({
  invoices,
  availableOrders,
  canManage,
  canDelete,
}: {
  invoices: Invoice[];
  availableOrders: OrderOption[];
  canManage: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
      if (!term) return true;
      return (
        invoice.invoice_number.toLowerCase().includes(term) ||
        (invoice.order?.ticket_number ?? "").toLowerCase().includes(term) ||
        (invoice.order?.customer?.full_name ?? "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [invoices, search, statusFilter]);

  function openCreate() {
    setError(null);
    setFormKey((value) => value + 1);
    setShowForm(true);
    requestAnimationFrame(() => {
      document.getElementById("invoice-form")?.scrollIntoView({ block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      order_id: textValue(form.get("order_id")),
      discount_amount: numberValue(form.get("discount_amount"), 0),
      due_at: fromJakartaInput(textValue(form.get("due_at"))),
      notes: emptyToNull(form.get("notes")),
    };

    const result = await apiRequest<Invoice>("/api/admin/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(invoice: Invoice) {
    if (
      !window.confirm(
        `Hapus invoice ${invoice.invoice_number}? Pembayaran dan item terkait juga harus sudah dihapus.`,
      )
    ) {
      return;
    }

    setBusyId(invoice.id);
    const result = await apiRequest<{ deleted: boolean }>(
      `/api/admin/invoices/${invoice.id}`,
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
          { label: "Total invoice", value: invoices.length },
          {
            label: "Draft",
            value: invoices.filter((invoice) => invoice.status === "draft")
              .length,
            tone: "warning",
          },
          {
            label: "Belum lunas",
            value: invoices.filter(
              (invoice) =>
                invoice.status === "draft" || invoice.status === "terkirim",
            ).length,
            tone: "accent",
          },
          {
            label: "Sisa tagihan",
            value: formatRupiah(
              invoices.reduce(
                (total, invoice) =>
                  total +
                  Math.max(
                    0,
                    invoice.total_amount - invoice.paid_amount,
                  ),
                0,
              ),
            ),
          },
        ]}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={`${inputClass} sm:max-w-xs`}
            placeholder="Cari nomor invoice, tiket, pelanggan…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={`${inputClass} sm:max-w-[10rem]`}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | InvoiceStatus)
            }
          >
            <option value="all">Semua status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {invoiceStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className={buttonPrimary}
            disabled={availableOrders.length === 0}
          >
            Invoice baru
          </button>
        ) : null}
      </div>

      {availableOrders.length === 0 ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
          Semua order sudah punya invoice. Buat order servis baru untuk membuat
          invoice berikutnya.
        </p>
      ) : null}

      {showForm && canManage ? (
        <div id="invoice-form">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[color:var(--bjork-text)]">
                  Invoice baru
                </h2>
                <p className="text-xs text-[color:var(--bjork-text-muted)]">
                  Nomor invoice dibuat otomatis. Satu order hanya boleh punya
                  satu invoice.
                </p>
              </div>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => setShowForm(false)}
              >
                Tutup
              </button>
            </div>

            <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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

                <Field label="Diskon (Rp)">
                  <input
                    name="discount_amount"
                    type="number"
                    min={0}
                    step={1000}
                    className={inputClass}
                    defaultValue={0}
                  />
                </Field>

                <Field label="Jatuh tempo (opsional)">
                  <input
                    name="due_at"
                    type="datetime-local"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Catatan (opsional)">
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={1000}
                  className={inputClass}
                  placeholder="Contoh: pembayaran paling lambat 7 hari setelah invoice."
                />
              </Field>

              <FormError message={error} />

              <FormActions>
                <button type="submit" disabled={busy} className={buttonPrimary}>
                  {busy ? "Menyimpan…" : "Buat invoice"}
                </button>
              </FormActions>
            </form>
          </Card>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada invoice"
          description="Buat invoice dari order servis yang sudah selesai atau sedang dikerjakan."
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-[color:var(--bjork-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Dibayar</th>
                  <th className="px-4 py-3 font-semibold">Sisa</th>
                  <th className="px-4 py-3 font-semibold">Terbit</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const remaining = invoice.total_amount - invoice.paid_amount;
                  return (
                    <tr key={invoice.id} className="border-t border-[color:var(--bjork-border)]">
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/admin/invoice/${invoice.id}`}
                          className="font-mono text-xs text-[color:var(--blk-accent-ink)] hover:text-[color:var(--bjork-text)]"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[color:var(--bjork-text)]">
                          {invoice.order?.ticket_number ?? "—"}
                        </p>
                        <p className="text-xs text-[color:var(--bjork-text-muted)]">
                          {invoice.order?.customer?.full_name ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[color:var(--bjork-text-muted)]">
                        {formatRupiah(invoice.total_amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[color:var(--bjork-text-muted)]">
                        {formatRupiah(invoice.paid_amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            remaining > 0 ? "text-amber-200" : "text-emerald-200"
                          }
                        >
                          {formatRupiah(Math.max(remaining, 0))}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[color:var(--bjork-text-muted)]">
                        {formatDateTime(invoice.issued_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/invoice/${invoice.id}`}
                            className={buttonSmall}
                          >
                            Detail
                          </Link>
                          {canDelete ? (
                            <button
                              type="button"
                              className={buttonSmallDanger}
                              disabled={busyId === invoice.id}
                              onClick={() => handleDelete(invoice)}
                            >
                              {busyId === invoice.id ? "…" : "Hapus"}
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
